# Autenticación — Frontend

Documentación de la autenticación (registro, login, Google, logout) de la app Expo: flujo de
pantallas, estado de sesión, persistencia, protección de rutas, paso de completar perfil y detalle
de cada módulo.

---

## 1. Visión general

Flujo basado en **rutas separadas** (no tabs), con estética CarpiSeñas (header azul + panel celeste,
inputs/botones tipo *pill*, fuente Nunito).

- **Inicio** (`(auth)/index.tsx`) → elegir **"Registrarse con correo"** o **"Continuar con Google"**,
  + link "¿Ya tienes cuenta? Inicia sesión". (El botón de Google se oculta en modo mock.)
- **Registro** (email, password, confirmar password, nombre, apellido, fecha de nacimiento, género,
  país) → sin auto-login (por decisión de UX): navega a login con un aviso de éxito. La confirmación
  por email está **desactivada** en Supabase, así que el usuario puede loguearse enseguida.
- **Login** (email + password) → hidrata la sesión; con **"Recordarme en este equipo"** (default)
  también la persiste. Incluye mostrar/ocultar contraseña y link a recuperar contraseña.
- **Google** (`useGoogleAuth`) → OAuth vía Supabase (PKCE). Web funciona directo; nativo requiere un
  *development build* (no Expo Go).
- **Completar perfil** → si un usuario (típicamente de Google) tiene el perfil incompleto
  (falta país/género/fecha), un *gate* en `(protected)/_layout.tsx` muestra `CompleteProfileScreen`
  antes de dejar entrar a la app.
- **Recuperar contraseña** (`(auth)/forgot-password.tsx`) → UI lista, lógica **pendiente** (stub).
- **Logout** client-side: limpia token, user y cache de queries.

### Stack
Expo Router v6 · NativeWind v4 · TanStack Query v5 · React Hook Form + Zod 4 · Axios · Zustand ·
expo-secure-store · expo-font · expo-image · **@supabase/supabase-js** (sólo para Google OAuth).

### Responsabilidades por capa
| Capa | Tecnología | Rol |
|------|------------|-----|
| UI / formularios | RHF + Zod + NativeWind | Render y validación de inputs |
| Estado de sesión | Zustand (`sessionStore`) | `user`, `token`, `status` en memoria |
| Datos remotos | TanStack Query | login/registro (mutations), perfil (query) |
| Red | Axios (`http`) | Base URL, header `Authorization`, manejo de 401 |
| Persistencia | expo-secure-store / localStorage | Token + user entre reinicios (si "Recordarme") |
| Google OAuth | Supabase (`lib/supabase`) | signInWithOAuth + exchangeCodeForSession (PKCE) |
| Routing / guard | Expo Router (`Stack.Protected`) | Rutas públicas/privadas + gate de perfil |

---

## 2. Estructura de archivos

```bash
app/
  _layout.tsx                   # providers + fuentes + hidratación + guard (Stack.Protected)
  (auth)/
    _layout.tsx                 # stack del grupo público (index = pantalla de inicio / anchor)
    index.tsx                   # Inicio: elegir correo / Google
    register.tsx                # Registro
    login.tsx                   # Login (consume el "flash" de registro)
    forgot-password.tsx         # Recuperar contraseña (stub)
  (protected)/
    _layout.tsx                 # gate de perfil + navegación (SideBar / BottomBar responsive)
    index.tsx · profile.tsx · … # pantallas privadas
src/
  components/
    common/                     # primitivos reutilizables (pill)
      Button.tsx · Checkbox.tsx · TextField.tsx · Select.tsx
    features/auth/
      AuthShell.tsx             # scaffold compartido (header azul + panel celeste)
      LoginForm.tsx · RegisterForm.tsx
      BirthDateField.tsx        # input fecha con máscara + date picker
      GoogleButton.tsx · GoogleIcon.tsx
    features/profile/
      CompleteProfileScreen.tsx # paso de completar perfil (Google)
  hooks/features/auth/
    useLogin.ts · useRegister.ts · useLogout.ts · useSessionHydration.ts · useGoogleAuth.ts
  hooks/features/profile/
    useProfile.ts · useUpdateProfile.ts
  services/
    http.ts                     # Axios + interceptores + helper de error
    auth.ts                     # login/register + toRegisterRequest (+ mock)
    profile.ts                  # getProfile/updateProfile (+ mock)
  store/sessionStore.ts         # estado de sesión (Zustand)
  lib/
    storage.ts                  # persistencia token/user cross-platform
    supabase.ts                 # cliente Supabase (sólo OAuth Google)
    flashMessage.ts             # mensaje de un solo uso entre pantallas (sin URL)
  schemas/     auth.ts · profile.ts        # validación Zod
  types/       auth.ts · user.ts · profile.ts
  constants/   countries.ts · gender.ts · env.ts   # opciones + flag USE_MOCK_AUTH
  utils/       date.ts · cn.ts
```

