# PARNASO — Handoff de arquitectura a Producto/UX

> Este documento marca el cierre de la fase de arquitectura y la apertura de la fase de diseño de producto/UX, antes de Sprint 1. Organiza las decisiones de `ARCHITECTURE.md`, `RELATIONSHIPS_REVIEW.md`, `CONCEPTUAL_REFRAMING.md`, `CREATIVE_CONTEXT.md` y `DESIGN_SYSTEM.md` en tres categorías: qué ya está cerrado, qué queda abierto para diseño, y las 9 decisiones puntuales que el usuario ya resolvió antes de Sprint 1.
>
> **Estado: las 9 decisiones de la sección 3 quedaron resueltas** (algunas aprobadas tal cual, otras con ajuste conceptual, dos deliberadamente no cerradas todavía por decisión explícita — ver detalle en cada una). Con esto, el alcance conceptual y estructural necesario para arrancar Sprint 1 se considera suficiente.

---

## 1. Qué ya está cerrado (arquitectura y producto — no requiere ni admite input de UX)

| Decisión | Qué significa para quien diseña/construye |
|---|---|
| **Núcleo de 8 tablas**: `projects`, `project_members`, `profiles`, `sources`, `documents`, `notes`, `claims`, `relationships` | Todo lo que se diseñe en Sprint 1-8 vive dentro de estas entidades de contenido + membresía + identidad. No hay Person/Event/Place/Topic/Interview todavía — cualquier pantalla que los mencione es Phase 2, fuera de alcance. |
| **Creator Profile y Creative Context no tienen columna ni tabla propia** | `profiles` existe solo para nombre/avatar por ahora; ningún formulario de Sprint 1-8 pide "¿qué haces?" ni "¿qué necesita este proyecto?". Creative Context queda emergente (ver `CREATIVE_CONTEXT.md` §1), pero la arquitectura no cierra la puerta a una futura capa declarada — eso no cambia nada de lo que se construye ahora. |
| **`relationships` es polimórfico y universal** | Cualquier flujo de "conectar X con Y" en la UI puede asumir el mismo mecanismo sin importar los tipos de entidad (Source↔Claim, Note↔Document, Source↔Project). No hay que diseñar un flujo distinto por par. |
| **`relationship_type` es una lista cerrada de 12 verbos** (`supports, contradicts, corroborates, mentions, references, related_to, derived_from, originated_from, concerns, inspires, contrasts_with, influenced_by`) | El selector de "tipo de relación" tiene estas 12 opciones, ninguna más, ninguna personalizable por ahora. |
| **`'project'` es un destino válido de relación** | Un flujo de "conectar esta fuente/documento/nota directamente al proyecto" es técnicamente posible desde Sprint 6. |
| **Disponibilidad de funciones nunca varía por `project_type`** | Todo proyecto tiene Sources, Documents, Notes, Claims, Connections y Project Pulse, sin excepción. |
| **Soft delete universal, sin hard delete en MVP** | Todo flujo de "eliminar" es en realidad "archivar" — reversible, nunca destructivo. |
| **Evidencia archivada permanece visible, marcada** (tratamiento visual: neutro/desaturado, nunca tachado — ver `DESIGN_SYSTEM.md` §10, decisión UX 7) | Un Document/Source archivado sigue apareciendo en "Supporting Evidence", con un indicador de "ya no está activo", no de "esto no existe". |
| **`sources.type` cubre 15 tipos** (persona, organización, institución, libro, artículo, sitio web, película, canción, obra, fotografía, archivo, conversación, lugar, objeto, anónimo, otro) — **ninguno se elimina ni se simplifica para la UI** (decisión UX 4) | El formulario de Source necesita estas 15 opciones agrupadas visualmente, nunca reducidas. |
| **`project_type` cubre 17 valores, todos se conservan** (decisión UX 3) — y ahora es **obligatorio** (`not null`, sin default) junto con `title` en la creación (decisión UX 2) | El formulario de creación de proyecto exige elegir un `project_type` real, no permite dejarlo en blanco ni cae en "other" por omisión. |
| **Verificación (`reliability_level`, `verification_status`, `attribution_status`) es condicional por tipo, no por proyecto** | Se muestran/piden según el `type` de Source elegido — la condición vive en la UI, no en el dato. |
| **El rol de un Document nunca es un campo fijo** | Ningún flujo de carga de documento pide clasificar "¿esto es evidencia o inspiración?" — ese significado lo da la relación creada después. |
| **Color de entidad y color de estado son sistemas semánticos separados** (decisión UX 6 — ver `DESIGN_SYSTEM.md` §9) | El celeste de Claim nunca puede reutilizarse para decir "este Claim necesita evidencia". Los valores hex exactos de los estados intermedios quedan abiertos (ver §2), pero el principio de separación ya no se negocia. |
| **Project Pulse comunica posibilidad, nunca déficit ni desempeño** (decisión UX 9 — ver `CONCEPTUAL_REFRAMING.md` §7) | Prohibido: scores/porcentajes, color de error por "elementos sin conectar", lenguaje de productividad o gamificación. El copy siempre es una invitación a explorar. |
| **Nombres de producto ya decididos**: "Create Project" (no "Create Research"), "Source / Reference", "Project Pulse", "Creation Workspace" (roadmap) | Naming resuelto — no es un punto de discusión de copy pendiente. |
| **Connections es una capacidad transversal, no una entidad de contenido aislada** (ver `ARCHITECTURE.md` §7) | Cualquier pantalla de detalle debe poder crear/ver relaciones directamente, sin obligar a pasar primero por la pantalla Connections. |
| **Storage privado por defecto, RLS por proyecto** | Ninguna pantalla necesita un toggle de "hacer público" — no existe esa función todavía. |

