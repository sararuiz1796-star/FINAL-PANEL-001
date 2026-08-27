# PARNASO — Reframing conceptual: de "investigación periodística" a "infraestructura de investigación y desarrollo creativo"

> Responde punto por punto a la revisión pedida. No es un reemplazo de vocabulario ("journalist" → "creator") — es un análisis de qué decisiones estructurales cambian, cuáles no, y por qué. Complementa (y en algunos puntos corrige) `docs/ARCHITECTURE.md` y `docs/RELATIONSHIPS_REVIEW.md`. Sigue sin haber código escrito.

---

## 0. Marco de la revisión

El error que hay que evitar en este documento es el opuesto al de la vez anterior: la vez pasada el riesgo era sobreinterpretar todo como periodismo; ahora el riesgo es sobrecorregir y diluir el modelo hasta que ya no distinga nada (si todo puede ser cualquier cosa, `relationships` deja de ser útil). La prueba que aplico a cada decisión es la que vos mismo planteás en la sección 13: el sistema debe poder representar tanto *"esta afirmación está respaldada por este documento"* como *"esta fotografía me llevó a investigar este lugar"* — sin que una de las dos se sienta forzada o sobrante.

Con esa prueba, reviso los 10 puntos que pediste.

---

## 1. Source

**Qué mantendría:** la tabla como nodo de "origen de información/inspiración" — sigue siendo, conceptualmente, el punto de entrada de algo externo a tu investigación (sea una persona entrevistada o un libro que te influyó). Mantengo también `relationship_to_research` y `how_found` tal cual: ya son lo bastante genéricos ("por qué importa esto", "cómo lo encontraste") para funcionar igual de bien con un libro que con un testigo.

**Qué modificaría:**
- `type` se amplía de `('person','organization','institution','anonymous','other')` a algo como `('person','organization','institution','book','article','website','film','song','artwork','photograph','archive','conversation','place','object','anonymous','other')`. Es solo una lista más larga en un `CHECK` — cero costo estructural.
- `reliability_level`, `verification_status`, `attribution_status` se quedan en el esquema (siguen siendo exactamente lo que necesita un proyecto de periodismo o investigación académica), pero dejan de ser campos que la UI *siempre* pide completar. La regla pasa a ser: estos tres campos se muestran/editan en el formulario cuando son relevantes para el `type` (persona, organización, institución, archivo) y se ocultan o quedan opcionales cuando no aplican (un libro, una canción, una fotografía de referencia no tienen "nivel de confiabilidad" en ningún sentido útil). Esto es una decisión de UI condicional por `type`, no una rama de esquema — no hay tablas nuevas ni columnas nulas por dos caminos distintos.

**Qué eliminaría:** nada del esquema. Lo que "elimino" es la *obligatoriedad implícita* de esos tres campos como si fueran parte de la identidad de toda fuente.

**Qué agregaría:** nada de columna nueva todavía. Sí dejo anotado que si en el uso real (sección 42 del brief original) aparece que las fuentes de tipo libro/película/canción necesitan un campo propio como `creator` (autor/director/artista) que hoy se fuerza dentro de `organization`, eso se agrega en un ciclo posterior — no lo invento ahora sin evidencia de uso real.

**Sobre el nombre — la pregunta que hiciste explícitamente.** Evalué tres alternativas:

| Alternativa | Por qué no |
|---|---|
| `references` como nombre de tabla | `REFERENCES` es palabra reservada de SQL (se usa en `FOREIGN KEY ... REFERENCES`). Se puede usar entre comillas, pero es una fuente de errores tontos en cada migración y cada query manual — no vale la pena el riesgo por una tabla que va a tocarse constantemente. |
| `materials` | Colisiona semánticamente con `Document` (que en este mismo reframing también se redefine como "material de investigación" — ver punto 2). Tener `sources`/`materials`/`documents` como tres cosas separadas para conceptos que se superponen es más confuso, no menos. |
| `influences` | Demasiado estrecho: no cubre bien el caso periodístico puro (una fuente institucional no "influencia", *informa*). |

