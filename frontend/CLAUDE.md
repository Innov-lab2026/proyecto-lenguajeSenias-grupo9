# Carpiseñas — Configuración de Claude Code

## El proyecto

**Carpiseñas**: app móvil **gamificada para aprender Lengua de Señas Argentina (LSA)**, pensada para que personas oyentes aprendan de forma progresiva. Repo: `proyecto-lenguajeSenias-grupo9` (proyecto grupal). El código de la app está en `frontend/`. **Idioma del proyecto: español** (UI, comentarios, docs y commits en español).

## Stack (Expo SDK 54)

| Área | Tecnología |
|------|-----------|
| Runtime | Expo SDK 54 · React Native 0.81 · React 19.1 |
| Routing | Expo Router v6 (typed routes) |
| Estilos | NativeWind v4 + Tailwind v3.4 · `tailwind-merge` |
| Datos remotos | TanStack Query v5 · Axios |
| Estado cliente | Zustand v5 |
| Formularios | React Hook Form v7 + Zod 4 |
| Animación / gestos | Reanimated v4 · Gesture Handler · Worklets |
| Nativo | expo-secure-store · expo-image · expo-haptics · expo-font |

**Activado en `app.json` (importa para cómo escribimos código):**
- **New Architecture** (`newArchEnabled`)
- **React Compiler** (`experiments.reactCompiler`) → la memoización es automática
- **Typed routes** (`experiments.typedRoutes`)

## Cómo trabajamos (user-in-the-loop)

Regla completa en `.claude/rules/workflow.md` o `.gemini/rules/workflow.md`. En resumen:
- **Planificar primero**: analizar, proponer enfoque, esperar OK antes de implementar.
- **Decisiones de arquitectura/tecnología**: presentar opciones con trade-offs, no decidir solo.
- **Nunca** hacer `commit`/`push`/PR ni otras operaciones de git de escritura sin pedido explícito.
- Avanzar de a un paso lógico y mostrar el diff; no encadenar varios pasos sin revisión.

## Reglas de código clave

- **React Compiler activo** → **no** agregues `memo` / `useMemo` / `useCallback` manuales salvo que midas un problema real. (Esto reemplaza la vieja guía de "memoizar todo".)
- **Alias**: `@/*` apunta a la raíz → importá como `@/src/store/...`, `@/src/components/...`.
- **Estilo del repo**: sin punto y coma, comillas simples, 2 espacios, `interface` para props, mapas `Record<Variant, string>` para clases por variante.
- **Texto siempre dentro de `<Text>`**; nunca `{valorFalsy && <X/>}` (crashea en RN) — usá ternario o `!!`. Ver skill `react-native`.
- **Accesibilidad con props de RN** (`accessibilityRole`, `accessibilityLabel`, `accessibilityState`), **no** atributos web (`aria-*`, `role`).
- **Colores**: tokens semánticos de NativeWind (`bg-primary`, `text-ink`, `bg-secondary/20`), no hex sueltos. Fuente única de verdad en `global.css`.
- **Frontera de estado**: datos del servidor en **TanStack Query**; sesión/estado de cliente en **Zustand** (`sessionStore`). No los mezcles.
- **Antes de tocar APIs de Expo**: leé los docs versionados → https://docs.expo.dev/versions/v54.0.0/

## Estructura

Convención `common` (genérico reutilizable) + `features/<dominio>` (todo lo de una función). Hoy implementado: `auth`. Andamiado para: `lessons`, `practice`, `profile`.

```
app/                      ← rutas (Expo Router): (auth) público / (protected) privado
src/
├── components/{common,features/<dominio>}
├── hooks/{common,features/<dominio>}
├── services/    ← http.ts (Axios + interceptores) + <dominio>.ts
├── store/       ← Zustand (sessionStore)
├── lib/         ← storage.ts (persistencia token/user)
├── schemas/     ← Zod
├── types/ · utils/ (cn.ts, date.ts)
```

Detalle y onboarding: `README.md` del frontend. Auth documentada en `DOCS/AUTH_IMPLEMENTATION.md`.

## Skills disponibles (se activan solas según la tarea)

| Skill | Cuándo dispara |
|-------|----------------|
| `react-native` | Componentes RN, performance de listas, animaciones Reanimated, UI nativa (la guía base, 35+ reglas) |
| `nativewind-4` | Estilar con `className`/Tailwind, tokens de color, variantes, fuentes |
| `expo-router-6` | Rutas, layouts, grupos, navegación, params, guards de sesión |
| `tanstack-query-5` | Queries/mutations, caché, invalidación, datos remotos |
| `zod-4` | Validación y schemas (breaking changes vs v3) |
| `zustand-5` | Estado con Zustand (selectores, persist, slices) |
| `testing-rn` | Tests (Jest + jest-expo + RNTL) — ver nota de testing abajo |

## Comandos

- `/nueva-feature <nombre>` — andamia una feature nueva siguiendo la convención `common/features` y el estilo del repo.

## Testing

**Aún no hay testing instalado** (sin runner ni librería). La skill `testing-rn` define el stack objetivo (Jest + `jest-expo` + React Native Testing Library) y los patrones correctos para RN. **No uses Vitest/RTL web ni `toBeInTheDocument`.** Si un cambio amerita tests, proponé primero el setup.

## Enlaces

- NativeWind v4: [llms.txt](https://www.nativewind.dev/llms.txt) · [completo](https://www.nativewind.dev/llms-full.txt)
- Expo SDK 54 (docs versionados): https://docs.expo.dev/versions/v54.0.0/

---
*Actualizado: 2026-06-20 · Configuración de Carpiseñas*
