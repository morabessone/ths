import { SUPPLEMENTS_DATABASE, type StudyTrigger } from '@/constants/supplements';
import type { SupplementRecommendation } from '@/types/nutrition.types';
import type { MedicalStudyValues } from '@/types/nutrition.types';
import type { Goal } from '@/types/nutrition.types';

function matchesTrigger(
  values: MedicalStudyValues,
  trigger: StudyTrigger
): boolean {
  const val = values[trigger.param];
  if (val === undefined) return false;
  if (trigger.operator === 'lt') return val < trigger.threshold;
  return val > trigger.threshold;
}

export function generateSupplementStack(params: {
  goal: Goal;
  studies: MedicalStudyValues[];
  healthConditions: string[];
  trainingAtNight?: boolean;
  poorSleep?: boolean;
}): SupplementRecommendation[] {
  const mergedValues = Object.assign({}, ...params.studies);
  const recommendations: SupplementRecommendation[] = [];

  for (const [, def] of Object.entries(SUPPLEMENTS_DATABASE)) {
    if (
      def.contraindicated_conditions?.some((c) =>
        params.healthConditions.includes(c)
      )
    ) {
      continue;
    }

    let include = false;
    let why = def.why_template;

    if (def.indicated_for?.includes(params.goal)) include = true;

    if (def.study_triggers?.some((t) => matchesTrigger(mergedValues, t))) {
      include = true;
      if (mergedValues.vitamin_d !== undefined) {
        why = why.replace('{value}', String(mergedValues.vitamin_d));
      }
    }

    if (params.trainingAtNight && def.lifestyle_triggers?.includes('training_at_night')) {
      include = true;
    }
    if (params.poorSleep && def.lifestyle_triggers?.includes('poor_sleep')) {
      include = true;
    }

    if (!include) continue;

    const dose = `${def.defaultDose.amount}${def.defaultDose.unit}`;
    const timingLabels: Record<string, string> = {
      post_training: 'Post-entreno',
      before_bed: 'Antes de dormir',
      with_breakfast: 'Con el desayuno',
      with_lunch: 'Con el almuerzo',
    };

    recommendations.push({
      name: def.name,
      dose,
      timing: timingLabels[def.timing] ?? def.timing,
      why,
    });
  }

  return recommendations;
}
