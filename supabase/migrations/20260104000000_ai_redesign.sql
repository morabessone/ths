-- LivIn — Rediseño IA: contexto extendido, alacena, chat, plan onboarding

ALTER TABLE biometrics
  ADD COLUMN IF NOT EXISTS wake_time          TIME,
  ADD COLUMN IF NOT EXISTS sleep_time         TIME,
  ADD COLUMN IF NOT EXISTS work_type          TEXT CHECK (work_type IN ('sedentary', 'light_active', 'active', 'very_active')),
  ADD COLUMN IF NOT EXISTS stress_level       TEXT CHECK (stress_level IN ('low', 'moderate', 'high', 'variable')),
  ADD COLUMN IF NOT EXISTS sleep_quality      TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  ADD COLUMN IF NOT EXISTS meal_times         JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cooking_comfort    TEXT CHECK (cooking_comfort IN ('minimal', 'basic', 'comfortable', 'enthusiast')),
  ADD COLUMN IF NOT EXISTS food_preferences   TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS food_dislikes      TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS main_goal_detail   TEXT,
  ADD COLUMN IF NOT EXISTS sunlight_exposure  TEXT CHECK (sunlight_exposure IN ('low', 'moderate', 'high')),
  ADD COLUMN IF NOT EXISTS hydration_habit    TEXT CHECK (hydration_habit IN ('poor', 'regular', 'good')),
  ADD COLUMN IF NOT EXISTS alcohol_frequency  TEXT CHECK (alcohol_frequency IN ('never', 'occasional', 'weekly', 'frequent')),
  ADD COLUMN IF NOT EXISTS digestion_notes    TEXT;

-- Ampliar training_time si hace falta
ALTER TABLE biometrics DROP CONSTRAINT IF EXISTS biometrics_training_time_check;
ALTER TABLE biometrics
  ADD CONSTRAINT biometrics_training_time_check
  CHECK (training_time IN ('morning', 'midday', 'afternoon', 'evening', 'night', 'variable'));

CREATE TABLE IF NOT EXISTS onboarding_plan (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_text         TEXT NOT NULL,
  nutrition_summary JSONB,
  model_used        TEXT DEFAULT 'claude-sonnet-4-20250514',
  generated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS pantry_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT CHECK (category IN (
    'protein', 'vegetable', 'fruit', 'grain', 'dairy',
    'fat', 'legume', 'supplement', 'condiment',
    'frozen', 'canned', 'spice', 'other'
  )),
  quantity        TEXT,
  location        TEXT DEFAULT 'pantry' CHECK (location IN ('fridge', 'freezer', 'pantry')),
  added_via       TEXT CHECK (added_via IN ('photo', 'receipt', 'manual', 'shopping_list')),
  low_stock       BOOLEAN DEFAULT FALSE,
  expires_soon    BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  added_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pantry_items_user ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_category ON pantry_items(user_id, category);

CREATE TABLE IF NOT EXISTS shopping_suggestions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items           JSONB NOT NULL DEFAULT '[]',
  budget_estimate JSONB,
  generated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  context_snapshot JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, created_at DESC);

ALTER TABLE education_videos
  ADD COLUMN IF NOT EXISTS channel_name TEXT,
  ADD COLUMN IF NOT EXISTS channel_url  TEXT;

ALTER TABLE onboarding_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own plan" ON onboarding_plan
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own pantry" ON pantry_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own suggestions" ON shopping_suggestions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own messages" ON chat_messages
  FOR ALL USING (auth.uid() = user_id);
