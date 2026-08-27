# PARNASO — Arquitectura Técnica Propuesta

> Estado: **propuesta para revisión**. Nada de esto se ha implementado todavía. Este documento existe para ser aprobado (o corregido) antes de escribir el primer módulo, tal como pide el brief (secciones 44 y 48-49).

---

## 0. Nota sobre el repositorio

El repo `FINAL-PANEL-001` ya contiene un `index.html` de un proyecto no relacionado ("Panel de Marca · Cami López · Preludio", paleta terracota/crudo). No lo he tocado. El DESIGN_SYSTEM.md que compartiste (bloques saturados negro `#0A0A0A` / crudo `#F5F2ED` + acentos naranja/rosa/morado/lima/celeste) es un lenguaje visual distinto. Asumo que PARNASO se construye desde cero dentro de este mismo repo, en una carpeta propia, sin heredar nada de ese archivo. Si ese `index.html` debía estar aquí por otra razón, dímelo antes del Sprint 1.

---

## 1. Decisiones que necesito que apruebes

Todo lo demás en este documento son consecuencias de estas cinco decisiones. Son las únicas con impacto estructural difícil de revertir después.

### D1 — Modelo de relaciones: tabla polimórfica genérica vs. tablas de unión por par

El corazón del producto ("nada está aislado") depende de cómo se modelen las relaciones. Hay tres caminos:

| Opción | Cómo funciona | Ventaja | Riesgo |
|---|---|---|---|
| **A. Tabla `relationships` genérica** (recomendada) | Una sola tabla: `source_entity_type`, `source_entity_id`, `target_entity_type`, `target_entity_id`, `relationship_type`. | Agregar Person/Event/Place/Topic/Interview en Phase 2 no requiere nuevas tablas ni migraciones de esquema. Una sola vista de "Connections" recorre una sola tabla. | No hay FK nativa de Postgres hacia `target_entity_id` (puede apuntar a cualquier tabla). Se compensa con un trigger de validación (ver D1-mitigación). |
| **B. Tabla de unión por par** (`source_document`, `document_claim`, etc.) | Una tabla por cada combinación de entidades relacionadas. | FK real, integridad referencial nativa. | Con 5 entidades hoy y 5 más en Phase 2, son ~45 combinaciones posibles → decenas de tablas casi idénticas. Cada entidad nueva es una migración grande. Contradice la regla de "no sobrearquitectar" en la dirección opuesta: sobre-normaliza. |
| **C. JSONB de relaciones embebido en cada entidad** | Cada fila guarda un array de referencias relacionadas. | Simple de leer. | Imposible de indexar/consultar bien ("¿qué depende de esta fuente?"), no soporta `relationship_type` con metadata, se vuelve inconsistente (relación en A pero no reflejada en B). Se descarta. |

**Recomiendo A**, con integridad reforzada así:
- `entity_type` restringido por `CHECK` a una lista cerrada de valores (hoy: `source`, `document`, `note`, `claim`; se amplía en Phase 2 con una migración de un solo `ALTER ... CHECK`, no de esquema).
- Un trigger `BEFORE INSERT/UPDATE` (`validate_relationship_entities()`) que, según el `entity_type`, verifica con `EXISTS` que el id realmente exista en la tabla correspondiente y pertenezca al mismo `project_id`. Esto da integridad equivalente a una FK sin pagar el costo de tablas combinatorias.
- `UNIQUE(project_id, source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)` para evitar relaciones duplicadas.

Esta es la decisión más importante del documento — todo el valor del producto (Connections, Project Pulse, futuro Graph) depende de que esto escale sin reconstrucción. Necesito tu aprobación explícita antes de escribirla en una migración.

### D2 — Enums: `CHECK` sobre texto vs. tipos `ENUM` nativos de Postgres

Recomiendo **`text` + `CHECK constraint`**, no `CREATE TYPE ... AS ENUM`. Los enums nativos de Postgres son incómodos de evolucionar (agregar un valor es fácil, pero quitar o renombrar uno requiere recrear el tipo y todas las columnas que lo usan). Dado que status y reliability_level, etc. van a iterar mientras usás la app en investigaciones reales (sección 42 del brief), `CHECK` es más barato de ajustar. El costo: Postgres no autocompleta los valores en herramientas de introspección tan bien como un enum nativo — trade-off aceptable.

