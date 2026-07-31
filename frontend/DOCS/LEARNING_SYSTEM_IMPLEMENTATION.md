# Sistema de aprendizaje (contenido, progreso y gamificación) — Backend + Frontend

Documentación de todo lo implementado para reemplazar el modelo de progreso viejo
(`user_progress`, por módulo) por un esquema real de contenido y progreso, conectar el
frontend a ese backend, y dejar jugable de punta a punta el Módulo 1 (incluyendo drag & drop
real en la isla 5).

**Estado al escribir esto:** implementado, compilando y verificado contra la base real
(smoke tests manuales, con limpieza de datos de prueba después), y **ya commiteado en
`test`** (`eecf851`, merge de `review-lessons-ui`). **Todavía sin deployar** — ver §7.

**No cubre:** el refresh de sesión / manejo de tokens (`fix(auth): renovar la sesión con
refresh token...`, ya commiteado). Ver el historial de git para eso.

**Actualizado tras el merge de `review-lessons-ui`:** la pantalla de lección se reescribió
por completo (video real con expo-video, layout responsive, extracción en 13 componentes).
Ver §6.4-bis y `DOCS/LESSONS_UI_IMPLEMENTATION.md` para el detalle de esa parte — este
documento se actualizó para no seguir describiendo el runner viejo.

---

## 1. Visión general

### 1.1. Qué reemplaza

Existía una tabla `user_progress` (progreso por módulo: `completed_islands`, `total_xp`,
`total_stars`) con dos problemas: no tenía forma de sembrar contenido real de lecciones, y
el cliente calculaba y mandaba la recompensa al servidor (`POST /api/progress` con
`xp_gain`/`stars_gain` en el body) — el server confiaba ciegamente en esos números.

Se reemplazó por:
- Un esquema de **contenido** real (`modules`, `lessons`, `videos`).
- Un esquema de **progreso** granular (por lección, por letra del abecedario, por seña).
- Dos **RPC de Postgres** que calculan la recompensa **en el servidor** — el cliente nunca
  vuelve a mandar cuánto ganó, sólo qué respondió.
- Gamificación básica (favoritos, compra de stickers con validación de saldo, logros
  otorgados automáticamente).

### 1.2. Qué NO cubre (todavía)

El **contenido del ejercicio en sí** (qué video mostrar, las opciones del quiz, la
conversación de la isla 5) **sigue viviendo en el frontend** (`types/lessons.ts`,
mock estático). El backend sabe *cuánto vale* completar la lección 1 y *registra* que se
completó, pero no sabe *qué video ni qué pregunta mostrar*. Es una separación deliberada,
no un olvido — ver §5.4.

### 1.3. Responsabilidades por capa

| Capa | Tecnología | Rol |
|---|---|---|
| Contenido (catálogo) | Postgres (`modules`, `lessons`, `videos`) | Metadata: títulos, recompensas, orden |
| Progreso | Postgres (`user_stats`, `user_lessons_completed`, …) | Qué completó cada usuario |
| Economía | RPC `security definer` (`complete_user_lesson`, …) | Calcula y persiste XP/puntos/señas — nunca el cliente |
| Acceso a datos (backend) | `supabaseAdmin` (service_role) | Un solo patrón en todo el backend — ver §3.1 |
| API | Express (`content*`, `progress*`, `alphabet*`, `favorites*`, `gamification*`) | REST sobre esas tablas/RPC |
| Datos remotos (frontend) | TanStack Query | Queries + mutations, invalidación automática |
| Contenido del ejercicio (frontend) | `types/lessons.ts` (mock estático) | Qué video/pregunta mostrar — no viene del backend aún |

---

## 2. Backend — esquema de datos

### 2.1. Tablas de contenido (catálogo)

| Tabla | Qué guarda |
|---|---|
| `modules` | `title`, `description`, `order`. Hoy: Módulo 1 con lecciones reales; Módulo 2 y 3 sembrados como placeholders bloqueados (sin lecciones) — ver §2.5. |
| `lessons` | Una fila por isla. `module_id`, `lesson_number` (1-5), `xp_reward`, `points_perfect`, `points_retry`, `order`. |
| `videos` | Catálogo de señas: `title`, `url`, `signs_reward` (hoy siempre 1 — ver §2.3). |
| `lesson_signs` | **Puente lección↔video, pero sólo de las señas ACREDITADAS**, no de todos los videos que aparecen en la lección. Ej.: la lección 1 enseña "Hola" y "Adiós" pero sólo evalúa "Hola" → una sola fila. La lección 4 (ejercicio de *match*) evalúa los 3 pares a la vez → 3 filas. |

