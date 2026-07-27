-- Tabla para guardar el progreso de los usuarios en los módulos
create table if not exists public.user_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    module_id text not null,
    completed_islands integer not null default 0,
    total_xp integer not null default 0,
    total_stars integer not null default 0,
    last_updated timestamptz not null default now(),
    
    unique(user_id, module_id)
);

-- RLS
alter table public.user_progress enable row level security;

create policy "Los usuarios pueden gestionar su propio progreso"
on public.user_progress
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Trigger para updated_at (opcional, pero buena práctica)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.last_updated = now();
    return new;
end;
$$ language plpgsql;

create trigger on_progress_updated
    before update on public.user_progress
    for each row
    execute function public.handle_updated_at();
