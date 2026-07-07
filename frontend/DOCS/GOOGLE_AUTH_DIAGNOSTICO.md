# Diagnóstico — Login con Google (CarpiSeñas)

_Fecha: 2026-07-06 · Ámbito: front desplegado en Vercel + backend Express/Supabase_

## TL;DR

El login con Google **ya funciona en local hasta el paso del perfil**. Quedan **dos problemas
independientes** para que ande de punta a punta (sobre todo en el deploy):

| # | Problema | Tipo | Responsable |
|---|----------|------|-------------|
| 1 | `GET /api/profile` responde **500** para usuarios nuevos de Google | Código | **Backend** |
| 2 | `POST /auth/v1/token?grant_type=pkce` responde **401** en Vercel | Config + Seguridad | **Quien maneje Vercel + Supabase** |

Estado del flujo:

| Etapa | Local | Vercel (hoy) | Vercel (con key corregida) |
|-------|:----:|:-----------:|:--------------------------:|
| OAuth Google + intercambio PKCE | ✅ | ❌ 401 | ✅ |
| `GET /api/profile` | ❌ 500 | ❌ 500 | ❌ 500 |

> Arreglar la key de Vercel **iguala Vercel a local**: desbloquea la autenticación, pero el 500 del
> backend sigue tapando la entrada a la app hasta que se corrija aparte.

---

## Problema 1 — `GET /api/profile` devuelve 500 (backend)

### Evidencia (consola del front, tras loguear con Google)

```
[google] exchange done {hasSession: true, exchangeError: null}   ← OAuth OK
[storage] SET accessToken (len=1406)                             ← token guardado
GET http://localhost:3000/api/profile 500 (Internal Server Error) ← acá falla
```

El front hace todo bien: obtiene el token de Google, lo guarda y pide el perfil. El **backend** responde 500.

### Causa raíz

`backend/src/services/profileService.ts` → `getProfileByIdService`:

```ts
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()               // ← devuelve error si hay 0 filas (PGRST116)

if (error) {
  throw new Error(`No se pudo obtener el perfil: ${error.message}`)
}
```

`.single()` **da error cuando no hay ninguna fila**. Un usuario **nuevo de Google no tiene fila en
`profiles`** (entra directo por Supabase Auth, sin pasar por `registerService`, que es quien crea el
perfil con los metadatos). → `.single()` error → `throw` → el controller responde **500**.

Con email/contraseña no se ve porque ese registro sí crea la fila de perfil.

### Problema más profundo

El front necesita que `GET /api/profile` devuelva **200 con el perfil** (aunque `birth_date`,
`gender`, `country` sean `null`) para mostrar la pantalla **"Completar perfil"**
(`frontend/app/(protected)/_layout.tsx`, gate `!isProfileComplete(profile)`). Un **500** —o un 404—
cae en la rama de error y muestra "No pudimos cargar tu perfil".

Y aunque se arregle el GET, al completar el perfil el front llama `PATCH /api/profile`, que hace
`.update(...).eq('id', userId).single()`. Un `UPDATE` sobre una fila inexistente = 0 filas →
`.single()` error → **otro 500**. Es decir: el usuario de Google **nunca podría completar su perfil**.

### Fix recomendado (backend)

1. **`getProfileByIdService`**: usar `.maybeSingle()` en vez de `.single()`. Si vuelve `null` (no hay
   fila), **crearla** a partir del usuario autenticado (`req.user`: `id` + `full_name` del metadata de
   Google, el resto en `null`) y devolverla. Así el GET siempre da 200 y el front rutea a "completar perfil".
2. **`updateProfileService`**: usar `.upsert({ id: userId, ... })` en vez de `.update()`, para que
   funcione exista o no la fila.
3. Usar **`supabaseAdmin`** (service role) para estas operaciones: el `authMiddleware` ya validó al
   usuario, así que leer/escribir su propio perfil con admin evita cualquier bloqueo de RLS.

**Alternativa/complemento (base de datos):** que el trigger `handle_new_user` cree la fila de
`profiles` para **todo** usuario nuevo de `auth.users` (incluyendo OAuth), con `birth_date/gender/country`
nullables.

---

## Problema 2 — 401 en Vercel + key secreta filtrada (config/seguridad)

### Evidencia

```
POST https://<proyecto>.supabase.co/auth/v1/token?grant_type=pkce  401
Response: {"message":"Invalid API key","hint":"Double check your API key."}
```

Comparación de la key (formato nuevo de Supabase):

| Entorno | `EXPO_PUBLIC_SUPABASE_KEY` | Correcta? |
|---------|---------------------------|:---------:|
| Local (`.env`) | `sb_publishable_...` | ✅ |
| Vercel (horneada en el build, visible en el header `apikey`) | `sb_secret_...` | ❌ |

En Vercel quedó cargada la **secret key** en una variable **pública** (`EXPO_PUBLIC_*` se inlinea en el
bundle del cliente). Eso genera **dos problemas**:

- **401:** la `sb_secret_` no es válida para el flujo PKCE público del navegador → "Invalid API key".
- **Filtración de seguridad:** la secret key (nivel admin, **saltea RLS**) quedó expuesta en el bundle
  público — cualquiera la ve en DevTools.

### Tipos de key (recordatorio)

| Key | Uso | Dónde va |
|-----|-----|----------|
| `sb_publishable_...` | cliente (web/móvil) | **pública** — normal que se vea en DevTools; la protege RLS |
| `sb_secret_...` | servidor (admin) | **secreta** — jamás en el cliente |

### Acciones

1. 🔴 **Rotar/revocar la `sb_secret_...` ya** (Supabase → Settings → API Keys). Está expuesta; rotarla
   cierra la ventana de exposición. **No afecta al backend**, que usa `SUPABASE_SERVICE_ROLE_KEY`
   (formato legacy JWT), una key distinta.
2. **Corregir la env de Vercel:** `EXPO_PUBLIC_SUPABASE_KEY = sb_publishable_...` (la misma que local).
3. **Rebuild/redeploy** (no alcanza redeploy del mismo build: las `EXPO_PUBLIC_*` se hornean en build-time).
4. Confirmar en Supabase que el **Redirect URL** incluya `https://carpisenias.vercel.app/**` (si no, el
   popup de Google no vuelve con el código).

---

## Checklist de acciones

**Backend (código):**
- [ ] `getProfileByIdService` → `.maybeSingle()` + auto-crear perfil si no existe.
- [ ] `updateProfileService` → `.upsert()` en vez de `.update()`.
- [ ] Usar `supabaseAdmin` para leer/escribir el perfil.
- [ ] (Opcional) Revisar el trigger `handle_new_user` para que cubra usuarios OAuth.

**Vercel + Supabase (config/seguridad):**
- [ ] Rotar la `sb_secret_...` filtrada.
- [ ] `EXPO_PUBLIC_SUPABASE_KEY` en Vercel = `sb_publishable_...`.
- [ ] Rebuild/redeploy.
- [ ] Verificar Redirect URL `https://carpisenias.vercel.app/**` en Supabase.

---

## Notas

- El front **no necesita ninguna key secreta**: solo la publishable para el OAuth de Google. Las keys de
  admin viven en el backend (server-side, nunca expuestas).
- El COOP warning `Cross-Origin-Opener-Policy policy would block the window.closed call` es benigno
  (viene del polling del popup de `expo-web-browser`), no es un error.
- La swap local de publishable ↔ anon key dio resultado idéntico (`hasSession: true`): la key nunca fue
  el problema en local.
