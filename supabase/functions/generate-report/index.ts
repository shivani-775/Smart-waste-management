import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { corsHeaders } from '../_shared/cors.ts'

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

    const { report_type, date_from, date_to } = await req.json()

    if (!report_type || !date_from || !date_to) {
      throw new Error('Missing required parameters: report_type, date_from, date_to')
    }

    let reportData = {}

    switch (report_type) {
      case 'collection_efficiency':
        reportData = await generateCollectionEfficiencyReport(supabaseClient, date_from, date_to)
        break
      
      case 'waste_trends':
        reportData = await generateWasteTrendsReport(supabaseClient, date_from, date_to)
        break
      
      case 'bin_performance':
        reportData = await generateBinPerformanceReport(supabaseClient, date_from, date_to)
        break
      
      case 'environmental_impact':
        reportData = await generateEnvironmentalImpactReport(supabaseClient, date_from, date_to)
        break
      
      default:
        throw new Error(`Unknown report type: ${report_type}`)
    }

    // Get user ID from JWT
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    // Store report
    const { data: report, error: reportError } = await supabaseClient
      .from('reports')
      .insert({
        report_type,
        generated_by: user?.id,
        date_from,
        date_to,
        data: reportData
      })
      .select()
      .single()

    if (reportError) throw reportError

    console.log(`Generated ${report_type} report for ${date_from} to ${date_to}`)

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in generate-report:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateCollectionEfficiencyReport(supabase: any, dateFrom: string, dateTo: string) {
  const { data: collections } = await supabase
    .from('collection_history')
    .select('*')
    .gte('collected_at', dateFrom)
    .lte('collected_at', dateTo)

  const { data: routes } = await supabase
    .from('collection_routes')
    .select('*')
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo)

  const totalCollections = collections?.length || 0
  const completedRoutes = routes?.filter((r: any) => r.status === 'completed').length || 0
  const totalDistance = routes?.reduce((sum: number, r: any) => sum + (r.distance_km || 0), 0) || 0
  const totalTime = routes?.reduce((sum: number, r: any) => sum + (r.estimated_time_minutes || 0), 0) || 0

  return {
    total_collections: totalCollections,
    completed_routes: completedRoutes,
    total_distance_km: Math.round(totalDistance * 10) / 10,
    total_time_hours: Math.round((totalTime / 60) * 10) / 10,
    avg_collections_per_route: completedRoutes > 0 ? Math.round((totalCollections / completedRoutes) * 10) / 10 : 0,
    efficiency_score: completedRoutes > 0 ? Math.min(100, Math.round((totalCollections / completedRoutes) * 20)) : 0
  }
}

async function generateWasteTrendsReport(supabase: any, dateFrom: string, dateTo: string) {
  const { data: analytics } = await supabase
    .from('analytics_data')
    .select('*')
    .gte('date', dateFrom)
    .lte('date', dateTo)
    .order('date', { ascending: true })

  const totalCollections = analytics?.reduce((sum: number, a: any) => sum + (a.total_collections || 0), 0) || 0
  const avgFillLevel = analytics?.length > 0 
    ? analytics.reduce((sum: number, a: any) => sum + (a.avg_fill_level || 0), 0) / analytics.length 
    : 0
  const totalCriticalBins = analytics?.reduce((sum: number, a: any) => sum + (a.critical_bins || 0), 0) || 0

  return {
    date_range: { from: dateFrom, to: dateTo },
    total_collections: totalCollections,
    avg_fill_level: Math.round(avgFillLevel * 10) / 10,
    total_critical_alerts: totalCriticalBins,
    daily_trends: analytics || []
  }
}

async function generateBinPerformanceReport(supabase: any, dateFrom: string, dateTo: string) {
  const { data: bins } = await supabase
    .from('bins')
    .select('*')

  const { data: collections } = await supabase
    .from('collection_history')
    .select('*')
    .gte('collected_at', dateFrom)
    .lte('collected_at', dateTo)

  const binStats = bins?.map((bin: any) => {
    const binCollections = collections?.filter((c: any) => c.bin_id === bin.id) || []
    const avgFillBefore = binCollections.length > 0
      ? binCollections.reduce((sum: number, c: any) => sum + c.fill_level_before, 0) / binCollections.length
      : 0

    return {
      bin_id: bin.bin_id,
      location: bin.location,
      current_fill_level: bin.fill_level,
      total_collections: binCollections.length,
      avg_fill_at_collection: Math.round(avgFillBefore * 10) / 10,
      status: bin.status
    }
  }) || []

  return {
    total_bins: bins?.length || 0,
    bin_statistics: binStats,
    most_collected: binStats.sort((a: any, b: any) => b.total_collections - a.total_collections).slice(0, 5)
  }
}

async function generateEnvironmentalImpactReport(supabase: any, dateFrom: string, dateTo: string) {
  const { data: routes } = await supabase
    .from('collection_routes')
    .select('*')
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo)

  const { data: analytics } = await supabase
    .from('analytics_data')
    .select('*')
    .gte('date', dateFrom)
    .lte('date', dateTo)

  const totalDistance = routes?.reduce((sum: number, r: any) => sum + (r.distance_km || 0), 0) || 0
  const fuelSaved = analytics?.reduce((sum: number, a: any) => sum + (a.fuel_savings_amount || 0), 0) || 0
  const distanceSaved = analytics?.reduce((sum: number, a: any) => sum + (a.distance_saved_km || 0), 0) || 0
  
  // Rough estimates: 1L fuel = 2.3kg CO2, average truck consumption 25L/100km
  const estimatedFuelUsed = totalDistance * 0.25 // 25L per 100km
  const co2Emissions = estimatedFuelUsed * 2.3
  const co2Saved = fuelSaved * 2.3

  return {
    total_distance_traveled: Math.round(totalDistance * 10) / 10,
    estimated_fuel_used_liters: Math.round(estimatedFuelUsed * 10) / 10,
    co2_emissions_kg: Math.round(co2Emissions * 10) / 10,
    fuel_savings_liters: Math.round(fuelSaved * 10) / 10,
    distance_saved_km: Math.round(distanceSaved * 10) / 10,
    co2_saved_kg: Math.round(co2Saved * 10) / 10,
    trees_equivalent: Math.round(co2Saved / 21) // 1 tree absorbs ~21kg CO2/year
  }
}