import { calculateBMR, calculateNutrientTargets, GOAL_ADJUSTMENTS } from '@/lib/nutrition/engine';

describe('Nutrition engine', () => {
  const baseBio = {
    weight_kg: 75,
    height_cm: 175,
    age: 30,
    biological_sex: 'male' as const,
    goal: 'hypertrophy' as const,
    activity_level: 'moderate' as const,
    training_days: 4,
    training_type: 'strength' as const,
  };

  it('calculates BMR with Mifflin-St Jeor', () => {
    const bmr = calculateBMR({
      weightKg: 75,
      heightCm: 175,
      age: 30,
      sex: 'male',
    });
    expect(bmr).toBeGreaterThan(1600);
    expect(bmr).toBeLessThan(2000);
  });

  it('calculates BMR with Katch-McArdle when lean mass provided', () => {
    const bmr = calculateBMR({
      weightKg: 75,
      heightCm: 175,
      age: 30,
      sex: 'male',
      leanMassKg: 60,
    });
    expect(bmr).toBe(370 + 21.6 * 60);
  });

  it('applies goal adjustments', () => {
    const targets = calculateNutrientTargets(baseBio);
    expect(targets.calories_kcal).toBeGreaterThan(2000);
    expect(targets.protein_g).toBeGreaterThan(100);
  });

  it('fat loss never exceeds -500 deficit from maintenance logic', () => {
    expect(GOAL_ADJUSTMENTS.fat_loss).toBe(-400);
  });
});
