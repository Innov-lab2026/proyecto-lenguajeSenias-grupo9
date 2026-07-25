-- Crear el bucket de avatares con límite de tamaño de 3MB (3145728 bytes)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars', 
    'avatars', 
    true, 
    3145728, 
    '{image/png,image/jpeg,image/jpg,image/webp}'
)
on conflict (id) do update set 
    public = true,
    file_size_limit = 3145728,
    allowed_mime_types = '{image/png,image/jpeg,image/jpg,image/webp}';

-- Políticas de seguridad para el bucket de avatares
-- Permitir que cualquier usuario vea los avatares
create policy "Cualquier persona puede ver avatares"
on storage.objects for select
using (bucket_id = 'avatars');

-- Permitir que usuarios autenticados suban sus propios avatares
create policy "Usuarios pueden subir su propio avatar"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'avatars' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

