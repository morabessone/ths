export interface TimingRule {
  id: string;
  context: 'pre_training' | 'post_training' | 'breakfast_rest' | 'dinner';
  title: string;
  guidelines: string[];
  avoid: string[];
  example: string;
}

export const TIMING_RULES: TimingRule[] = [
  {
    id: 'pre_training',
    context: 'pre_training',
    title: 'Pre-entrenamiento (60–90 min antes)',
    guidelines: [
      'Hidratos simples + complejos en proporción 1:1',
      'Proteína moderada (20–30 g)',
    ],
    avoid: ['Grasas altas', 'Fibra excesiva'],
    example: 'Avena + banana + claras de huevo',
  },
  {
    id: 'post_training',
    context: 'post_training',
    title: 'Post-entrenamiento (dentro de 90 min)',
    guidelines: [
      'Proteína de absorción rápida: 30–40 g',
      'Hidratos simples para reponer glucógeno: ~0.8 g/kg',
    ],
    avoid: ['Grasa en exceso'],
    example: 'Batido de proteína + fruta + leche descremada',
  },
  {
    id: 'breakfast_rest',
    context: 'breakfast_rest',
    title: 'Desayuno (día sin entreno)',
    guidelines: [
      'Proteína + grasas buenas + hidratos complejos',
      'Priorizar fibra para saciedad',
    ],
    avoid: ['Hidratos simples en cantidad alta'],
    example: 'Huevos revueltos + pan integral + palta',
  },
  {
    id: 'dinner',
    context: 'dinner',
    title: 'Cena',
    guidelines: [
      'Alta proteína (caseína si es posible) + grasas saludables',
      'Magnesio y triptófano favorecen el sueño',
    ],
    avoid: ['Cafeína', 'Alcohol', 'Ultraprocesados', 'Hidratos simples en exceso'],
    example: 'Pescado + verduras al horno + quinoa',
  },
];

export function getTimingNote(
  mealType: string,
  isTrainingDay: boolean,
  trainingTime?: string
): string | undefined {
  if (!isTrainingDay) return undefined;
  if (mealType === 'breakfast' && trainingTime === 'morning') {
    return 'Pre-entreno';
  }
  if (mealType === 'snack') return 'Post-entreno';
  return undefined;
}