---

## 2. Qué queda abierto para diseño (deliberadamente no resuelto ahora)

| Punto | Por qué sigue abierto | Bloquea Sprint 1? |
|---|---|---|
| **Layout de "Card de entidad"** por tipo (Source/Document/Note/Claim) | Decisión UX 5: el usuario prefiere resolverlo en UX/UI con más tiempo — una Source no debe tener necesariamente la misma jerarquía visual que una Note, ni un Claim presentarse igual que un Document con otro ícono. El modelo de datos queda cerrado; la composición visual, no. | No. |
| **Iconografía completa por `sources.type` (15) y `documents.file_type` (9)** | Decisión UX 8: se construye progresivamente, a medida que se llega a cada entidad (Sprint 2-3), con un set provisional pero coherente con `DESIGN_SYSTEM.md` mientras tanto — no se producen 15 íconos de una sola vez ahora. | No. |
| **Valores hex exactos de `--state-warning` y `--state-neutral`, y si `disputed` merece un matiz de "conflicto" propio** | El principio de separación entidad/estado ya está cerrado (ver §1); los tokens concretos no. Debe resolverse junto con Design System antes de construir las vistas de detalle de Claim/Source. | No para el shell; sí antes de Sprint 2 (Sources) y Sprint 5 (Claims). |
| **Cómo se ve/comunica "Source / Reference" en la UI según el tipo** (¿la etiqueta visible cambia entre "Fuente" y "Referencia"?) | La arquitectura lo permite, no decide si conviene. | No. |
| **Layout de `Source Detail` por tipo** (una persona muestra teléfono/rol; un libro probablemente portada/autor/año) | Todos los campos ya existen o son genéricos — el layout es diseño de UI, no de esquema. | No para el shell; sí antes de Sprint 2. |
| **Copy exacto de cada empty state** (Sources, Documents, Notes, Claims, Connections, Project Pulse) | Tono ya decidido (`DESIGN_SYSTEM.md` §6: directo, sin motivacional); el texto exacto de cada uno no está escrito. | No para el shell. |
| **Qué señales muestra Project Pulse y en qué orden, cuando hay varias activas a la vez** | Adaptativo ya decidido; priorización visual entre señales simultáneas, no. | No — Project Pulse es Sprint 7. |
| **Flujo de interacción para "crear una relación"** (¿se elige el verbo antes o después del destino? ¿se sugieren destinos por tipo de origen?) | El mecanismo de abajo está cerrado (§1); la interacción, no. | No — Relationships es Sprint 6. |
| **Representación visual de `Connections`** (¿lista agrupada por tipo? ¿por entidad de origen? ¿tabla?) | Ya se acordó que no es un grafo visual todavía — la vista estructurada en sí no tiene diseño. | No — Connections es Sprint 8. |
| **Mecanismo exacto de verificación condicional en el formulario de Source** (¿campos aparecen dinámicamente? ¿sección colapsable?) | El criterio (se muestra según `type`) está cerrado; la interacción, no. | No para el shell; sí antes de Sprint 2. |

---

## 3. Las 9 decisiones — estado final resuelto

Cada una, con la decisión exacta del usuario y su consecuencia directa para Sprint 1.

**1. Orden del sidebar — APROBADA.**
Overview → Sources → Documents → Notes → Claims → Connections. Es el default del MVP, no una jerarquía conceptual fija — la arquitectura sigue permitiendo contextualización futura por Creator Profile/Project Type/señales reales (`CREATIVE_CONTEXT.md`). Connections se entiende como capacidad transversal, no como una carpeta aislada (ver §1). → Implementa tal cual en `lib/navigation.ts`.

