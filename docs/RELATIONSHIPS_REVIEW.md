# PARNASO — Revisión final: relationships, soft delete, RLS y extensibilidad

> Complementa `docs/ARCHITECTURE.md`. Este documento responde punto por punto a la revisión pedida antes de Sprint 1. Sigue siendo especificación — nada de esto se ha aplicado como migración todavía.

Nota: el `index.html` preexistente de "Cami López · Preludio" no se toca ni se usa como referencia visual en ningún punto de este documento ni del anterior.

---

## 0. Escenario de ejemplo (usado en todo este documento)

Para que las relaciones no queden abstractas, uso un caso concreto — el mismo tipo de afirmación que ya aparece en el brief ("La empresa adquirió el terreno en 1998"):

**Proyecto**: *Investigación: adquisición de terrenos en el Valle de Q.* (`project_type = 'journalism'`)

**Sources**
| id (alias) | name | type | reliability_level | verification_status |
|---|---|---|---|---|
| S1 | Marta Uribe | person | high | partially_verified |
| S2 | Terravix S.A. | organization | medium | unverified |
| S3 | Registro de Instrumentos Públicos | institution | very_high | verified |

**Documents**
| id (alias) | title | file_type | source_id | verification_status |
|---|---|---|---|---|
| D1 | Escritura pública de compraventa, 1998 | pdf | S3 | verified |
| D2 | Correo interno de Terravix sobre la negociación | email | S1 | partially_verified |
| D3 | Comunicado de prensa de Terravix, 2020 | web | S2 | unverified |

**Notes**
| id (alias) | title | note_type |
|---|---|---|
| N1 | Contradicción entre la fecha de la escritura y la que menciona Marta | observation |
| N2 | Preguntar a Terravix por qué el comunicado de 2020 no menciona 1998 | question |

**Claims**
| id (alias) | content | status |
|---|---|---|
| C1 | La empresa adquirió el terreno en 1998. | needs_evidence → supported (después de conectar evidencia) |
| C2 | Terravix omitió deliberadamente la fecha real de adquisición en su comunicado público. | idea |

Este es exactamente el punto que hay que validar: **el valor no está en la lista de Documents o Sources por separado — está en poder responder "¿por qué creo C1?" recorriendo `relationships`.** Si el MVP no permite esa pregunta, se convirtió en gestor de archivos.

---

## 1. La tabla `relationships` (DDL final)

```sql
create table relationships (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,

  source_entity_type  text not null,
  source_entity_id    uuid not null,
  target_entity_type  text not null,
  target_entity_id    uuid not null,

  relationship_type   text not null default 'related_to',
  notes               text,

  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),

  constraint relationships_source_entity_type_check
    check (source_entity_type in ('source','document','note','claim','project')),
  constraint relationships_target_entity_type_check
    check (target_entity_type in ('source','document','note','claim','project')),
  constraint relationships_type_check
    check (relationship_type in (
      'supports','contradicts','corroborates','mentions','references',
      'related_to','derived_from','originated_from','concerns',
      'inspires','contrasts_with','influenced_by'
    )),
  constraint relationships_no_self_reference
    check (not (source_entity_type = target_entity_type and source_entity_id = target_entity_id)),
  constraint relationships_unique_edge
    unique (project_id, source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)
);

create index idx_relationships_project_id on relationships(project_id);
create index idx_relationships_source on relationships(source_entity_type, source_entity_id);
create index idx_relationships_target on relationships(target_entity_type, target_entity_id);
create index idx_relationships_type on relationships(relationship_type);
```

Todas las constraints tienen nombre explícito a propósito: cuando en Phase 2 se agregue `person`, la migración es un `ALTER TABLE relationships DROP CONSTRAINT relationships_source_entity_type_check, ADD CONSTRAINT ... CHECK (... IN (..., 'person'))` — dos líneas, sin tocar filas existentes.

---

## 2. Ejemplos reales: 8 relaciones sobre el escenario del Valle de Q.

