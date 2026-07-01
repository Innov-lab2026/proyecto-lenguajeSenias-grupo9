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