### D3 — `project_members` desde el MVP aunque la colaboración es Phase 5

Aunque el modelo de permisos hoy es "un solo dueño", propongo crear la tabla `project_members` (con una sola fila `role='owner'` por proyecto) desde el Sprint 1, en vez de un simple `owner_id` en `projects`. Costo marginal ahora, pero evita una migración de RLS completa cuando llegue Collaboration (Phase 5) — todas las políticas RLS ya estarían escritas contra membership, no contra `owner_id`.

### D4 — Soft delete consistente (`archived_at`) en toda entidad core

El brief ya lo pide para `Project`. Propongo el mismo patrón (`archived_at timestamptz`, nunca `DELETE` físico desde la UI) en `sources`, `documents`, `notes`, `claims`. Es reversible, barato, y evita perder evidencia de investigación por error — coherente con que esto puede contener material sensible (sección 35).

Regla que se deriva de esto y que quiero dejar explícita: **archivar una entidad no borra ni oculta las `relationships` que la mencionan.** Si un Document que respalda un Claim se archiva, esa relación de evidencia sigue existiendo — lo que cambia es que la UI debe marcar ese Document como archivado en la lista de "Supporting Evidence" del Claim, no quitarlo silenciosamente. Ocultar evidencia archivada rompería exactamente lo que Claim Detail existe para responder ("¿por qué creo que esto es cierto?", sección 29). El MVP no expone ningún borrado físico (`DELETE`) desde la interfaz — el walkthrough completo de archivar/restaurar está en `docs/RELATIONSHIPS_REVIEW.md`, sección 4.

### D5 — Stack de frontend: React + Vite + TypeScript + Tailwind, no Next.js

No hay necesidad de SSR/SEO (esto no es una app pública, es un workspace privado autenticado). Next.js añadiría complejidad (routing de servidor, RSC) sin beneficio real aquí. Recomiendo Vite + React + TypeScript + React Router + TanStack Query (estado de servidor) + Tailwind (los tokens del design system son casi 1:1 config de Tailwind) + Radix primitives sin estilo propio (para accesibilidad de modal/drawer/popover) restyled 100% según DESIGN_SYSTEM.md.

Si estás de acuerdo con D1–D5, sigo con el resto del plan tal como está. Si no, dímelo y ajusto antes de Sprint 1.

---

## 2. Arquitectura técnica recomendada

```
Frontend    React 18 + TypeScript + Vite
Routing     React Router v6
Server state TanStack Query (cache, invalidation, optimistic updates)
UI state    React Context / Zustand (solo para UI efímera: sidebar abierto, filtros)
Styling     Tailwind CSS, configurado 1:1 con los tokens de DESIGN_SYSTEM.md
Primitivos  Radix UI (sin estilo) para Dialog/Popover/Dropdown — reskin completo
Iconos      lucide-react, stroke-width 2.5 (regla del design system)
Backend     Supabase (Postgres + Auth + Storage + RLS + Realtime cuando aplique)
Migraciones supabase/migrations/*.sql versionadas en el repo (supabase CLI)
Testing     Vitest + React Testing Library (unit); Playwright se añade cuando exista flujo crítico end-to-end que valga la pena proteger (no desde el día 1)
```

Por qué Supabase y no backend propio: el brief ya lo pide (sección 34), y da RLS a nivel de fila, Auth y Storage integrados sin tener que construir capa de autorización propia — crítico dado que el contenido puede ser sensible (fuentes anónimas, documentos confidenciales).

---

## 3. Modelo de datos

Convención: toda tabla usa `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`, y `updated_at timestamptz not null default now()` (mantenida por trigger `set_updated_at()` genérico) salvo que se indique otra cosa.

