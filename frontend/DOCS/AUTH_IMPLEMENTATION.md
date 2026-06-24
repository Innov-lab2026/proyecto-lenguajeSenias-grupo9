# Autenticación — Frontend

Documentación de la implementación de autenticación (registro, login, logout) en la app Expo:
estado de sesión, persistencia, protección de rutas, flujo de datos y detalle de cada módulo.

---

## 1. Visión general

- Pantalla única de auth (`/login`) con tabs **Crear Cuenta / Iniciar Sesión** (toggle interno).
- **Login** (email + password) → hidrata la sesión; con **"Recordarme en este equipo"** marcado
  (default) también la persiste en storage. Incluye mostrar/ocultar contraseña y el link
  "Olvidaste tu contraseña?" (*stub*; el flujo de recupero es tarea futura).
- **Registro** (nombre, apellido, fecha de nacimiento, género, email, password) → sin auto-login:
  muestra "revisá tu correo para confirmar" y vuelve a login (alineado con la confirmación por
  email de Supabase).
- **Logout** client-side: limpia token, user y cache de queries.
- Botón **"Continuar con Google"** como *stub* (UI lista; OAuth real pendiente del backend).
- Tipografía **Nunito** (variable font) en toda la UI de auth: bold en todos los textos salvo la
  tab inactiva (regular).

### Stack
Expo Router v6 · NativeWind v4 · TanStack Query · React Hook Form + Zod · Axios · Zustand · expo-secure-store · expo-font.

### Responsabilidades por capa
| Capa | Tecnología | Rol |
|------|------------|-----|
| UI / formularios | RHF + Zod + NativeWind | Render y validación de inputs |
| Estado de sesión | Zustand (`sessionStore`) | `user`, `token`, `status` en memoria |
| Datos remotos | TanStack Query (`useMutation`) | Ejecuta login/registro, expone `isPending`/`error` |
| Red | Axios (`http`) | Base URL, header `Authorization`, manejo de 401 |
| Persistencia | expo-secure-store / localStorage | Token + user entre reinicios (si "Recordarme") |
| Routing / guard | Expo Router (`Stack.Protected`) | Separa rutas públicas/privadas y redirige |

---

## 2. Estructura de archivos

```bash
app/
  _layout.tsx                 # providers + fuentes + hidratación de sesión + guard de rutas
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
      Checkbox.tsx
      TextField.tsx
    features/auth/            # componentes específicos de auth
      AuthCard.tsx            # tarjeta con tabs; renderiza LoginForm o RegisterForm
      LoginForm.tsx
      RegisterForm.tsx
      GoogleButton.tsx
      GoogleIcon.tsx
      comingSoon.ts           # aviso "Próximamente" cross-platform
  hooks/features/auth/
    useLogin.ts
    useRegister.ts
    useLogout.ts
    useSessionHydration.ts
  services/
    http.ts                   # instancia Axios + interceptores + helper de error
    auth.ts                   # login/register + mapeo del payload (+ capa mock)
  store/
    sessionStore.ts           # estado de sesión (Zustand)
  lib/
    storage.ts                # persistencia token/user cross-platform
  schemas/
    auth.ts                   # validación Zod (login y registro)
  types/
    auth.ts                   # contratos request/response + Gender
    user.ts                   # modelo de usuario + normalización
  utils/
    date.ts                   # máscara/parseo de fechas DD/MM/AAAA
```

---

## 3. Flujo de datos

### 3.1 Arranque y restauración de sesión (hidratación)

Al abrir la app no sabemos aún si hay sesión, por eso `status` arranca en `"loading"` y el splash
permanece visible hasta resolverlo (también espera la carga de la fuente Nunito).

```
App monta
   │
   ▼
app/_layout.tsx
   ├─ SplashScreen.preventAutoHideAsync()   (a nivel módulo)
   ├─ useFonts({ Nunito })  ................ carga de la fuente
   ├─ status = useSessionStore() ............ "loading"
   ├─ useSessionHydration()  ─────────────┐
   └─ ready = fuentes listas && status !== "loading"
      → mientras no esté ready: render null (splash visible)
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
> Si el login se hizo **sin** "Recordarme", no hay nada en storage y la app abre en login.

### 3.2 Login

```
Usuario completa LoginForm
        │  onChangeText → react-hook-form
        ▼
