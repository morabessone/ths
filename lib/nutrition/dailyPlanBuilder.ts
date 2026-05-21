import { calculateNutrientTargets, adjustTargetsFromStudies } from '@/lib/nutrition/engine';
import { buildMicroGuidance } from '@/lib/nutrition/microGuidance';
import { pickMealForMoment, scaleMealToSlot } from '@/lib/nutrition/mealComposer';
import { generateSupplementStack } from '@/lib/nutrition/supplements';
import type { NormalizedHealthData } from '@/types/health.types';
import type {
  BiometricsInput,
  DailyPlanBuilt,
  DailyPlanBuilderInput,
  Meal,
  MedicalStudy,
  PlanMoment,
  TrainingTimeSlot,
} from '@/types/nutrition.types';

function trainingTimeSlot(bio: BiometricsInput): TrainingTimeSlot {
  const t = bio.training_time ?? 'morning';
  if (t === 'afternoon' || t === 'evening') return t;
  return 'morning';
}

function allocateSlots(
  targets: ReturnType<typeof calculateNutrientTargets>,
  isTraining: boolean,
  time: TrainingTimeSlot
) {
  const total = {
    calories: targets.calories_kcal,
    protein_g: targets.protein_g,
    carbs_g: targets.carbs_g,
  };
  if (!isTraining) {
    return {
      breakfast: { calories: total.calories * 0.28, protein_g: total.protein_g * 0.25, carbs_g: total.carbs_g * 0.3 },
      lunch: { calories: total.calories * 0.32, protein_g: total.protein_g * 0.35, carbs_g: total.carbs_g * 0.35 },
      snack: { calories: total.calories * 0.12, protein_g: total.protein_g * 0.15, carbs_g: total.carbs_g * 0.15 },
      dinner: { calories: total.calories * 0.28, protein_g: total.protein_g * 0.25, carbs_g: total.carbs_g * 0.2 },
      pre: null,
      post: null,
    };
  }
  if (time === 'morning') {
    return {
      breakfast: { calories: total.calories * 0.22, protein_g: total.protein_g * 0.2, carbs_g: total.carbs_g * 0.28 },
      pre: { calories: total.calories * 0.12, protein_g: total.protein_g * 0.12, carbs_g: total.carbs_g * 0.18 },
      lunch: { calories: total.calories * 0.28, protein_g: total.protein_g * 0.3, carbs_g: total.carbs_g * 0.25 },
      post: { calories: total.calories * 0.14, protein_g: total.protein_g * 0.18, carbs_g: total.carbs_g * 0.2 },
      snack: null,
      dinner: { calories: total.calories * 0.24, protein_g: total.protein_g * 0.2, carbs_g: total.carbs_g * 0.09 },
    };
  }
  return {
    breakfast: { calories: total.calories * 0.25, protein_g: total.protein_g * 0.22, carbs_g: total.carbs_g * 0.22 },
    pre: { calories: total.calories * 0.1, protein_g: total.protein_g * 0.1, carbs_g: total.carbs_g * 0.15 },
    lunch: { calories: total.calories * 0.3, protein_g: total.protein_g * 0.32, carbs_g: total.carbs_g * 0.28 },
    post: { calories: total.calories * 0.15, protein_g: total.protein_g * 0.2, carbs_g: total.carbs_g * 0.22 },
    snack: null,
    dinner: { calories: total.calories * 0.2, protein_g: total.protein_g * 0.16, carbs_g: total.carbs_g * 0.13 },
  };
}

function buildMoments(
  isTraining: boolean,
  time: TrainingTimeSlot,
  meals: {
    breakfast: Meal;
    pre?: Meal | null;
    lunch: Meal;
    post?: Meal | null;
    snack: Meal | null;
    dinner: Meal;
  }
): PlanMoment[] {
  const moments: PlanMoment[] = [
    {
      id: 'breakfast',
      label: isTraining && time === 'morning' ? 'Desayuno pre-entreno' : 'Desayuno',
      time_hint: time === 'morning' ? '07:00–08:30' : '08:00–09:30',
      meal: meals.breakfast,
      timing_rationale: meals.breakfast.carb_type,
    },
  ];
  if (meals.pre) {
    moments.push({
      id: 'pre_training',
      label: 'Pre-entrenamiento',
      time_hint: '60–90 min antes',
      meal: meals.pre,
      timing_rationale: 'Hidratos disponibles, poca grasa y fibra.',
    });
  }
  moments.push({
    id: 'lunch',
    label: 'Almuerzo',
    time_hint: '12:30–14:00',
    meal: meals.lunch,
    timing_rationale: meals.lunch.carb_type,
  });
  if (meals.post) {
    moments.push({
      id: 'post_training',
      label: 'Post-entrenamiento',
      time_hint: 'Dentro de 90 min',
      meal: meals.post,
      timing_rationale: 'Proteína rápida + hidratos simples.',
    });
  } else if (meals.snack) {
    moments.push({
      id: 'snack',
      label: 'Merienda',
      time_hint: '16:00–17:30',
      meal: meals.snack,
    });
  }
  moments.push({
    id: 'dinner',
    label: 'Cena',
    time_hint: '20:00–21:30',
    meal: meals.dinner,
    timing_rationale: 'Más proteína, hidratos moderados, grasas de calidad.',
  });
  return moments;
}