### 3.1 `projects`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| owner_id | uuid | `references auth.users(id)`, not null |
| title | text | not null |
| subtitle | text | |
| description | text | |
| project_type | text | `CHECK IN ('journalism','book','novel','poetry_collection','essay','documentary','screenplay','photo_series','album','exhibition','artwork','design_project','academic_research','artistic_research','communication_project','personal_research','other')` — ampliado para cubrir creación artística, no solo investigación factual (ver `docs/CONCEPTUAL_REFRAMING.md` §6) |
| status | text | `CHECK IN ('active','paused','completed','archived')`, default `'active'` |
| research_question | text | |
| cover_image | text | ruta en Storage |
| archived_at | timestamptz | nullable |
| created_at, updated_at | timestamptz | |

Índices: `idx_projects_owner_id (owner_id)`.

### 3.2 `project_members` (ver D3)

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | `references projects(id) on delete cascade` |
| user_id | uuid | `references auth.users(id)` |
| role | text | `CHECK IN ('owner','editor','viewer')`, default `'owner'` |
| created_at | timestamptz | |

`UNIQUE(project_id, user_id)`. Índice: `idx_project_members_user_id (user_id)`.

### 3.3 `sources` — conceptualmente "Source / Reference" (ver `docs/CONCEPTUAL_REFRAMING.md` §1)

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | `references projects(id) on delete cascade`, not null |
| name | text | not null |
| type | text | `CHECK IN ('person','organization','institution','book','article','website','film','song','artwork','photograph','archive','conversation','place','object','anonymous','other')` — ampliado para cubrir referencias creativas, no solo fuentes entrevistadas |
| role | text | |
| organization | text | |
| email | text | |
| phone | text | |
| location | text | |
| website | text | |
| how_found | text | |
| relationship_to_research | text | |
| reliability_level | text | `CHECK IN ('unknown','low','medium','high','very_high')`, default `'unknown'` — **opcional en UI**: se muestra/pide solo cuando `type` es persona/organización/institución/archivo; no aplica a libro/película/canción/fotografía |
| verification_status | text | `CHECK IN ('unverified','partially_verified','verified','disputed')`, default `'unverified'` — mismo criterio de opcionalidad condicional que arriba |
| attribution_status | text | `CHECK IN ('on_record','off_record','background','anonymous','not_specified')`, default `'not_specified'` — idem |
| notes | text | |
| search_vector | tsvector | generated (`name`, `notes`, `organization`) — ver 3.8 |
| archived_at | timestamptz | nullable |
| created_at, updated_at | timestamptz | |

Índices: `idx_sources_project_id (project_id)`, `idx_sources_search_vector GIN (search_vector)`, índice parcial `idx_sources_active (project_id) WHERE archived_at IS NULL`.

Nota: `reliability_level`/`verification_status`/`attribution_status` no se eliminan ni se ramifican en columnas separadas — siguen siendo las mismas tres columnas para todo `type`, simplemente la UI decide si mostrarlas/pedirlas según el `type` seleccionado. No hay rama de esquema, solo de formulario.

### 3.4 `documents`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | `references projects(id) on delete cascade`, not null |
| title | text | not null |
| description | text | |
| file_url | text | ruta en Storage, no URL pública |
| file_type | text | `CHECK IN ('pdf','doc','xls','image','audio','video','web','email','other')` |
| file_size | bigint | bytes |
| source_id | uuid | `references sources(id) on delete set null`, nullable |
| date | date | fecha del documento (no de carga) |
| author | text | |
| origin | text | |
| confidentiality | text | `CHECK IN ('public','internal','confidential','sensitive')`, default `'internal'` |
| verification_status | text | mismo check que en sources |
| notes | text | |
| search_vector | tsvector | generated (`title`, `description`, `notes`) |
| archived_at | timestamptz | |
| created_at, updated_at | timestamptz | |

Índices: `idx_documents_project_id`, `idx_documents_source_id`, `idx_documents_search_vector GIN`.

### 3.5 `notes`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | FK cascade, not null |
| title | text | |
| content | text | not null |
| note_type | text | `CHECK IN ('observation','idea','question','hypothesis','lead','reminder','interpretation','personal_note')` |
| status | text | `CHECK IN ('active','resolved','archived')`, default `'active'` |
| search_vector | tsvector | generated (`title`, `content`) |
| created_at, updated_at | timestamptz | |

Índices: `idx_notes_project_id`, `idx_notes_search_vector GIN`.

