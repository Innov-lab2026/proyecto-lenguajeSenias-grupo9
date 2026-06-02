# Autenticación — Frontend

Documentación de la implementación de autenticación (registro, login, logout) en la app Expo:
estado de sesión, persistencia, protección de rutas, flujo de datos y detalle de cada módulo.

---

## 1. Visión general

- Pantalla única de auth (`/login`) con tabs **Crear Cuenta / Iniciar Sesión** (toggle interno).
- **Login** (email + password) → persiste token + user e hidrata la sesión.
- **Registro** (email + password) → sin auto-login: muestra "revisá tu correo para confirmar"
  y vuelve a login (alineado con la confirmación por email de Supabase).
- **Logout** client-side: limpia token, user y cache de queries.
- Botón **"Continuar con Google"** como *stub* (UI lista; OAuth real pendiente del backend).

### Stack
Expo Router v6 · NativeWind v4 · TanStack Query · React Hook Form + Zod · Axios · Zustand · expo-secure-store.

### Responsabilidades por capa
| Capa | Tecnología | Rol |
|------|------------|-----|
| UI / formularios | RHF + Zod + NativeWind | Render y validación de inputs |
| Estado de sesión | Zustand (`sessionStore`) | `user`, `token`, `status` en memoria |
| Datos remotos | TanStack Query (`useMutation`) | Ejecuta login/registro, expone `isPending`/`error` |
| Red | Axios (`http`) | Base URL, header `Authorization`, manejo de 401 |
| Persistencia | expo-secure-store / localStorage | Token + user entre reinicios |
| Routing / guard | Expo Router (`Stack.Protected`) | Separa rutas públicas/privadas y redirige |

---

## 2. Estructura de archivos

```bash
app/
  _layout.tsx                 # providers + hidratación de sesión + guard de rutas
  (auth)/
    _layout.tsx               # stack del grupo público
    login.tsx                 # pantalla de auth (orquesta login/registro)
  (protected)/
    _layout.tsx               # stack del grupo privado
    index.tsx                 # home protegido (+ botón logout)
src/
  components/
    common/                   # primitivos reutilizables
      Button.tsx
      TextField.tsx
    features/auth/            # componentes específicos de auth
      AuthCard.tsx
      AuthForm.tsx
      GoogleButton.tsx
      GoogleIcon.tsx
  hooks/features/auth/
    useLogin.ts
    useRegister.ts
    useLogout.ts
    useSessionHydration.ts
  services/
    http.ts                   # instancia Axios + interceptores + helper de error
    auth.ts                   # login/register (+ capa mock)
  store/
    sessionStore.ts           # estado de sesión (Zustand)
  lib/
    storage.ts                # persistencia token/user cross-platform
  schemas/
    auth.ts                   # validación Zod
  types/
    auth.ts                   # contratos request/response
    user.ts                   # modelo de usuario + normalización
```

---

## 3. Flujo de datos

### 3.1 Arranque y restauración de sesión (hidratación)

Al abrir la app no sabemos aún si hay sesión, por eso `status` arranca en `"loading"` y el splash
permanece visible hasta resolverlo.

```
App monta
   │
   ▼
app/_layout.tsx
   ├─ SplashScreen.preventAutoHideAsync()   (a nivel módulo)
   ├─ status = useSessionStore() ............ "loading"
   ├─ useSessionHydration()  ─────────────┐
   └─ status === "loading" → render null  │ (splash sigue visible)
                                          │
                       ┌──────────────────┘
                       ▼
   useSessionHydration (al montar):
     getToken() + getUser()  (desde storage)
        │
        ├─ token && user  → setSession(user, token)   → status "authenticated"
        └─ falta alguno    → limpia storage + clearSession() → status "unauthenticated"
                       │
                       ▼
   _layout re-renderiza → hideAsync() (splash fuera)
                       │
        ┌──────────────┴───────────────┐
   "authenticated"               "unauthenticated"
   Stack.Protected (protected)   Stack.Protected (auth)
        → home "/"                    → "/login"
```