**Decisión:** mantengo el nombre de tabla `sources` a nivel técnico (evita el problema de palabra reservada y evita renombrar algo que ya diseñamos con detalle), pero el concepto de producto pasa a llamarse **"Source / Reference"** — la etiqueta que ve el usuario puede variar según contexto (un proyecto de periodismo la llama "Fuente"; un proyecto artístico la llama "Referencia"), sin que eso implique dos tablas ni dos modelos. Si en el uso real esto resulta confuso, es un cambio de copy en la UI, no una migración.

---

## 2. Document

**Qué mantendría:** la tabla tal cual está (`file_type`, `confidentiality`, `verification_status`, `source_id`, etc.) — esos campos no le hacen daño a un documento que es "material visual" en vez de "evidencia"; `confidentiality` sigue siendo útil (una fotografía familiar puede ser tan sensible como un contrato), y `verification_status` simplemente no se completa (queda en `unverified` por defecto) cuando no aplica.

**Qué modificaría:** nada en el esquema. Lo que cambia es una idea de diseño que quiero dejar explícita porque evita agregar una columna que sonaría razonable pero no lo es: **no voy a agregar un campo `document_role` o `function` que clasifique el documento como "evidencia" vs. "referencia" vs. "inspiración".** El rol de un documento dentro de la investigación no es un atributo fijo del documento — es lo que dice la relación que lo conecta. El mismo PDF puede ser `document --supports--> claim` en un contexto y `document --inspires--> note` en otro, incluso dentro del mismo proyecto. Si le pusiéramos una etiqueta fija de "rol", estaríamos volviendo a fijar el documento a una sola función, exactamente el error que señalás en la sección 5. `relationship_type` ya resuelve esto sin columna nueva.

**Qué eliminaría:** nada.

**Qué agregaría:** nada ahora. La única extensión que preveo (no la construyo) es que cuando exista `Creation Workspace` (punto 8), un documento pueda relacionarse también con una pieza de la obra en construcción — eso ya lo cubre el motor de relaciones sin cambios.

---

## 3. Note

**Qué mantendría:** tal cual — `note_type` (`observation, idea, question, hypothesis, lead, reminder, interpretation, personal_note`) ya cubre exactamente lo que pedís en la sección 7 ("pensar, asociar, imaginar, cuestionar, descartar, descubrir"). Este es el punto donde el brief original ya estaba bien alineado con el nuevo alcance — no necesita cambios.

**Qué modificaría / eliminaría / agregaría:** nada.

---

## 4. Claim

**Qué mantendría:** el esquema completo tal cual (`status`, `confidence_level`) — sigue siendo la entidad correcta para periodismo, documental, investigación académica e histórica, exactamente como decís en la sección 6.

**Qué modificaría:** no el esquema, sino la narrativa de producto alrededor de él. La corrección estructural real es: **Claim deja de presentarse como el destino final de toda investigación** ("todo lo que aprendés eventualmente se convierte en un Claim") y pasa a ser una clase de nodo más, junto a Note, igual de válida pero no obligatoria. Esto se traduce en un cambio concreto de UI: el empty state de la pestaña Claims dentro de Research/Creative Workspace no dice "Todavía no hay afirmaciones — agregá evidencia" (que suena a tarea pendiente), dice algo neutral tipo *"Este proyecto todavía no tiene afirmaciones registradas"* — sin implicar que debería tenerlas. Ejemplo tuyo — *"Quiero explorar la memoria a través del color rojo"* — es un `Note(note_type='idea')`, no un Claim mal llenado; el sistema no debe empujar al usuario poeta a forzar esa idea dentro de Claim solo porque Claim tiene una pestaña más prominente.

**Qué eliminaría:** nada del modelo.