### 3.6 `claims`

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | FK cascade, not null |
| content | text | not null |
| status | text | `CHECK IN ('idea','needs_evidence','partially_supported','supported','contradicted','verified')`, default `'idea'` |
| confidence_level | text | `CHECK IN ('unknown','low','medium','high')`, default `'unknown'` |
| search_vector | tsvector | generated (`content`) |
| created_at, updated_at | timestamptz | |

Índices: `idx_claims_project_id`, `idx_claims_status` (para el widget de Project Pulse: "3 claims necesitan evidencia", cuando el proyecto tiene claims), `idx_claims_search_vector GIN`.

### 3.7 `relationships` (ver D1)

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | `references projects(id) on delete cascade`, not null — desnormalizado a propósito para que RLS y consultas de "todo lo del proyecto X" no requieran joins |
| source_entity_type | text | `CHECK IN ('source','document','note','claim','project')` — `'project'` permite conectar algo directamente al proyecto como totalidad (ver nota especial más abajo); se amplía más en Phase 2 |
| source_entity_id | uuid | not null, validado por trigger, no FK nativa |
| target_entity_type | text | mismo check |
| target_entity_id | uuid | not null, validado por trigger |
| relationship_type | text | `CHECK IN ('supports','contradicts','corroborates','mentions','references','related_to','derived_from','originated_from','concerns','inspires','contrasts_with','influenced_by')`, default `'related_to'` — se agregaron `inspires`, `contrasts_with`, `influenced_by` para cubrir conexiones no evidenciales (ver `docs/CONCEPTUAL_REFRAMING.md` §5) |
| notes | text | contexto opcional de la relación |
| created_by | uuid | `references auth.users(id)` |
| created_at | timestamptz | |

**Nota especial — `'project'` como entidad.** A diferencia de `source`/`document`/`note`/`claim`, `projects` no tiene una columna `project_id` que apunte a sí misma: su propio `id` *es* el proyecto. El trigger de validación (ver `docs/RELATIONSHIPS_REVIEW.md` §3 y §6) necesita una rama especial para este caso: `EXISTS (SELECT 1 FROM projects WHERE id = entity_id AND id = NEW.project_id)` en vez del `EXECUTE format(...)` genérico contra `entity_table_name()`. Esto habilita relaciones como *"este libro influencia el proyecto en su conjunto"* sin forzar una Note intermedia artificial.

Constraints (nombradas explícitamente para poder hacer `ALTER ... DROP/ADD CONSTRAINT` cuando se amplíen los tipos en Phase 2, sin adivinar nombres autogenerados):
- `relationships_source_entity_type_check` — `CHECK (source_entity_type IN ('source','document','note','claim','project'))`.
- `relationships_target_entity_type_check` — mismo check sobre `target_entity_type`.
- `relationships_no_self_reference` — `CHECK (NOT (source_entity_type = target_entity_type AND source_entity_id = target_entity_id))`.
- `relationships_unique_edge` — `UNIQUE(project_id, source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)`.

Índices: `idx_relationships_project_id`, `idx_relationships_source (source_entity_type, source_entity_id)`, `idx_relationships_target (target_entity_type, target_entity_id)`, `idx_relationships_type (relationship_type)`.

**Mapeo tipo → tabla.** En vez de derivar el nombre de tabla concatenando texto (`entity_type || 's'`), que se rompe con plurales irregulares (`person` → `people`, no `persons`), se usa una función explícita de mapeo — este es también el único lugar que se toca al agregar una entidad Phase 2:

```sql
create or replace function entity_table_name(p_entity_type text)
returns text
language sql immutable as $$
  select case p_entity_type
    when 'source'   then 'sources'
    when 'document' then 'documents'
    when 'note'     then 'notes'
    when 'claim'    then 'claims'
    -- Phase 2 — una línea por entidad nueva, nada más:
    -- when 'person'   then 'people'
    -- when 'event'    then 'events'
    -- when 'place'    then 'places'
    -- when 'topic'    then 'topics'
    -- when 'interview' then 'interviews'
    else null
  end;
$$;
```

