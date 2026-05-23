/**
 * Deletes a Supabase Auth user by email (cascades to profiles and app data).
 * Usage: node scripts/delete-auth-user.mjs user@example.com
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/delete-auth-user.mjs <email>');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const ref = env.EXPO_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const password = env.SUPABASE_DB_PASSWORD;
if (!ref || !password) {
  console.error('Need EXPO_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD in .env.local');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const { rows } = await client.query(`SELECT id, email FROM auth.users WHERE email = $1`, [email]);
if (!rows.length) {
  console.log(`No user found with email: ${email}`);
  await client.end();
  process.exit(0);
}

const { id } = rows[0];
await client.query(`DELETE FROM auth.users WHERE id = $1`, [id]);
console.log(`Deleted user ${email} (${id}) and related data.`);
await client.end();