**Qué agregaría:** nada al esquema. Sí una regla de producto a aplicar desde Sprint 1: la pestaña Claims nunca se oculta según `project_type` (evitar ramas de UI por tipo de proyecto — ver decisión general al final), pero tampoco se le da más peso visual que a Notes/Sources/Documents en el Overview. Todas las pestañas cuentan igual.

---

## 5. Relationship

Este es el punto con más cambios reales.

**Qué mantendría:** el diseño polimórfico completo (D1), el trigger de validación, las constraints nombradas — nada de eso depende del dominio (periodismo vs. creación), es infraestructura pura y ya está bien pensada.

**Qué modificaría — vocabulario de `relationship_type`.** Agrego tres verbos de la lista que diste y que hoy faltan: `inspires`, `contrasts_with`, `influenced_by`. Lista final propuesta:
```
supports, contradicts, corroborates, mentions, references,
related_to, derived_from, originated_from, concerns,
inspires, contrasts_with, influenced_by
```
No agrego `located_in` todavía — no tiene sentido como valor suelto sin que exista `Place` (Phase 2); se agrega junto con esa entidad, mismo patrón de `ALTER` de siempre.

**Qué agregaría — esta es la decisión estructural que sí hay que aprobar antes de Sprint 1: permitir que una relación apunte directamente al `Project` como entidad, no solo a Source/Document/Note/Claim.**

Por qué importa: tu propio modelo conceptual (sección 11) dibuja flechas que van hacia "CREATIVE UNIVERSE" — cosas que influencian el proyecto en su conjunto, no un Claim específico. Ejemplo real: *"Este libro está influyendo en el universo conceptual de mi obra"* (tu propio ejemplo, sección 13) no siempre tiene un Claim o una Note puntual del otro lado — a veces la conexión es directamente con el proyecto como totalidad. Sin esto, el usuario se vería forzado a crear una Note artificial solo para tener algo a lo cual conectar el libro, lo cual es exactamente el tipo de fricción que el producto existe para eliminar.

**Cómo se implementa sin romper nada existente:**
- Se agrega `'project'` a los `CHECK` de `source_entity_type`/`target_entity_type` (mismo `ALTER` de siempre).
- El trigger `validate_relationship_entities()` necesita un caso especial: para todas las demás entidades, la validación es `EXISTS (... WHERE id = entity_id AND project_id = NEW.project_id)`. Pero `projects` no tiene una columna `project_id` que apunte a sí misma — su propio `id` *es* el proyecto. Entonces cuando `entity_type = 'project'`, la validación correcta es `EXISTS (SELECT 1 FROM projects WHERE id = entity_id AND id = NEW.project_id)` (el id de la entidad debe ser, literalmente, el mismo proyecto al que pertenece la relación — no puede haber una relación en el Proyecto A que apunte al Proyecto B). Dejo esto anotado explícitamente porque es el único punto donde la función de validación necesita una rama `IF entity_type = 'project' THEN ... ELSE ...` en vez del `EXECUTE format(...)` genérico — el resto del trigger no cambia.
- No se agrega una tabla `entity_table_name` nueva entrada — `project` no pasa por esa función, se resuelve con la rama especial de arriba.

**Qué eliminaría:** nada.

---

## 6. Project types

**Qué modificaría:** ampliar el `CHECK` de `project_type` de la lista periodística original a algo como:
```
journalism, book, novel, poetry_collection, essay, documentary,
screenplay, photo_series, album, exhibition, artwork,
design_project, academic_research, artistic_research,
communication_project, personal_research, other
```
Igual que con `sources.type`, es solo una lista más larga — cero impacto estructural. `research_question` se queda como campo (nullable, ya lo era) — funciona igual de bien como "pregunta que guía la investigación" para un ensayo que como "premisa" para un poemario; no necesita renombrarse.