> Como todavía no existe `GET /me`, confiamos en el token + user persistidos. Si el token está vencido,
> el primer request fallará con 401 y el interceptor limpiará la sesión (ver 3.5).

### 3.2 Login

```
Usuario completa AuthForm (mode="login")
        │  onChangeText → react-hook-form
        ▼
handleSubmit  → zodResolver(loginSchema) valida
        │  (ok)
        ▼
AuthForm.onSubmit(values) → AuthCard → screen.handleSubmit("login", values)
        │
        ▼
useLogin().mutate(values)         [TanStack Query]
        │
        ▼
services/auth.login(payload)
        ├─ USE_MOCK=true  → devuelve { user, token } fake (delay 600ms)
        └─ USE_MOCK=false → POST /api/auth/login → { message, user, token }
        │
        ▼ (onSuccess)
toUser(user) → saveToken(token) + saveUser(user)   [storage]
            → setSession(user, token)               [store: status "authenticated"]
        │
        ▼
_layout reacciona al cambio de status → Stack.Protected habilita (protected)
        → Expo Router redirige a "/" automáticamente (sin navegación manual)
```

Si el login falla, `useLogin().error` queda seteado; la pantalla lo transforma con
`getApiErrorMessage()` y lo pasa al form, que muestra el mensaje sobre el CTA.

### 3.3 Registro

```
Usuario completa AuthForm (mode="register")  → valida (Zod)
        │
        ▼
screen.handleSubmit("register", values)
        │
        ▼
useRegister().mutate(values, { onSuccess })
        │
        ▼
services/auth.register(payload)
        ├─ withFullNameFallback(): si no hay full_name, lo deriva del email (workaround backend)
        ├─ USE_MOCK=true  → { message, user } fake
        └─ USE_MOCK=false → POST /api/auth/register → { message, user }   (SIN token)
        │
        ▼ (onSuccess en la pantalla)
setMode("login") + setInfo(message)
        → NO hay setSession ni token: el usuario debe confirmar el email y luego loguearse
        → la tarjeta vuelve a "Iniciar Sesión" y muestra el banner "revisá tu correo"
```

### 3.4 Logout

```
Home → botón "Cerrar sesión" → useLogout()()
        │
        ├─ removeToken() + removeUser()   [storage]
        ├─ clearSession()                 [store: status "unauthenticated"]
        └─ queryClient.clear()            [limpia cache de TanStack Query]
        │
        ▼
_layout reacciona → Stack.Protected habilita (auth) → redirige a "/login"
```

### 3.5 Autorización de requests y manejo de 401

```
Cualquier request con http (Axios)
        │
        ▼
interceptor de REQUEST:
   token = sessionStore.getState().token
   si hay token → header Authorization: Bearer <token>
        │
        ▼
respuesta del backend
        │
        ├─ 2xx → sigue normal
        └─ 401 → interceptor de RESPONSE:
                   clearSession()  → status "unauthenticated" → redirige a login
                   (gancho preparado para refresh token a futuro)
```

> El token se lee del **store** (memoria) en cada request, no del storage: es más rápido y el store
> es la fuente de verdad de la sesión activa.

---

## 4. Detalle por módulo

### 4.1 Routing (`app/`)

**`app/_layout.tsx`** — Layout raíz. Monta los providers globales (`QueryClientProvider`,
`SafeAreaProvider`), dispara la hidratación (`useSessionHydration`) y aplica el **guard** de rutas:
- Mantiene el splash con `SplashScreen.preventAutoHideAsync()` y lo oculta cuando `status !== "loading"`.
- Mientras `status === "loading"` renderiza `null` (splash visible).
- Usa `Stack.Protected guard={...}` para montar `(protected)` si está autenticado o `(auth)` si no.
  Al cambiar `status`, Expo Router redirige solo (no hay `router.replace` manual).