| # | source (tipo→entidad) | relationship_type | target (tipo→entidad) | notes |
|---|---|---|---|---|
| 1 | document → D1 (Escritura 1998) | `corroborates` | claim → C1 | El documento público confirma directamente la fecha de la afirmación. |
| 2 | source → S3 (Registro Público) | `supports` | claim → C1 | La fuente institucional respalda C1 (es quien emitió D1). |
| 3 | document → D2 (Correo interno) | `supports` | claim → C1 | El correo interno menciona la negociación en la misma fecha. |
| 4 | document → D2 (Correo interno) | `derived_from` | source → S1 (Marta Uribe) | El correo fue entregado por esta fuente. |
| 5 | document → D3 (Comunicado 2020) | `supports` | claim → C2 | El comunicado que omite la fecha de 1998 respalda la sospecha de ocultamiento. |
| 6 | note → N1 | `concerns` | claim → C1 | La nota señala una tensión sobre esta afirmación específica. |
| 7 | note → N1 | `references` | document → D1 | La nota compara la fecha de este documento... |
| 8 | note → N1 | `references` | source → S1 | ...contra el testimonio de esta fuente. |
| 9 | note → N2 | `concerns` | source → S2 (Terravix) | Pregunta pendiente dirigida a esta fuente. |
| 10 | claim → C2 | `contradicts` | claim → C1 | *(opcional)* si se decide modelar que "ocultamiento deliberado" tensiona con "adquisición simple" — muestra que `relationships` no está limitado a document/source→claim, también conecta claims entre sí. |

Dos filas más, para mostrar que el mismo modelo cubre conexiones no evidenciales — el caso que motivó el reframing (`docs/CONCEPTUAL_REFRAMING.md`):

| # | source (tipo→entidad) | relationship_type | target (tipo→entidad) | notes |
|---|---|---|---|---|
| 11 | source → S1 (Marta Uribe, `type='person'`) | `originated_from` | document → D2 | *(equivalente a la fila 4, mismo hecho visto desde el otro lado — se elige un solo sentido al crear la relación, no ambos)* |
| 12 | source → *(hipotética, `type='book'`)* "El despojo de la tierra" | `influenced_by` | project → *(el proyecto Valle de Q. mismo)* | Un libro que no respalda ni contradice ningún Claim puntual, pero está formando el marco conceptual completo de la investigación — se conecta directamente al proyecto, no a un Claim o Note artificial. |

La fila 12 es la que requiere que `'project'` sea un `entity_type` válido (ver §1 y la nota especial en §3) — sin eso, el usuario tendría que inventar una Note vacía solo para tener algo a lo cual enganchar el libro.

Con estas filas, `Claim Detail` para C1 puede construir sin lógica especial:
- **Supporting Evidence**: filas 1, 2, 3 (donde `target = claim/C1` y `relationship_type in ('supports','corroborates')`).
- **Notas relacionadas**: fila 6.
- Y para C2: **Supporting Evidence** = fila 5; si se agrega la fila 10, además aparece "Contradicted by C1" — exactamente el comportamiento que el brief pide en la sección 29 ("¿Qué contradice?").

SQL de ejemplo para insertar la fila #1 (las demás siguen el mismo patrón):

```sql
insert into relationships (
  project_id, source_entity_type, source_entity_id,
  target_entity_type, target_entity_id, relationship_type, notes, created_by
) values (
  :project_id, 'document', :d1_id,
  'claim', :c1_id, 'corroborates',
  'La escritura pública confirma la fecha exacta de adquisición.',
  auth.uid()
);
```

---

## 3. Cómo se evita crear relaciones inválidas

Función de mapeo (evita el bug de plurales irregulares, ver `ARCHITECTURE.md` §3.7). `'project'` queda deliberadamente fuera de este mapeo — no pasa por `EXISTS ... AND project_id = ...` genérico porque `projects` no tiene una columna `project_id` propia; se resuelve con una rama especial en el trigger:

```sql
create or replace function entity_table_name(p_entity_type text)
returns text language sql immutable as $$
  select case p_entity_type
    when 'source'   then 'sources'
    when 'document' then 'documents'
    when 'note'     then 'notes'
    when 'claim'    then 'claims'
    else null   -- 'project' se maneja aparte en el trigger, no acá
  end;
$$;
```

Trigger de validación, con la rama especial para `'project'`:

```sql
create or replace function validate_relationship_entities()
returns trigger language plpgsql as $$
declare
  v_source_table text;
  v_target_table text;
  v_exists boolean;
begin
  -- lado source
  if NEW.source_entity_type = 'project' then
    select exists(select 1 from projects where id = NEW.source_entity_id and id = NEW.project_id)
      into v_exists;
    if not v_exists then
      raise exception 'relationships: el proyecto % no coincide con project_id de la relación', NEW.source_entity_id;
    end if;
  else
    v_source_table := entity_table_name(NEW.source_entity_type);
    if v_source_table is null then
      raise exception 'relationships: tipo de entidad source "%" no reconocido', NEW.source_entity_type;
    end if;
    execute format('select exists(select 1 from %I where id = $1 and project_id = $2)', v_source_table)
      into v_exists using NEW.source_entity_id, NEW.project_id;
    if not v_exists then
      raise exception 'relationships: % % no existe en el proyecto %', NEW.source_entity_type, NEW.source_entity_id, NEW.project_id;
    end if;
  end if;

  -- lado target (mismo patrón)
  if NEW.target_entity_type = 'project' then
    select exists(select 1 from projects where id = NEW.target_entity_id and id = NEW.project_id)
      into v_exists;
    if not v_exists then
      raise exception 'relationships: el proyecto % no coincide con project_id de la relación', NEW.target_entity_id;
    end if;
  else
    v_target_table := entity_table_name(NEW.target_entity_type);
    if v_target_table is null then
      raise exception 'relationships: tipo de entidad target "%" no reconocido', NEW.target_entity_type;
    end if;
    execute format('select exists(select 1 from %I where id = $1 and project_id = $2)', v_target_table)
      into v_exists using NEW.target_entity_id, NEW.project_id;
    if not v_exists then
      raise exception 'relationships: % % no existe en el proyecto %', NEW.target_entity_type, NEW.target_entity_id, NEW.project_id;
    end if;
  end if;

  return NEW;
end;
$$;

create trigger trg_validate_relationship_entities
  before insert or update on relationships
  for each row execute function validate_relationship_entities();
```

La rama `'project'` exige `id = entity_id AND id = NEW.project_id` — es decir, la entidad "es" literalmente el proyecto al que pertenece la relación. Esto bloquea, por ejemplo, que una relación creada dentro del Proyecto A apunte a `entity_type='project', entity_id=<id del Proyecto B>` — ni siquiera RLS necesita intervenir ahí, el trigger ya lo rechaza porque `id != NEW.project_id`.

Casos concretos que este diseño bloquea:

| Intento inválido | Qué lo detiene | Dónde |
|---|---|---|
| `source_entity_type = 'person'` (todavía no existe en MVP) | `relationships_source_entity_type_check` | constraint de columna (ni siquiera llega al trigger) |
| `source_entity_id` = un uuid que no corresponde a ningún Document real | `EXISTS` del trigger falla → `RAISE EXCEPTION` | trigger |
| Documento D1 relacionado consigo mismo (`source = target`) | `relationships_no_self_reference` | constraint |
| La misma relación `document D1 --supports--> claim C1` insertada dos veces | `relationships_unique_edge` | constraint |
| Un usuario B intenta crear una relación usando un `document_id` que existe, pero en el **proyecto de otro usuario** (A) | El `EXISTS` exige `project_id = NEW.project_id` — si el documento pertenece a otro proyecto, la validación falla igual que si no existiera | trigger (y además RLS lo bloquea antes, ver §5) |
| `relationship_type = 'implies'` (no está en la lista cerrada) | `relationships_type_check` | constraint |
| `entity_type = 'project'` apuntando al **id de un proyecto distinto** al de la relación (ej. relación creada en el Proyecto A pero `target_entity_id` = id del Proyecto B) | La rama especial exige `id = entity_id AND id = NEW.project_id` — un proyecto distinto nunca cumple esa igualdad | trigger (rama `'project'`) |

---

## 4. Soft delete y restauración

Regla única: **ninguna entidad core (`sources`, `documents`, `notes`, `claims`, `projects`) se borra físicamente desde la UI en el MVP.** Solo existe `archived_at`.