Trigger `validate_relationship_entities()`: antes de insertar/actualizar, resuelve `source_entity_type`/`target_entity_type` vía `entity_table_name()` y hace `EXISTS (SELECT 1 FROM <tabla> WHERE id = ... AND project_id = NEW.project_id)` con SQL dinámico (`format()` + `EXECUTE`); si el tipo no mapea a ninguna tabla o el id no existe en el proyecto, `RAISE EXCEPTION`. El SQL completo, con casos de fallo reales, está en `docs/RELATIONSHIPS_REVIEW.md`.

### 3.8 Búsqueda de texto (MVP, sin IA)

Cada tabla con contenido narrativo (`sources`, `documents`, `notes`, `claims`) tiene una columna `search_vector tsvector GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(...))) STORED` con índice GIN. La pantalla de Global Search (sección 31, Sprint 8) hace un `UNION ALL` con `ts_rank` sobre las cuatro tablas filtradas por `project_id`. Esto cubre "buscar 'empresa X' y encontrar Sources/Documents/Notes/Claims" sin necesitar Elasticsearch ni pgvector todavía. Full-text sobre OCR/transcripts y semantic search quedan en Phase 3 tal como lo definiste.

### 3.9 Entidades futuras (Phase 2) — solo para que la Fase 1 no las bloquee

`people`, `events`, `places`, `topics`, `interviews` se agregan como tablas nuevas con `project_id` FK, sin tocar el núcleo. Se integran al grafo de relaciones únicamente ampliando el `CHECK` de `entity_type` en `relationships` y el `CASE` del trigger de validación — por eso vale la pena la decisión D1 ahora.

### 3.10 `profiles` — identidad del creador, separada del acceso al proyecto (ver `docs/CREATIVE_CONTEXT.md`)