### 2.2. Tablas de progreso del usuario

| Tabla | Qué guarda |
|---|---|
| `user_stats` | Fila única por usuario: `total_xp`, `total_points`, `total_signs`. Se crea sola al registrarse (trigger, ver §2.4). |
| `user_lessons_completed` | Histórico de lecciones completadas, con lo ganado en cada una. |
| `user_alphabet_progress` | Letras del abecedario completadas. |
| `user_video_signs` | Señas efectivamente aprendidas (idempotente: `primary key (user_id, video_id)`, una seña repetida entre lecciones no se cuenta dos veces). |

### 2.3. Gamificación

| Tabla | Qué guarda |
|---|---|
| `stickers` | Catálogo comprable: `tier`, `price`. |
| `achievements` | Catálogo de logros: `requirement_type`, `requirement_count`. Hoy sólo existe el tipo `'lessons_completed'` (Copa Bronce/Plata/Oro a 5/15/30 lecciones). |
| `user_stickers` | Stickers comprados. |
| `user_achievements` | Logros otorgados. |

`videos.signs_reward` vale **1** para las 9 señas del seed (bajado de un default de 2): como
`lesson_signs` ya contiene sólo las señas evaluadas (una fila = una seña), un valor mayor
duplicaría el conteo.

### 2.4. El trigger que resolvió la pregunta original

`handle_new_user_stats()` corre en `AFTER INSERT ON auth.users` (mismo patrón que ya usaba
`profiles`) e inserta la fila de `user_stats` en cero. Al ser un trigger de base de datos
—no código de un endpoint— cubre **los dos flujos de login por igual** (Google y mail/pass),
que era justamente el motivo para descartar hacerlo desde `authController.register`.

### 2.5. Módulo 2 y 3: placeholders bloqueados

`20260724000005_seed_modules_2_3.sql` sembró "Módulo 2" y "Módulo 3" **sin lecciones**, sólo
para que vuelvan a aparecer como tabs bloqueados en el home (antes eran un mock hardcodeado
en el frontend; al conectar el backend real, desaparecieron porque sólo existía el Módulo 1).
No hace falta ningún cambio de frontend para esto — la lógica de "el primer módulo por
`order` desbloqueado, el resto bloqueado" ya estaba escrita de forma genérica.

---

## 3. Backend — el patrón de autenticación con Supabase

### 3.1. Decisión: `service_role` + `user_id` explícito, en todo el backend

El esquema nuevo fue diseñado originalmente alrededor de `auth.uid()` (RPC leyendo la
identidad del JWT de quien llama). Pero el backend habla con Supabase usando la clave
**service_role** —igual que ya hacía `profileService.ts`— no con el JWT del usuario. Con
service_role, `auth.uid()` es siempre `null`.

**Se unificó todo en un solo patrón** (en vez de mantener dos: JWT-forwarding para
contenido/progreso y service_role para perfil):
- Los `services/*.ts` del backend usan `supabaseAdmin` para todo (lecturas y RPC).
- Las RPC reciben `p_user_id uuid` como parámetro explícito, no `auth.uid()`.
- El middleware de auth (sin cambios) sigue validando el token y exponiendo `req.user.id`;
  los controllers pasan ese id a los services.

### 3.2. El costo de seguridad de esa decisión, y cómo se cubrió

Con `p_user_id` explícito, cualquiera con la API key pública podría en teoría llamar a una
RPC pasando el `user_id` de otra persona y otorgarle puntos ajenos — porque ya no hay
`auth.uid()` verificando quién es realmente quien llama.

**Mitigación: se revoca el `EXECUTE` de cada RPC para todos salvo `service_role`.**

```sql
revoke execute on function public.complete_user_lesson(uuid, uuid, boolean) from public;
grant execute on function public.complete_user_lesson(uuid, uuid, boolean) to service_role;
```

