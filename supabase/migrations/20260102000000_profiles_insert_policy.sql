-- Permite crear el propio perfil si el trigger no corrió
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