**`app/(auth)/login.tsx`** — Pantalla pública de auth. Es el **orquestador** del flujo:
- Mantiene el estado de UI: `mode` ("login" | "register") e `info` (mensaje de confirmación).
- Instancia `useLogin()` y `useRegister()` y deriva `submitting` y `serverError` del mutation activo.
- `handleModeChange`: cambia de tab, limpia `info` y resetea los mutations (`login.reset()`/`register.reset()`).
- `handleSubmit`: en login → `login.mutate`; en registro → `register.mutate` con `onSuccess` que vuelve
  a login y muestra el aviso.
- Layout mobile-first: `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView`
  (`keyboardShouldPersistTaps="handled"`) para que el teclado no tape los inputs.

**`app/(auth)/_layout.tsx`** y **`app/(protected)/_layout.tsx`** — Stacks de cada grupo
(`headerShown: false`). Separan rutas públicas de privadas.

**`app/(protected)/index.tsx`** — Home protegido. Muestra el saludo y un botón **"Cerrar sesión"**
cableado a `useLogout()`.

### 4.2 Componentes comunes (`src/components/common/`)

**`Button.tsx`** — Botón reutilizable.
- Props: `label`, `onPress`, `variant` (`"primary"` amarillo / `"ghost"` blanco con borde),
  `loading`, `disabled`, `leftIcon`, `className`.
- Cuando `loading` muestra `ActivityIndicator` (su color sale de una tabla por variante, ya que el
  indicador no acepta `className`) y se deshabilita. Expone `accessibilityRole`/`accessibilityState`.

**`TextField.tsx`** — Input con label + error. `forwardRef` para encadenar foco entre campos.
- Props: `label`, `error` + todas las de `TextInput`.
- Label en mayúsculas (`text-muted`), borde rojo si hay `error`, `accessibilityLabel={label}`.

### 4.3 Componentes de auth (`src/components/features/auth/`)

**`AuthCard.tsx`** — Tarjeta visual con tabs. **Componente controlado** (el `mode` lo maneja el padre).
- Props: `mode`, `onModeChange`, `onSubmit`, `submitting`, `serverError`, `infoMessage`.
- Renderiza: tabs (cada una `flex-1`, subrayado azul en la activa), `GoogleButton`, divisor
  "O UTILIZA TU EMAIL", `AuthForm` y el footer de términos. Muestra `infoMessage` en un banner `accent`.
- Mobile-first: `w-full max-w-md self-center` (ancho completo en mobile, acotado y centrado en web).

**`AuthForm.tsx`** — Formulario **presentacional** (login y registro comparten campos).
- Props: `mode`, `onSubmit(values)`, `submitting`, `serverError`.
- Usa `useForm` + `zodResolver(loginSchema)`; campos email/password con `Controller` + `TextField`.
- CTA dinámico ("Iniciar Sesión" / "Crear Cuenta Gratis"), encadenado de foco email → password,
  y muestra `serverError` sobre el botón. No conoce mutations ni navegación (eso vive en la pantalla).

**`GoogleButton.tsx`** — Botón "Continuar con Google" (`Button` ghost + `GoogleIcon`). Handler **stub**:
muestra "Próximamente" (`Alert.alert` en mobile, `alert` del navegador en web). Pendiente el OAuth real.

**`GoogleIcon.tsx`** — Logo de Google renderizado con **expo-image** (`require` del `.svg` como asset,
sin transformer). Prop `size`.

### 4.4 Hooks (`src/hooks/features/auth/`)

**`useLogin.ts`** — `useMutation(login)`. En `onSuccess`: normaliza el user (`toUser`), persiste
token + user, y `setSession`. La navegación la resuelve el guard.

**`useRegister.ts`** — `useMutation(register)` minimalista. No hace auto-login (el backend no devuelve
token); el manejo del éxito ("revisá tu correo" + volver a login) lo hace la pantalla.

**`useLogout.ts`** — Devuelve una función async: `removeToken()` + `removeUser()` + `clearSession()`
+ `queryClient.clear()`. 100% client-side (no hay endpoint `/logout` aún).