Con esto, ni siquiera un usuario autenticado puede invocar las RPC directo contra Supabase —
sólo el backend (que ya validó la identidad real vía el middleware) puede hacerlo. Este
bloque de permisos se repite para las 4 RPC (§4).

---

## 4. Backend — las 4 RPC (lógica que vive en la base, no en TypeScript)

| RPC | Qué hace | Devuelve |
|---|---|---|
| `complete_user_lesson(p_lesson_id, p_user_id, p_is_perfect)` | Si no estaba completada: calcula XP/puntos según `is_perfect`, registra la lección, inserta las señas nuevas de `lesson_signs` en `user_video_signs` (idempotente) y actualiza `user_stats`. Si la lección no existe, o ya estaba completada, devuelve `success: false` sin tocar nada. | `{ success, message?, earned_xp, earned_points, earned_signs }` |
| `complete_alphabet_letter(p_letter, p_user_id)` | Igual que arriba pero para una letra (5 XP / 20 puntos / 1 seña fijos). | `{ success, message?, earned_xp?, earned_points?, earned_signs? }` |
| `purchase_sticker(p_user_id, p_sticker_id)` | Valida que no lo tenga ya y que el saldo alcance; descuenta `total_points` y registra la propiedad — todo en una transacción, para que un doble click no compre dos veces ni deje puntos en negativo. | `{ success, message?, spent_points?, remaining_points?, required?, available? }` |
| `evaluate_achievements(p_user_id)` | Cuenta lecciones completadas y otorga los logros de `requirement_type = 'lessons_completed'` que correspondan y todavía no tenga. Devuelve sólo los **recién** otorgados (no el historial), para que el front pueda mostrar un popup de "nuevo logro". | `json` array de `{ id, name }` |

`evaluate_achievements` se llama **desde el backend** (no desde la RPC de completar lección)
justo después de un `complete_user_lesson` exitoso — decisión deliberada para no volver a
tocar una RPC ya probada; ver `progressController.completeLesson`.

**Guard agregado a `complete_user_lesson`:** si `p_lesson_id` no existe, la versión original
dejaba que el `insert` fallara con un error de Postgres feo (`not null` de `earned_xp`
violado). Ahora devuelve `{ success: false, message: 'Lesson not found' }` de forma
controlada.

---

## 5. Backend — endpoints REST

Todos con `authMiddleware`. Base: `/api`.

### 5.1. Contenido (lectura) — `content*`
```
GET /modules
GET /modules/:id/lessons
GET /videos
GET /stickers
GET /achievements
```

### 5.2. Progreso — `progress*` (reemplaza por completo a `GET/POST /api/progress`, que ya no existe)
```
GET  /stats
GET  /lessons/completed
POST /lessons/:id/complete   body: { is_perfect: boolean }
```

### 5.3. Abecedario — `alphabet*`
```
GET  /alphabet/progress
POST /alphabet/:letter/complete
```

### 5.4. Favoritos — `favorites*` (CRUD directo, sin RPC — no hay lógica que proteger)
```
GET    /favorites
POST   /favorites          body: { favorable_type: 'video'|'letter', favorable_id }
DELETE /favorites/:type/:id
```

### 5.5. Gamificación — `gamification*`
```
GET  /stickers/mine
POST /stickers/:id/purchase
GET  /achievements/mine
```

**Sin frontend todavía:** favoritos, stickers y logros tienen API completa (§5.4/5.5) pero
**ninguna pantalla los consume** — es trabajo de frontend pendiente, no bugueado, sólo no
empezado.

### 5.6. Migraciones (orden de aplicación)

```
20260702013407_init_users.sql              → profiles, trigger de alta (ya existía)
20260721180000_create_avatars_bucket.sql   → bucket de avatares (ya existía)
20260722000000_create_user_progress.sql    → el modelo VIEJO (ya existía, aplicado)
20260724000000_full_schema.sql             → todo el esquema nuevo (§2-§4)
20260724000001_create_videos_bucket.sql    → bucket 'lesson-videos' (aún sin usar por el front)
20260724000002_drop_user_progress.sql      → retira user_progress (migración nueva, no se
                                               edita la de 20260722 porque ya podía estar aplicada)
20260724000003_seed_module_1.sql           → Módulo 1 + 5 lecciones + 9 videos + lesson_signs
                                               + stickers + achievements (renombrado desde
                                               seed.sql — supabase db push ignora archivos que
                                               no siguen el patrón <timestamp>_name.sql)
20260724000004_gamification_rpcs.sql       → purchase_sticker + evaluate_achievements
20260724000005_seed_modules_2_3.sql        → Módulo 2 y 3 (placeholders bloqueados, §2.5)
```

