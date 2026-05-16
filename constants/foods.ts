import type { Meal } from '@/types/nutrition.types';

export const SAMPLE_MEALS: Record<string, Meal> = {
  breakfast_training: {
    name: 'Avena con banana y claras',
    timing_note: '60 min antes de entrenar',
    why: 'Hidratos simples y complejos para energía sostenida sin pesadez gástrica.',
    ingredients: [
      { name: 'Avena', quantity: 80, unit: 'g', available: true },
      { name: 'Banana', quantity: 1, unit: 'unidad', available: true },
      { name: 'Claras de huevo', quantity: 150, unit: 'g', available: true },
    ],
    macros: { calories: 480, protein_g: 32, carbs_g: 78, fat_g: 8 },
    preparation: [
      'Cociná la avena en agua o leche durante 5 min.',
      'Agregá la banana pisada y las claras revueltas.',
    ],
  },
  lunch_default: {
    name: 'Pollo con arroz y verduras',
    why: 'Combinación equilibrada de proteína magra, hidratos y micronutrientes.',
    ingredients: [
      { name: 'Pechuga de pollo', quantity: 180, unit: 'g', available: true },
      { name: 'Arroz integral', quantity: 150, unit: 'g', available: true },
      { name: 'Brócoli', quantity: 200, unit: 'g', available: false },
    ],
    macros: { calories: 620, protein_g: 52, carbs_g: 65, fat_g: 12 },
    preparation: ['Cociná el arroz.', 'Grillá el pollo.', 'Saltear el brócoli al vapor.'],
  },
  snack_post: {
    name: 'Batido proteico con fruta',
    timing_note: 'Post-entreno',
    why: 'Ventana anabólica: proteína rápida + hidratos para reponer glucógeno.',
    ingredients: [
      { name: 'Proteína en polvo', quantity: 30, unit: 'g', available: true },
      { name: 'Banana', quantity: 1, unit: 'unidad', available: true },
      { name: 'Leche descremada', quantity: 250, unit: 'ml', available: true },
    ],
    macros: { calories: 380, protein_g: 38, carbs_g: 45, fat_g: 4 },
    preparation: ['Mezclá todos los ingredientes en la licuadora.'],
  },
  dinner_rest: {
    name: 'Salmón con ensalada y quinoa',
    why: 'Proteína de alta calidad + grasas omega-3 para recuperación nocturna.',
    ingredients: [
      { name: 'Salmón', quantity: 150, unit: 'g', available: false },
      { name: 'Quinoa', quantity: 80, unit: 'g', available: true },
      { name: 'Espinaca', quantity: 100, unit: 'g', available: true },
    ],
    macros: { calories: 540, protein_g: 42, carbs_g: 38, fat_g: 22 },
    preparation: ['Cociná la quinoa.', 'Horneá el salmón 15 min a 180°C.', 'Armá la ensalada.'],
  },
};