handleSubmit  → zodResolver(loginSchema) valida
        │  (ok)
        ▼
LoginForm.onSubmit(values, rememberMe) → AuthCard → screen.handleLogin
        │
        ▼
useLogin().mutate({ payload: values, rememberMe })   [TanStack Query]
        │
        ▼
services/auth.login(payload)
        ├─ USE_MOCK=true  → devuelve { user, session } fake (delay 600ms)
        └─ USE_MOCK=false → POST /api/auth/login
                            → { message, user{ id,email,first_name,last_name },
                                session{ access_token, expires_in } }
        │
        ▼ (onSuccess)
toUser(user)  +  token = session.access_token
   ├─ rememberMe=true  → saveToken(token) + saveUser(user)   [storage]
   └─ rememberMe=false → sin persistencia (sesión sólo en memoria)
        → setSession(user, token)        [store: status "authenticated"]
        │
        ▼
_layout reacciona al cambio de status → Stack.Protected habilita (protected)
        → Expo Router redirige a "/" automáticamente (sin navegación manual)
```

Si el login falla, `useLogin().error` queda seteado; la pantalla lo transforma con
`getApiErrorMessage()` y lo pasa al form, que muestra el mensaje sobre el CTA.

### 3.3 Registro

```
Usuario completa RegisterForm
  (nombre, apellido, fecha de nacimiento DD/MM/AAAA, género, email, password)
        │  valida (Zod: registerSchema)
        ▼
screen.handleRegister(values)
        │
        ▼
useRegister().mutate(values, { onSuccess })
        │
        ▼
toRegisterRequest(values)   → mapea al contrato del endpoint:
   { email, password, first_name, last_name,
     birth_date (ISO YYYY-MM-DD), gender (valor del backend) }
        │
        ▼
services/auth.register(payload)
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
`SafeAreaProvider`), carga la fuente **Nunito** (`useFonts`), dispara la hidratación
(`useSessionHydration`) y aplica el **guard** de rutas:
- Mantiene el splash con `SplashScreen.preventAutoHideAsync()` y lo oculta cuando las fuentes
  cargaron (o fallaron) **y** `status !== "loading"`.
- Mientras no esté listo renderiza `null` (splash visible).
- Usa `Stack.Protected guard={...}` para montar `(protected)` si está autenticado o `(auth)` si no.
  Al cambiar `status`, Expo Router redirige solo (no hay `router.replace` manual).