**Todas aplicadas y verificadas contra la base real** (Supabase remoto — no local con
Docker). `gen_random_uuid()` se usa en vez de `uuid_generate_v4()`/`uuid-ossp`: esa extensión
ya estaba instalada en el proyecto pero en el schema `extensions`, no `public`, y sin
calificarla la migración fallaba con `function uuid_generate_v4() does not exist`.
`gen_random_uuid()` es nativo de Postgres 13+, sin extensión.

---

## 6. Frontend — la conexión al backend

### 6.1. Capa de datos

```
src/types/progress.ts       → Module, LessonMeta, UserStats, CompletedLesson,
                               EarnedAchievement, CompleteLessonResult
src/services/content.ts     → getModules(), getModuleLessons() (+ mock si USE_MOCK_AUTH)
src/services/progress.ts    → REESCRITO por completo: getStats(), getCompletedLessons(),
                               completeLesson() — se borró getUserProgress/updateProgress/
                               UserProgress del modelo viejo
src/hooks/features/lessons/
  useModules.ts · useModuleLessons.ts · useStats.ts · useCompletedLessons.ts
  useCompleteLesson.ts      → useMutation; en éxito invalida ['stats'] y ['completed-lessons']
```

`getStats()` nunca propaga `null`: si el backend devuelve `data: null` (no debería, el
trigger siempre crea la fila, pero por las dudas), normaliza a stats en cero.

### 6.2. El mapeo de nombres front↔back (fuente de bugs si no se respeta)

| Front (`HomeStats`) | Back (`user_stats`) |
|---|---|
| `xp` | `total_xp` |
| `stars` | `total_points` |
| `paws` | `total_signs` |

`stars` en el front **es** los puntos del backend, no una tercera moneda. `paws` son señas.

### 6.3. Home (`app/(protected)/index.tsx`) — reescrito

- Módulos reales (`useModules`), no `MOCK_HOME_MODULES`.
- `completedIslands` del módulo seleccionado se deriva contando cuántas de sus lecciones
  (`useModuleLessons`) están en `useCompletedLessons()`.
- **Desbloqueo entre módulos, simplificado a propósito:** el primer módulo (menor `order`)
  siempre desbloqueado; el resto queda `locked` por default. La cascada "desbloqueado si el
  anterior está 100% completo" necesitaría el progreso de *cada* módulo, no sólo del
  seleccionado (un hook por módulo a la vez, no en loop) — y como hoy Módulo 2/3 no tienen
  lecciones, no hay con qué ejercitar esa lógica todavía. Documentado en el código, no sólo
  acá.
- Navegación: `onIslandPress` resuelve la lección real por `lesson_number` y navega a
  `/lesson/${lesson.id}?n=${lesson.lesson_number}` — el UUID real más el número (necesario
  porque el contenido del ejercicio sigue siendo mock, indexado por número, ver §6.4).

### 6.4. Runner de lección (`app/lesson/[id].tsx`)

> Esta sección describe la lógica de negocio del runner (de dónde sale cada dato), que sigue
> vigente tal cual tras el merge de `review-lessons-ui`. La **UI** de la pantalla (video real,
> layout responsive, extracción en componentes) se describe en §6.4-bis.

- `id` (ruta) = UUID real de la lección, para `completeLesson`. `n` (query param) =
  `lesson_number`, decide qué `MOCK_LESSON_*` mostrar. `pr` (query param, agregado al mergear
  la UI nueva) = `points_retry` de la lección: sólo para que el modal de feedback muestre
  cuántos puntos se pueden ganar todavía tras un error — no reemplaza el cálculo del server.
- **Se eliminó todo el cálculo de recompensa del cliente** (arrays `xpValues`/
  `pointsNoErrors`/`pointsWithErrors` hardcodeados, con un bug de indexación conocido). La
  economía la calcula y persiste el server.
