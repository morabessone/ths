/**
 * Runs the initial schema migration against Supabase Postgres.
 * Requires SUPABASE_DB_PASSWORD in .env.local (Project Settings → Database).
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

if (!projectRef) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}
if (!password) {
  console.error(
    'Missing SUPABASE_DB_PASSWORD. Add it to .env.local from Supabase → Project Settings → Database → Database password'
  );
  process.exit(1);
}

const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;

const sql = readFileSync(
  join(root, 'supabase', 'migrations', '20260101000000_initial_schema.sql'),
  'utf8'
);

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Connected to Supabase Postgres. Running migration...');
  await client.query(sql);
  console.log('Migration completed successfully.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