**`useSessionHydration.ts`** — En `useEffect` al montar: lee token + user del storage y setea la sesión
o la limpia. Usa un flag `active` para evitar actualizaciones tras desmontar.

### 4.5 Servicios (`src/services/`)

**`http.ts`** — Instancia Axios central.
- `baseURL` = `${EXPO_PUBLIC_API_URL}/api`. Header `Content-Type: application/json`.
- Interceptor de request: agrega `Authorization: Bearer <token>` leyendo del store.
- Interceptor de response: ante 401 hace `clearSession()` (gancho para refresh a futuro).
- `getApiErrorMessage(error)`: extrae un mensaje legible del `{ error }` del backend.

**`auth.ts`** — `login(payload)` y `register(payload)`.
- Capa **mock** conmutable con `EXPO_PUBLIC_USE_MOCK_AUTH=true` (datos fake con delay, sin red).
- `withFullNameFallback`: workaround temporal porque el backend exige `full_name` (lo deriva del email).

### 4.6 Estado y persistencia

**`store/sessionStore.ts`** (Zustand) — Sólo sesión: `user`, `token`, `status`
(`"loading" | "authenticated" | "unauthenticated"`) y acciones `setSession`, `clearSession`, `setStatus`.
Los datos remotos (lessons, etc.) NO van acá: viven en TanStack Query.

**`lib/storage.ts`** — Persistencia cross-platform con helpers internos (`setItem`/`getItem`/`deleteItem`):
- mobile → **expo-secure-store**; web → **localStorage**.
- Expone `saveToken`/`getToken`/`removeToken` y `saveUser`/`getUser`/`removeUser` (user serializado a JSON).
- Se guarda también el user porque no hay `GET /me` para reconstruir la sesión al reabrir la app.

### 4.7 Validación y tipos

**`schemas/auth.ts`** — `loginSchema` (email válido + password ≥ 8). `registerSchema` reutiliza el mismo
(mismos campos). Exporta los tipos inferidos `LoginValues`/`RegisterValues`.

**`types/auth.ts`** — Contratos de las operaciones: `LoginRequest`, `RegisterRequest` (con `full_name?`),
`LoginResponse` (`{ message, user, token }`), `RegisterResponse` (`{ message, user }`, sin token).

**`types/user.ts`** — `SupabaseUser` (shape crudo del backend), `User` (modelo interno) y `toUser()`
que normaliza (`user_metadata.full_name` → `name`).

---

## 5. Configuración

- `EXPO_PUBLIC_API_URL` — base de la API (ej. `http://localhost:3000`; en device físico usar IP LAN,
  en emulador Android `http://10.0.2.2:3000`).
- `EXPO_PUBLIC_USE_MOCK_AUTH` — `true` para desarrollar sin backend (capa mock en `services/auth.ts`).
- Logo de Google vía **expo-image** (el `.svg` queda como asset; no se usa transformer SVG).
- Tokens de color centralizados: variables CSS en `global.css` + tokens semánticos en
  `tailwind.config.js` (`primary`, `secondary`, `ink`, `muted`, `surface`, `background`, `accent`).

---

## 6. Verificación

Probado en **web** y **Expo Go (Android)** con la capa mock (`EXPO_PUBLIC_USE_MOCK_AUTH=true`):
registro → aviso de confirmación → login → home → logout, persistencia de sesión, guard/redirección
y diseño/responsive correctos.

---

## 7. Pendiente (depende del backend)

- Apagar la capa mock y apuntar a los endpoints reales (`/api/auth/*`).
- `full_name` opcional en registro (hoy el backend lo exige; el front envía sólo email + password).
- `GET /me` (restaurar/validar sesión), `POST /logout`, y **refresh token** (hoy la sesión dura ~1h).
- Estrategia de **Google OAuth** (client IDs + flujo) y, si aplica, cookie httpOnly en web.
- Formato de errores unificado para mapear mensajes en el formulario.
```