- `isPerfect` se deriva de `retryCount` (¿algún paso tuvo al menos un error, en algún
  intento?) — reutiliza estado que el runner ya llevaba para la UI de reintento, no agrega
  un tracker nuevo.
- Efecto secundario bueno: desapareció el bug de "Señas = accuracy%" — antes el tercer
  contador de la pantalla de recompensa mostraba un porcentaje inventado (`accuracy`, que
  bajaba 20 puntos por error); ahora muestra `earned_signs`, un conteo real del server.
- La pantalla de recompensa distingue completar-por-primera-vez de reintentar-una-ya-completa
  (`result.success`), calcula "Nivel N+1 desbloqueado" con el número real (antes decía
  "nivel 2" fijo, sin importar qué lección jugaste), y muestra `earned_achievements` si se
  otorgó un logro nuevo.
- El HUD superior (XP/puntos/señas durante el juego) pasó de `MOCK_HOME_STATS` (nunca
  reflejaba al usuario real) a `useStats()`.

### 6.4-bis. UI del runner: video real + layout responsive (merge de `review-lessons-ui`)

La pantalla se reescribió en paralelo, en otra rama, y se mergeó sobre esta implementación.
Detalle completo, gotchas de plataforma y verificación en
`DOCS/LESSONS_UI_IMPLEMENTATION.md` — acá sólo el resumen de qué cambió respecto a lo
descripto en el resto de este documento:

- **Los videos ya no son un ícono placeholder.** Se integró **expo-video** (`~3.0.16`) y los
  6 lugares donde debía haber una seña (content, quiz, matching, diálogo) reproducen video
  real. El gating de "ya viste el video" depende del evento `playToEnd`, no de un tap
  simulado.
- **13 componentes nuevos** en `src/components/features/lessons/` (`LessonVideo`,
  `LessonHeader`, `LessonFooter`, `LessonSummary`, 4 modales, 3 `steps/*`) — `[id].tsx` quedó
  como orquestador (estado + reglas de negocio), sin JSX de las pantallas.
  **`DialogueExercise`/`DraggableWord` (drag & drop, §6.5) se conservaron tal cual** — la
  otra rama traía su propia versión de diálogo (tap-para-seleccionar) y se descartó a favor
  de ésta al resolver el merge.
- **Layout responsive.** Antes todo ocupaba el ancho completo en desktop (modales de
  ~1800px, CTA de punta a punta); ahora hay topes por zona (`max-w-5xl` la columna,
  `max-w-md` los modales, `max-w-sm` el CTA) y el marco de video es vertical 9:16 (los videos
  de LSA son verticales, no horizontales).
- **El texto de feedback tras un error ya no dice "75 puntos" fijo** — lee el `pr` real de la
  lección (ver arriba). Sigue siendo sólo informativo: la recompensa la calcula el server.
- **Los 3 videos de Cloudinary son de prueba** (señas sueltas del abecedario, cargadas para
  validar que el reproductor anda) — no corresponden semánticamente a "Hola"/"Mío"/etc.
  Reemplazarlos por contenido real sigue pendiente (§7.2).

### 6.5. Drag & drop real — isla 5

La isla 5 (completar una conversación) tenía una interacción de tocar-para-seleccionar que
no coincidía con el texto en pantalla ("Arrastra cada palabra a su lugar"). Se implementó
arrastre real:

```
app/_layout.tsx                                    → + GestureHandlerRootView en la raíz
                                                       (requisito de react-native-gesture-handler;
                                                       nadie lo había necesitado hasta ahora)
src/components/features/lessons/
  DraggableWord.tsx      → el chip arrastrable (Gesture.Pan + Reanimated)
  DialogueExercise.tsx   → mide cada blanco con measureInWindow (coordenadas absolutas de
                            pantalla — banco de palabras y área de diálogo, que además
                            scrollea, no comparten un padre de coordenadas locales) y decide
                            si el punto de soltado cayó dentro de alguno
```

