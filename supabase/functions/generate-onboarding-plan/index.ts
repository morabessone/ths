import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callClaude } from '../_shared/anthropic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
Sos un especialista en nutrición y salud metabólica con un enfoque profundamente humano.
Tu filosofía central: la salud no es una ecuación matemática. El cuerpo es un organismo
conectado a la luz, el tiempo, las emociones y el entorno. No contás calorías.
No das tablas de alimentos con gramos exactos. No generás obsesión ni culpa.

Tu tarea es generar un plan de orientación nutricional personalizado para una persona
que quiere empezar a cuidarse mejor. El plan debe:

1. Hablarle directamente al usuario (segunda persona, "te recomiendo", "tu cuerpo").
2. Explicar el PORQUÉ de cada recomendación de manera educativa y accesible.
3. Dar orientaciones de macronutrientes en rangos aproximados, no en objetivos exactos.
4. Incluir timing de alimentación basado en su rutina real (horario de entreno, trabajo, sueño).
5. Recomendar suplementación específica con su razón concreta.
6. Incorporar hábitos de estilo de vida conectados a la salud metabólica.
7. Nunca mencionar contar calorías como objetivo. Si aparece un número calórico, es contexto educativo únicamente.
8. Tono: cálido, motivador, educativo. Como un amigo que sabe mucho, no un médico frío.
9. Extensión: entre 600 y 900 palabras. Bien estructurado con secciones claras en markdown.
10. Terminar siempre con 3-5 "primeros pasos concretos" para esta semana.

Usá markdown: ## para secciones, **negrita** para conceptos clave, > para notas importantes.

Al final del mensaje, en una línea separada que empiece exactamente con "JSON_SUMMARY:",
incluí un JSON válido (sin markdown) con esta forma:
{"protein_range":{"min":120,"max":160,"unit":"g"},"carbs_guidance":"...","fat_guidance":"...","supplements":[],"key_habits":[]}
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

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user_id).single();

    const { data: studies } = await supabase
      .from('medical_studies')
      .select('values_json, alerts')
      .eq('user_id', user_id)
      .order('study_date', { ascending: false })
      .limit(3);

    const studiesSummary =
      studies?.length ?
        studies.map((s) => JSON.stringify(s.values_json)).join('; ')
      : 'No hay estudios cargados aún.';

    const userPrompt = `
Generá un plan de orientación nutricional personalizado para esta persona:

**Datos personales:**
- Nombre: ${profile?.full_name ?? 'Usuario'}
- Edad: ${bio?.age} años
- Sexo biológico: ${bio?.biological_sex === 'male' ? 'Masculino' : 'Femenino'}
- Peso: ${bio?.weight_kg} kg
- Altura: ${bio?.height_cm} cm

**Objetivo principal:**
${bio?.goal} — "${bio?.main_goal_detail ?? 'Sin detalle adicional'}"

**Actividad física:**
- Días de entrenamiento por semana: ${bio?.training_days}
- Tipo: ${bio?.training_type}
- Horario habitual: ${bio?.training_time}
- Trabajo/actividad diaria: ${bio?.work_type ?? 'No informado'}

**Horarios y rutina:**
- Despierta: ${bio?.wake_time ?? 'No informado'}
- Se acuesta: ${bio?.sleep_time ?? 'No informado'}
- Horarios de comidas: ${JSON.stringify(bio?.meal_times ?? {})}
- Calidad del sueño: ${bio?.sleep_quality ?? 'No informada'}

**Alimentación:**
- Estilo: ${bio?.dietary_style}
- Intolerancias: ${bio?.intolerances?.join(', ') || 'Ninguna'}
- Le gusta: ${bio?.food_preferences?.join(', ') || 'No especificado'}
- No le gusta: ${bio?.food_dislikes?.join(', ') || 'No especificado'}
- Cocina: ${bio?.cooking_comfort ?? 'No informado'}
- Alcohol: ${bio?.alcohol_frequency ?? 'No informado'}
- Digestión: ${bio?.digestion_notes ?? 'Ninguna'}

**Hábitos:**
- Sol: ${bio?.sunlight_exposure ?? 'No informado'}
- Hidratación: ${bio?.hydration_habit ?? 'No informado'}
- Estrés: ${bio?.stress_level ?? 'No informado'}
- Suplementos actuales: ${bio?.current_supplements?.join(', ') || 'Ninguno'}
- Condiciones: ${bio?.health_conditions?.join(', ') || 'Ninguna'}

**Estudios médicos:**
${studiesSummary}

Generá el plan completo ahora.
`;

    const raw = await callClaude({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 2500,
    });

    let planText = raw;
    let nutritionSummary = null;
    const jsonMarker = raw.indexOf('JSON_SUMMARY:');
    if (jsonMarker >= 0) {
      planText = raw.slice(0, jsonMarker).trim();
      try {
        nutritionSummary = JSON.parse(raw.slice(jsonMarker + 'JSON_SUMMARY:'.length).trim());
      } catch {
        nutritionSummary = null;
      }
    }

    const row = {
      user_id,
      plan_text: planText,
      nutrition_summary: nutritionSummary,
      model_used: 'claude-sonnet-4-20250514',
      generated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('onboarding_plan')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from('onboarding_plan').update(row).eq('id', existing.id);
    } else {
      await supabase.from('onboarding_plan').insert(row);
    }

    return new Response(JSON.stringify({ plan_text: planText, nutrition_summary: nutritionSummary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
