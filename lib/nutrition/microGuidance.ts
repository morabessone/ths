import type { MedicalStudy, MicroGuidance, NutrientTargets } from '@/types/nutrition.types';

export function buildMicroGuidance(
  targets: NutrientTargets,
  studies: MedicalStudy[]
): MicroGuidance[] {
  const guidance: MicroGuidance[] = [];
  const values = Object.assign({}, ...studies.map((s) => s.values_json));

  if (values.vitamin_d !== undefined && values.vitamin_d < 30) {
    guidance.push({
      nutrient: 'Vitamina D',
      severity: values.vitamin_d < 20 ? 'high' : 'moderate',
      message: `Tu vitamina D está en ${values.vitamin_d} ng/mL. Priorizamos pescados grasos en almuerzo o cena.`,
      food_suggestions: [
        'Salmón o sardinas 2–3 veces por semana',
        'Huevos y lácteos fortificados',
        'Exposición solar breve (según tu médico)',
      ],
      supplement_note: 'Vitamina D3 con comida grasa si tu médico lo indica.',
    });
  }

  if (values.ferritin !== undefined && values.ferritin < 30) {
    guidance.push({
      nutrient: 'Hierro',
      severity: 'moderate',
      message: `Ferritina baja (${values.ferritin} ng/mL). Incluimos carnes magras o legumbres con vitamina C.`,
      food_suggestions: [
        'Carne roja magra o hígado ocasional',
        'Lentejas/garbanzos con cítricos',
        'Evitá té o café justo con las comidas principales',
      ],
      supplement_note: 'Hierro solo si lo indica un profesional (puede interferir con zinc).',
    });
  }

  if (values.magnesium !== undefined && values.magnesium < 0.85) {
    guidance.push({
      nutrient: 'Magnesio',
      severity: 'moderate',
      message: 'Magnesio sérico bajo: más verduras de hoja verde, frutos secos y cacao amargo.',
      food_suggestions: ['Espinaca, acelga, almendras', 'Calabaza y cacao >70%'],
      supplement_note: 'Magnesio glicinato o citrato antes de dormir puede ayudar al sueño.',
    });
  }

  if (values.b12 !== undefined && values.b12 < 300) {
    guidance.push({
      nutrient: 'Vitamina B12',
      severity: 'moderate',
      message: 'B12 baja: priorizá huevos, lácteos o suplementación si sos vegano/a.',
      food_suggestions: ['Huevos', 'Lácteos', 'Nutritional yeast'],
      supplement_note: 'B12 sublingual si tu estilo de dieta lo requiere.',
    });
  }

  if (guidance.length === 0 && targets.omega3_g >= 2) {
    guidance.push({
      nutrient: 'Omega-3',
      severity: 'low',
      message: 'Mantené 2–3 porciones de pescado azul por semana para inflamación y cerebro.',
      food_suggestions: ['Salmón', 'Sardinas', 'Chía y nueces'],
    });
  }

  return guidance;
}