**2. Creación del proyecto — APROBADA CON CAMBIO DE NOMBRE.**
"Create Project", no "Create Research" — PARNASO no impone que todo proyecto sea una "investigación". Obligatorio: `title` + `project_type`. Opcional después: `description`, `research_question` (el campo técnico se mantiene; su expresión en UI para distintos contextos queda para después). → `project_type` pasa a `not null` en el esquema (ya aplicado en `ARCHITECTURE.md` §3.1).

**3. Selector de Project Type — APROBADA CON AJUSTE.**
Se agrupan los 17 valores existentes por familia semántica coherente — sin eliminar ni fusionar valores para simplificar, sin mezclar categorías distintas solo para llenar una familia (ej. un álbum no es "Audiovisual", es Música), sin lógica diferente por profesión todavía. → Grupos de referencia a validar con UX: Texto, Audiovisual, Visual/Diseño, Música, Investigación/Comunicación, Otro — a ajustar si alguna familia mezcla conceptos que no deberían ir juntos.

**4. Selector de Source Type — APROBADA.**
Mismo criterio: agrupar sin eliminar riqueza semántica. Es especialmente importante que Source pueda representar personas, libros, películas, canciones, fotografías, obras, objetos, lugares, conversaciones y archivos por igual — eso es parte de lo que diferencia a PARNASO de una herramienta periodística tradicional.

**5. Layout de cards de entidad — NO SE CIERRA.**
Queda abierta para UX/UI con más tiempo (ver §2). El modelo de datos permanece cerrado; la composición visual no se resuelve ahora para evitar convertir todas las entidades en "SaaS cards" idénticas. No bloquea Sprint 1.

**6. Mapping de badges de estado — AJUSTADA, NO APROBADA TAL CUAL.**
Se separa explícitamente color de entidad de color de estado (ver `DESIGN_SYSTEM.md` §9). Dirección aprobada: `verified`→success, `contradicted`→error, `disputed`→error o matiz de conflicto propio, `needs_evidence`/`partially_supported`→warning (token nuevo), `unverified`/`idea`→neutral (token nuevo). Los valores hex concretos no se inventan en este ciclo — se resuelven junto con Design System antes de construir las vistas de Claim/Source (Sprint 2 y 5). No bloquea el shell de Sprint 1.

**7. Archivado — APROBADA CON PRECISIÓN.**
Tratamiento neutro/desaturado, baja intensidad, contraste suficiente, eventual ícono de archivo — nunca tachar el contenido completo. Comunica "ya no está activo", no "esto no existe". Ver `DESIGN_SYSTEM.md` §10.

**8. Iconografía — NO BLOQUEANTE.**
Se construye progresivamente por Sprint (2-3), con un set provisional coherente con el Design System mientras tanto. No se producen los 15+9 íconos de una sola vez ahora.

**9. Project Pulse / elementos sin conectar — APROBADA CON CAMBIO CONCEPTUAL.**
Se mantiene "elementos sin conectar" como señal, pero nunca como score de productividad o "health score". Prohibido: porcentajes, rojo por ausencia de conexiones, lenguaje de productividad, gamificación. El copy comunica posibilidad ("N elementos por conectar"), no deficiencia. Ver `CONCEPTUAL_REFRAMING.md` §7 para el principio completo.

---

## 4. Consecuencia para Sprint 1

Con estas 9 decisiones resueltas, el alcance conceptual y estructural para arrancar Sprint 1 queda cerrado. Sprint 1 construye el fundamento:

- Auth
- Profile (tabla `profiles`, sin `creative_practices` todavía)
- Home
- Create Project
- Project shell / Research Workspace básico
- Conexión real con Supabase, persistencia real de datos
- Estructura base de navegación (`lib/navigation.ts`)
- Design System aplicado desde el comienzo (tokens de `DESIGN_SYSTEM.md` — no los de estado intermedio, que quedan pendientes)

Sprint 1 explícitamente **no** construye: perfiles especializados, onboarding contextual, navegación personalizada por profesión, Project Pulse completo, Connections visual, IA, búsqueda semántica, Creation Workspace, iconografía completa, ni la UX final de cada entidad.

## 5. Cómo usar este documento

- La sección 1 es la que ingeniería puede citar si una propuesta de diseño choca con algo ya decidido.
- La sección 2 es responsabilidad de producto/UX, con los plazos de bloqueo indicados por fila (la mayoría no bloquea el shell, pero sí bloquea sprints específicos más adelante).
- La sección 3 es el registro de las 9 decisiones puntuales ya resueltas — no vuelven a discutirse salvo que la experiencia real de uso (sección 42 del brief original) demuestre que algo necesita ajustarse.
