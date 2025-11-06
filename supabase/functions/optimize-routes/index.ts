import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { corsHeaders } from '../_shared/cors.ts'

interface Bin {
  id: string
  bin_id: string
  location: string
  latitude: number | null
  longitude: number | null
  fill_level: number
  status: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { threshold = 75 } = await req.json()

    // Get bins that need collection
    const { data: bins, error: binsError } = await supabaseClient
      .from('bins')
      .select('*')
      .gte('fill_level', threshold)
      .order('fill_level', { ascending: false })

    if (binsError) throw binsError

    if (!bins || bins.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No bins need collection', route: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cluster bins by proximity (simple distance-based clustering)
    const clusters = clusterBins(bins as Bin[], 5) // Max 5 bins per route

    // Create optimized routes
    const routes: any[] = []
    for (const cluster of clusters) {
      const routeName: string = `Auto-Route ${new Date().toISOString().split('T')[0]}-${routes.length + 1}`
      const distance = calculateTotalDistance(cluster)
      const estimatedTime = Math.ceil(distance * 3 + cluster.length * 15) // 3 min/km + 15 min per bin

      const { data: route, error: routeError } = await supabaseClient
        .from('collection_routes')
        .insert({
          name: routeName,
          status: 'planned',
          distance_km: distance,
          estimated_time_minutes: estimatedTime,
          bins: cluster.map(b => b.id)
        })
        .select()
        .single()

      if (routeError) {
        console.error('Error creating route:', routeError)
        continue
      }

      routes.push(route)
    }

    console.log(`Created ${routes.length} optimized routes`)

    return new Response(
      JSON.stringify({ 
        message: `Created ${routes.length} optimized collection routes`,
        routes,
        bins_included: bins.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in optimize-routes:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function clusterBins(bins: Bin[], maxPerCluster: number): Bin[][] {
  const clusters: Bin[][] = []
  const remaining = [...bins]

  while (remaining.length > 0) {
    const cluster: Bin[] = [remaining.shift()!]
    
    while (cluster.length < maxPerCluster && remaining.length > 0) {
      const lastBin = cluster[cluster.length - 1]
      
      // Find nearest bin
      let nearestIndex = 0
      let minDistance = Infinity
      
      remaining.forEach((bin, index) => {
        const distance = calculateDistance(lastBin, bin)
        if (distance < minDistance) {
          minDistance = distance
          nearestIndex = index
        }
      })
      
      cluster.push(remaining.splice(nearestIndex, 1)[0])
    }
    
    clusters.push(cluster)
  }

  return clusters
}

function calculateDistance(bin1: Bin, bin2: Bin): number {
  if (!bin1.latitude || !bin1.longitude || !bin2.latitude || !bin2.longitude) {
    return 5 // Default 5km if no coordinates
  }

  const R = 6371 // Earth's radius in km
  const dLat = toRad(bin2.latitude - bin1.latitude)
  const dLon = toRad(bin2.longitude - bin1.longitude)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(bin1.latitude)) * Math.cos(toRad(bin2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateTotalDistance(bins: Bin[]): number {
  let total = 0
  for (let i = 0; i < bins.length - 1; i++) {
    total += calculateDistance(bins[i], bins[i + 1])
  }
  return Math.round(total * 10) / 10 // Round to 1 decimal
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}