`project_members` (3.2) ya resuelve *acceso*: qué usuario puede ver/editar qué proyecto. `profiles` resuelve algo distinto: la identidad y (en el futuro) las prácticas creativas de la persona — independiente de cualquier proyecto puntual. Se crea desde Sprint 1 aunque el único dato que usa el MVP es el nombre para mostrar, por el mismo motivo que `project_members` (D3): crearla después de que existan usuarios reales exige backfill; crearla ahora no cuesta nada.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | `references auth.users(id) on delete cascade` |
| full_name | text | |
| avatar_url | text | |
| created_at, updated_at | timestamptz | |

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- reservado, NO se implementa en Sprint 1:
  -- creative_practices text[]  -- multi-selección "¿Qué haces?" del futuro onboarding de Creator Profile
);

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function handle_new_user();
```

RLS (política mínima, solo-lectura-propia — se amplía cuando exista colaboración real en Phase 5): ver `docs/CREATIVE_CONTEXT.md` §2 para el SQL completo de `profiles_select_own`/`profiles_update_own`.

`creative_practices` (el "Creator Profile" del brief — periodismo, escritura, fotografía, etc., multi-selección) queda comentado a propósito: no se implementa onboarding ni personalización en este ciclo. **"Creative Context" (qué necesita un proyecto específico) no gana columna ni tabla propia en ningún momento** — se infiere de los `sources.type`/`documents.file_type`/`relationship_type` que ya existen en cada proyecto, con la misma lógica de "calcular, no almacenar" que usa Project Pulse (ver `docs/CREATIVE_CONTEXT.md` §1).

---

## 4. Estrategia de Row Level Security

Función auxiliar `SECURITY DEFINER` para evitar recursión de RLS:

```sql
create or replace function public.user_has_project_access(p_project_id uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;
```

Políticas por tabla:
- `profiles`: cada usuario solo ve/edita su propia fila (`auth.uid() = id`) — ver `docs/CREATIVE_CONTEXT.md` §2. Se amplía a "co-miembros pueden verse entre sí" cuando exista colaboración real (Phase 5).
- `projects`: `select/update/delete` donde `user_has_project_access(id)`; `insert` con `owner_id = auth.uid()` (y un trigger que inserta automáticamente la fila `project_members(role='owner')` al crear el proyecto).
- `project_members`: solo lectura para miembros del mismo proyecto; escritura reservada a `role = 'owner'` (relevante recién en Phase 5, pero la política ya queda bien desde ahora).
- `sources`, `documents`, `notes`, `claims`, `relationships`: `select/insert/update/delete` donde `user_has_project_access(project_id)`.

Todas las tablas con `RLS ENABLED` desde la primera migración — nunca se abre una tabla "temporalmente" sin políticas.

El SQL completo de las políticas (`CREATE POLICY` por tabla) y un ejemplo trabajado con dos usuarios que demuestra el aislamiento en la práctica están en `docs/RELATIONSHIPS_REVIEW.md`, sección 5.

---

## 5. Storage

Un solo bucket privado: `research-files`.

Convención de rutas (coherente con sección 36 del brief):
```
{project_id}/{entity_type}/{uuid}-{filename}
```
Ejemplo: `8f2b.../documents/3a91-contrato_2019.pdf`.

Política de `storage.objects`: el primer segmento del `name` (path) se extrae con `split_part(name, '/', 1)::uuid` y se valida contra `user_has_project_access(...)`. Nada público por defecto — coherente con sección 35 (documentos y proyectos privados salvo decisión explícita del usuario, que no existe todavía en el MVP).

---

## 6. Estructura de carpetas

```
/
├── docs/
│   └── ARCHITECTURE.md          (este documento)
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 0001_init.sql        (projects, project_members, sources, documents, notes, claims, relationships, triggers, RLS)
└── app/                          (aplicación React — se crea en Sprint 1, no antes)
    ├── src/
    │   ├── app/                  (router, providers, layout raíz)
    │   ├── features/
    │   │   ├── projects/
    │   │   ├── sources/
    │   │   ├── documents/
    │   │   ├── notes/
    │   │   ├── claims/
    │   │   └── relationships/
    │   ├── components/
    │   │   ├── ui/                (Button, Card, Badge, Input, Modal, Drawer, Table, EmptyState, Skeleton — construidos sobre los tokens de DESIGN_SYSTEM.md)
    │   │   └── layout/             (Sidebar, Topbar — leen su lista de ítems desde lib/navigation.ts, no hardcodeada en el componente)
    │   ├── lib/
    │   │   ├── supabase/           (client.ts, queries por entidad)
    │   │   ├── design-tokens.ts    (espejo 1:1 de DESIGN_SYSTEM.md, consumido por tailwind.config)
    │   │   └── navigation.ts       (config de navegación — ver nota abajo)
    │   ├── hooks/
    │   └── types/                  (tipos generados por `supabase gen types` + tipos de dominio)
    ├── tailwind.config.ts
    └── vite.config.ts
```

Cada `feature/` sigue el mismo patrón interno: `api.ts` (queries TanStack), `components/`, tipos locales. No se introduce una capa de abstracción adicional (ni Redux, ni GraphQL, ni ORM) — Supabase client + TanStack Query es suficiente para el volumen de datos de una investigación individual.

**`lib/navigation.ts`.** Los ítems del sidebar del Research Workspace (Overview, Sources, Documents, Notes, Claims, Connections) se definen en Sprint 1 como una lista de datos —`{ key, label, icon, entityType, order }[]`— en este único módulo, y `Sidebar`/`Topbar` simplemente la recorren. Ningún componente hardcodea el orden o los labels directamente en JSX. Esto no implementa contextualización por `project_type` ni por preferencia del creador (eso sigue fuera de Sprint 1 — ver `docs/CONCEPTUAL_REFRAMING.md` §6), pero es la razón por la que, cuando esa contextualización se construya, el cambio es editar esta lista o leer un override desde datos, no reescribir componentes de layout.

---

## 7. Mapa de navegación (MVP)

```
Welcome / Login
  └── Home (lista de investigaciones)
        ├── Create Research
        └── Research Workspace [project_id]
              ├── Overview          (conteos, Project Pulse, actividad reciente)
              ├── Sources           → Source Detail
              ├── Documents         → Document Detail
              ├── Notes
              ├── Claims            → Claim Detail
              └── Connections       (vista estructurada de relaciones, sin grafo visual todavía)
Global (fuera del workspace)
  ├── Search
  └── Settings / Account
```

Pantallas explícitamente fuera del MVP (quedan en el mapa conceptual, no se construyen): Timeline, Maps, Graph visual, People/Places/Topics/Interviews como módulos propios, Creation Workspace (antes "Writing workspace" — ver `docs/CONCEPTUAL_REFRAMING.md` §8), IA.

**Sobre el orden y énfasis de estos ítems.** El orden de arriba (Sources → Documents → Notes → Claims → Connections) es el default de Sprint 1, no una jerarquía fija del producto. Todo proyecto tiene acceso a las mismas seis secciones sin excepción — eso no cambia nunca por `project_type`. Lo que sí queda abierto para después es *cuál se muestra primero o con más énfasis* según el tipo de proyecto o la preferencia del creador (un proyecto de fotografía podría querer Documents antes que Claims, por ejemplo) — ver `docs/CONCEPTUAL_REFRAMING.md` §6 para la decisión completa y el punto de extensión reservado (`ui_preferences jsonb`, no implementado en Sprint 1).

---

## 8. Orden de implementación

Confirmo el orden que propusiste en la sección 49, con una precisión: Sprint 1 incluye la fundación de base de datos completa (las 8 tablas del MVP — incluyendo `profiles`, ver `docs/CREATIVE_CONTEXT.md` §2 — no solo `projects`), porque `relationships` necesita que las demás tablas ya existan para el trigger de validación.

| Sprint | Contenido |
|---|---|
| 1 | Auth, Home, Create Project, Research Workspace (shell), migración inicial completa (las 8 tablas + RLS + triggers) |
| 2 | Sources, Source Detail |
| 3 | Documents, Document Detail |
| 4 | Notes |
| 5 | Claims, Claim Detail |
| 6 | Relationships (crear/listar relaciones desde cualquier entidad) |
| 7 | Research Overview + Project Pulse |
| 8 | Global Search + Connections |

Cada sprint termina cumpliendo el criterio de calidad de la sección 47 (loading/empty/error state, validación, responsive) antes de pasar al siguiente — no se acumula deuda de UI para "después".

---

## 9. Riesgos técnicos

1. **Trigger de validación de `relationships` con SQL dinámico.** Es la pieza más delicada del esquema — un bug ahí permite relaciones "fantasma" (apuntando a un id que no existe). Mitigación: tests SQL específicos para el trigger antes de Sprint 6, cubriendo los 4 tipos de entidad y sus combinaciones inválidas.
2. **RLS con función `SECURITY DEFINER`.** Mal escrita, puede abrir acceso entre proyectos de distintos usuarios. Mitigación: probar con dos usuarios de prueba antes de considerar Sprint 1 cerrado — no basta con probar con un solo usuario.
3. **`search_vector` en español.** `to_tsvector('spanish', ...)` requiere que el diccionario `spanish` esté disponible en la instancia de Postgres de Supabase (lo está por defecto), pero si en el futuro el contenido es multilingüe, el ranking de búsqueda se degrada. No es bloqueante para el MVP, sí para cuando el producto soporte inglés.
4. **Storage y confidencialidad.** El campo `confidentiality` en `documents` es hoy solo metadata visual (badge) — no cambia permisos de acceso reales todavía (todo lo del proyecto es visible a sus miembros). Si en algún momento se necesita ocultar un documento "Sensitive" incluso a un `editor` del mismo proyecto, eso requiere una política RLS adicional que no está en este documento — a decidir cuando aparezca el caso real de uso.
5. **Costo de la desnormalización de `project_id` en `relationships`.** Facilita RLS y queries, pero exige que el trigger también verifique que ambas entidades pertenecen al mismo `project_id` que la fila de `relationships` — si ese chequeo se omite, se puede crear una relación cuyo `project_id` no coincide con las entidades reales.

---

## 10. Resumen para aprobar

Antes de tocar código necesito luz verde (o correcciones) sobre:
- **D1**: tabla `relationships` polimórfica + trigger de validación (en vez de tablas de unión por par).
- **D2**: `CHECK` sobre texto en vez de enums nativos de Postgres.
- **D3**: `project_members` desde el Sprint 1 aunque la colaboración es Phase 5.
- **D4**: `archived_at` (soft delete) en toda entidad core.
- **D5**: Vite + React + TS + Tailwind + Radix, sin Next.js.

Si apruebas esto tal cual, arranco Sprint 1 (Auth + Home + Create Project + Research Workspace shell + migración inicial completa) en el próximo ciclo.
