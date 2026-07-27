-- 1. EXTENSIONES Y LIMPIEZA (Si es necesario)
-- No se instala uuid-ossp: los defaults de id usan gen_random_uuid(), nativo de
-- Postgres 13+ (sin extensión). uuid_generate_v4() requería "uuid-ossp", que en
-- este proyecto ya estaba instalada en el schema `extensions` (no `public`), y
-- sin calificarla o ajustar el search_path la llamada fallaba con
-- "function uuid_generate_v4() does not exist".

-- 2. AJUSTE EN LA TABLA DE PERFILES (profiles)
-- Añadiendo campos necesarios si no existen
alter table public.profiles 
add column if not exists first_name text,
add column if not exists last_name text;

-- 3. TABLAS DE CONTENIDO
create table if not exists public.modules (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    "order" integer not null unique,
    created_at timestamptz default now()
);

create table if not exists public.lessons (
    id uuid primary key default gen_random_uuid(),
    module_id uuid references public.modules(id) on delete cascade,
    title text not null,
    description text,
    lesson_number integer not null, -- 1 a 5
    xp_reward integer not null,
    points_perfect integer not null,
    points_retry integer not null,
    "order" integer not null,
    unique(module_id, lesson_number)
);

create table if not exists public.videos (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    url text not null,
    signs_reward integer default 1,
    created_at timestamptz default now()
);

-- Señas ACREDITADAS por lección: no es "todos los videos de la lección" (eso incluiría
-- distractores/opciones no elegidas), es específicamente cuáles se evalúan y suman al
-- completar. Ej: lección 1 enseña Hola y Adiós, pero la interacción sólo evalúa Hola →
-- una sola fila. Puede haber más de una fila por lección (ej. un ejercicio de "match"
-- evalúa varios pares a la vez).
create table if not exists public.lesson_signs (
    lesson_id uuid not null references public.lessons(id) on delete cascade,
    video_id  uuid not null references public.videos(id) on delete cascade,
    primary key (lesson_id, video_id)
);

-- 4. TABLAS DE GAMIFICACIÓN (Stickers y Logros)
create table if not exists public.stickers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    tier text check (tier in ('Básico', 'Estándar', 'Premium')),
    price integer not null,
    image_url text,
    created_at timestamptz default now()
);

create table if not exists public.achievements (
    id uuid primary key default gen_random_uuid(),
    name text not null, -- Bronce, Plata, Oro
    description text,
    requirement_type text not null, -- ej: 'lessons_completed'
    requirement_count integer not null,
    icon_url text
);

-- 5. TABLAS DE PROGRESO DEL USUARIO
create table if not exists public.user_stats (
    user_id uuid primary key references auth.users(id) on delete cascade,
    total_xp integer default 0,
    total_points integer default 0,
    total_signs integer default 0,
    updated_at timestamptz default now()
);

create table if not exists public.user_lessons_completed (
    user_id uuid references auth.users(id) on delete cascade,
    lesson_id uuid references public.lessons(id) on delete cascade,
    completed_at timestamptz default now(),
    is_perfect boolean default true,
    earned_xp integer not null,
    earned_points integer not null,
    primary key (user_id, lesson_id)
);

create table if not exists public.user_alphabet_progress (
    user_id uuid references auth.users(id) on delete cascade,
    letter varchar(1) not null,
    completed_at timestamptz default now(),
    earned_xp integer default 5,
    earned_points integer default 20,
    earned_signs integer default 1,
    primary key (user_id, letter)
);

create table if not exists public.user_video_signs (
    user_id uuid references auth.users(id) on delete cascade,
    video_id uuid references public.videos(id) on delete cascade,
    earned_at timestamptz default now(),
    primary key (user_id, video_id)
);

create table if not exists public.user_favorites (
    user_id uuid references auth.users(id) on delete cascade,
    favorable_type text check (favorable_type in ('video', 'letter')),
    favorable_id text not null, -- ID del video o la Letra
    created_at timestamptz default now(),
    primary key (user_id, favorable_type, favorable_id)
);

create table if not exists public.user_stickers (
    user_id uuid references auth.users(id) on delete cascade,
    sticker_id uuid references public.stickers(id) on delete cascade,
    purchased_at timestamptz default now(),
    primary key (user_id, sticker_id)
);

create table if not exists public.user_achievements (
    user_id uuid references auth.users(id) on delete cascade,
    achievement_id uuid references public.achievements(id) on delete cascade,
    earned_at timestamptz default now(),
    primary key (user_id, achievement_id)
);

-- 6. FUNCIONES Y LÓGICA (RPC)

