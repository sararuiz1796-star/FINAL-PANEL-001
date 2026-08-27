# PARNASO — Core universal + Creative Context (Creator Profiles)

> Incorpora la capa "Core + Creative Context" a la arquitectura conceptual. Responde si modifica alguna de las 9 decisiones pendientes de `docs/HANDOFF_PRODUCT_UX.md` §3. No se construye onboarding, perfiles ni personalización en este ciclo — sigue sin haber pantallas.

**Estado: aprobado.** `profiles` queda confirmada como octava tabla del núcleo, se implementa en Sprint 1. `creative_practices` queda fuera del esquema implementado, reservada para incorporarse después sin romper nada. La no-persistencia de Creative Context en el MVP también queda aprobada, con una precisión del usuario que se registra explícitamente en §1.1 — no se cierra la puerta a una futura capa explícita de configuración/preferencia contextual.

---

## 0. La distinción que hay que fijar primero

El brief introduce tres conceptos que hasta ahora se venían mezclando en uno solo ("tipo de proyecto"). Antes de tocar arquitectura, los defino con precisión porque cada uno vive en un lugar distinto del sistema — o, en el caso del tercero, en ningún lugar del esquema:

| Concepto | Qué es | Cardinalidad | Dónde vive |
|---|---|---|---|
| **Creator Profile** | Desde qué prácticas trabaja una persona (ej. "Periodista + Escritora") | Muchos por persona, y es de la **persona**, no del proyecto | Futuro: tabla `profiles`, ver §3 |
| **Project Type** | Qué se está creando ahora mismo (ej. "Novela") | Uno por proyecto | Ya existe: `projects.project_type` |
| **Creative Context** | Qué necesita específicamente ese proyecto (ej. "investigación histórica + personajes + lugares + referencias literarias") | Emergente, no se elige de una lista | **No se persiste** — ver §4 |

Esta tabla ya responde buena parte de la revisión que pediste: no son tres cosas al mismo nivel de esquema. Solo una de las tres (Project Type) ya está modelada; una (Creator Profile) necesita un lugar reservado; la tercera (Creative Context) es, por diseño, un dato calculado, nunca un campo.

---

## 1. Por qué Creative Context no se modela como tabla ni como campo

Tu propio ejemplo lo deja claro: *"Investigación territorial + entrevistas + archivo + fotografía"* no es una opción de una lista cerrada — es una descripción de lo que ese proyecto específico contiene. Eso ya está representado en el sistema, de forma distribuida: son los `sources.type` que existen en ese proyecto, los `documents.file_type` que se cargaron, los `note_type` que predominan, los `relationship_type` que se usaron. Si agregáramos un campo `creative_context` que el usuario tuviera que llenar a mano, estaríamos pidiéndole que describa en texto libre algo que el propio uso de la herramienta ya expresa — duplicación de dato, con el riesgo típico de quedar desactualizado (el campo dice una cosa, el contenido real del proyecto dice otra).

**Decisión: Creative Context se infiere, nunca se declara ni se guarda — en el MVP.** Cuando exista personalización real (fuera de este ciclo), la función que decide "qué mostrar primero, qué enfatizar" puede leer estas señales existentes (conteo de `sources.type`, `documents.file_type`, `relationship_type` predominantes en el proyecto) exactamente igual que Project Pulse ya lee señales existentes para decidir qué tiles mostrar. No es una tabla nueva — es la misma lógica de "computar, no almacenar" que ya usa Project Pulse, aplicada a un problema distinto.

### 1.1 Precisión (aprobada): "emergente por ahora" no significa "emergente para siempre"

El usuario señala correctamente que esta decisión no debe leerse como un cierre definitivo: que Creative Context sea emergente en el MVP es una decisión de alcance, no un dogma de diseño. Si el uso real demuestra que las personas quieren **declarar** una orientación o intención para su proyecto (no solo que el sistema la infiera de lo que ya cargaron), la arquitectura debe poder incorporar esa capa explícita sin rehacer el Core.

Confirmo que nada de lo diseñado hasta ahora lo impide, por el mismo motivo que ya vale para `ui_preferences` y `creative_practices`: sería una adición puramente aditiva, con dos formas posibles según lo que el uso real pida —

- **Si termina siendo una etiqueta simple** ("orientación declarada" del proyecto): una columna nullable en `projects` (ej. `declared_context text` o `declared_context_tags text[]`), agregada con un `ALTER TABLE ... ADD COLUMN` no destructivo, sin afectar ninguna fila existente.
- **Si termina necesitando estructura propia** (múltiples orientaciones con peso, historial de cambios, etc.): una tabla nueva `project_context` con `project_id` FK — el mismo patrón que ya usamos para cada entidad futura de Phase 2 (una tabla nueva, sin tocar el núcleo existente).

