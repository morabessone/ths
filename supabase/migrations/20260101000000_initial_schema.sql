-- LivIn — Schema inicial
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'premium', 'nutritionist', 'admin')),
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE biometrics (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg         NUMERIC(5,2),
  height_cm         NUMERIC(5,1),
  age               INTEGER,
  biological_sex    TEXT CHECK (biological_sex IN ('male', 'female')),
  goal              TEXT CHECK (goal IN ('hypertrophy', 'fat_loss', 'performance', 'general_health', 'energy')),
  activity_level    TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  training_days     INTEGER CHECK (training_days BETWEEN 0 AND 7),
  training_type     TEXT CHECK (training_type IN ('strength', 'cardio', 'mixed', 'functional', 'none')),
  training_time     TEXT CHECK (training_time IN ('morning', 'afternoon', 'evening', 'night')),
  dietary_style     TEXT CHECK (dietary_style IN ('omnivore', 'vegetarian', 'vegan', 'keto', 'gluten_free', 'paleo')),
  intolerances      TEXT[] DEFAULT '{}',
  health_conditions TEXT[] DEFAULT '{}',
  current_supplements TEXT[] DEFAULT '{}',
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biometrics_user_id ON biometrics(user_id);
CREATE INDEX idx_biometrics_recorded_at ON biometrics(user_id, recorded_at DESC);

CREATE TABLE anthropometry (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  waist_cm        NUMERIC(5,1),
  hip_cm          NUMERIC(5,1),
  arm_cm          NUMERIC(5,1),
  chest_cm        NUMERIC(5,1),
  thigh_cm        NUMERIC(5,1),
  neck_cm         NUMERIC(5,1),
  body_fat_pct    NUMERIC(4,1),
  lean_mass_kg    NUMERIC(5,2),
  notes           TEXT,
  measured_at     DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_anthropometry_user_id ON anthropometry(user_id);

CREATE TABLE medical_studies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  study_type      TEXT NOT NULL CHECK (study_type IN (
                    'blood_count', 'lipid_profile', 'metabolic', 'thyroid',
                    'hormones', 'vitamins', 'minerals', 'inflammation', 'other'
                  )),
  study_name      TEXT,
  pdf_url         TEXT,
  values_json     JSONB NOT NULL DEFAULT '{}',
  alerts          JSONB DEFAULT '[]',
  parsed_by       TEXT CHECK (parsed_by IN ('user', 'ai', 'manual')),
  study_date      DATE,
  parsed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_studies_user_id ON medical_studies(user_id);
CREATE INDEX idx_medical_studies_date ON medical_studies(user_id, study_date DESC);

CREATE TABLE nutrient_targets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  calories_kcal   INTEGER,
  protein_g       NUMERIC(6,1),
  carbs_g         NUMERIC(6,1),
  fat_g           NUMERIC(6,1),
  fiber_g         NUMERIC(5,1),
  vit_d_mcg       NUMERIC(6,2),
  vit_b12_mcg     NUMERIC(6,2),
  vit_c_mg        NUMERIC(6,1),
  vit_a_mcg       NUMERIC(6,1),
  folate_mcg      NUMERIC(6,1),
  iron_mg         NUMERIC(5,1),
  calcium_mg      NUMERIC(7,1),
  magnesium_mg    NUMERIC(7,1),
  zinc_mg         NUMERIC(5,1),
  potassium_mg    NUMERIC(7,1),
  sodium_mg       NUMERIC(7,1),
  omega3_g        NUMERIC(5,2),
  water_ml        INTEGER,
  day_type        TEXT CHECK (day_type IN ('training', 'rest', 'light_activity')),
  training_focus  TEXT CHECK (training_focus IN ('strength', 'cardio', 'mixed', 'none')),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_nutrient_targets_user_date ON nutrient_targets(user_id, date DESC);

CREATE TABLE daily_plan (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  breakfast       JSONB,
  lunch           JSONB,
  snack           JSONB,
  dinner          JSONB,
  supplements     JSONB DEFAULT '[]',
  education_tip   JSONB,
  wearable_context JSONB,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_plan_user_date ON daily_plan(user_id, date DESC);

CREATE TABLE ingredients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  name_es         TEXT,
  barcode         TEXT UNIQUE,
  category        TEXT CHECK (category IN (
                    'protein', 'vegetable', 'fruit', 'grain', 'dairy',
                    'fat', 'legume', 'supplement', 'other'
                  )),
  calories_kcal   NUMERIC(6,1),
  protein_g       NUMERIC(6,2),
  carbs_g         NUMERIC(6,2),
  fat_g           NUMERIC(6,2),
  fiber_g         NUMERIC(6,2),
  sugar_g         NUMERIC(6,2),
  vit_d_mcg       NUMERIC(6,3),
  vit_b12_mcg     NUMERIC(6,3),
  vit_c_mg        NUMERIC(6,2),
  folate_mcg      NUMERIC(6,2),
  iron_mg         NUMERIC(6,3),
  calcium_mg      NUMERIC(7,2),
  magnesium_mg    NUMERIC(7,2),
  zinc_mg         NUMERIC(6,3),
  potassium_mg    NUMERIC(7,2),
  omega3_g        NUMERIC(6,3),
  source          TEXT DEFAULT 'usda',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ingredients_name ON ingredients USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_ingredients_barcode ON ingredients(barcode);
CREATE INDEX idx_ingredients_category ON ingredients(category);

CREATE TABLE fridge_stock (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ingredient_id   UUID REFERENCES ingredients(id),
  ingredient_name TEXT NOT NULL,
  quantity        NUMERIC(8,2),
  unit            TEXT CHECK (unit IN ('g', 'kg', 'ml', 'l', 'unit', 'tbsp', 'cup')),
  added_at        TIMESTAMPTZ DEFAULT NOW(),
  expires_at      DATE
);

CREATE INDEX idx_fridge_stock_user_id ON fridge_stock(user_id);

CREATE TABLE shopping_list (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  items           JSONB NOT NULL DEFAULT '[]',
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(user_id, week_start)
);

CREATE TABLE supplement_stack (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplement_name TEXT NOT NULL,
  supplement_slug TEXT NOT NULL,
  dose_amount     NUMERIC(7,2),
  dose_unit       TEXT CHECK (dose_unit IN ('g', 'mg', 'mcg', 'IU', 'ml')),
  timing          TEXT CHECK (timing IN (
                    'morning_fasted', 'with_breakfast', 'pre_training',
                    'post_training', 'with_lunch', 'afternoon', 'with_dinner', 'before_bed'
                  )),
  reason          TEXT NOT NULL,
  reason_source   TEXT CHECK (reason_source IN ('medical_study', 'profile', 'goal', 'generic')),
  priority        TEXT DEFAULT 'recommended' CHECK (priority IN ('essential', 'recommended', 'optional')),
  active          BOOLEAN DEFAULT TRUE,
  started_at      DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_supplement_stack_user_id ON supplement_stack(user_id, active);

CREATE TABLE wearable_data (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  source          TEXT CHECK (source IN ('apple_health', 'google_fit', 'garmin', 'fitbit', 'manual')),
  steps           INTEGER,
  calories_burned INTEGER,
  active_minutes  INTEGER,
  training_detected     BOOLEAN DEFAULT FALSE,
  training_type         TEXT,
  training_duration_min INTEGER,
  training_calories     INTEGER,
  hr_zones_json         JSONB,
  sleep_hours     NUMERIC(4,1),
  sleep_quality   TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  deep_sleep_min  INTEGER,
  rem_sleep_min   INTEGER,
  resting_hr      INTEGER,
  hrv_ms          INTEGER,
  water_ml        INTEGER,
  synced_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_wearable_data_user_date ON wearable_data(user_id, date DESC);

CREATE TABLE education_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id       TEXT NOT NULL,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan                TEXT NOT NULL CHECK (plan IN ('free', 'premium_monthly', 'premium_yearly')),
  status              TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id  TEXT,
  stripe_sub_id       TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE anthropometry ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrient_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE fridge_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" ON biometrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON anthropometry FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON medical_studies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON nutrient_targets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON daily_plan FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON fridge_stock FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON shopping_list FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON supplement_stack FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON wearable_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON education_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ingredients" ON ingredients FOR SELECT USING (TRUE);