export function buildDailyPlan(input: DailyPlanBuilderInput): DailyPlanBuilt {
  const { bio, wearable, studies = [], fridgeIngredients = [] } = input;
  const baseTargets = calculateNutrientTargets(bio, wearable, studies);
  const { targets, alerts } = adjustTargetsFromStudies(baseTargets, studies);
  const microGuidance = buildMicroGuidance(targets, studies);
  const isTraining = targets.day_type === 'training';
  const time = trainingTimeSlot(bio);
  const slots = allocateSlots(targets, isTraining, time);
  const poorSleep = (wearable?.sleepHours ?? 8) < 6.5;

  const breakfast = scaleMealToSlot(
    pickMealForMoment(
      isTraining && time === 'morning' ? 'pre_training' : 'breakfast',
      bio,
      fridgeIngredients,
      microGuidance
    ),
    slots.breakfast
  );

  const pre =
    isTraining && slots.pre && time !== 'morning'
      ? scaleMealToSlot(
          pickMealForMoment('pre_training', bio, fridgeIngredients, microGuidance),
          slots.pre
        )
      : null;

  const lunch = scaleMealToSlot(
    pickMealForMoment('lunch', bio, fridgeIngredients, microGuidance),
    slots.lunch
  );

  const post =
    isTraining && slots.post
      ? scaleMealToSlot(
          pickMealForMoment('post_training', bio, fridgeIngredients, microGuidance),
          slots.post
        )
      : null;

  const snack =
    !isTraining && slots.snack
      ? scaleMealToSlot(
          pickMealForMoment('snack', bio, fridgeIngredients, microGuidance),
          slots.snack
        )
      : null;

  const dinner = scaleMealToSlot(
    pickMealForMoment('dinner', bio, fridgeIngredients, microGuidance),
    slots.dinner
  );

  const meals = { breakfast, pre, lunch, post, snack, dinner };
  const moments = buildMoments(isTraining, time, {
    breakfast,
    pre,
    lunch,
    post,
    snack,
    dinner,
  });

  const studyValues = studies.map((s) => s.values_json);
  const supplements = generateSupplementStack({
    goal: bio.goal,
    studies: studyValues,
    healthConditions: bio.health_conditions ?? [],
    trainingAtNight: time === 'evening',
    poorSleep,
  });

  const daySummary = isTraining
    ? `Día de entrenamiento (${time === 'morning' ? 'mañana' : time === 'afternoon' ? 'tarde' : 'noche'}). Objetivo: ${Math.round(targets.calories_kcal)} kcal, ${targets.protein_g} g proteína, ${targets.carbs_g} g hidratos. No necesitás cargar comidas: seguí las ventanas del plan.`
    : `Día de recuperación. Objetivo: ${Math.round(targets.calories_kcal)} kcal con hidratos moderados y proteína distribuida. El plan usa tu heladera cuando podés.`;

  const education_tip = {
    title: isTraining ? 'Timing de hidratos hoy' : 'Fibra y saciedad',
    content: isTraining
      ? 'En días de entreno priorizamos hidratos simples post-esfuerzo y complejos en el resto del día para energía estable sin picos.'
      : 'En descanso subimos fibra y grasas de calidad para mantener saciedad sin exceso de hidratos simples.',
    topic: 'timing',
  };

  const wearable_context = {
    sleep_hours: wearable?.sleepHours,
    sleep_quality: wearable?.sleepQuality,
    steps: wearable?.steps,
    calories_burned: wearable?.caloriesBurned,
    training_detected: wearable?.trainingDetected,
    training_type: wearable?.trainingType,
    source: wearable?.source,
    plan_summary: daySummary,
    micro_alerts: microGuidance,
  };

  return {
    targets,
    studyAlerts: alerts,
    microGuidance,
    moments,
    breakfast: isTraining && time === 'morning' ? breakfast : breakfast,
    lunch,
    snack: post ?? snack,
    dinner,
    supplements,
    education_tip,
    daySummary,
    wearable_context,
  };
}

export function studiesFromDb(
  rows: { id: string; values_json: unknown; alerts?: unknown; study_date?: string }[]
): MedicalStudy[] {
  return rows.map((r) => ({
    id: r.id,
    values_json: (r.values_json ?? {}) as MedicalStudy['values_json'],
    alerts: Array.isArray(r.alerts) ? (r.alerts as MedicalStudy['alerts']) : [],
    study_date: r.study_date,
  }));
}
