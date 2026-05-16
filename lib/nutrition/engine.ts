import { MICRONUTRIENT_DRI } from '@/constants/nutrients';
import type {
  BiometricsInput,
  BiologicalSex,
  DayType,
  Goal,
  MedicalStudy,
  NutrientTargets,
  StudyAlert,
  TrainingType,
} from '@/types/nutrition.types';
import type { NormalizedHealthData } from '@/types/health.types';

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

export const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  hypertrophy: 250,
  fat_loss: -400,
  performance: 100,
  general_health: 0,
  energy: 50,
};

const PROTEIN_TARGETS: Record<Goal, { min: number; max: number }> = {
  hypertrophy: { min: 2.0, max: 2.4 },
  fat_loss: { min: 2.2, max: 2.6 },
  performance: { min: 1.8, max: 2.2 },
  general_health: { min: 1.4, max: 1.8 },
  energy: { min: 1.6, max: 2.0 },
};

export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: BiologicalSex;
  leanMassKg?: number;
}): number {
  if (params.leanMassKg && params.leanMassKg > 0) {
    return 370 + 21.6 * params.leanMassKg;
  }
  if (params.sex === 'male') {
    return 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age + 5;
  }
  return 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age - 161;
}

export function calculateDynamicActivityFactor(
  bmr: number,
  wearable?: NormalizedHealthData | null
): number {
  if (!wearable?.caloriesBurned || wearable.caloriesBurned <= 0) return 1.55;
  const factor = wearable.caloriesBurned / bmr;
  return Math.min(1.9, Math.max(1.2, factor));
}

export function calculateTDEE(
  bmr: number,
  activityLevel: keyof typeof ACTIVITY_FACTORS,
  wearable?: NormalizedHealthData | null
): number {
  const factor = wearable
    ? calculateDynamicActivityFactor(bmr, wearable)
    : ACTIVITY_FACTORS[activityLevel];
  return Math.round(bmr * factor);
}

export function getDayType(
  trainingDays: number,
  wearable?: NormalizedHealthData | null
): { dayType: DayType; trainingFocus: TrainingType } {
  if (wearable?.trainingDetected) {
    const type = (wearable.trainingType as TrainingType) ?? 'mixed';
    return { dayType: 'training', trainingFocus: type };
  }
  if (trainingDays > 0) {
    return { dayType: 'training', trainingFocus: 'strength' };
  }
  return { dayType: 'rest', trainingFocus: 'none' };
}

export function calculateMacros(
  calories: number,
  weightKg: number,
  goal: Goal,
  dayType: DayType,
  trainingFocus: TrainingType,
  leanMassKg?: number
): { protein_g: number; carbs_g: number; fat_g: number; fiber_g: number } {
  const refWeight = leanMassKg && leanMassKg > 0 ? leanMassKg : weightKg;
  const range = PROTEIN_TARGETS[goal];
  let proteinPerKg = (range.min + range.max) / 2;

  if (dayType === 'training' && trainingFocus === 'strength') {
    proteinPerKg *= 1.2;
  } else if (dayType === 'training' && trainingFocus === 'cardio') {
    proteinPerKg *= 1.1;
  }

  const protein_g = Math.round(refWeight * proteinPerKg);
  const proteinCal = protein_g * 4;

  let fatPct = dayType === 'rest' ? 0.3 : 0.25;
  const fatCal = Math.round((calories - proteinCal) * fatPct);
  const fat_g = Math.round(fatCal / 9);

  let carbsCal = calories - proteinCal - fatCal;
  if (dayType === 'training' && trainingFocus === 'cardio') {
    carbsCal = Math.round(carbsCal * 1.15);
  } else if (dayType === 'rest') {
    carbsCal = Math.round(carbsCal * 0.9);
  }
  const carbs_g = Math.max(0, Math.round(carbsCal / 4));
  const fiber_g = dayType === 'rest' ? 30 : 25;

  return { protein_g, carbs_g, fat_g, fiber_g };
}

