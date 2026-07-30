-- Habilita RLS en public.users — la única tabla de negocio que no la tenía
-- (init_users.sql le dio RLS a profiles, pero no a users).
--
-- Sin esto, Supabase otorga por defecto privilegios sobre el schema public a
-- los roles anon/authenticated: cualquier usuario autenticado podía leer (o
-- escribir) la tabla entera vía PostgREST con la clave pública que ya viaja
-- en el bundle del frontend (EXPO_PUBLIC_SUPABASE_KEY) — exponiendo el email
-- de todos los usuarios registrados, sin ninguna policy que lo impidiera.
--
-- El backend no se ve afectado: los servicios usan supabaseAdmin
-- (service_role), que bypassea RLS. Esto sólo cierra el acceso directo desde
-- el cliente.

alter table public.users enable row level security;

-- Sólo lectura de la propia fila. Nada de insert/update/delete: esas
-- operaciones ya las hace el backend (profileService.ensureAppUserRecord)
-- con service_role, no el cliente.
create policy "El usuario ve su propia fila" on public.users
    for select to authenticated using ((select auth.uid()) = id);
