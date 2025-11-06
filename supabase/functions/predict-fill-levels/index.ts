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

    // Get all bins
    const { data: bins, error: binsError } = await supabaseClient
      .from('bins')
      .select('*')

    if (binsError) throw binsError

    // Get collection history for trend analysis
    const { data: history, error: historyError } = await supabaseClient
      .from('collection_history')
      .select('*')
      .order('collected_at', { ascending: false })
      .limit(1000)

    if (historyError) throw historyError

    const predictions = []

    for (const bin of bins) {
      // Get bin-specific history
      const binHistory = history?.filter(h => h.bin_id === bin.id) || []
      
      if (binHistory.length < 2) {
        // Not enough data, use default prediction
        const daysToFull = estimateDaysToFull(bin.fill_level, 10) // Assume 10% per day
        const predictedDate = new Date()
        predictedDate.setDate(predictedDate.getDate() + daysToFull)
        
        const prediction = {
          bin_id: bin.id,
          predicted_fill_date: predictedDate.toISOString(),
          predicted_fill_level: 90,
          confidence_score: 0.5
        }
        
        predictions.push(prediction)
        continue
      }

      // Calculate fill rate from history
      const fillRate = calculateFillRate(binHistory)
      const daysToFull = estimateDaysToFull(bin.fill_level, fillRate)
      
      const predictedDate = new Date()
      predictedDate.setDate(predictedDate.getDate() + daysToFull)
      
      const prediction = {
        bin_id: bin.id,
        predicted_fill_date: predictedDate.toISOString(),
        predicted_fill_level: 90,
        confidence_score: Math.min(0.95, 0.6 + (binHistory.length * 0.05))
      }
      
      predictions.push(prediction)
    }

    // Store predictions in database
    for (const prediction of predictions) {
      await supabaseClient
        .from('waste_predictions')
        .upsert(prediction, {
          onConflict: 'bin_id,predicted_fill_date'
        })
    }

    console.log(`Generated ${predictions.length} predictions`)

    return new Response(
      JSON.stringify({ 
        message: `Generated predictions for ${predictions.length} bins`,
        predictions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in predict-fill-levels:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function calculateFillRate(history: any[]): number {
  if (history.length < 2) return 10 // Default 10% per day

  // Calculate average days between collections
  const intervals = []
  for (let i = 0; i < history.length - 1; i++) {
    const date1 = new Date(history[i].collected_at)
    const date2 = new Date(history[i + 1].collected_at)
    const days = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
    const fillChange = history[i].fill_level_before - history[i + 1].fill_level_after
    
    if (days > 0 && fillChange > 0) {
      intervals.push(fillChange / days)
    }
  }

  if (intervals.length === 0) return 10

  // Return average fill rate per day
  const avgRate = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return Math.max(5, Math.min(20, avgRate)) // Clamp between 5-20% per day
}

function estimateDaysToFull(currentLevel: number, fillRatePerDay: number): number {
  const remainingCapacity = 90 - currentLevel // Target 90% as "full"
  if (remainingCapacity <= 0) return 0
  
  const days = remainingCapacity / fillRatePerDay
  return Math.max(1, Math.ceil(days))
}