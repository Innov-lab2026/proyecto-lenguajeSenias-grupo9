# Pantalla de lección — UI responsive + reproducción de video

Documentación de la reescritura de `app/lesson/[id].tsx`: render real de los videos de las señas
(antes eran placeholders), layout que funciona en desktop (antes todo ocupaba el ancho completo de
la pantalla) y extracción de la pantalla en componentes.

Plan de trabajo original y diagnóstico completo: `local/LESSON_UI_PLAN.md`.

---

## 1. Visión general

La pantalla de lección es un flujo autocontenido (fuera de `(protected)`, sin navbar) con tres
"pantallas" en una: **modal de intro** → **secuencia de steps** → **resumen**. Los steps son de 4
tipos (`content`, `quiz`, `matching`, `dialogue`) y cada respuesta abre un **modal de feedback**.

### Qué cambió

| Antes | Después |
|-------|---------|
| Ningún video se reproducía: los 6 lugares eran un ícono `videocam-outline` | Video real con **expo-video** en los 6 lugares |
| Todo a ancho completo en desktop (modales de ~1800px, CTA de punta a punta) | Columna acotada (`max-w-5xl`) + modales `max-w-md` + CTA `max-w-sm` |
| Cajas de video horizontales que estiraban a lo alto | Marco **vertical 9:16** (los videos de LSA son verticales) |
| `text-[8px]` / `text-[10px]` en diálogo y opciones | Escala legible (`text-sm` / `text-base`, con variantes `md:`) |
| Un archivo de 908 líneas con todo mezclado | 442 líneas de orquestación + 13 componentes en `features/lessons/` |

### Stack agregado
**expo-video `~3.0.16`** (paquete oficial del SDK 54; funciona en Expo Go, web y nativo). Se descartó
`expo-av` (deprecado en SDK 54) y un `<video>` solo-web (no sirve en mobile). El config plugin
`expo-video` quedó registrado en `app.json`.

> ⚠️ Al ser un módulo nativo, quien use un *development build* propio tiene que **regenerarlo**.
> En Expo Go y en web funciona sin pasos extra.

---

## 2. Estructura de archivos

```bash
app/lesson/
  [id].tsx                      # orquestador: estado, reglas de puntaje, composición (442 líneas)
src/components/features/lessons/
  LessonVideo.tsx               # reproductor reutilizable (expo-video) — marco vertical
  LessonHeader.tsx              # HUD: stats (XP/estrellas/patitas) + ProgressBar
  LessonFooter.tsx              # CTA principal + fila de accesos (atrás/ajustes/favorito/pista)
  LessonSummary.tsx             # pantalla de resumen al terminar la lección
  LessonModalCard.tsx           # overlay + card centrado con tope de ancho (compartido)
  IntroModal.tsx                # inicio: dificultad, isla, título, descripción
  FeedbackModal.tsx             # correcto/incorrecto — responsive (card en desktop, full en mobile)
  SettingsModal.tsx             # silenciar audio / salir de la lección
  HintModal.tsx                 # pista del step actual
  steps/
    ContentStep.tsx             # mostrar una seña (video único o selector de señas)
    QuizStep.tsx                # 2 variantes: video + opciones de texto, o grilla de videos
    MatchingStep.tsx            # relacionar video ↔ palabra
    DialogueStep.tsx            # completar huecos de una conversación
src/constants/lessons.ts        # LESSON_SHELL (ancho de la columna en desktop)
src/types/lessons.ts            # + MatchingState, + videoUrls en los mocks que faltaban
```

**Convención:** los 13 componentes son **presentacionales** y reciben props. Toda la máquina de
estados (18 `useState`, `handleNext`, `handleRetry`, tablas de puntaje) se quedó en `[id].tsx` — se
extrajo la UI, no la lógica, para que el refactor no arrastrara riesgo de regresión funcional.

---

## 3. Reproducción de video

### 3.1 `LessonVideo`

```tsx
<LessonVideo
  uri={step.videoUrl}
  muted={isMuted}          // respeta el toggle del modal de ajustes
  autoPlay={estaSeleccionado}
  onWatched={() => marcarVisto(idx)}
  interactive={false}      // cuando vive dentro de otro Pressable
  compact                  // overlays chicos, para grillas
  className="h-full max-h-[560px] aspect-[9/16]"
/>
```

| Comportamiento | Detalle |
|----------------|---------|
| Reproducción | Autoplay en loop, **silenciado** por defecto (son señas; y en web el autoplay solo se permite muteado) |
| Controles | `nativeControls={false}` + toggle propio de play/pausa, para no romper la estética |
| Gating | El evento **`playToEnd`** dispara `onWatched()` → es lo que habilita el botón *Siguiente* |
| Carga / error | Spinner mientras `status === 'loading'`; si `status === 'error'` cae al placeholder de ícono |
| `interactive={false}` | No envuelve en su propio `Pressable` ni muestra overlay de play: evita capturar el tap que le corresponde a la tarjeta de opción que lo contiene |
| `autoPlay` reactivo | Es un efecto (no solo setup al montar): en el quiz de opciones-video hay hasta 4 players montados y **solo el seleccionado reproduce** |