**Decisión que sí quiero dejar explícita para que no se cuele por accionar por defecto:** *no* voy a ramificar la UI (mostrar/ocultar pestañas, campos obligatorios distintos) según `project_type`. Es tentador ("si es poesía, ocultar Claims"; "si es periodismo, mostrar reliability_level por defecto") pero es exactamente el tipo de complejidad condicional que la sección 45 del brief pide evitar, y además reintroduce la idea de que hay "proyectos que necesitan Claims" y "proyectos que no" — lo contrario de lo que pediste. `project_type` es metadata descriptiva y de icono/color en la UI, no un interruptor que cambia el modelo de datos disponible.

---

## 7. Research Health → Project Pulse

Adopto tu sugerencia y me inclino por **"Project Pulse"** sobre "Research Pulse" — "Research" sigue empujando hacia la lectura factual; "Project" es neutral entre un poemario y una investigación periodística.

**Qué cambia estructuralmente: nada en el esquema.** Esto ya era, y sigue siendo, un conjunto de consultas agregadas sobre las tablas existentes (conteos de elementos sin `relationships`, Claims por estado, Notes de tipo `question` sin resolver) — no es una tabla nueva, es una vista/queries.

**Lo que sí cambia es el criterio de diseño del panel**, y vale la pena dejarlo explícito porque es la diferencia entre que esto sirva para todo tipo de creador o solo para periodismo disfrazado:
- Project Pulse calcula *todas* las señales disponibles (elementos sin conectar, Claims sin evidencia, preguntas abiertas, fuentes sin explorar, conexiones recientes), pero **solo muestra en la UI las señales cuyo conteo es mayor a cero** — nunca un tile fijo de "0 Claims necesitan evidencia" en un proyecto de fotografía que nunca va a tener Claims. El panel se adapta a lo que realmente existe en los datos del proyecto, no a una plantilla fija de métricas periodísticas.
- Señal universal que sí quiero que esté siempre presente, tenga o no Claims el proyecto: **"N elementos sin conectar todavía"** (Sources/Documents/Notes/Claims con cero filas en `relationships`) — esta es la métrica que representa directamente el principio "nada está aislado" para cualquier tipo de creador, y es la que más se acerca a validar la hipótesis central del producto (sección 14).

---

## 8. Future Creation Workspace

Adopto el renombre: en el roadmap, Phase 4 pasa de "Writing Workspace" a **"Creation Workspace"**. No se construye nada ahora (coincido con tu instrucción), pero confirmo por qué la arquitectura actual no lo bloquea: cuando exista (sea para escribir capítulos, organizar una exposición, o secuenciar un álbum), su contenido se modela como una tabla nueva (`creation_items` o el nombre que se decida entonces) con `project_id`, y se conecta al resto exactamente como Person/Event/Place/Topic/Interview — un `ALTER` a los `CHECK` de `relationships` y una entrada en la lógica de validación, cero cambios al núcleo. No hay nada que "preparar" hoy más allá de lo que el motor de relaciones ya permite.

---

## 9. Search

**Qué modificaría:** ninguna estructura nueva — sigue siendo `tsvector` + `GIN` sobre `sources`, `documents`, `notes`, `claims`. El único ajuste es que el vector de búsqueda de `sources` debería indexar también campos descriptivos nuevos si en algún momento se agrega `creator` (ver punto 1) — no aplica todavía porque esa columna no se agrega en este ciclo.

**Qué mantendría:** todo lo demás del diseño de búsqueda de `ARCHITECTURE.md` §3.8.

---

## 10. Future AI layer

**Qué mantendría:** el principio explícito del brief original de que la IA nunca debe presentar una inferencia como hecho, distinguiendo Fuente / Evidencia / Interpretación / Sugerencia de IA.

