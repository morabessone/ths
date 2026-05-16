import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: bio } = await supabase
      .from('biometrics')
      .select('*')
      .eq('user_id', user_id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    const today = new Date().toISOString().split('T')[0];

    const { data: wearable } = await supabase
      .from('wearable_data')
      .select('*')
      .eq('user_id', user_id)
      .eq('date', today)
      .maybeSingle();

    const { data: studies } = await supabase
      .from('medical_studies')
      .select('*')
      .eq('user_id', user_id)
      .order('study_date', { ascending: false })
      .limit(5);

    // Motor nutricional: en producción importar desde shared package
    // Por ahora delegamos al cliente con datos mínimos persistidos
    const placeholderPlan = {
      user_id,
      date: today,
      breakfast: { name: 'Plan generado', macros: { calories: 400, protein_g: 30, carbs_g: 50, fat_g: 10 } },
      wearable_context: wearable,
      generated_at: new Date().toISOString(),
    };

    await supabase.from('daily_plan').upsert(placeholderPlan, { onConflict: 'user_id,date' });

    return new Response(JSON.stringify({ success: true, bio, studies_count: studies?.length ?? 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
