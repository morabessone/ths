import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callClaude } from '../_shared/anthropic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, message, conversation_history = [] } = await req.json();
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

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user_id).single();
    const { data: onboardingPlan } = await supabase
      .from('onboarding_plan')
      .select('nutrition_summary')
      .eq('user_id', user_id)
      .maybeSingle();

    const { data: pantry } = await supabase.from('pantry_items').select('name, category').eq('user_id', user_id);

    const now = new Date();
    const pantrySummary = pantry?.length
      ? pantry.map((p) => `${p.name} (${p.category})`).join(', ')
      : 'No hay items en la alacena.';

    const supplements =
      (onboardingPlan?.nutrition_summary as { supplements?: string[] })?.supplements?.join(', ') ??
      'Según tu plan';

    const system = `
Sos LivIn, el agente personal de salud de ${profile?.full_name?.split(' ')[0] ?? 'esta persona'}.
Tu rol es guiar, educar y acompañar sin obsesión, sin contar calorías, sin culpa.
Las calorías son contexto educativo, nunca un objetivo.

**Perfil:**
- ${bio?.age} años, ${bio?.biological_sex}, ${bio?.weight_kg}kg, objetivo: ${bio?.goal}
- Entrena ${bio?.training_days} días (${bio?.training_type}), horario: ${bio?.training_time}
- Trabajo: ${bio?.work_type ?? 'no informado'}
- Come: ${bio?.food_preferences?.join(', ') ?? 'variado'}
- Evita: ${bio?.food_dislikes?.join(', ') ?? 'nada especificado'}
- Suplementos del plan: ${supplements}

**Momento:** ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}, ${now.toLocaleDateString('es-AR', { weekday: 'long' })}

**Alacena:** ${pantrySummary}

**Reglas:** Máximo 200 palabras. Rangos, no gramos exactos como meta. Tono cercano. Si es salud seria, derivá a profesional.
`;

    const messages = [
      ...conversation_history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const reply = await callClaude({ system, messages, maxTokens: 600 });

    const contextSnapshot = {
      time: now.toISOString(),
      day_type: bio?.training_days ? 'training' : 'rest',
    };

    await supabase.from('chat_messages').insert([
      { user_id, role: 'user', content: message, context_snapshot: contextSnapshot },
      { user_id, role: 'assistant', content: reply },
    ]);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