- **Archivar**: `update documents set archived_at = now() where id = :id;`
- **Restaurar**: `update documents set archived_at = null where id = :id;`
- **Listas activas**: siempre filtran `where archived_at is null`, sobre un índice parcial:
  ```sql
  create index idx_documents_active on documents(project_id) where archived_at is null;
  ```
  (mismo patrón en `sources`, `notes`, `claims`).

**Qué pasa con las `relationships` de una entidad archivada** — esto es lo que había que decidir explícitamente:

- Archivar D2 (el correo interno) **no borra ni oculta** la fila `document D2 --supports--> claim C1`. La relación se queda intacta en la base.
- En la UI, `Claim Detail → Supporting Evidence` sigue mostrando esa fila, pero el Document aparece con un badge "Archivado" en vez de desaparecer. Ocultarlo silenciosamente destruiría la cadena de evidencia que el producto existe para preservar (sección 29 del brief).
- Restaurar D2 simplemente quita el badge — la relación nunca dejó de estar ahí, así que no hay "reconexión" que hacer.
- **No hay hard delete en el MVP**, ni siquiera para limpiar duplicados accidentales — se resuelve archivando. Si en una fase futura se agrega borrado físico real (por ejemplo, un panel de administración en Phase 5), esa función deberá primero verificar `not exists (select 1 from relationships where source_entity_id = :id or target_entity_id = :id)` y bloquear o forzar al usuario a eliminar antes las relaciones — no está resuelto ahora porque no hace falta.

Esto también resuelve tu preocupación de fondo: como las relaciones sobreviven al archivado, el sistema nunca "olvida" por qué creías algo, incluso si la fuente original ya no está activa en tu flujo de trabajo diario.

---

## 5. Cómo RLS garantiza aislamiento por proyecto

```sql
alter table projects         enable row level security;
alter table project_members  enable row level security;
alter table sources           enable row level security;
alter table documents         enable row level security;
alter table notes             enable row level security;
alter table claims            enable row level security;
alter table relationships     enable row level security;

create or replace function user_has_project_access(p_project_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- projects
create policy projects_select on projects for select using (user_has_project_access(id));
create policy projects_insert on projects for insert with check (owner_id = auth.uid());
create policy projects_update on projects for update using (user_has_project_access(id));
create policy projects_delete on projects for delete using (owner_id = auth.uid());

-- se crea automáticamente la membresía de owner al crear el proyecto
create or replace function create_owner_membership()
returns trigger language plpgsql as $$
begin
  insert into project_members(project_id, user_id, role) values (NEW.id, NEW.owner_id, 'owner');
  return NEW;
end;
$$;
create trigger trg_create_owner_membership
  after insert on projects
  for each row execute function create_owner_membership();

-- project_members: solo el owner puede escribir; cualquier miembro puede leer
create policy project_members_select on project_members
  for select using (user_has_project_access(project_id));
create policy project_members_write on project_members
  for all using (
    exists (select 1 from project_members pm
            where pm.project_id = project_members.project_id
            and pm.user_id = auth.uid() and pm.role = 'owner')
  );

-- mismo patrón para las 5 tablas de contenido
create policy sources_all on sources for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
create policy documents_all on documents for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
create policy notes_all on notes for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
create policy claims_all on claims for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
create policy relationships_all on relationships for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
```

### Ejemplo trabajado con dos usuarios

1. Usuario **A** crea el Proyecto *Valle de Q.* → el trigger `create_owner_membership` inserta `project_members(project_id=P1, user_id=A, role='owner')`.
2. Usuario **B** crea su propio Proyecto *Otro caso* (P2) → su propia fila en `project_members`.
3. B ejecuta `select * from documents;` autenticado como B. Postgres reescribe la query con la política `documents_all`, que evalúa `user_has_project_access(project_id)` fila por fila. Para las filas de D1/D2/D3 (que pertenecen a P1), `user_has_project_access` consulta `project_members` buscando `(project_id=P1, user_id=B)` → no existe → `false`. **Esas filas ni siquiera aparecen en el resultado**, no da error, simplemente no están.
4. B intenta `insert into relationships (project_id, ...) values (:P1_id, ...)` apuntando al proyecto de A. El `WITH CHECK` de `relationships_all` evalúa `user_has_project_access(P1)` para B → `false` → Postgres rechaza el insert con "new row violates row-level security policy" **antes** de que el trigger `validate_relationship_entities` llegue a ejecutarse. B no puede ni siquiera confirmar si el `document_id` que probó existe.
5. Si B intenta adivinar un `document_id` real de A vía `select`, el punto 3 ya lo bloquea — no hay manera de enumerar contenido de P1 desde la sesión de B.

