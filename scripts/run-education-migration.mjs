/**
 * Runs only the education videos migration.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, '.env.local'), 'utf8');
    const env = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnvLocal();
const projectRef = (env.EXPO_PUBLIC_SUPABASE_URL || '').match(/https:\/\/([^.]+)/)?.[1];
const password = process.env.SUPABASE_DB_PASSWORD || env.SUPABASE_DB_PASSWORD;

if (!projectRef || !password) {
  console.error('Need EXPO_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD in .env.local');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;
const sql = readFileSync(
  join(root, 'supabase', 'migrations', '20260103000000_education_videos.sql'),
  'utf8'
);

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Running education migration...');
  await client.query(sql);
  console.log('Education migration completed.');
} catch (err) {
  if (err.message?.includes('already exists')) {
    console.log('Tables already exist — migration skipped.');
  } else {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
} finally {
  await client.end();
}
