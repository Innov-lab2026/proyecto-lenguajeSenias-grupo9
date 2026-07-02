create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    provider text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz
);

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    birth_date date,
    gender text,
    avatar_url text,
    country text,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz
);

-- 1. Nos aseguramos de que el RLS esté activo en la tabla
alter table public.profiles enable row level security;

-- 2. Creamos la política que permite a los usuarios gestionar su propio perfil
create policy "Los usuarios pueden gestionar su propio perfil" 
on public.profiles
for all -- Permite SELECT, INSERT, UPDATE y DELETE bajo esta misma regla
to authenticated -- Solo aplica para usuarios logueados
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
