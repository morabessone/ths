# LivIn

App móvil de guía nutricional personalizada (React Native + Expo).

## Requisitos

- Node.js 20+
- Cuenta [Supabase](https://supabase.com) (opcional para modo demo local)

## Configuración

1. Instalar dependencias:

```bash
npm install
```

2. Copiar variables de entorno:

```bash
cp .env.example .env.local
```

Completar `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

3. Ejecutar migración SQL en Supabase (SQL Editor o CLI):

`supabase/migrations/20260101000000_initial_schema.sql`

4. Iniciar la app:

```bash
npx expo start
```

## Modo demo

Sin credenciales de Supabase, la app funciona en modo demo: onboarding completo, plan del día generado localmente con el motor nutricional.

## Scripts

- `npm start` — Expo dev server
- `npm test` — Tests del motor nutricional
- `npm run typecheck` — Verificación TypeScript

## Stack

Expo SDK 52 · Expo Router · NativeWind v4 · Zustand · TanStack Query · Supabase