### 3.2 Bug de plataforma: el loop rompía el gating en web

**Síntoma:** en Expo Go el botón *Siguiente* se habilitaba al terminar el video; en web no, aunque el
video terminara.

**Causa:** con `player.loop = true`, expo-video en web delega en el atributo `loop` del `<video>`
nativo — y un `<video loop>` **nunca dispara el evento `ended`** (el navegador lo reinicia por su
cuenta). Como `playToEnd` depende exactamente de ese evento
(`node_modules/expo-video/build/VideoPlayer.web.js`), nunca llegaba. En nativo el player sí notifica
el fin de cada ciclo aunque esté en loop, por eso solo fallaba en web.

**Solución:** loop manual — no se usa `player.loop`; al recibir `playToEnd` se dispara `onWatched()`
y se llama a `player.replay()`. El evento se emite igual en las dos plataformas.

### 3.3 Otros detalles

- `fullscreenOptions={{ enable: false }}` en vez de `allowsFullscreen` (deprecado en expo-video).
- Los videos de prueba son **478×850 (~9:16, verticales)** sobre fondo blanco → el marco es
  alto-dominante y el contenedor pasó de `bg-slate-200` a `bg-surface`.

---

## 4. Sistema de layout

### 4.1 Columna de la lección

```ts
// src/constants/lessons.ts
export const LESSON_SHELL = 'mx-auto w-full max-w-5xl'   // 1024px
```

Se aplica al **contenido interno** de header, área de steps y footer. Los bordes (`border-b`,
`border-t`) y fondos siguen siendo *full-bleed*, para que en desktop se lean como barras completas.

### 4.2 Marco de video

```
frame: h-full max-h-[560px] aspect-[9/16] · rounded-3xl · overflow-hidden · bg-surface
video: contentFit="contain"   ← cualquier proporción real entra sin deformarse
```

`aspect-[9/16]` lo soporta NativeWind v4. El `max-h` evita que en ventanas muy altas el video crezca
sin control. Con `contentFit="contain"`, si mañana entra contenido con otra proporción, entra
letterboxeado en vez de deformarse.

### 4.3 Topes por zona

| Zona | Tope | Medido en desktop (1440px) |
|------|------|----------------------------|
| Columna de la lección | `max-w-5xl` | 1024px |
| Modales (intro / ajustes / pista / feedback) | `max-w-md` | 448px |
| CTA del footer | `max-w-sm` | 384px |
| Filas del ejercicio de matching | `max-w-2xl` | 672px |
| Columna del resumen | `max-w-md` | 448px |
| Imagen del carpincho (resumen) | `max-w-[280px]` | 280×250px |
| Marco de video (content step) | `aspect-[9/16]` + `max-h-[560px]` | 315×560px |

### 4.4 Modal de feedback responsive

Es el único componente que cambia de forma según el tamaño (usa el hook `useResponsive` ya existente,
breakpoint `isMobile` = <768px):

- **Mobile:** `Modal` full-screen deslizante (como estaba).
- **Desktop:** card centrado `max-w-md` sobre overlay — un full-screen en un monitor era desmedido.

### 4.5 Recorte de las ilustraciones de feedback

Las ilustraciones (`feedback_correcto.svg` / `feedback_incorrecto.svg`, ~390×375, casi cuadradas)
tienen la cabeza del carpincho pegada al borde superior. Con `contentFit="cover"` y recorte centrado
(el default), una caja ancha y baja como el card de desktop (448×224) recortaba ~90px de arriba,
justo la cara.

**Solución:** `contentPosition="top"` en ambas variantes → el recorte prioriza siempre la cara (que
es lo que comunica el resultado) y sacrifica el pasto de abajo.

### 4.6 Escala tipográfica

| Uso | Antes | Ahora |
|-----|-------|-------|
| Pregunta del step | `text-xs` (matching/diálogo) vs `text-lg` (quiz) | `text-base md:text-lg` en los 4 tipos |
| Título de contenido | `text-xl` | `text-xl md:text-2xl` |
| Diálogo y banco de palabras | `text-[10px]` | `text-sm md:text-base` |
| Etiqueta de opción-video | `text-[8px]` | `text-xs md:text-sm` |

---

## 5. Cambios en los datos mock (`src/types/lessons.ts`)

- **`MatchingState`**: el tipo del estado del ejercicio de matching pasó de estar inline en la
  pantalla a exportarse desde `types/`, para compartirlo con `MatchingStep`.
- **`videoUrls` faltantes**: los quiz de opciones-video de `MOCK_LESSON_1` y `MOCK_LESSON_3` tenían
  `options` pero ningún `videoUrls`, así que no había forma de saber qué video correspondía a cada
  opción (el campo ya existía en el tipo, faltaban los datos). Se completaron reusando los 3 videos
  de prueba.