export function getMicroTargets(sex: BiologicalSex): Omit<
  NutrientTargets,
  'calories_kcal' | 'protein_g' | 'carbs_g' | 'fat_g' | 'fiber_g' | 'day_type' | 'training_focus'
> {
  const key = sex === 'male' ? 'male' : 'female';
  return {
    vit_d_mcg: MICRONUTRIENT_DRI.vit_d_mcg[key],
    vit_b12_mcg: MICRONUTRIENT_DRI.vit_b12_mcg[key],
    vit_c_mg: MICRONUTRIENT_DRI.vit_c_mg[key],
    vit_a_mcg: MICRONUTRIENT_DRI.vit_a_mcg[key],
    folate_mcg: MICRONUTRIENT_DRI.folate_mcg[key],
    iron_mg: MICRONUTRIENT_DRI.iron_mg[key],
    calcium_mg: MICRONUTRIENT_DRI.calcium_mg[key],
    magnesium_mg: MICRONUTRIENT_DRI.magnesium_mg[key],
    zinc_mg: MICRONUTRIENT_DRI.zinc_mg[key],
    potassium_mg: MICRONUTRIENT_DRI.potassium_mg[key],
    sodium_mg: MICRONUTRIENT_DRI.sodium_mg[key],
    omega3_g: MICRONUTRIENT_DRI.omega3_g[key],
    water_ml: 2500,
  };
}

export function adjustTargetsFromStudies(
  baseTargets: NutrientTargets,
  studies: MedicalStudy[]
): { targets: NutrientTargets; alerts: StudyAlert[] } {
  const targets = { ...baseTargets };
  const alerts: StudyAlert[] = [];

  for (const study of studies) {
    const v = study.values_json;
    if (v.vitamin_d !== undefined && v.vitamin_d < 30) {
      targets.vit_d_mcg = 50;
      alerts.push({
        parameter: 'vitamin_d',
        severity: v.vitamin_d < 20 ? 'high' : 'moderate',
        message: `Vitamina D en ${v.vitamin_d} ng/mL — objetivo elevado a 50 mcg/día.`,
      });
    }
    if (v.ferritin !== undefined && v.ferritin < 30) {
      targets.iron_mg = 25;
      alerts.push({
        parameter: 'ferritin',
        severity: 'moderate',
        message: 'Ferritina baja — objetivo de hierro aumentado.',
      });
    }
    if (v.magnesium !== undefined && v.magnesium < 0.85) {
      targets.magnesium_mg = Math.max(targets.magnesium_mg, 450);
      alerts.push({
        parameter: 'magnesium',
        severity: 'moderate',
        message: 'Magnesio sérico bajo — considerá suplementación.',
      });
    }
    alerts.push(...study.alerts);
  }

  return { targets, alerts };
}

export function calculateNutrientTargets(
  bio: BiometricsInput,
  wearable?: NormalizedHealthData | null,
  studies: MedicalStudy[] = []
): NutrientTargets {
  const bmr = calculateBMR({
    weightKg: bio.weight_kg,
    heightCm: bio.height_cm,
    age: bio.age,
    sex: bio.biological_sex,
    leanMassKg: bio.lean_mass_kg,
  });

  const tdee = calculateTDEE(bmr, bio.activity_level, wearable);
  const calories = Math.max(1200, tdee + GOAL_ADJUSTMENTS[bio.goal]);
  const { dayType, trainingFocus } = getDayType(bio.training_days, wearable);
  const macros = calculateMacros(
    calories,
    bio.weight_kg,
    bio.goal,
    dayType,
    trainingFocus,
    bio.lean_mass_kg
  );
  const micros = getMicroTargets(bio.biological_sex);

  const base: NutrientTargets = {
    calories_kcal: calories,
    ...macros,
    ...micros,
    day_type: dayType,
    training_focus: trainingFocus,
  };

  const { targets } = adjustTargetsFromStudies(base, studies);
  return targets;
}