-- Función para completar una lección
--
-- `p_user_id` viene explícito (no `auth.uid()`): el backend llama esta RPC con
-- service_role, no con el JWT del usuario, así que auth.uid() sería null acá.
-- La identidad ya fue validada por el middleware antes de llegar a este punto;
-- por eso el EXECUTE de esta función se revoca para todos salvo service_role
-- (ver el bloque de permisos al final del archivo) — nadie más puede invocarla
-- pasando un p_user_id ajeno.
create or replace function public.complete_user_lesson(
    p_lesson_id uuid,
    p_user_id uuid,
    p_is_perfect boolean
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_xp_reward integer;
    v_points_reward integer;
    v_exists boolean;
    v_signs_earned integer := 0;
begin
    -- Verificar si ya se completó
    select exists(select 1 from public.user_lessons_completed where user_id = p_user_id and lesson_id = p_lesson_id) into v_exists;

    if v_exists then
        return json_build_object('success', false, 'message', 'Lesson already completed', 'earned_xp', 0, 'earned_points', 0, 'earned_signs', 0);
    end if;

    -- Buscar recompensas
    select xp_reward,
           case when p_is_perfect then points_perfect else points_retry end
    into v_xp_reward, v_points_reward
    from public.lessons
    where id = p_lesson_id;

    if v_xp_reward is null then
        return json_build_object('success', false, 'message', 'Lesson not found', 'earned_xp', 0, 'earned_points', 0, 'earned_signs', 0);
    end if;

    -- Registrar conclusión
    insert into public.user_lessons_completed (user_id, lesson_id, is_perfect, earned_xp, earned_points)
    values (p_user_id, p_lesson_id, p_is_perfect, v_xp_reward, v_points_reward);

    -- Registrar señas nuevas: sólo las de lesson_signs (las EVALUADAS, no todos los
    -- videos de la lección) y sólo las que el usuario no tenía ya (on conflict do
    -- nothing + sumar sólo lo insertado) — así una seña repetida entre lecciones no
    -- se cuenta dos veces.
    with inserted_signs as (
        insert into public.user_video_signs (user_id, video_id)
        select p_user_id, ls.video_id
        from public.lesson_signs ls
        where ls.lesson_id = p_lesson_id
        on conflict do nothing
        returning video_id
    )
    select coalesce(sum(v.signs_reward), 0)
    into v_signs_earned
    from inserted_signs i
    join public.videos v on v.id = i.video_id;

    -- Actualizar stats globales
    update public.user_stats
    set total_xp = total_xp + v_xp_reward,
        total_points = total_points + v_points_reward,
        total_signs = total_signs + v_signs_earned,
        updated_at = now()
    where user_id = p_user_id;

    return json_build_object('success', true, 'earned_xp', v_xp_reward, 'earned_points', v_points_reward, 'earned_signs', v_signs_earned);
end;
$$;

-- Función para completar letra del abecedario
create or replace function public.complete_alphabet_letter(
    p_letter text,
    p_user_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_exists boolean;
begin
    select exists(select 1 from public.user_alphabet_progress where user_id = p_user_id and letter = p_letter) into v_exists;

    if v_exists then
        return json_build_object('success', false, 'message', 'Letter already completed');
    end if;

    insert into public.user_alphabet_progress (user_id, letter)
    values (p_user_id, p_letter);

    update public.user_stats
    set total_xp = total_xp + 5,
        total_points = total_points + 20,
        total_signs = total_signs + 1,
        updated_at = now()
    where user_id = p_user_id;

    return json_build_object('success', true, 'earned_xp', 5, 'earned_points', 20, 'earned_signs', 1);
end;
$$;

-- 7. POLÍTICA DE SEGURIDAD (RLS)
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.videos enable row level security;
alter table public.lesson_signs enable row level security;
alter table public.stickers enable row level security;
alter table public.achievements enable row level security;
alter table public.user_stats enable row level security;
alter table public.user_lessons_completed enable row level security;
alter table public.user_alphabet_progress enable row level security;
alter table public.user_video_signs enable row level security;
alter table public.user_favorites enable row level security;
alter table public.user_stickers enable row level security;
alter table public.user_achievements enable row level security;

-- Políticas de lectura para contenido (Todos los autenticados)
create policy "Contenido visible para todos" on public.modules for select to authenticated using (true);
create policy "Contenido visible para todos" on public.lessons for select to authenticated using (true);
create policy "Contenido visible para todos" on public.videos for select to authenticated using (true);
create policy "Contenido visible para todos" on public.lesson_signs for select to authenticated using (true);
create policy "Contenido visible para todos" on public.stickers for select to authenticated using (true);
create policy "Contenido visible para todos" on public.achievements for select to authenticated using (true);

-- Políticas de Usuario (Solo el propio usuario)
create policy "Usuario gestiona sus propios stats" on public.user_stats for select to authenticated using (auth.uid() = user_id);
create policy "Usuario ve su progreso" on public.user_lessons_completed for select to authenticated using (auth.uid() = user_id);
create policy "Usuario ve sus letras" on public.user_alphabet_progress for select to authenticated using (auth.uid() = user_id);
create policy "Usuario ve sus videos vistos" on public.user_video_signs for select to authenticated using (auth.uid() = user_id);
create policy "Usuario gestiona sus favoritos" on public.user_favorites for all to authenticated using (auth.uid() = user_id);
create policy "Usuario ve sus stickers" on public.user_stickers for select to authenticated using (auth.uid() = user_id);
create policy "Usuario ve sus logros" on public.user_achievements for select to authenticated using (auth.uid() = user_id);

-- 8. TRIGGER DE INICIALIZACIÓN DE STATS
create or replace function public.handle_new_user_stats()
returns trigger
language plpgsql
security definer as $$
begin
    insert into public.user_stats (user_id) values (new.id);
    return new;
end;
$$;

create trigger on_auth_user_created_stats
    after insert on auth.users
    for each row execute function public.handle_new_user_stats();

-- 9. RESTRICCIÓN DE EJECUCIÓN DE LAS RPC
-- Ambas funciones reciben p_user_id explícito (no auth.uid()) porque el backend
-- las llama con service_role, no con el JWT del usuario. Sin esta restricción,
-- cualquiera con la anon key podría llamarlas pasando el user_id de otra persona
-- y otorgarle puntos/señas ajenas. Se revoca de "public" (cubre anon y
-- authenticated, que no tienen grant propio) y se deja sólo para service_role.
revoke execute on function public.complete_user_lesson(uuid, uuid, boolean) from public;
grant execute on function public.complete_user_lesson(uuid, uuid, boolean) to service_role;

revoke execute on function public.complete_alphabet_letter(text, uuid) from public;
grant execute on function public.complete_alphabet_letter(text, uuid) to service_role;

