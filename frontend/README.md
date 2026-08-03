# CarpiSeñas — App (frontend) 👋

App móvil y web **gamificada para aprender Lengua de Señas Argentina (LSA)**, pensada para que
las personas aprendan de forma progresiva. Construida con [Expo](https://expo.dev) (SDK 54) y
React Native, corre en **Android, iOS y navegador** desde la misma base de código.

> Este README cubre el **frontend**. El backend (Express + Supabase) vive en la carpeta `backend/`
> del repositorio y tiene su propia documentación.

---

## Cómo comenzar

Esta guía está pensada para montar la app **desde cero**, incluso si nunca usaste Git, una terminal
o herramientas de desarrollo. Seguí los pasos **en orden**. Cualquier texto en `recuadro gris` es un
comando: se escribe en la **terminal** y se ejecuta con Enter.

> 💡 **¿Qué es la terminal?**
> - **Windows:** abrí el menú Inicio, escribí `PowerShell` y abrilo.
> - **macOS:** abrí Spotlight (Cmd + Espacio), escribí `Terminal` y abrila.

### 1. Requisitos previos (se instalan una sola vez)

1. **Node.js** (incluye `npm`). Descargá la versión **LTS** desde 👉 https://nodejs.org y seguí el
   instalador (siguiente → siguiente → finalizar).
   Para verificar que quedó instalado, en la terminal:

   ```bash
   node -v
   npm -v
   ```

   Si cada comando muestra un número de versión (ej. `v20.x.x`), está OK.

2. **Git** (para descargar el código). Descargalo desde 👉 https://git-scm.com/downloads e instalalo.
   Verificá con:

   ```bash
   git --version
   ```

   > Si preferís no usar comandos para Git, podés instalar **GitHub Desktop**
   > (https://desktop.github.com) y clonar el repo desde su interfaz. Igual vas a necesitar la terminal
   > para los pasos 3 en adelante.

3. **(Solo para probar en un celular) Expo Go**: instalá la app **Expo Go** desde la
   Play Store (Android) o la App Store (iPhone). Es la app que mostrará nuestro proyecto en el teléfono.

### 2. Descargar el proyecto (clonar el repositorio)

En la terminal, ubicate en la carpeta donde quieras guardar el proyecto (por ejemplo el Escritorio) y
clonalo:

```bash
git clone https://github.com/Innov-lab2026/proyecto-lenguajeSenias-grupo9.git
```

Eso crea una carpeta llamada `proyecto-lenguajeSenias-grupo9`. Entrá a la carpeta del frontend:

```bash
cd proyecto-lenguajeSenias-grupo9/frontend
```

> A partir de acá, **todos los comandos se ejecutan dentro de la carpeta `frontend`**.

### 3. Instalar las dependencias

```bash
npm install
```

Esto descarga todo lo que la app necesita para funcionar (puede tardar unos minutos la primera vez).

### 4. Configurar el archivo de entorno (`.env`)

La app necesita un archivo llamado `.env` con su configuración. Ya hay una plantilla lista
(`.env.example`); solo hay que **copiarla** con el nombre `.env`:

- **Windows (PowerShell):**

  ```powershell
  Copy-Item .env.example .env
  ```

- **macOS / Linux:**

  ```bash
  cp .env.example .env
  ```

Las variables disponibles son:

| Variable | Para qué sirve |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base del backend. `http://localhost:3000` para la web en la PC; la IP de tu PC en la red si probás en un celular físico; `http://10.0.2.2:3000` en emulador de Android. |
| `EXPO_PUBLIC_USE_MOCK_AUTH` | `true` = login y registro con datos de prueba, sin backend. `false` = contra el backend real. |
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase (necesaria para el login con Google). |
| `EXPO_PUBLIC_SUPABASE_KEY` | Clave pública (anon) de Supabase. |

> ✅ **Para QA / probar sin backend:** la plantilla ya viene con `EXPO_PUBLIC_USE_MOCK_AUTH=true`, así
> que el login y el registro funcionan con datos de prueba, **sin necesidad de levantar el servidor**.
> No hace falta tocar nada más.
>
> ⚠️ El **login con Google no se mockea**: usa Supabase real siempre. Con el modo mock activo, ese
> botón queda deshabilitado.

### 5. Iniciar la aplicación

Tenés dos formas de verla. **Para QA, la más simple es la web.**

**Opción A — En el navegador (recomendada para QA):**

```bash
npm run web
```

Se abre la app en el navegador (normalmente en `http://localhost:8081`). Listo.

**Opción B — En el celular (con Expo Go):**

```bash
npx expo start
```

Aparecerá un **código QR** en la terminal. Escanealo con el teléfono:
- **Android:** abrí la app **Expo Go** y usá la opción "Scan QR code".
- **iPhone:** abrí la app **Cámara**, apuntá al QR y tocá la notificación que aparece.

> 📶 El **celular y la PC deben estar en la misma red WiFi**. Si el QR no conecta, en la terminal
> cortá con `Ctrl + C` y volvé a iniciar con `npx expo start --tunnel` (funciona aunque estén en
> redes distintas, pero es un poco más lento).
>
> ⚠️ El **login con Google no funciona en Expo Go**: el redirect por scheme necesita un
> *development build*. En Expo Go usá el login por email o el modo mock.

### Problemas comunes

- **"command not found" / "no se reconoce el comando"** al usar `node`, `npm` o `git`: cerrá y volvé a
  abrir la terminal después de instalarlos. Si sigue, reinstalá el programa.
- **La pantalla queda en blanco o con errores raros:** detené con `Ctrl + C` y reiniciá limpiando la
  caché: `npx expo start -c`.
- **El QR no conecta:** verificá la misma WiFi y probá `npx expo start --tunnel`.
- **Para detener la app:** en la terminal donde corre, presioná `Ctrl + C`.

---

## Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run web` | Levanta la app en el navegador (modo desarrollo). |
| `npm start` | Inicia el servidor de Expo con el QR para Expo Go. |
| `npm run android` | Abre la app en un emulador/dispositivo Android. |
| `npm run ios` | Abre la app en un simulador/dispositivo iOS (solo macOS). |
| `npm run lint` | Corre ESLint sobre el proyecto. |
| `npm run build` | Genera el export estático para web (carpeta `dist/`). |
| `npx tsc --noEmit` | Verifica los tipos de TypeScript sin generar archivos. |

> **Antes de subir cambios**, conviene correr `npx tsc --noEmit` y `npm run lint`. Todavía **no hay
> tests automatizados** configurados en el proyecto.

---

## Stack tecnológico

| Área | Tecnología |
|---|---|
| Runtime | Expo SDK 54 · React Native 0.81 · React 19.1 |
| Routing | Expo Router v6 (typed routes) |
| Estilos | NativeWind v4 + Tailwind v3.4 · `tailwind-merge` |
| Datos del servidor | TanStack Query v5 · Axios |
| Estado de cliente | Zustand v5 |
| Formularios | React Hook Form v7 + Zod 4 |
| Animación / gestos | Reanimated v4 · Gesture Handler · Worklets |
| Video | `expo-video` |
| Gráficos | `react-native-svg` |
| Auth con Google | `@supabase/supabase-js` + `expo-auth-session` + `expo-web-browser` |
| Nativo | `expo-secure-store` · `expo-image` · `expo-haptics` · `expo-font` · `expo-image-picker` |

**Activado en `app.json`** (afecta cómo se escribe el código):

- **New Architecture** (`newArchEnabled`)
- **React Compiler** (`experiments.reactCompiler`) → la memoización es automática; **no** hace falta
  agregar `memo` / `useMemo` / `useCallback` a mano salvo que se mida un problema real.
- **Typed routes** (`experiments.typedRoutes`) → las rutas se validan por tipos.
- **Export estático para web** (`web.output: "static"`).

---

## Cómo está organizada la app

### Rutas (Expo Router)

El routing es **por archivos**: cada archivo dentro de `app/` es una pantalla. Los paréntesis marcan
*grupos* que no aparecen en la URL.

```
app/
├── _layout.tsx              ← providers, fuentes, hidratación de sesión y guard de rutas
├── index.tsx                ← entrada: redirige según haya sesión o no
├── +html.tsx                ← HTML raíz (solo web)
├── +not-found.tsx           ← 404
│
├── (auth)/                  ← rutas PÚBLICAS (sin sesión)
│   ├── index.tsx            ← onboarding / bienvenida
│   ├── login.tsx
│   ├── register.tsx
│   ├── pre-register.tsx
│   └── forgot-password.tsx
│
├── (protected)/             ← rutas PRIVADAS (requieren sesión)
│   ├── home.tsx             ← camino de islas + estadísticas
│   ├── alphabet.tsx         ← abecedario (grilla de letras)
│   ├── alphabet/[letter].tsx← video de una letra + práctica con cámara
│   ├── favorites.tsx        ← señas y letras guardadas
│   ├── rewards.tsx          ← logros y stickers
│   ├── profile.tsx          ← perfil, preferencias y cuenta
│   ├── help.tsx · about.tsx
│   └── debug-videos.tsx     ← pantalla de diagnóstico del catálogo de videos
│
└── lesson/[id].tsx          ← pantalla de lección (fuera de (protected) a propósito:
                               es inmersiva, sin barras de navegación)
```

La protección de rutas se resuelve en `app/_layout.tsx` con `Stack.Protected`, según el estado de
`sessionStore`.

### Código fuente (`src/`)

Convención **common / features**: `common` son piezas genéricas reutilizables;
`features/<dominio>` agrupa todo lo específico de una función.

```
src/
├── components/
│   ├── common/              ← Button, TextField, Select, Checkbox, ProgressBar,
│   │                          CarpiAvatar, AppAlertProvider, PwaInstallFromQuery
│   └── features/
│       ├── auth/            ← AuthShell, LoginForm, RegisterForm, BirthDateField, GoogleButton
│       ├── home/            ← IslandPath, Island, ModuleTabs, StatsHeader, LockedModuleView
│       │   ├── islands/     ← las 5 islas en SVG + su animación de reposo
│       │   └── stats/       ← contadores de XP / puntos / señas, con animación
│       ├── lessons/         ← LessonHeader, LessonFooter, LessonVideo, VideoFrame,
│       │   │                  modales (Intro, Pause, Hint, Feedback, Summary)
│       │   └── steps/       ← un componente por tipo de ejercicio
│       ├── navigation/      ← SideBar (desktop/tablet) y BottomBar (mobile)
│       ├── favorites/ · rewards/ · profile/
│
├── hooks/
│   ├── common/              ← useResponsive
│   ├── usePwaInstall.ts     ← instalación como PWA en web
│   └── features/
│       ├── auth/            ← useLogin, useRegister, useLogout, useGoogleAuth,
│       │                      useSessionHydration
│       ├── lessons/         ← useLessonEngine (máquina de estados de la lección),
│       │                      useModules, useAllLessons, useStats, useCompleteLesson,
│       │                      useCompletedLessons
│       ├── alphabet/        ← useVideos, useAlphabetProgress, useCompleteLetter
│       ├── rewards/         ← useStickers, useMyStickers, usePurchaseSticker
│       └── profile/         ← useProfile, useUpdateProfile
│
├── services/                ← capa HTTP: http.ts (Axios + interceptores) y un archivo
│                              por dominio (auth, content, progress, gamification,
│                              alphabet, profile, session, geolocation)
├── store/                   ← Zustand: sessionStore, favoritesStore, preferencesStore
├── lib/                     ← storage.ts (SecureStore | localStorage), supabase.ts, flashMessage.ts
├── schemas/                 ← validación con Zod (auth, profile)
├── types/                   ← contratos y modelos (auth, user, lessons, progress,
│                              gamification, home, profile, navigation)
├── constants/               ← lessons.ts (contenido y textos), countries, gender, home, env
└── utils/                   ← cn.ts (merge de clases), date.ts, jwt.ts, lessonVideos.ts, home.ts
```

### Convenciones de código

- **Alias `@/*`** apunta a la raíz del frontend → importá como `@/src/components/...`.
- **Estilo**: sin punto y coma, comillas simples, 2 espacios, `interface` para props.
- **Todo texto debe ir dentro de `<Text>`**. Nunca uses `{valorFalsy && <X/>}` (rompe en React
  Native): usá un ternario o `!!`.
- **Accesibilidad con props de React Native** (`accessibilityRole`, `accessibilityLabel`,
  `accessibilityState`), **no** atributos web (`aria-*`, `role`).
- **Colores**: usar los tokens semánticos de NativeWind (`bg-primary`, `text-ink`,
  `bg-secondary/20`), no valores hexadecimales sueltos. La fuente única de verdad es `global.css`.
- **Frontera de estado**: datos que vienen del servidor van en **TanStack Query**; el estado de
  sesión y preferencias del cliente va en **Zustand**. No se mezclan.

---

## Cómo funciona el sistema de lecciones

El contenido de las lecciones (enunciados, opciones, respuestas correctas y referencias a los
videos) vive en `src/types/lessons.ts`, indexado por el campo `content_key` de la base
(`m1-l1`, `m1-l2`, …). La base guarda la **economía** (XP, puntos, señas acreditadas y desbloqueos);
el cliente **nunca** calcula recompensas: las pide al servidor al completar la lección.

Los videos se referencian **por id** contra el catálogo (`GET /api/videos`) y se resuelven en tiempo
de ejecución (`utils/lessonVideos.ts`), en vez de guardar URLs fijas.

Toda la máquina de estados de una lección (qué paso se muestra, respuestas, validación, feedback y
resumen) está en `hooks/features/lessons/useLessonEngine.ts`. La pantalla
(`app/lesson/[id].tsx`) solo compone ese estado en componentes.

**Tipos de ejercicio disponibles** (campo `type` de cada paso):

| Tipo | Qué hace |
|---|---|
| `content` | Muestra una seña, o un selector de varias señas relacionadas. |
| `quiz` | Pregunta con opciones (de texto o de video). |
| `matching` | Relacionar cada video con su palabra. |
| `composition` | Armar una frase o palabra desde un banco de opciones. |
| `dialogue` | Completar una conversación arrastrando expresiones a los huecos. |
| `dialogue-composition` | Completar una frase de un diálogo tocando la opción correcta. |
| `dialogue-sequence` | Reproduce la conversación completa en secuencia, sin interacción. |

---

## Web y PWA

La app se exporta como **sitio estático** (`web.output: "static"` en `app.json`) y se despliega en
Vercel. La configuración del deploy está en `vercel.json`, que incluye un *rewrite* a `/index.html`
para que las rutas dinámicas funcionen al recargar la página.

Además es instalable como **PWA**: el manifiesto está en `public/manifest.json` y los íconos en
`public/icons/`. El hook `hooks/usePwaInstall.ts` maneja el evento `beforeinstallprompt`, y el
componente `PwaInstallFromQuery` dispara el instalador cuando se entra con `?install=1`.

Para generar el build de producción:

```bash
npm run build
```

Eso deja el sitio listo en la carpeta `dist/`.

---

## Documentación adicional

En la carpeta [`DOCS/`](./DOCS) hay documentación técnica más detallada:

| Documento | Contenido |
|---|---|
| [`AUTH_IMPLEMENTATION.md`](./DOCS/AUTH_IMPLEMENTATION.md) | Registro, login, Google, logout, estado de sesión, persistencia, protección de rutas y el paso de completar perfil. |
| [`LEARNING_SYSTEM_IMPLEMENTATION.md`](./DOCS/LEARNING_SYSTEM_IMPLEMENTATION.md) | Esquema de contenido y progreso, gamificación y conexión del frontend con el backend. |
| [`LESSONS_UI_IMPLEMENTATION.md`](./DOCS/LESSONS_UI_IMPLEMENTATION.md) | La pantalla de lección: layout responsive y reproducción de video. |
