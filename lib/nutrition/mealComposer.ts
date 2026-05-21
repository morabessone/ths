import { MEAL_TEMPLATES, type MealTemplate } from '@/constants/meal-templates';
import type {
  BiometricsInput,
  DietaryStyle,
  Meal,
  MealIngredient,
  MicroGuidance,
  PlanMomentId,
} from '@/types/nutrition.types';

function normalizeDiet(style?: string): DietaryStyle {
  const s = (style ?? 'omnivore') as DietaryStyle;
  if (MEAL_TEMPLATES.some((t) => t.diets.includes(s))) return s;
  return 'omnivore';
}

function markAvailability(ingredients: MealIngredient[], fridge: Set<string>): MealIngredient[] {
  return ingredients.map((ing) => {
    const key = ing.name.toLowerCase();
    const available =
      fridge.size === 0 ||
      [...fridge].some(
        (f) => key.includes(f) || f.includes(key) || key.split(' ').some((w) => w.length > 3 && f.includes(w))
      );
    return { ...ing, available };
  });
}

function scoreTemplate(
  template: MealTemplate,
  diet: DietaryStyle,
  moment: PlanMomentId,
  fridge: Set<string>,
  preferFish: boolean
): number {
  if (template.moment !== moment && moment !== 'snack') return -1;
  if (!template.diets.includes(diet) && diet !== 'omnivore') return -1;
  let score = 10;
  if (preferFish && template.tags.includes('fish')) score += 15;
  if (preferFish && template.tags.includes('vit_d')) score += 10;
  const ings = markAvailability(template.ingredients, fridge);
  const avail = ings.filter((i) => i.available).length;
  score += avail * 4;
  if (template.tags.includes('post_workout') && moment === 'post_training') score += 8;
  if (template.tags.includes('pre_workout') && moment === 'pre_training') score += 8;
  return score;
}

export function pickMealForMoment(
  moment: PlanMomentId,
  bio: BiometricsInput,
  fridgeIngredients: string[],
  microGuidance: MicroGuidance[],
  macroScale = 1
): Meal {
  const diet = normalizeDiet(bio.dietary_style);
  const fridge = new Set(fridgeIngredients.map((i) => i.toLowerCase().trim()));
  const preferFish = microGuidance.some((g) => g.nutrient.includes('Vitamina D'));

  const candidates = MEAL_TEMPLATES.map((t) => ({
    t,
    score: scoreTemplate(t, diet, moment, fridge, preferFish),
  }))
    .filter((c) => c.score >= 0)
    .sort((a, b) => b.score - a.score);

  const template = candidates[0]?.t ?? MEAL_TEMPLATES.find((t) => t.moment === moment) ?? MEAL_TEMPLATES[0];
  const ingredients = markAvailability(template.ingredients, fridge);

  const missing = ingredients.filter((i) => !i.available).map((i) => i.name);
  let why = template.why ?? '';
  if (missing.length > 0 && fridge.size > 0) {
    why += ` Te falta en heladera: ${missing.join(', ')}. Podés reemplazar por algo similar.`;
  } else if (fridge.size > 0) {
    why += ' Armado priorizando lo que tenés en heladera.';
  }

  const m = template.macros;
  return {
    name: template.name,
    timing_note: template.timing_note,
    why,
    carb_type: template.carb_type,
    moment_id: moment,
    ingredients,
    macros: {
      calories: Math.round(m.calories * macroScale),
      protein_g: Math.round(m.protein_g * macroScale),
      carbs_g: Math.round(m.carbs_g * macroScale),
      fat_g: Math.round(m.fat_g * macroScale),
    },
    preparation: template.preparation,
  };
}

export function scaleMealToSlot(meal: Meal, target: { protein_g: number; carbs_g: number; calories: number }): Meal {
  const ratio = Math.min(
    1.35,
    Math.max(
      0.75,
      target.protein_g / Math.max(meal.macros.protein_g, 1)
    )
  );
  return {
    ...meal,
    macros: {
      calories: Math.round(meal.macros.calories * ratio),
      protein_g: Math.round(meal.macros.protein_g * ratio),
      carbs_g: Math.round(meal.macros.carbs_g * ratio),
      fat_g: Math.round(meal.macros.fat_g * ratio),
    },
  };
}
