/**
 * Deploy all LivIn Edge Functions + set ANTHROPIC_API_KEY secret.
 * Requires in .env.local:
 *   SUPABASE_ACCESS_TOKEN  (https://supabase.com/dashboard/account/tokens)
 *   ANTHROPIC_API_KEY      (optional but required for IA features)
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvLocal() {
  const path = join(root, '.env.local');
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const token = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
const anthropic = process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY;
const projectRef = (env.EXPO_PUBLIC_SUPABASE_URL || '').match(/https:\/\/([^.]+)/)?.[1];

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN in .env.local');
  console.error('Create one at: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}
if (!projectRef) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

const cliEnv = { ...process.env, SUPABASE_ACCESS_TOKEN: token };

function run(args, label) {
  console.log(`\n→ ${label}`);
  const r = spawnSync('npx', ['supabase', ...args], {
    cwd: root,
    env: cliEnv,
    stdio: 'inherit',
    shell: true,
  });
  if (r.status !== 0) {
    console.error(`Failed: ${label}`);
    process.exit(r.status ?? 1);
  }
}

if (anthropic) {
  run(
    ['secrets', 'set', `ANTHROPIC_API_KEY=${anthropic}`, '--project-ref', projectRef],
    'Setting ANTHROPIC_API_KEY secret'
  );
} else {
  console.warn('\n⚠ ANTHROPIC_API_KEY not set — IA functions will fail until you add it.');
}

const functions = [
  'generate-onboarding-plan',
  'chat',
  'process-pantry-photo',
  'generate-shopping-list',
  'calculate-daily-plan',
];

for (const fn of functions) {
  run(
    ['functions', 'deploy', fn, '--project-ref', projectRef, '--use-api'],
    `Deploying ${fn}`
  );
}

console.log('\n✓ All Edge Functions deployed.');
console.log(`  Base URL: https://${projectRef}.supabase.co/functions/v1/`);
