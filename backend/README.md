# CarpiSeñas — API (backend) 🛠️

API REST que da soporte a la app **CarpiSeñas** (aprendizaje gamificado de Lengua de Señas
Argentina). Construida con **Express 5 + TypeScript** sobre **Supabase** (PostgreSQL + Auth +
Storage).

Se encarga de la autenticación, el catálogo de contenido (módulos, lecciones, videos), el progreso
del usuario y toda la **economía del juego**: XP, puntos, señas acreditadas, stickers y logros.

> Este README cubre el **backend**. La app cliente (Expo) está en la carpeta `frontend/` y la
> landing en `landing-page/`, cada una con su propia documentación.

---

## Principio clave: la economía se calcula en el servidor

**El cliente nunca decide cuántos puntos gana un usuario.** Cuando alguien termina una lección, la
app solo informa *qué* lección completó y *si fue perfecta*; el servidor consulta la recompensa
configurada en la base, la aplica y devuelve el resultado. Lo mismo con la compra de stickers y la
evaluación de logros.

Esa lógica vive en **funciones de PostgreSQL (RPCs)**, no en el código de Node, para que la
operación sea atómica y no se pueda manipular desde afuera:

| RPC | Qué resuelve |
|---|---|
| `complete_user_lesson` | Acredita XP, puntos y señas de una lección; evita acreditar dos veces. |
| `complete_alphabet_letter` | Marca una letra del abecedario como vista y acredita su seña. |
| `purchase_sticker` | Descuenta puntos y registra la compra, validando saldo. |
| `evaluate_achievements` | Revisa y otorga los logros que correspondan. |
| `handle_new_user` / `handle_new_user_stats` | Crean el perfil y las estadísticas al registrarse. |

---

## Requisitos previos

1. **Node.js** LTS (incluye `npm`) → https://nodejs.org
2. **Una cuenta de Supabase** con un proyecto creado → https://supabase.com

Verificá la instalación con:

```bash
node -v
npm -v
```

---

## Puesta en marcha

Todos los comandos se ejecutan **dentro de la carpeta `backend`**.

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar el archivo de entorno (`.env`)

Copiá la plantilla:

- **Windows (PowerShell):** `Copy-Item .env.example .env`
- **macOS / Linux:** `cp .env.example .env`

Y completá los valores desde tu proyecto de Supabase (**Project Settings → API**):

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto del servidor Express. Por defecto `3000`. |
| `SUPABASE_URL` | URL del proyecto, con el formato `https://xxxxxxxx.supabase.co`. |
| `SUPABASE_ANON_KEY` | Clave pública. La usan login y registro, que corren con los permisos del usuario final y respetan RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada. **Saltea RLS**: la usan los servicios que ya validaron al usuario con el middleware de auth. |

> ⚠️ **`SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al cliente ni subirse al repositorio.**
> El archivo `.env` está ignorado por Git; solo se versiona `.env.example`.

### 3. Aplicar las migraciones a la base

El esquema completo está versionado en `supabase/migrations/`. Se aplican con la
[CLI de Supabase](https://supabase.com/docs/guides/cli) enlazando el proyecto y ejecutando el push
de migraciones.

> Las migraciones incluyen tanto la estructura (tablas, RPCs, políticas de RLS, buckets de Storage)
> como los datos iniciales de contenido (módulos, lecciones, videos, stickers y logros).

### 4. Levantar el servidor

```bash
npm run dev
```

Queda escuchando en `http://localhost:3000` y **recarga solo** al guardar cambios (nodemon).

Para comprobar que responde, abrí `http://localhost:3000` en el navegador: debería devolver
`{ "message": "LSA API running" }`.

---

## Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática (nodemon + ts-node). |
| `npm run build` | Compila TypeScript a JavaScript en la carpeta `dist/`. |
| `npm start` | Ejecuta la versión ya compilada (`dist/index.js`). |

> Todavía **no hay tests automatizados**: el script `test` es un placeholder.

---

## Documentación interactiva (Swagger)

Con el servidor levantado, la documentación de la API está en:

👉 **http://localhost:3000/docs**

Se genera automáticamente desde los comentarios JSDoc de los archivos en `src/routes/`, así que
**documentar un endpoint nuevo es anotarlo en su propia ruta**.

---

## Endpoints

Todas las rutas cuelgan de `/api`. Salvo login y registro, **todas requieren autenticación**
mediante el header:

```
Authorization: Bearer <access_token>
```

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Auth |
|---|---|---|:---:|
| `POST` | `/api/auth/login` | Inicia sesión y devuelve la sesión con los tokens. | — |
| `POST` | `/api/auth/register` | Registra un usuario y crea su perfil. | — |
| `PATCH` | `/api/auth/credentials` | Cambia email y/o contraseña. | ✅ |
| `DELETE` | `/api/auth/account` | Elimina la cuenta del usuario. | ✅ |

