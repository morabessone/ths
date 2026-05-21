import type { DailyPlanBuilt, DailyPlanBuilderInput } from '@/types/nutrition.types';
import { buildDailyPlan } from '@/lib/nutrition/dailyPlanBuilder';

/**
 * Capa IA: refina textos del plan con lineamientos fijos.
 * Si hay OPENAI en el entorno, se puede extender; por ahora enriquece localmente.
 */
export async function buildPlanWithAI(input: DailyPlanBuilderInput): Promise<DailyPlanBuilt> {
  const plan = buildDailyPlan(input);

  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return enrichPlanLocally(plan, input);
  }

  try {
    const prompt = buildPrompt(input, plan);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'Sos nutricionista de LivIn. Respondé SOLO JSON válido en español. No pedís que el usuario registre comidas. Enfocate en asesorar macros, micros, timing de hidratos y heladera.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return enrichPlanLocally(plan, input);
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content;
    if (!text) return enrichPlanLocally(plan, input);
    const parsed = JSON.parse(text) as {
      day_summary?: string;
      education_title?: string;
      education_content?: string;
    };
    if (parsed.day_summary) plan.daySummary = parsed.day_summary;
    if (parsed.education_title) plan.education_tip.title = parsed.education_title;
    if (parsed.education_content) plan.education_tip.content = parsed.education_content;
    plan.wearable_context.plan_summary = plan.daySummary;
    return plan;
  } catch {
    return enrichPlanLocally(plan, input);
  }
}

function buildPrompt(input: DailyPlanBuilderInput, plan: DailyPlanBuilt): string {
  return JSON.stringify({
    instrucciones:
      'Mejorá day_summary y education_tip sin cambiar números de macros. Mencioná timing de entreno y micros si aplican.',
    bio: input.bio,
    targets: plan.targets,
    micro: plan.microGuidance,
    moments: plan.moments.map((m) => ({ label: m.label, meal: m.meal?.name })),
  });
}

function enrichPlanLocally(
  plan: DailyPlanBuilt,
  input: DailyPlanBuilderInput
): DailyPlanBuilt {
  const diet = input.bio.dietary_style ?? 'omnivore';
  const extra =
    plan.microGuidance.length > 0
      ? ` Hoy reforzamos: ${plan.microGuidance.map((m) => m.nutrient).join(', ')}.`
      : '';
  plan.daySummary += ` Estilo ${diet}.${extra}`;
  plan.wearable_context.plan_summary = plan.daySummary;
  return plan;
}