---

## 3. Flujo de datos

### 3.1 Arranque y restauración de sesión (hidratación)

`status` arranca en `"loading"`; el splash queda visible hasta resolver sesión **y** cargar la fuente.

```
app/_layout.tsx
   ├─ SplashScreen.preventAutoHideAsync()  ·  useFonts({ Nunito })
   ├─ useSessionHydration()  → getToken() + getUser() (storage)
   │     ├─ token && user → setSession(user, token)  → status "authenticated"
   │     └─ falta alguno   → limpia storage + clearSession() → "unauthenticated"
   └─ ready = fuentes listas && status !== "loading"  → hideAsync()
                 ┌──────────────┴───────────────┐
            "authenticated"                "unauthenticated"
            Stack.Protected (protected)    Stack.Protected (auth)
```

> No hay `GET /me`: se confía en token + user persistidos. Si el token venció, el primer request da
> 401 y el interceptor limpia la sesión. Sin "Recordarme" no se persiste nada → la app abre en inicio.

### 3.2 Login

```
LoginForm (valida con loginSchema) → login.tsx handleSubmit
  → useLogin().mutate({ payload, rememberMe })
      → services/auth.login(payload)
          ├─ mock  → { user, session } fake
          └─ real  → POST /api/auth/login → { message, user{id,email,first_name,last_name},
                                              session{access_token, expires_in} }
      → onSuccess: token = session.access_token; normalized = toUser(user)
          ├─ rememberMe → saveToken + saveUser (storage)
          └─ setSession(normalized, token)  → status "authenticated"
  → el guard habilita (protected) y Expo Router redirige (sin navegación manual)
```

### 3.3 Registro

```
RegisterForm (registerSchema) → register.tsx handleSubmit
  → useRegister().mutate(values)
      → toRegisterRequest: { email, password, first_name, last_name,
                             birth_date (ISO), gender (GENDER_API_VALUE), country }
      → POST /api/auth/register → { message, user }   (SIN token)
  → onSuccess: setFlashMessage(message) + router.replace('/login')
       (sin auto-login por decisión de UX; confirmación por email desactivada)
  → login.tsx consume el flash al montar y lo muestra como aviso
```

### 3.4 Google (OAuth con Supabase, PKCE)

```
GoogleButton → useGoogleAuth.signInWithGoogle()
  → supabase.auth.signInWithOAuth({ provider:'google', redirectTo, skipBrowserRedirect })
  → WebBrowser.openAuthSessionAsync(url, redirectTo)  → devuelve URL con ?code
  → supabase.auth.exchangeCodeForSession(code) → session
  → toGoogleUser(session.user) + saveToken/saveUser + setSession
  → el guard entra a (protected); si el perfil está incompleto → CompleteProfileScreen
```

### 3.5 Gate de completar perfil

```
(protected)/_layout.tsx → useProfile()  (GET /api/profile, sólo si autenticado)
  ├─ isPending → spinner (ActivityIndicator)
  ├─ isError   → estado recuperable: "No pudimos cargar tu perfil" + Reintentar + Cerrar sesión
  ├─ perfil incompleto (falta country || gender || birth_date) → <CompleteProfileScreen/>
  └─ completo  → navegación normal (SideBar / BottomBar) + <Slot/>

CompleteProfileScreen → useUpdateProfile().mutate({ birth_date, gender, country })
  → PATCH /api/profile → invalida ['profile'] → el gate deja pasar
```

### 3.6 Logout y manejo de 401

```
useLogout()() → removeToken + removeUser + clearSession + queryClient.clear()
             → guard vuelve a (auth)

http (Axios): request → agrega Bearer desde el store · response 401 → clearSession() (redirige a auth)
```

---

## 4. Detalle por módulo

### 4.1 Routing (`app/`)
- **`_layout.tsx`** — providers (`QueryClientProvider`, `SafeAreaProvider`), carga de fuente Nunito,
  `useSessionHydration`, splash, y guard con `Stack.Protected` (montado según `status`).