Esto confirma aislamiento en las tres direcciones que importan: lectura cruzada (bloqueada por `using`), escritura cruzada (bloqueada por `with check`), y fuga de existencia (bloqueada porque RLS actúa antes que cualquier lógica de negocio).

---

## 6. Cómo se incorporan Person, Event, Place, Topic e Interview sin rehacer el núcleo

Usando `person` como ejemplo, agregarlo en Phase 2 son exactamente estos pasos — ninguno toca `sources`, `documents`, `notes`, `claims` ni las filas ya existentes de `relationships`:

**Paso 1 — nueva tabla**, mismo patrón que las demás (`project_id` FK, `archived_at`, `search_vector`, RLS con la misma política genérica):
```sql
create table people (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  aliases text[],
  description text,
  occupation text,
  organization text,
  location text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table people enable row level security;
create policy people_all on people for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
```

**Paso 2 — ampliar los CHECK de `relationships`** (dos `ALTER`, cero migración de datos; `'project'` ya está en la lista base desde el MVP, no es parte de esta extensión):
```sql
alter table relationships drop constraint relationships_source_entity_type_check;
alter table relationships add constraint relationships_source_entity_type_check
  check (source_entity_type in ('source','document','note','claim','project','person'));

alter table relationships drop constraint relationships_target_entity_type_check;
alter table relationships add constraint relationships_target_entity_type_check
  check (target_entity_type in ('source','document','note','claim','project','person'));
```

**Paso 3 — una línea en `entity_table_name()`:**
```sql
create or replace function entity_table_name(p_entity_type text)
returns text language sql immutable as $$
  select case p_entity_type
    when 'source'   then 'sources'
    when 'document' then 'documents'
    when 'note'     then 'notes'
    when 'claim'    then 'claims'
    when 'person'   then 'people'   -- ← la única línea nueva
    else null
  end;
$$;
```

Con esos tres pasos, ya se puede insertar `source S1 (Marta Uribe) --related_to--> person <nueva fila en people>` sin que `sources`, `documents`, `notes`, `claims`, ni ninguna pantalla del MVP (`Claim Detail`, `Connections`, `Project Pulse`) necesite cambiar una sola línea — todas ya recorren `relationships` de forma genérica por `entity_type`/`entity_id`.

El mismo patrón de 3 pasos aplica igual para `event`, `place`, `topic`, `interview`. Si alguna de esas entidades necesita un verbo de relación nuevo (ej. `located_at` para Event→Place), el `ALTER` correspondiente es sobre `relationships_type_check`, con el mismo costo.

Esto es la prueba concreta de la decisión D1: el núcleo (`sources`/`documents`/`notes`/`claims`/`relationships`) no se reescribe nunca — solo se amplía.

---

## 7. Resumen de validación

| Pregunta pedida | Respuesta |
|---|---|
| 1. Tabla `relationships` | DDL final en §1, constraints nombradas, lista para migración. |
| 2. 5–10 relaciones reales | 10 filas concretas en §2 sobre el caso Valle de Q., mostrando cómo arman "Supporting Evidence" de un Claim. |
| 3. Relaciones inválidas | Constraints + trigger en §3, con tabla de 6 casos de fallo concretos. |
| 4. Soft delete y restauración | §4 — archivar no rompe relaciones, evidencia archivada se marca, no se oculta; no hay hard delete en MVP. |
| 5. Aislamiento por proyecto | §5 — políticas completas + walkthrough de 5 pasos con dos usuarios. |
| 6. Extensibilidad (Person/Event/Place/Topic/Interview) | §6 — 3 pasos concretos por entidad nueva, cero cambios al núcleo existente. |

Si esto queda validado, arranco Sprint 1 con la migración `supabase/migrations/0001_init.sql` que traduce exactamente este documento y `ARCHITECTURE.md` a SQL ejecutable.
