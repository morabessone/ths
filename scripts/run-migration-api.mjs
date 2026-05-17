/**
 * Runs migration via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN in .env.local
 * (https://supabase.com/dashboard/account/tokens)
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvLocal() {
  const raw = readFileSync(join(root, '.env.local'), 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const token = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
const projectRef = (env.EXPO_PUBLIC_SUPABASE_URL || '').match(/https:\/\/([^.]+)/)?.[1];

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN in .env.local');
  process.exit(1);
}
if (!projectRef) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

const sql = readFileSync(
  join(root, 'supabase', 'migrations', '20260101000000_initial_schema.sql'),
  'utf8'
);

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
if (!res.ok) {
  console.error('API error', res.status, body);
  process.exit(1);
}

console.log('Migration applied via Management API.');
console.log(body.slice(0, 500));