Ninguna de las dos rutas exige tocar `sources`, `documents`, `notes`, `claims`, `relationships` ni el trigger de validación. Por eso la arquitectura queda abierta a esto sin necesidad de prepararlo hoy — "no impedirlo" no requiere ninguna acción en Sprint 1, solo la garantía (ya cierta por diseño) de que agregar esa capa después es aditivo, no una migración de ruptura.

---

## 2. Creator Profile — el único lugar donde sí hace falta un cambio de esquema

**Qué es:** metadata de la persona, no del proyecto — "desde qué prácticas trabajo" (multi-selección: Periodismo + Escritura + Fotografía, etc.). Vive fuera de `projects` por definición, porque una misma persona puede tener un Creator Profile y crear proyectos de tipos completamente distintos con él (tu ejemplo: Periodista + Escritora creando una novela).

**El gap real que esto expone:** hasta ahora, `ARCHITECTURE.md` nunca definió una tabla `profiles` — `projects.owner_id` y `project_members.user_id` referencian `auth.users(id)` directamente. Eso alcanza para Sprint 1 (un solo dueño, sin UI de colaboración), pero significa que no hay ningún lugar en el esquema donde algún día se pueda guardar "esta persona trabaja desde estas prácticas". Agregar esa tabla *después* de que existan usuarios reales exige una migración de backfill (crear una fila de `profiles` para cada `auth.users` que ya exista). Agregarla *ahora*, antes de Sprint 1, no cuesta nada — es exactamente la misma lógica que ya aplicamos con `project_members` (decisión D3: barato ahora, caro después).

**Propuesta — la única decisión estructural nueva de este documento:**

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- reservado para una fase posterior, NO se agrega ahora:
  -- creative_practices text[]   -- ej. {'journalism','writing','photography'} — alimenta el futuro "¿Qué haces?" del onboarding (brief §8)
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

