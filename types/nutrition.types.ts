export type BiologicalSex = 'male' | 'female';
export type Goal = 'hypertrophy' | 'fat_loss' | 'performance' | 'general_health' | 'energy';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type TrainingType = 'strength' | 'cardio' | 'mixed' | 'functional' | 'none';
export type DayType = 'training' | 'rest' | 'light_activity';
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
  available: boolean;
}

export interface MealMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal {
  name: string;
  timing_note?: string;
  why?: string;
  ingredients: MealIngredient[];
  macros: MealMacros;
  micros?: Record<string, number>;
  preparation: string[];
}

export interface SupplementRecommendation {
  name: string;
  dose: string;
  timing: string;
  with?: string;
  why: string;
}

export interface EducationTip {
  title: string;
  content: string;
  topic: string;
}

export interface WearableContext {
  sleep_hours?: number;
  sleep_quality?: string;
  steps?: number;
  calories_burned?: number;
  training_detected?: boolean;
}

export interface NutrientTargets {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  vit_d_mcg: number;
  vit_b12_mcg: number;
  vit_c_mg: number;
  vit_a_mcg: number;
  folate_mcg: number;
  iron_mg: number;
  calcium_mg: number;
  magnesium_mg: number;
  zinc_mg: number;
  potassium_mg: number;
  sodium_mg: number;
  omega3_g: number;
  water_ml: number;
  day_type: DayType;
  training_focus: TrainingType;
}

export interface StudyAlert {
  parameter: string;
  severity: 'low' | 'moderate' | 'high';
  message: string;
}

export interface MedicalStudyValues {
  vitamin_d?: number;
  b12?: number;
  ferritin?: number;
  tsh?: number;
  hdl?: number;
  ldl?: number;
  triglycerides?: number;
  crp?: number;
  magnesium?: number;
  [key: string]: number | undefined;
}

export interface MedicalStudy {
  id: string;
  values_json: MedicalStudyValues;
  alerts: StudyAlert[];
  study_date?: string;
}

export interface BiometricsInput {
  weight_kg: number;
  height_cm: number;
  age: number;
  biological_sex: BiologicalSex;
  goal: Goal;
  activity_level: ActivityLevel;
  training_days: number;
  training_type: TrainingType;
  training_time?: string;
  dietary_style?: string;
  intolerances?: string[];
  health_conditions?: string[];
  lean_mass_kg?: number;
}
