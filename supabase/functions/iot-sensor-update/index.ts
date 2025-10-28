import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bin_id, fill_level, latitude, longitude } = await req.json();

    console.log(`IoT Update received for bin: ${bin_id}, fill_level: ${fill_level}`);

    if (!bin_id || fill_level === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: bin_id and fill_level' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate fill_level range
    if (fill_level < 0 || fill_level > 100) {
      return new Response(
        JSON.stringify({ error: 'fill_level must be between 0 and 100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if bin exists
    const { data: existingBin, error: fetchError } = await supabase
      .from('bins')
      .select('id')
      .eq('bin_id', bin_id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching bin:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update existing bin or create new one
    if (existingBin) {
      const updateData: any = { 
        fill_level,
        last_updated: new Date().toISOString()
      };
      
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;

      const { data, error } = await supabase
        .from('bins')
        .update(updateData)
        .eq('bin_id', bin_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating bin:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update bin' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Bin ${bin_id} updated successfully:`, data);
      return new Response(
        JSON.stringify({ success: true, bin: data, message: 'Bin updated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Create new bin
      const { data, error } = await supabase
        .from('bins')
        .insert({
          bin_id,
          location: `Bin ${bin_id}`,
          fill_level,
          latitude,
          longitude,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bin:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create bin' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`New bin ${bin_id} created successfully:`, data);
      return new Response(
        JSON.stringify({ success: true, bin: data, message: 'New bin created successfully' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
