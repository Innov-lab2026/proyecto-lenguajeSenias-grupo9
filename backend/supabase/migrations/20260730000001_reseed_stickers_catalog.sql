-- Resiembra el catálogo de stickers con los 7 diseñados que ya muestra el
-- frontend (StickersList.tsx: Bien/LSA/Baile/ABC/Mate/Empanada/Seña),
-- reemplazando los 3 placeholders genéricos del seed original
-- (20260724000003_seed_module_1.sql).
--
-- El arte del sticker vive en el bundle del frontend (no hay upload de
-- imágenes ni CDN para esto) — `image_url` queda en null a propósito. El
-- frontend matchea cada fila con su imagen local por `name`, mismo criterio
-- que ya usa el abecedario para encontrar el video de cada letra por `title`.
--
-- Se borran los 3 placeholders en vez de convivir con ellos: hasta ahora
-- "comprar un sticker" sólo escribía en localStorage (nunca se conectó
-- purchase_sticker), así que no hay filas reales en user_stickers que
-- referencien estos ids — es seguro reemplazarlos.
delete from public.stickers
where name in ('Sticker Básico 1', 'Sticker Estándar 1', 'Sticker Premium 1');

insert into public.stickers (name, tier, price, image_url) values
    ('Bien', 'Básico', 300, null),
    ('LSA', 'Básico', 300, null),
    ('Baile', 'Estándar', 600, null),
    ('ABC', 'Estándar', 600, null),
    ('Mate', 'Premium', 1200, null),
    ('Empanada', 'Premium', 1200, null),
    ('Seña', 'Premium', 1200, null);