- **`(auth)/_layout.tsx`** — Stack del grupo; `index.tsx` es el *anchor* (pantalla de inicio).
- **`(auth)/index.tsx`** — Inicio: botón "Registrarse con correo" → `/register`, `GoogleButton`
  (oculto en mock), link a `/login`.
- **`(auth)/register.tsx`** — `AuthShell` + `RegisterForm` + `useRegister`. En éxito → flash + `/login`.
- **`(auth)/login.tsx`** — `AuthShell` + `LoginForm` + `useLogin`. Consume el flash de registro
  (`consumeFlashMessage`) una vez al montar (sin ensuciar la URL).
- **`(auth)/forgot-password.tsx`** — `AuthShell` + input email; muestra un aviso genérico (stub).
- **`(protected)/_layout.tsx`** — gate de perfil (`useProfile`) + navegación responsive
  (`SideBar` en desktop/tablet, `BottomBar` en mobile).

### 4.2 Componentes comunes (`src/components/common/`)
- **`Button.tsx`** — pill (`rounded-full`), variantes `primary` (amarillo) y `white` (blanco con
  sombra). `hover:` en web (usa `primary-hover`/`accent`), estado `loading` (spinner) y `disabled`.
- **`TextField.tsx`** — input pill **sin label visible** (el nombre del campo va en el `placeholder`;
  `label` sólo alimenta `accessibilityLabel`). Foco marcado en el borde del contenedor; `rightElement`
  (ojo/calendario). Fix de autofill en web (inyecta CSS `-webkit-box-shadow` para que el fondo no se
  salga de la pill).
- **`Select.tsx`** — desplegable pill + `Modal` con lista y **buscador opcional** (filtro sin acentos).
  Al cerrar hace `blur()` del elemento activo (evita warning de `aria-hidden` con foco atrapado).
- **`Checkbox.tsx`** — checkbox con label (para "Recordarme en este equipo").

### 4.3 Componentes de auth (`src/components/features/auth/`)
- **`AuthShell.tsx`** — scaffold compartido: header azul (`bg-secondary`) con eyebrow/título/subtítulo
  (texto oscuro), panel celeste (`bg-accent`) redondeado que lo solapa, y el contenido acotado a
  `max-w-md`. `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView`. Prop `headerContent` (para el
  carpincho de la pantalla de Google).
- **`LoginForm.tsx`** — email + password (ojo), checkbox "Recordarme", link a `/forgot-password`,
  footer a `/register`. Presentacional (`onSubmit(values, rememberMe)`).
- **`RegisterForm.tsx`** — Nombre, Apellido, Género (`Select`), Fecha (`BirthDateField`), País
  (`Select searchable`), Correo, Contraseña, Confirmar contraseña. Footer a `/login`.
- **`BirthDateField.tsx`** — input con máscara `DD/MM/AAAA` + selector: calendario nativo (iOS/Android)
  o `<input type="date">` en web. `onRequestClose` (Escape) y blur al cerrar.
- **`GoogleButton.tsx`** — botón "Continuar con Google" cableado a `useGoogleAuth`; muestra loading/error.
- **`GoogleIcon.tsx`** — logo Google con **expo-image** (asset `.svg`, sin transformer).

### 4.4 Componente de perfil
- **`features/profile/CompleteProfileScreen.tsx`** — dentro de `AuthShell` (con carpincho
  `capi-body.webp`): Género, Fecha, País + CTA "Continuar". Envía con `useUpdateProfile`. Link
  "Cerrar sesión" como salida.

### 4.5 Hooks
- **auth:** `useLogin` (`{ payload, rememberMe }`), `useRegister` (mapea con `toRegisterRequest`),
  `useLogout`, `useSessionHydration`, `useGoogleAuth` (OAuth Supabase; no-op en mock).
- **profile:** `useProfile` (query `['profile']`, `enabled` si autenticado, `retry: 1`,
  `staleTime` 5min), `useUpdateProfile` (mutation → invalida `['profile']`).

### 4.6 Servicios
- **`http.ts`** — Axios: `baseURL = ${EXPO_PUBLIC_API_URL}/api`, Bearer desde el store, 401 → clearSession,
  `getApiErrorMessage`.
- **`auth.ts`** — `login`/`register`/`toRegisterRequest`. Capa **mock** vía `USE_MOCK_AUTH`.
- **`profile.ts`** — `getProfile` (GET `/profile`) / `updateProfile` (PATCH `/profile`). También mock
  (devuelve un perfil de prueba completo).