> ⚠️ Los 3 videos de Cloudinary son señas sueltas del abecedario cargadas **solo para probar cómo se
> ve un video real en la pantalla**: no corresponden semánticamente a "Hola", "Mío", "Nombre", etc.
> Por eso no se buscó coherencia de contenido al completarlos, y en la lección 3 (4 opciones, 3
> videos) uno se repite. Se resuelve cuando entre el contenido real.

---

## 6. Limpieza de código

- **Rama muerta en `handleNext`**: el caso `showFeedback === 'incorrect'` del segundo `if` era
  inalcanzable, porque el primer `if` de la función ya lo manejaba y retornaba. Quedó como
  `if (showFeedback === 'correct')`.
- **Memoización manual eliminada**: `useMemo` (lookup de `lesson`) y `useCallback`
  (`handleMatchSelection`). **React Compiler está activo** (`app.json` → `experiments.reactCompiler`)
  y no había ningún problema de performance medido que justificara memoizar a mano.
- **`useEffect` vacío** eliminado (solo tenía un comentario).
- **Import muerto** de `RewardStats`, más los que quedaron sin uso al mover contenido a componentes
  (`Text`, `Pressable`, `Ionicons`, `Image`, `Button`, `ProgressBar`, `Modal`, `Fragment`).
- Comentarios en inglés traducidos al español (convención del repo).

---

## 7. Verificación

`npx tsc --noEmit` y `npm run lint` limpios en cada paso (sin warnings nuevos; los que quedan son
pre-existentes de otros archivos).

**Web** (medido con el DOM, no a ojo) en 390px (mobile), 768px (tablet) y 1440px/1440×720 (desktop):

- Marco de video: 315×560 en desktop y 313.9×558 en mobile → 9:16 exacto en ambos, con el `max-h`
  respetado en desktop.
- Modal de intro 448px, CTA 384px, fila de stats confinada al shell (antes se esparcían por los
  1440px).
- Feedback: card de 448px en desktop y 390×844 (full-screen) en mobile — el switch responsive anda en
  las dos direcciones. Capturas confirmando que la cara del carpincho ya no se corta en ninguno de los
  tres tamaños, y que el card no desborda en una ventana baja.
- Quiz de opciones-video: al seleccionar una opción, **solo ese** `<video>` pasa a `paused:false`.
- Recorrido funcional completo de la lección 1 por los dos caminos: *Siguiente* tras responder bien
  (20 XP / +150 puntos) y tras responder mal (20 XP / +0 puntos) — mismos valores antes y después de
  la limpieza del punto 6.
- Lecciones 2 a 5: selector de señas, matching (preview + pares) y diálogo (completar huecos)
  funcionando con video real.

**Expo Go:** verificado por el usuario — autoplay y desbloqueo del botón *Siguiente* al terminar el
video.

---

## 8. Pendiente

> ⚠️ **Esta lista es de la época del modelo mock y quedó casi toda obsoleta.** Se conserva tachada
> como registro. Revisado el 2026-07-30.

- ~~**HUD en vivo + texto de feedback**~~ ✅ El HUD lee `GET /api/stats` real; `MOCK_HOME_STATS` ya
  no lo consume ninguna pantalla. El feedback de error usa `points_retry` de la lección, no un
  número hardcodeado.
- ~~**`useLessonEngine`**: mover los 18 `useState`~~ ✅ Hecho: el motor vive en
  `src/hooks/features/lessons/useLessonEngine.ts`.
- ~~**Tablas de puntaje a constantes**~~ ✅ Superado: la economía **ya no vive en el cliente**. XP,
  puntos y señas los calcula y persiste la RPC `complete_user_lesson` a partir de
  `lessons.xp_reward` / `points_perfect` / `points_retry` y `lesson_signs`.
- ~~**Backend de lecciones** / `updateProgress`~~ ✅ Superado: el progreso se guarda vía
  `POST /api/lessons/:id/complete`. `updateProgress` y el modelo `user_progress` se eliminaron.
- ~~**Contenido real**: reemplazar los 3 videos de prueba~~ ✅ Hecho: los videos se referencian
  **por id** y se resuelven contra `GET /api/videos` (ver `utils/lessonVideos.ts`). No queda
  ninguna URL de video hardcodeada.
- **Performance en Android**: el quiz de opciones-video monta hasta 4 players a la vez. **Sigue
  vigente** — hoy sólo reproduce el seleccionado; si llegara a pesar, cargar el player recién al
  seleccionar la opción.

**Lo que sí sigue pendiente hoy** (ver la auditoría en `local/` para el detalle): los videos de las
dos conversaciones (`m1-l5`, `m2-l5`), y sacar de los componentes los ids de contenido hardcodeados
(`m1-l1-quiz`, `m2-l4-composition`, etc.) moviéndolos a flags declarativas en `LessonStep` — el
patrón que ya estrenó `shuffleOptions`.
