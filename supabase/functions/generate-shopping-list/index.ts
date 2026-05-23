import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callClaude } from '../_shared/anthropic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
Sos un nutricionista que arma listas de compras inteligentes.
Analizá el stock actual del usuario y su perfil.

Devolvé ÚNICAMENTE un JSON válido sin texto adicional:
{
  "items": [
    {
      "name": "nombre del producto",
      "reason": "razón específica (máx 1 oración)",
      "category": "protein|vegetable|fruit|grain|dairy|fat|legume|supplement|condiment|frozen|canned|spice|other",
      "priority": "high|medium|low"
    }
  ],
  "budget_estimate": {
    "currency": "ARS",
    "total_min": número,
    "total_max": número,
    "note": "estimación orientativa"
  }
}
Máximo 20 items.
`;

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

    const { data: pantry } = await supabase.from('pantry_items').select('*').eq('user_id', user_id);
    const { data: plan } = await supabase
      .from('onboarding_plan')
      .select('nutrition_summary')
      .eq('user_id', user_id)
      .maybeSingle();

    const raw = await callClaude({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Perfil: ${JSON.stringify(bio)}\nStock: ${JSON.stringify(pantry)}\nPlan: ${JSON.stringify(plan?.nutrition_summary)}`,
        },
      ],
      maxTokens: 1200,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { items: [], budget_estimate: { currency: 'ARS', note: 'Sin estimación' } };

    await supabase.from('shopping_suggestions').insert({
      user_id,
      items: parsed.items ?? [],
      budget_estimate: parsed.budget_estimate ?? null,
    });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