### Contenido — catálogo

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/modules` | Lista los módulos disponibles. |
| `GET` | `/api/modules/:id/lessons` | Lecciones de un módulo. |
| `GET` | `/api/lessons` | Todas las lecciones. |
| `GET` | `/api/videos` | Catálogo de videos de señas. |
| `GET` | `/api/stickers` | Catálogo de stickers. |
| `GET` | `/api/achievements` | Catálogo de logros. |

### Progreso

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/stats` | Estadísticas del usuario (XP, puntos, señas). |
| `GET` | `/api/lessons/completed` | Lecciones ya completadas. |
| `POST` | `/api/lessons/:id/complete` | Completa una lección y **acredita la recompensa**. |

### Abecedario

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/alphabet/progress` | Letras vistas por el usuario. |
| `POST` | `/api/alphabet/:letter/complete` | Marca una letra como vista y acredita su seña. |

### Gamificación

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/stickers/mine` | Stickers que compró el usuario. |
| `POST` | `/api/stickers/:id/purchase` | Compra un sticker descontando puntos. |
| `GET` | `/api/achievements/mine` | Logros obtenidos. |

### Favoritos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/favorites` | Favoritos del usuario. |
| `POST` | `/api/favorites` | Agrega un favorito. |
| `DELETE` | `/api/favorites/:type/:id` | Quita un favorito. |

### Perfil

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/profile` | Datos del perfil. |
| `PATCH` | `/api/profile` | Actualiza datos del perfil. |
| `PUT` | `/api/profile/avatar` | Sube o reemplaza la foto de perfil. |
| `DELETE` | `/api/profile/avatar` | Elimina la foto de perfil. |

---

## Arquitectura

El flujo de una request atraviesa siempre las mismas capas:

```
request → routes → middleware/auth → controllers → services → Supabase (tablas y RPCs)
```

| Capa | Responsabilidad |
|---|---|
| **routes** | Declaran las rutas, aplican el middleware y documentan el endpoint con JSDoc para Swagger. |
| **middleware** | `auth.ts` valida el token contra Supabase y adjunta el usuario a la request. |
| **controllers** | Leen y validan la entrada, arman la respuesta HTTP y traducen errores a códigos de estado. |
| **services** | Concentran el acceso a datos: consultas a Supabase e invocación de las RPCs. |

### Estructura de carpetas

```text
backend/
├── src/
│   ├── index.ts                 # Punto de entrada: Express, CORS, JSON, montaje de rutas y Swagger
│   ├── config/
│   │   └── supabaseClient.ts    # Dos clientes: anon (respeta RLS) y admin (service_role)
│   ├── middleware/
│   │   └── auth.ts              # Valida el Bearer token y adjunta el usuario a la request
│   ├── routes/                  # Un archivo por dominio; incluyen la doc JSDoc de Swagger
│   ├── controllers/             # Entrada/salida HTTP por dominio
│   ├── services/                # Acceso a datos y llamadas a las RPCs
│   └── docs/
│       └── swagger.ts           # Configuración de swagger-jsdoc + swagger-ui
├── supabase/
│   └── migrations/              # Esquema versionado: tablas, RPCs, RLS, buckets y datos iniciales
├── database/                    # Scripts SQL de referencia (init y triggers)
├── .env.example                 # Plantilla de variables de entorno
├── vercel.json                  # Configuración del despliegue
└── tsconfig.json
```

Los dominios (`auth`, `content`, `progress`, `alphabet`, `gamification`, `favorites`, `profile`)
mantienen el **mismo nombre en las tres capas**, así que una ruta siempre tiene su controlador y su
servicio con el archivo homónimo.

---

## Modelo de datos

Tablas principales definidas en las migraciones:

| Grupo | Tablas |
|---|---|
| **Contenido** | `modules`, `lessons`, `videos`, `lesson_signs` |
| **Catálogos** | `stickers`, `achievements` |
| **Progreso del usuario** | `user_stats`, `user_lessons_completed`, `user_alphabet_progress`, `user_video_signs` |
| **Colección del usuario** | `user_favorites`, `user_stickers`, `user_achievements` |

`lesson_signs` merece una aclaración: **no lista todos los videos de una lección**, sino las señas
que el ejercicio realmente *evalúa*. Es lo que determina cuántas señas se le acreditan al usuario al
completarla.

Storage tiene dos buckets, creados también por migración: uno para los **avatares** de perfil y otro
para los **videos** de señas.

---

## Seguridad

- **RLS activo** en las tablas de usuario: cada quien accede solo a sus propios datos.
- **Dos clientes de Supabase separados** (`src/config/supabaseClient.ts`): el *anon* para login y
  registro, que respeta RLS; el *admin* (`service_role`) solo en servicios que ya pasaron por el
  middleware de auth.
- **El `user_id` siempre sale del JWT verificado**, nunca del cuerpo de la request. Es lo que impide
  que alguien opere sobre datos ajenos enviando otro id.
- **Las RPCs tienen el `EXECUTE` restringido** a `service_role`, así que no se pueden invocar
  directamente desde el cliente.

---

## Despliegue

El proyecto está preparado para **Vercel** como función serverless: `vercel.json` enruta todo el
tráfico a `src/index.ts`.

Por eso `src/index.ts` solo llama a `app.listen()` cuando `NODE_ENV` **no** es `production` — en
Vercel la plataforma se encarga de manejar las requests, y exporta la app con `export default app`.

Antes de desplegar hay que cargar las mismas variables de entorno del `.env` en la configuración del
proyecto en Vercel.