alter table profiles enable row level security;
create policy profiles_select_own on profiles for select using (auth.uid() = id);
create policy profiles_update_own on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
```

Nota deliberada: la política de `select` es *solo la propia fila* por ahora — no "cualquier co-miembro de un proyecto puede ver tu perfil". Sin colaboración real (Phase 5), no hace falta esa política todavía, y ampliarla después es un `CREATE POLICY` adicional, no una migración de esquema.

`creative_practices` (el multi-select "¿Qué haces?" del brief, sección 8) queda comentado, no implementado — se agrega con un `ALTER TABLE profiles ADD COLUMN creative_practices text[]` no destructivo cuando se construya el onboarding real. Cero tablas de perfiles especializados, cero lógica de personalización — exactamente lo que pediste evitar en la sección 9.

---

## 3. Revisión punto por punto de lo que pediste

**Orden por defecto de navegación.** No cambia lo que ya estaba decidido (`lib/navigation.ts` config-driven, un orden neutral para Sprint 1). Lo que sí aclaro: ese orden default **no debe modelarse como "el orden del periodista" ni el de ninguna disciplina particular** — es un default neutral del Core, no una plantilla de un Creative Context específico. Cuando la personalización real llegue, la función que resuelve el orden podrá tomar como entrada Project Type + (eventualmente) Creator Profile + señales de Creative Context inferido — pero eso es una función nueva sobre la misma lista de configuración, no una reestructuración.

**Campos obligatorios de Create Project** (renombrado desde "Create Research" — ver decisión UX 2 aprobada, `docs/HANDOFF_PRODUCT_UX.md` §3). Sin cambios. Creator Profile es del usuario, no del proyecto — nunca va a aparecer como campo en el formulario de creación de un proyecto. Confirmo explícitamente: Create Project no incorpora selección de perfil/práctica en Sprint 1.

**Presentación de selectores de tipos (`project_type`, `sources.type`).** Aquí sí hay una precisión que vale la pena fijar ahora para que nadie la resuelva a medias durante Sprint 1: **el orden/agrupación de estas listas en Sprint 1 es fijo y neutral (alfabético o agrupado por lógica de dominio), sin ningún intento de "adivinar" el orden según el perfil del creador.** Un ordenamiento inteligente por Creator Profile (mostrar "Serie fotográfica" primero si la persona ya dijo que es fotógrafa) es exactamente el tipo de personalización parcial que hay que evitar construir a medias — se diseña completo cuando exista el onboarding de perfiles, no antes.

**Estructura del proyecto.** Sin cambios de esquema. `projects` sigue siendo la misma tabla; `project_type` sigue siendo un solo valor de una lista cerrada.

**Relación entre Creator y Project.** Aquí es donde agrego la única pieza nueva: la relación ya no es solo "un usuario de `auth.users` es dueño/miembro de un proyecto" (`project_members`, ya existente) — ahora hay un lugar explícito (`profiles`) donde ese usuario puede tener, más adelante, sus propias prácticas creativas, independientes del proyecto. `project_members` sigue siendo la relación de *acceso*; `profiles` es la relación de *identidad/práctica*. Son dos cosas distintas y así quedan modeladas.

**Project Type.** Sin cambios — sigue siendo metadata descriptiva de un solo valor, nunca ramifica el modelo de datos (decisión ya cerrada, sección 12 punto 4 de `CONCEPTUAL_REFRAMING.md`).

**Creative Context.** Como se explica en §1: no se modela como dato. Es la combinación (futura, no construida ahora) de Creator Profile + Project Type + contenido real del proyecto, resuelta en tiempo de presentación, nunca almacenada.

**Futuras posibilidades de personalización.** El punto de extensión ya reservado (`ui_preferences jsonb` en `projects`/`project_members`, ver `CONCEPTUAL_REFRAMING.md` §6) sigue siendo válido y suficiente — ahora sabemos que, cuando se implemente, la función que llena esos valores por defecto también podrá leer `profiles.creative_practices` (cuando exista) además de `project_type`. No hace falta una segunda columna de preferencias — es la misma, con más inputs para resolverla.

**Project Pulse.** Sin cambios — y vale la pena decirlo como validación, no como pendiente: el principio ya aprobado de "calcular todas las señales, mostrar solo las que tienen datos" ya es, en los hechos, una forma de Creative Context funcionando sin necesitar saber la disciplina de nadie. Un proyecto de fotografía sin Claims simplemente no muestra señales de Claims — no porque el sistema "sepa" que es fotografía, sino porque no hay datos. Esto confirma que la arquitectura de Project Pulse ya estaba alineada con este principio antes de que se articulara explícitamente.

**Navegación contextual.** Mismo mecanismo que "orden por defecto" — reservado, no construido, sin cambios adicionales de arquitectura más allá de lo ya decidido.

---

## 4. Qué de las 9 decisiones pendientes cambia realmente

De las 9 decisiones que quedaron listadas en `docs/HANDOFF_PRODUCT_UX.md` §3, **ninguna deja de resolverse ahora** — esta capa conceptual no bloquea Sprint 1. Lo que cambia es más preciso:

- **Decisión 1 (orden por defecto de navegación) y decisiones 3-4 (presentación de selectores)** ganan una restricción explícita: deben implementarse como defaults neutrales, sin ningún intento de personalización parcial por perfil o disciplina. Eso ya era implícito, ahora queda dicho.
- **Decisiones 2, 5, 6, 7, 8, 9** quedan exactamente igual — no tienen relación con Creator Profile/Creative Context.

Lo único que se agrega a la lista de "pendiente antes de Sprint 1" es la aprobación de la tabla `profiles` (§2 de este documento) — es la única pieza que, si no se decide ahora, sería cara de agregar después.

---

## 5. Resumen para aprobar

1. **Creative Context no se persiste** — se infiere de `sources.type`/`documents.file_type`/`relationship_type` reales del proyecto, igual que Project Pulse. No hay tabla ni campo nuevo para esto, nunca.
2. **Se crea `profiles` en Sprint 1** (id, full_name, avatar_url + trigger de sincronización con `auth.users` + RLS de solo-lectura-propia) — barato ahora, evita backfill después. `creative_practices` queda comentado en el DDL, no implementado.
3. **Ninguna decisión ya aprobada se reabre** — Project Type, disponibilidad universal de funciones, y el punto de extensión `ui_preferences` siguen tal como están.
4. **Restricción explícita para Sprint 1-8**: ningún selector, orden de navegación o vista intenta personalización parcial por disciplina/perfil — eso se diseña completo cuando exista el onboarding de perfiles (fuera de este ciclo), no antes.

Si apruebas esto, actualizo `ARCHITECTURE.md` con la tabla `profiles` y `HANDOFF_PRODUCT_UX.md` con esta precisión, y quedamos listos para resolver las 9 decisiones pendientes y arrancar Sprint 1.
