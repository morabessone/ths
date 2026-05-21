import { pickMealForMoment } from '@/lib/nutrition/mealComposer';
import type {
  BiometricsInput,
  CravingType,
  DailyPlanBuilt,
  Meal,
  MicroGuidance,
  NowSuggestion,
} from '@/types/nutrition.types';

const PROTEIN_BAR_TIPS = {
  brands: [
    'Quest (alta proteína, edulcorantes)',
    'Grenade Carb Killa (perfil alto en prote)',
    'Naturya / barritas >20 g proteína con etiqueta corta',
  ],
  tip: 'Elegí barritas con ≥18 g de proteína por porción, <8 g de azúcares añadidos y lista de ingredientes corta (sin jarabe de maíz ni aceites hidrogenados).',
};

function sweetHealthyOptions(fridge: string[]): NowSuggestion[] {
  const hasYogurt = fridge.some((f) => f.includes('yogur'));
  const hasFruit = fridge.some((f) => f.includes('banana') || f.includes('fruta'));
  return [
    {
      id: 'sweet-1',
      title: hasYogurt ? 'Yogur griego con cacao y fruta' : 'Fruta con manteca de maní',
      description: 'Dulzor natural + proteína/fibra para que no te dispare el hambre en 30 min.',
      type: hasYogurt ? 'fridge_meal' : 'quick_option',
      aligns_with_plan: 'Hidratos con moderación, proteína para saciedad.',
      tip: 'Sumá canela en lugar de azúcar extra.',
    },
    {
      id: 'sweet-2',
      title: 'Antojo dulce — versión barrita',
      description: PROTEIN_BAR_TIPS.tip,
      type: 'pantry_tip',
      brands: PROTEIN_BAR_TIPS.brands,
      aligns_with_plan: 'Útil si no tenés tiempo de cocinar; no reemplaza una comida completa.',
    },
  ];
}

function saltyHealthyOptions(fridge: string[]): NowSuggestion[] {
  const hasEggs = fridge.some((f) => f.includes('huevo'));
  return [
    {
      id: 'salty-1',
      title: hasEggs ? 'Huevos revueltos con tomate' : 'Palitos de zanahoria con hummus',
      description: 'Salado saciante con proteína o fibra, bajo ultraprocesado.',
      type: 'quick_option',
      aligns_with_plan: 'Proteína y grasas buenas sin exceso de sodio industrial.',
    },
    {
      id: 'salty-2',
      title: 'Mix salado inteligente',
      description: 'Puñado de frutos secos sin sal + queso fresco o yogur griego.',
      type: 'pantry_tip',
      aligns_with_plan: 'Evitá snacks fritos; priorizá proteína.',
    },
  ];
}

export function buildNowSuggestions(
  craving: CravingType,
  plan: DailyPlanBuilt,
  bio: BiometricsInput,
  fridgeIngredients: string[]
): NowSuggestion[] {
  const fridge = fridgeIngredients.map((i) => i.toLowerCase());
  const micro = plan.microGuidance;

  if (craving === 'sweet') return sweetHealthyOptions(fridge);
  if (craving === 'salty') return saltyHealthyOptions(fridge);

  if (craving === 'quick') {
    return [
      {
        id: 'quick-bar',
        title: 'Barrita de proteína',
        description: PROTEIN_BAR_TIPS.tip,
        type: 'pantry_tip',
        brands: PROTEIN_BAR_TIPS.brands,
        aligns_with_plan: `Te faltan ~${Math.max(0, plan.targets.protein_g - 40)} g de proteína para cerrar el día.`,
      },
      {
        id: 'quick-shake',
        title: 'Batido rápido',
        description: '30 g proteína en polvo + agua o leche + banana si tenés.',
        type: 'pantry_tip',
        aligns_with_plan: 'Equivalente a una merienda post-entreno liviana.',
      },
    ];
  }

  // hungry — armar desde heladera según momento del día
  const hour = new Date().getHours();
  const moment =
    hour < 11 ? 'breakfast' : hour < 15 ? 'lunch' : hour < 18 ? 'snack' : 'dinner';
  const meal = pickMealForMoment(
    moment as 'breakfast' | 'lunch' | 'snack' | 'dinner',
    bio,
    fridgeIngredients,
    micro as MicroGuidance[]
  );

  const suggestions: NowSuggestion[] = [
    {
      id: 'now-fridge',
      title: meal.name,
      description: meal.why ?? 'Opción alineada a tu plan y heladera.',
      type: 'fridge_meal',
      meal,
      aligns_with_plan: `${meal.macros.protein_g} g prote · ${meal.macros.carbs_g} g hidratos · ${meal.macros.calories} kcal`,
    },
  ];

  const avail = meal.ingredients.filter((i) => i.available).length;
  if (avail < meal.ingredients.length) {
    suggestions.push({
      id: 'now-shop',
      title: 'Completá con alternativas',
      description: `Faltan: ${meal.ingredients.filter((i) => !i.available).map((i) => i.name).join(', ')}. Podés cambiar por proteína similar (pollo ↔ atún ↔ huevos).`,
      type: 'pantry_tip',
      aligns_with_plan: 'Misma distribución de macros, distintos ingredientes.',
    });
  }

  return suggestions;
}