**`app/(auth)/login.tsx`** — Pantalla pública de auth. Es el **orquestador** del flujo:
- Mantiene el estado de UI: `mode` ("login" | "register") e `info` (mensaje de confirmación).
- Instancia `useLogin()` y `useRegister()` y deriva `submitting` y `serverError` del mutation activo.
- `handleModeChange`: cambia de tab, limpia `info` y resetea los mutations.
- `handleLogin(values, rememberMe)` → `login.mutate({ payload, rememberMe })`.
- `handleRegister(values)` → `register.mutate` con `onSuccess` que vuelve a login y muestra el aviso.
- Layout mobile-first: `SafeAreaView` + `KeyboardAvoidingView` (**`behavior="padding"` en ambas
  plataformas**: con edge-to-edge de SDK 54, Android ya no redimensiona la ventana solo y el teclado
  tapaba los inputs inferiores) + `ScrollView` (`keyboardShouldPersistTaps="handled"`).

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
- Props: `label`, `error`, `labelRight` (elemento junto al label, ej. link "Olvidaste tu
  contraseña?"), `rightElement` (elemento dentro del input, ej. ojo de contraseña) + todas las de
  `TextInput`.
- El borde/redondeo vive en un contenedor: el outline nativo del navegador se quita (web) y el foco
  se señala con el borde del contenedor (`border-secondary`; rojo si hay error).

**`Checkbox.tsx`** — Checkbox con label (`checked`, `onChange`). Usado para "Recordarme en este
equipo". Expone `accessibilityRole="checkbox"` + `accessibilityState`.

### 4.3 Componentes de auth (`src/components/features/auth/`)

**`AuthCard.tsx`** — Tarjeta visual con tabs. **Componente controlado** (el `mode` lo maneja el padre).
- Props: `mode`, `onModeChange`, `onLogin`, `onRegister`, `submitting`, `serverError`, `infoMessage`.
- Renderiza: tabs (cada una `flex-1`, subrayado azul y **bold** en la activa, regular la inactiva),
  `GoogleButton`, divisor "O UTILIZA TU EMAIL", `LoginForm` **o** `RegisterForm` según `mode`, y el
  footer de términos. Muestra `infoMessage` en un banner `accent`.
- Mobile-first: `w-full max-w-md self-center` (ancho completo en mobile, acotado y centrado en web).

**`LoginForm.tsx`** — Formulario de login (email + password), presentacional.
- `useForm` + `zodResolver(loginSchema)`. Estado local: `rememberMe` (default `true`) y
  `showPassword` (ojo dentro del input).
- Link "Olvidaste tu contraseña?" junto al label (stub "Próximamente"; flujo de recupero pendiente).
- `onSubmit(values, rememberMe)` — no conoce mutations ni navegación (eso vive en la pantalla).

**`RegisterForm.tsx`** — Formulario de registro, presentacional.
- Campos: Nombre, Apellido, Fecha de nacimiento (máscara `DD/MM/AAAA` con `formatDdMmYyyy`),
  Género (chips: Masculino / Femenino / Otro / Prefiero no decir), Email y Contraseña.
- `useForm` + `zodResolver(registerSchema)`, encadenado de foco entre campos, CTA "Crear Cuenta".

**`GoogleButton.tsx`** — Botón "Continuar con Google" (`Button` ghost + `GoogleIcon`). Handler **stub**
vía `showComingSoon`. Pendiente el OAuth real.

**`GoogleIcon.tsx`** — Logo de Google renderizado con **expo-image** (`require` del `.svg` como asset,
sin transformer). Prop `size`.

**`comingSoon.ts`** — `showComingSoon(message)`: aviso "Próximamente" cross-platform
(`Alert.alert` en mobile, `alert` del navegador en web, donde `Alert.alert` es no-op).

### 4.4 Hooks (`src/hooks/features/auth/`)

**`useLogin.ts`** — `useMutation`. Recibe `{ payload, rememberMe }`. En `onSuccess`: normaliza el
user (`toUser`); si `rememberMe` persiste token + user en storage (si no, la sesión vive sólo en
memoria y se pierde al cerrar la app); luego `setSession`. La navegación la resuelve el guard.

**`useRegister.ts`** — `useMutation` que mapea los valores del form con `toRegisterRequest` y llama
al service. No hace auto-login (el backend no devuelve token); el manejo del éxito ("revisá tu
correo" + volver a login) lo hace la pantalla.

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

**`auth.ts`** — `login(payload)`, `register(payload)` y `toRegisterRequest(values)`.
- Capa **mock** conmutable con `EXPO_PUBLIC_USE_MOCK_AUTH=true` (datos fake con delay, sin red).
- `toRegisterRequest` mapea los valores del formulario al body del endpoint
  (`birthDate` DD/MM/AAAA → `birth_date` ISO; `gender` → valor del backend vía `GENDER_API_VALUE`).
- `login` lee el token de `session.access_token` y el user plano (`first_name`/`last_name`).

### 4.6 Estado y persistencia

**`store/sessionStore.ts`** (Zustand) — Sólo sesión: `user`, `token`, `status`
(`"loading" | "authenticated" | "unauthenticated"`) y acciones `setSession`, `clearSession`, `setStatus`.
Los datos remotos (lessons, etc.) NO van acá: viven en TanStack Query.

**`lib/storage.ts`** — Persistencia cross-platform con helpers internos (`setItem`/`getItem`/`deleteItem`):
- mobile → **expo-secure-store**; web → **localStorage**.
- Expone `saveToken`/`getToken`/`removeToken` y `saveUser`/`getUser`/`removeUser` (user serializado a JSON).
- Se guarda también el user porque no hay `GET /me` para reconstruir la sesión al reabrir la app.
- Sólo se escribe si el login fue con "Recordarme en este equipo".

### 4.7 Validación, tipos y utilidades

**`schemas/auth.ts`** — `loginSchema` (email válido + password ≥ 8) y `registerSchema` que lo
extiende con: `firstName`/`lastName` (mín. 2), `birthDate` (regex `DD/MM/AAAA` + fecha real, no
futura, año ≥ 1900) y `gender` (enum de `GENDER_VALUES`). Exporta `LoginValues`/`RegisterValues`.

**`types/auth.ts`** — `GENDER_VALUES`/`Gender` + `GENDER_API_VALUE` (mapa al valor del backend);
contratos: `LoginRequest`, `RegisterRequest` (`first_name`, `last_name`, `birth_date` ISO, `gender`),
`LoginResponse` (`{ message, user, session: { access_token, expires_in } }`),
`RegisterResponse` (`{ message, user }`, sin token).

**`types/user.ts`** — `AuthUser` (shape que devuelve el backend: `id`, `email`, `first_name`,
`last_name`), `User` (modelo interno con `firstName`/`lastName`) y `toUser()` que normaliza.

**`utils/date.ts`** — `formatDdMmYyyy` (máscara progresiva al escribir), `parseDdMmYyyy`
(valida fecha real, ej. rechaza 31/02) y `ddMmYyyyToIso` (formato del backend).

---

## 5. Configuración

- `EXPO_PUBLIC_API_URL` — base de la API (ej. `http://localhost:3000`; en device físico usar IP LAN,
  en emulador Android `http://10.0.2.2:3000`).
- `EXPO_PUBLIC_USE_MOCK_AUTH` — `true` para desarrollar sin backend (capa mock en `services/auth.ts`).
- Logo de Google vía **expo-image** (el `.svg` queda como asset; no se usa transformer SVG).
- Tokens de color centralizados: variables CSS en `global.css` + tokens semánticos en
  `tailwind.config.js` (`primary`, `secondary`, `ink`, `muted`, `surface`, `background`, `accent`).
- **Fuente Nunito** (`assets/fonts/Nunito-VariableFont_wght.ttf`): se carga **únicamente** con
  `useFonts` en `app/_layout.tsx` (en web expo-font inyecta el `@font-face` automáticamente).
  ⚠️ No declarar `@font-face` con `url()` local en `global.css`: NativeWind no lo soporta y rompe
  Metro. Uso: `font-nunito` + `font-bold`/`font-normal` (token en `tailwind.config.js`).

---

## 6. Verificación

Probado en **web** y **Expo Go (Android)** con la capa mock (`EXPO_PUBLIC_USE_MOCK_AUTH=true`):
- Flujo completo: registro (con los campos nuevos) → aviso de confirmación → login → home → logout.
- Persistencia de sesión con "Recordarme" y sesión sólo en memoria sin él.
- Guard/redirección, validaciones (incl. fecha DD/MM/AAAA y género), mostrar/ocultar contraseña,
  foco de inputs (borde azul, sin outline desalineado en web), fuente Nunito y teclado que no tapa
  los inputs en Android (edge-to-edge).

---

## 7. Pendiente

### Recupero de contraseña
- Implementar el flujo completo de **"Olvidaste tu contraseña?"** (hoy es un stub "Próximamente").
  Requiere pantalla de recupero + endpoints del backend.

### Backend / integración
- El front ya está alineado al contrato real (`POST /api/auth/login` con `session.access_token`;
  `POST /api/auth/register` con `first_name`, `last_name`, `birth_date`, `gender`). Falta:
- Confirmar los **valores canónicos de `gender`** que espera la DB (`profiles.gender`); el front
  envía los de `GENDER_API_VALUE` (alineados al ejemplo de swagger).
- `GET /me` (restaurar/validar sesión — ya existe `authMiddleware` en el backend, falta exponer ruta),
  `POST /logout`, y **refresh token** (hoy la sesión dura ~1h; el login ya recibe `expires_in`).
- Estrategia de **Google OAuth** (client IDs + flujo) y, si aplica, cookie httpOnly en web.
- Formato de errores unificado para mapear mensajes en el formulario.