**Qué agregaría (anotado para Phase 3, no se construye ahora):** cuando la función "Connect" de IA empiece a sugerir relaciones automáticamente, esas filas de `relationships` necesitan distinguirse de las que un humano creó a mano — si no, una sugerencia de IA se ve idéntica a un hecho confirmado por la persona investigadora, justo lo que el brief prohíbe. La preparación concreta (a implementar en Phase 3, no ahora): agregar a `relationships` las columnas `is_ai_suggested boolean not null default false` y `confirmed_by uuid references auth.users(id)` (nula mientras la sugerencia no se confirme). Es un `ALTER TABLE ... ADD COLUMN` no destructivo — no hay razón para pagarlo antes de tener IA real, pero lo dejo documentado para que ninguna pantalla de Connections construida en Sprint 6-8 asuma que toda fila de `relationships` fue creada por una persona.

**Qué mantendría del resto:** Extract / Compare / Verify / Ask Research / Research Gaps tal como están descritos — ya son lo bastante generales (extraer personas/lugares/fechas/temas sirve igual para investigar un territorio que para curar referencias de una serie fotográfica).

---

## 11. Resumen de deltas de esquema (lo único que realmente cambia antes de Sprint 1)

| Tabla / campo | Antes | Después |
|---|---|---|
| `sources.type` | `person, organization, institution, anonymous, other` | + `book, article, website, film, song, artwork, photograph, archive, conversation, place, object` |
| `sources.reliability_level/verification_status/attribution_status` | implícitamente obligatorios en la UI | opcionales, mostrados condicionalmente según `type` (sin rama de esquema) |
| `projects.project_type` | lista periodística | + `novel, poetry_collection, photo_series, album, exhibition, artwork, design_project, personal_research` |
| `relationships.relationship_type` | 9 valores | + `inspires, contrasts_with, influenced_by` (12 total; `located_in` se agrega junto con `Place` en Phase 2) |
| `relationships.source_entity_type` / `target_entity_type` | `source, document, note, claim` | + `project` (con rama especial en el trigger de validación) |
| "Research Health" | nombre y métricas fijas | renombrado **Project Pulse**, adaptativo (solo muestra señales con conteo > 0) |
| Roadmap Phase 4 | "Writing Workspace" | **"Creation Workspace"** (sin cambios de esquema ahora) |
| `documents` | (se consideró agregar `document_role`) | **no se agrega** — el rol emerge de `relationship_type`, no de una columna |

Nada de esto agrega tablas nuevas, ninguna migración destructiva, y el núcleo (`projects`, `project_members`, `sources`, `documents`, `notes`, `claims`, `relationships`) sigue siendo exactamente 7 tablas.

---

## 12. Decisiones que necesito que apruebes antes de Sprint 1

1. **Nombre**: `sources` se queda como identificador técnico; el concepto de producto pasa a llamarse "Source / Reference" (ver razones en el punto 1 — evita el problema de `references` como palabra reservada).
2. **`project` como entidad válida en `relationships`**, con la rama especial en el trigger de validación (punto 5) — esto es lo que permite conectar un libro o una fotografía directamente al "universo creativo" del proyecto sin forzar una Note intermedia.
3. **No agregar `document_role`** — el rol de un documento es siempre relacional, nunca un atributo fijo.
4. **No ramificar la UI por `project_type`** — todas las pestañas (incluida Claims) existen para todo tipo de proyecto; lo que cambia es el copy de los empty states, no la disponibilidad de funciones.
5. **Rename**: "Research Health" → **"Project Pulse"**, con el panel calculando todas las señales pero mostrando solo las que tienen datos (adaptativo, no plantilla fija).
6. **Diferido a Phase 3, documentado ahora**: `relationships.is_ai_suggested` y `confirmed_by` — no se implementa en Sprint 1-8, pero queda registrado para que nadie lo pase por alto cuando llegue la capa de IA.

Si apruebas esto, actualizo `docs/ARCHITECTURE.md` y `docs/RELATIONSHIPS_REVIEW.md` con los deltas de la sección 11 (ya los reflejé ahí para que quede todo consistente) y quedamos listos para Sprint 1.
