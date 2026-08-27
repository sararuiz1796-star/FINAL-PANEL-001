# Research Workspace — Design System

Este documento es la especificación visual del producto. Todo componente que se construya debe seguir estos tokens exactos — no improvisar colores, tamaños ni estilos fuera de lo definido acá.

## 1. Filosofía visual

Bloques de color plano y saturado, alto contraste, tipografía protagónica. Nada de gradientes, nada de grises tibios de relleno, nada de sombras difusas tipo Material Design. La interfaz debe sentirse con carácter editorial/gráfico, no como un dashboard corporativo genérico.

## 2. Color tokens

```
// Fondo base (elegir uno como dominante, no mezclar como fondo general)
--bg-dark: #0A0A0A
--bg-light: #F5F2ED

// Texto
--text-on-dark: #FFFFFF
--text-on-light: #0A0A0A
// No usar grises intermedios para texto principal (ej. nada de #888888 como color de texto de cuerpo)

// Bloques de color saturado — uso general de acento
--color-orange: #E8542E
--color-pink: #F2568C
--color-purple: #7B5FE0
--color-lime: #C4F042
--color-sky: #6FC5E8

// Asignación fija de color por entidad (no cambia nunca, se usa en sidebar, cards, badges, conteos)
--entity-source: var(--color-purple)   // #7B5FE0
--entity-document: var(--color-orange) // #E8542E
--entity-note: var(--color-lime)       // #C4F042
--entity-event: var(--color-pink)      // #F2568C
--entity-claim: var(--color-sky)       // #6FC5E8

// Estados
--state-error: #E8542E
--state-success: #C4F042
```

## 3. Tipografía

```
// Familia: sans-serif geométrica y gruesa (ej. Space Grotesk, Neue Montreal o equivalente disponible)
--font-family: 'Space Grotesk', sans-serif

// Escala tipográfica
--text-display: 48px / weight 700   // números/métricas protagónicas (ej. "24 fuentes")
--text-h1: 32px / weight 700        // títulos de pantalla
--text-h2: 22px / weight 600        // títulos de sección
--text-body: 16px / weight 400      // cuerpo de texto, lectura larga
--text-caption: 13px / weight 500   // metadatos, timestamps, labels secundarios
```

Regla: los números de conteo (cantidad de fuentes, documentos, claims sin evidencia, etc.) siempre usan `--text-display` o `--text-h1`, nunca del mismo tamaño que el texto de cuerpo — deben dominar visualmente la card.

## 4. Espaciado

```
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 40px

--radius-sm: 8px    // botones, badges de estado
--radius-md: 16px   // cards estándar
--radius-lg: 24px   // bloques grandes / hero cards
```

## 5. Componentes

### Cards de entidad
- Sin sombra difusa (`box-shadow: none`)
- Fondo: color de la entidad correspondiente (ver sección 2), a opacidad completa o en versión clara (10-15% del color como fondo + el color sólido como acento en badge/ícono)
- Borde: ninguno, o `1px solid` en negro puro al 10% de opacidad
- Esquina "mordida" opcional entre cards contiguas (una card se interconecta con la siguiente en vez de flotar separada) — usar donde el layout lo permita, no forzar en toda la UI

### Badges de estado
- Forma: píldora (`border-radius: 999px`)
- Fondo: color sólido correspondiente al estado (ej. `--state-error` para "Contradicted", `--state-success` para "Verified")
- Texto: alto contraste sobre ese fondo (blanco o negro según el color base)
- Nunca usar versión pastel/tenue del color

### Botones
- Primario: fondo negro (`--bg-dark`) o color de bloque activo, texto blanco, `--radius-sm`
- Secundario: borde 1px negro, fondo transparente, texto negro
- Nunca full-rounded excepto en badges de estado

### Íconos
- Estilo: línea gruesa (`stroke-width: 2.5` aprox), geométricos, sin detalle ilustrativo
- Tamaño estándar: 20px en listas, 24px en headers

## 6. Estados de pantalla

```
Empty state:
  - Ilustración: forma geométrica simple (círculo, pétalo, bloque) en el color de la entidad
  - Texto: corto y directo, sin tono motivacional ("Todavía no hay fuentes en este proyecto" — no "¡Empecemos a construir tu investigación! 🚀")

Loading state:
  - Skeleton en el color de bloque de la sección correspondiente, no gris genérico

Error state:
  - Bloque en --state-error
  - Mensaje directo, sin jerga técnica
```