Se sacó el mecanismo viejo de tocar-para-seleccionar (`selectedWordForDialogue` y sus usos).
El texto "Arrastra cada palabra a su lugar" ahora es literal en vez de una promesa falsa.
Se mantuvo tocar-un-blanco-lleno-para-vaciarlo como interacción complementaria (no choca con
el gesto de arrastre, que vive en los chips).

**No incluye** (evaluado y descartado por alcance): resaltar el blanco destino mientras se
arrastra por encima (hover feedback en vivo). El drop funciona igual sin eso; es pulido
posible a futuro.

---

## 7. Qué falta / pendiente

> ⚠️ **Revisado el 2026-07-30: casi toda esta sección quedó obsoleta.** Se escribió cuando el
> sistema recién se conectaba a la base; desde entonces se implementó casi todo. Se conserva
> tachada como registro de la evolución. **Para el estado real y priorizado, ver la auditoría y
> `PENDIENTES_DB.md` en `local/`.**

### 7.1. ~~Bloqueante para que esto llegue a producción~~ ✅ Superado

- ~~Sin deployar todavía~~ — `main` está desplegado y es la rama definitiva.
- Sigue vigente sólo esto: probar desde **Expo Go** en un dispositivo físico requiere apuntar
  `EXPO_PUBLIC_API_URL` a la **IP de LAN** de la máquina que corre el backend (`localhost` no
  sirve desde el celular).

### 7.2. Contenido pendiente (no es código, es trabajo de producto/UX)

- **Las dos lecciones de cierre (`m1-l5`, `m2-l5`) siguen sin su video.** El guion **sí** está
  definido y aprobado; lo que falta es grabar **un video de la conversación completa** para cada
  una. Hoy usan un video de relleno: se pueden jugar, dan XP y puntos, pero acreditan 0 señas.
  Receta exacta para cerrarlo en `PENDIENTES_DB.md` §0.6.
  > Nota: se acreditan 3 señas con **un solo video** (`videos.signs_reward = 3` + una fila en
  > `lesson_signs`), no con 3 filas — la RPC suma esa columna, no cuenta filas.
- **P1 (cómo penaliza cada error) sigue sin resolver por UX.** Hoy `complete_user_lesson`
  implementa la lectura más simple (cualquier error → monto reducido fijo). Si UX define una
  penalización progresiva, es un cambio de columnas en `lessons`, no de arquitectura.
- ~~**Módulo 2 y 3 no tienen lecciones**~~ — el **Módulo 2 tiene sus 5 lecciones** desde
  `20260728000000`. El Módulo 3 sigue sembrado y vacío, bloqueado a propósito.

### 7.3. ~~Frontend sin construir todavía~~ ✅ Casi todo construido

- ~~**Pantallas de favoritos, stickers y logros**~~ ✅ Las tres existen. Stickers está cableado a
  la API real (`purchase_sticker` descuenta en el server). **Favoritos y Logros siguen resolviendo
  contra el cliente**, no contra `/api/favorites` ni `achievements` — pendiente real, en la
  auditoría.
- **El contenido del ejercicio sigue siendo del lado del cliente** (§1.2) — vigente y por diseño.
  Lo que **sí** cambió: los **videos** ya no son mock, se referencian por id y se resuelven contra
  `GET /api/videos` (`utils/lessonVideos.ts`). Modelar el ejercicio completo en la base sigue
  siendo una pieza de arquitectura nueva, no una extensión chica.
- ~~**Reemplazar los 3 videos de Cloudinary de prueba**~~ ✅ Hecho: no queda ninguna URL de video
  hardcodeada en el código.
- **Hover feedback en el drag de la isla 5** (§6.5) — pulido opcional, sigue pendiente.
- ~~**Cascada de desbloqueo entre módulos**~~ ✅ Implementada y en uso: el módulo N se abre al
  completar el N-1, y un módulo sembrado sin lecciones (el 3) corta la cadena en vez de
  desbloquear módulos vacíos.

### 7.4. Menores / conocidos, no bloqueantes

- `profiles.first_name`/`last_name`: el schema los agregó pero `handle_new_user()` no los
  llena (sólo `full_name`). Quedan `null`.
- 2 warnings de lint preexistentes en `app/lesson/[id].tsx` (`exhaustive-deps` en los dos
  `useEffect` de arranque de step / guardado de progreso) — no introducidos por este trabajo,
  no tocados.
