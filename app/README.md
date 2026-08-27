# PARNASO — app

Frontend de PARNASO (React + TypeScript + Vite + Tailwind v4 + React Router + TanStack Query + Supabase). Ver `docs/ARCHITECTURE.md` en la raíz del repo para el modelo de datos, la arquitectura y el mapa de navegación completos.

## Setup

```bash
npm install
cp .env.example .env.local   # completar con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

## Estado

Scaffold técnico de Sprint 1 — routing, Tailwind con los tokens de `docs/DESIGN_SYSTEM.md`, providers y la config de navegación (`src/lib/navigation.ts`) están andando. Las features reales (Auth, Home, Create Project, Research Workspace) se construyen en el siguiente paso, una vez aprobada y aplicada la migración `supabase/migrations/0001_init.sql`.