## 7. Densidad

Densidad informativa alta (esto es una herramienta de trabajo, no una app de consumo minimalista), pero lograda mediante bloques de color bien delimitados — no texto apretado ni líneas divisorias finas. Cada bloque de color "contiene" su información y actúa como separador visual natural.

## 8. Reglas explícitas para Claude Code

1. No usar gradientes en ningún componente.
2. No usar `box-shadow` con blur para dar profundidad — usar color de fondo y borde en su lugar.
3. Todo color debe salir de los tokens de la sección 2 — no generar hex codes nuevos ad hoc.
4. La asignación de color por entidad (sección 2) es fija en toda la app — Sources siempre morado, Documents siempre naranja, etc.
5. Los números/métricas siempre en tamaño display o h1, nunca del tamaño del texto de cuerpo.
6. Alto contraste en texto siempre — no usar grises intermedios (#666, #999, etc.) como color de texto principal.

---

## 9. Addenda aprobada — Sistema de color de estado (decisión UX 6)

> Este documento nunca había estado en el repositorio (solo existía como archivo subido en la conversación) — se agrega ahora, íntegro, antes de Sprint 1, más esta sección que registra un ajuste conceptual aprobado sobre el sistema de color.

**Principio (aprobado, no negociable): color de entidad y color de estado son dos sistemas semánticos distintos y no deben mezclarse.** La sección 2 asigna un color fijo por *tipo de objeto* (Source=morado, Claim=celeste, etc.). Eso identifica **qué es** algo. El color de un badge de estado (`verified`, `needs_evidence`, `contradicted`...) comunica **en qué condición está** ese objeto — son preguntas distintas y no pueden compartir la misma paleta de significado. Concretamente: el celeste de Claim nunca debe usarse también para decir "este Claim necesita evidencia" — eso mezclaría "esto es un Claim" con "este Claim está en tal estado".

**Estado actual (`--state-error`, `--state-success`) es insuficiente.** Cubre los extremos, pero Claim tiene 6 estados (`idea, needs_evidence, partially_supported, supported, contradicted, verified`) y Source tiene 4 de verificación (`unverified, partially_verified, verified, disputed`) — hacen falta más de dos tokens de estado.

**Dirección de mapeo aprobada** (principio, no valores hex todavía — ver nota abajo):

| Estado | Token |
|---|---|
| `verified` | `--state-success` (ya existe) |
| `contradicted` | `--state-error` (ya existe) |
| `disputed` | `--state-error` o un matiz de "conflicto" propio — a definir |
| `needs_evidence`, `partially_supported` | `--state-warning` (**nuevo token, no definido todavía**) |
| `unverified`, `idea` | `--state-neutral` (**nuevo token, no definido todavía**) |

**Explícitamente pendiente, no resuelto en este documento:** los valores hex de `--state-warning` y `--state-neutral`, y si `disputed` merece su propio matiz de "conflicto" distinto de `contradicted`. No se inventan acá para no fijar arbitrariamente un token de color fuera de la paleta ya validada (sección 2) — deben salir de la misma paleta saturada de bloques (naranja/rosa/morado/lima/celeste) o de una extensión deliberada de ella, decidida junto con Design System antes de construir las vistas de detalle de Claim y Source (no bloquea el shell de Sprint 1: Auth, Home, Create Project, Research Workspace shell no muestran estos badges todavía).

## 10. Addenda aprobada — Tratamiento de "Archivado" (decisión UX 7)

Un elemento archivado comunica **"ya no está activo"**, nunca **"este contenido no existe"** — sigue siendo parte del historial del proyecto y puede seguir teniendo valor como evidencia/referencia/contexto (ver `docs/RELATIONSHIPS_REVIEW.md` §4: la evidencia archivada permanece visible en listas de "Supporting Evidence").

Tratamiento aprobado:
- Neutro y desaturado — no un color de estado (no es un "error" ni una "advertencia").
- Baja intensidad, pero con contraste suficiente para seguir siendo legible (no viola la regla de alto contraste de la sección 2/8).
- Eventualmente acompañado de un ícono de archivo (línea gruesa, coherente con la sección 5).
- **No tachar el contenido completo** — tachar comunica "esto fue borrado/es inválido", que es exactamente lo que no se quiere decir.
