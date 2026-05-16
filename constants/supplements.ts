export type SupplementTiming =
  | 'morning_fasted'
  | 'with_breakfast'
  | 'pre_training'
  | 'post_training'
  | 'with_lunch'
  | 'afternoon'
  | 'with_dinner'
  | 'before_bed';

export interface StudyTrigger {
  param: string;
  threshold: number;
  operator: 'lt' | 'gt';
}

export interface SupplementDefinition {
  name: string;
  defaultDose: { amount: number; unit: 'g' | 'mg' | 'mcg' | 'IU' | 'ml' };
  timing: SupplementTiming;
  indicated_for?: string[];
  study_triggers?: StudyTrigger[];
  lifestyle_triggers?: string[];
  dietary_triggers?: string[];
  contraindicated_conditions?: string[];
  why_template: string;
}

export const SUPPLEMENTS_DATABASE: Record<string, SupplementDefinition> = {
  creatine_monohydrate: {
    name: 'Creatina monohidratada',
    defaultDose: { amount: 5, unit: 'g' },
    timing: 'post_training',
    indicated_for: ['hypertrophy', 'performance'],
    contraindicated_conditions: ['kidney_disease'],
    why_template:
      'Aumenta los depósitos de fosfocreatina muscular, mejorando la fuerza y la recuperación entre series.',
  },
  magnesium_glycinate: {
    name: 'Magnesio glicinato',
    defaultDose: { amount: 400, unit: 'mg' },
    timing: 'before_bed',
    indicated_for: ['general_health', 'energy'],
    study_triggers: [{ param: 'magnesium', threshold: 0.85, operator: 'lt' }],
    lifestyle_triggers: ['training_at_night', 'poor_sleep'],
    why_template:
      'Tu análisis muestra magnesio bajo. El magnesio glicinato mejora la calidad del sueño y reduce el cortisol nocturno.',
  },
  vitamin_d3_k2: {
    name: 'Vitamina D3 + K2',
    defaultDose: { amount: 2000, unit: 'IU' },
    timing: 'with_breakfast',
    study_triggers: [{ param: 'vitamin_d', threshold: 30, operator: 'lt' }],
    why_template:
      'Tu nivel de vitamina D ({value} ng/mL) está por debajo del rango óptimo (30–60 ng/mL). La K2 dirige el calcio a los huesos.',
  },
  omega3_epa_dha: {
    name: 'Omega-3 EPA/DHA',
    defaultDose: { amount: 2, unit: 'g' },
    timing: 'with_lunch',
    study_triggers: [
      { param: 'triglycerides', threshold: 150, operator: 'gt' },
      { param: 'crp', threshold: 1, operator: 'gt' },
    ],
    why_template:
      'Tu perfil lipídico muestra triglicéridos elevados. El EPA/DHA reduce la inflamación sistémica.',
  },
};
