# Bienvenido a tu aplicación Expo 👋

Este es un proyecto de [Expo](https://expo.dev) creado con [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

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

> ✅ **Para QA / probar sin backend:** la plantilla ya viene con `EXPO_PUBLIC_USE_MOCK_AUTH=true`, así
> que el login y el registro funcionan con datos de prueba, **sin necesidad de levantar el servidor**.
> No hace falta tocar nada más.

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

### Problemas comunes

- **"command not found" / "no se reconoce el comando"** al usar `node`, `npm` o `git`: cerrá y volvé a
  abrir la terminal después de instalarlos. Si sigue, reinstalá el programa.
- **La pantalla queda en blanco o con errores raros:** detené con `Ctrl + C` y reiniciá limpiando la
  caché: `npx expo start -c`.
- **El QR no conecta:** verificá la misma WiFi y probá `npx expo start --tunnel`.
- **Para detener la app:** en la terminal donde corre, presioná `Ctrl + C`.

## Stack tecnológico

- Expo SDK 54
- Expo Router
- NativeWind v4 + Tailwind v3
- TanStack Query
- React Hook Form + Zod
- Axios
- Zustand
- tailwind-merge

## Estructura del proyecto

> Estado actual del repo. La carpeta `src/` sigue una convención **common / features**:
> `common` = piezas genéricas reutilizables; `features/<dominio>` = todo lo específico de una función
> (por ahora, `auth`). La documentación detallada de auth está en
> [`DOCS/AUTH_IMPLEMENTATION.md`](./DOCS/AUTH_IMPLEMENTATION.md).

```
frontend/
├── app/                          ← routing (Expo Router)
│   ├── _layout.tsx               ← providers + carga de fuentes + hidratación + guard de rutas
│   ├── (auth)/                   ← grupo de rutas públicas (sin sesión)
│   │   ├── _layout.tsx
│   │   └── login.tsx             ← pantalla de auth (toggle login / registro)
│   └── (protected)/              ← grupo de rutas privadas (requieren sesión)
│       ├── _layout.tsx
│       └── index.tsx             ← Home
├── src/
│   ├── components/
│   │   ├── common/               ← primitivos reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── TextField.tsx
│   │   └── features/
│   │       └── auth/             ← UI específica de auth
│   │           ├── AuthCard.tsx       ← tarjeta con tabs
│   │           ├── LoginForm.tsx      ← form de login (RHF + Zod)
│   │           ├── RegisterForm.tsx   ← form de registro (RHF + Zod)
│   │           ├── GoogleButton.tsx   ← botón "Continuar con Google" (stub)
│   │           ├── GoogleIcon.tsx     ← logo de Google (expo-image)
│   │           └── comingSoon.ts      ← aviso "Próximamente" cross-platform
│   ├── hooks/
│   │   └── features/
│   │       └── auth/
│   │           ├── useLogin.ts
│   │           ├── useRegister.ts
│   │           ├── useLogout.ts
│   │           └── useSessionHydration.ts  ← restaura la sesión al iniciar
│   ├── services/
│   │   ├── http.ts               ← instancia Axios + interceptores
│   │   └── auth.ts               ← login / register (+ capa mock)
│   ├── store/
│   │   └── sessionStore.ts       ← estado de sesión (Zustand)
│   ├── lib/
│   │   └── storage.ts            ← persistencia token/user (SecureStore | localStorage)
│   ├── schemas/
│   │   └── auth.ts               ← validación con Zod
│   ├── types/
│   │   ├── auth.ts               ← contratos request/response
│   │   └── user.ts               ← modelo de usuario + normalización
│   └── utils/
│       ├── cn.ts                 ← merge de clases de Tailwind
│       └── date.ts               ← máscara/parseo de fechas DD/MM/AAAA
├── assets/
│   ├── fonts/                    ← Nunito-VariableFont_wght.ttf
│   ├── icons/                    ← google.svg
│   └── images/
├── DOCS/
│   └── AUTH_IMPLEMENTATION.md     ← documentación de autenticación
├── .env.example                  ← plantilla de variables de entorno
├── global.css                    ← estilos globales (variables de color)
├── nativewind-env.d.ts
├── metro.config.js
├── tailwind.config.js            ← tokens de color + fuentes
├── babel.config.js
├── app.json
├── tsconfig.json
└── package.json
```