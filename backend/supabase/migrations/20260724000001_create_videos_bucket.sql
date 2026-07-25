-- Inserción de un nuevo bucket para los videos de las lecciones
insert into storage.buckets (id, name, public)
values ('lesson-videos', 'lesson-videos', true)
on conflict (id) do update set public = true;

-- Políticas de acceso para el bucket 'lesson-videos'
-- Permitir que cualquier usuario autenticado vea los videos
create policy "Cualquier usuario autenticado puede ver videos"
on storage.objects for select
to authenticated
using (bucket_id = 'lesson-videos');

-- Nota: Solo los administradores podrán subir videos (vía Dashboard o service_role)