### 4.7 Estado, persistencia y libs
- **`store/sessionStore.ts`** — `user`, `token`, `status` + `setSession`/`clearSession`/`setStatus`.
- **`lib/storage.ts`** — token + user cross-platform (SecureStore / localStorage); helpers
  `setItem`/`getItem`/`deleteItem` reusados por el storage adapter de Supabase.
- **`lib/supabase.ts`** — cliente Supabase (PKCE, `persistSession:false`, storage = SecureStore/
  localStorage sólo para el *code verifier* PKCE). Se usa **sólo** para Google OAuth.
- **`lib/flashMessage.ts`** — `setFlashMessage`/`consumeFlashMessage`: aviso de un solo uso entre
  pantallas, en memoria (no viaja por la URL).

### 4.8 Validación, tipos y constantes
- **`schemas/auth.ts`** — `loginSchema`; `birthDateSchema` (regex + fecha real, no futura, ≥1900);
  `registerSchema` (firstName/lastName ≥2, birthDate, gender enum, country enum, confirmPassword con
  `superRefine` de coincidencia). `forgotPasswordSchema`.
- **`schemas/profile.ts`** — `completeProfileSchema` (birthDate, gender, country) — reusa `birthDateSchema`.
- **`types/auth.ts`** — `GENDER_VALUES` (`masculino`/`femenino`/`otro`) + `GENDER_API_VALUE` (valor al
  backend) + `Gender`; `LoginRequest`, `RegisterRequest` (`first_name`, `last_name`, `birth_date`,
  `gender`, `country`), `LoginResponse` (`session.access_token`), `RegisterResponse` (sin token).
- **`types/user.ts`** — `AuthUser` (shape del backend), `User` (`firstName`/`lastName`), `toUser()`.
- **`types/profile.ts`** — `Profile` + `isProfileComplete()` (incompleto si falta country/gender/birth_date).
- **`constants/countries.ts`** — hispanohablantes + "Otro" (`COUNTRY_OPTIONS`/`COUNTRY_VALUES`).
- **`constants/gender.ts`** — `GENDER_OPTIONS` para el `Select`.
- **`constants/env.ts`** — `USE_MOCK_AUTH` (flag central de modo mock).
- **`utils/date.ts`** — `formatDdMmYyyy`, `parseDdMmYyyy`, `ddMmYyyyToIso`.

---

## 5. Configuración

- **Env** (`.env`): `EXPO_PUBLIC_API_URL` (base de la API), `EXPO_PUBLIC_USE_MOCK_AUTH` (mock sin
  backend), `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_KEY` (Google OAuth).
- **Modo mock** (`USE_MOCK_AUTH`): login/registro/perfil responden con datos de prueba. Google **no**
  se mockea (usa Supabase real) → su botón se oculta en mock.
- **Google OAuth (config externa, Supabase dashboard):** habilitar el provider Google + client IDs, y
  agregar a *Redirect URLs* el scheme nativo (`frontend://`) y el origin web (ej. `http://localhost:8081`).
- **Paleta** (`global.css`, formato "R G B"): `background #F8FAFC`, `surface #FFFFFF`, `ink #1F2937`,
  `muted #6F706F`, `primary #F7BB18` (+`primary-hover #FED75F`), `secondary #4A90E2`, `accent #ACDCFF`.
  Expuesta como tokens semánticos en `tailwind.config.js`.
- **Fuente Nunito** (variable): se carga **sólo** con `useFonts` en `app/_layout.tsx` (en web expo-font
  inyecta el `@font-face`). ⚠️ No usar `@font-face` con `url()` local en `global.css` (NativeWind no
  lo soporta y rompe Metro).

---

## 6. Verificación

Probado en **web** y **Expo Go (Android)** con la capa mock:
- Inicio → registro (todos los campos) → aviso "cuenta creada" → login → home; login/logout;
  "Recordarme" on/off; validaciones; `Select` de género/país (con buscador y sin acentos); date picker;
  gate de perfil (spinner/error/incompleto); hover de botones en web.
- Google se probó en web hasta el punto donde depende de la config de Supabase (habilitar provider).

---

## 7. Pendiente

- **Recuperar contraseña:** flujo completo (hoy la pantalla es un stub sin backend).
- **Backend:** `GET /me` (validar sesión al arranque), `POST /logout`, **refresh token** (la sesión
  dura ~1h; el login ya recibe `expires_in`). Confirmar valores canónicos de `gender` en `profiles.gender`.
- **Google OAuth:** habilitar el provider en Supabase + probar el flujo nativo con un *development build*.
- **Estadísticas de perfil** (racha/puntos) siguen mockeadas: faltan endpoints.
