-- LivIn — Módulo educación en video

CREATE TABLE education_categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  emoji         TEXT,
  cover_color   TEXT DEFAULT '#5B4FCF',
  order_index   INTEGER DEFAULT 0,
  published     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO education_categories (slug, name, description, emoji, cover_color, order_index) VALUES
  ('metabolismo', 'Metabolismo', 'Entendé cómo funciona tu cuerpo: insulina, cortisol, glucógeno y salud metabólica.', '🧬', '#5B4FCF', 1),
  ('entrenamiento', 'Entrenamiento', 'Técnica, programación, hipertrofia, fuerza y rendimiento físico.', '🏋️', '#3B2FA0', 2),
  ('entrenamiento-mujeres', 'Entrenamiento en mujeres', 'Ciclo hormonal, fases del mes, fuerza femenina y composición corporal.', '💪', '#7C6FE0', 3),
  ('nutricion', 'Nutrición', 'Macros, micros, timing, ayuno intermitente y hábitos alimentarios.', '🥗', '#22B87A', 4),
  ('recetas', 'Recetas fit', 'Ideas rápidas, altas en proteína y fáciles de preparar.', '🍳', '#F0A500', 5),
  ('cocina-saludable', 'Cocina saludable', 'Técnicas de cocción, ingredientes reales y preparaciones sin ultraprocesados.', '🫙', '#E04444', 6),
  ('fermentos', 'Fermentos y probióticos', 'Kefir, chucrut, kombucha, kimchi y salud intestinal.', '🧫', '#8B5CF6', 7),
  ('suplementacion', 'Suplementación', 'Qué funciona, qué no y cómo usar cada suplemento con evidencia.', '💊', '#0EA5E9', 8),
  ('habitos', 'Hábitos y estilo de vida', 'Sueño, estrés, hidratación y rutinas sostenibles.', '🌿', '#10B981', 9),
  ('salud-hormonal', 'Salud hormonal', 'Tiroides, cortisol, testosterona, SOP y equilibrio hormonal.', '⚗️', '#F43F5E', 10);

CREATE TABLE education_videos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id     UUID NOT NULL REFERENCES education_categories(id) ON DELETE CASCADE,
  youtube_id      TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  instructor      TEXT,
  instructor_bio  TEXT,
  duration_min    INTEGER,
  level           TEXT DEFAULT 'beginner'
                  CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  tags            TEXT[] DEFAULT '{}',
  is_premium      BOOLEAN DEFAULT FALSE,
  featured        BOOLEAN DEFAULT FALSE,
  order_index     INTEGER DEFAULT 0,
  published       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_education_videos_category ON education_videos(category_id, published, order_index);
CREATE INDEX idx_education_videos_tags ON education_videos USING gin(tags);
CREATE INDEX idx_education_videos_featured ON education_videos(featured) WHERE featured = TRUE;

CREATE TABLE video_progress (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id    UUID NOT NULL REFERENCES education_videos(id) ON DELETE CASCADE,
  watched     BOOLEAN DEFAULT FALSE,
  saved       BOOLEAN DEFAULT FALSE,
  watched_at  TIMESTAMPTZ,
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_video_progress_user ON video_progress(user_id);
CREATE INDEX idx_video_progress_saved ON video_progress(user_id, saved) WHERE saved = TRUE;

ALTER TABLE education_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published categories"
  ON education_categories FOR SELECT USING (published = TRUE);

CREATE POLICY "Anyone can read published videos"
  ON education_videos FOR SELECT USING (published = TRUE);

CREATE POLICY "Users manage own video progress"
  ON video_progress FOR ALL USING (auth.uid() = user_id);
