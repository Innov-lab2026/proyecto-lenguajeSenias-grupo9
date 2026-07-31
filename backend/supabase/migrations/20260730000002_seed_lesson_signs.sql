-- Siembra `lesson_signs` para los Módulos 1 y 2.
--
-- POR QUÉ EL MÓDULO 1 TAMBIÉN: sus filas se sembraron en
-- 20260724000003_seed_module_1.sql apuntando a los 9 videos placeholder
-- (`f1f1f1f1-…`). La resubida de videos del 30/07 borró esas filas de
-- public.videos, y `lesson_signs.video_id` tiene `on delete cascade`, así que
-- se llevó puestas las 7 filas del módulo. Confirmado en la base real:
-- `select count(*) from public.lesson_signs` → 0.
--
-- Efecto hasta ahora: completar CUALQUIER lección de los dos módulos acreditaba
-- 0 señas (`coalesce(sum(...), 0)` en la RPC no rompe, pero el contador de
-- huellas del home no subía).
--
-- Los ids de video salen del catálogo vigente (local/VIDEOS_DB.md, dump del
-- 30/07). No usar los de la tabla vieja de PENDIENTES_DB.md §2: varios ya no
-- existen y uno de ellos hoy está titulado "(incorrecto)".
--
-- Criterio: `lesson_signs` son las señas que el ejercicio EVALÚA, no todos los
-- videos que la lección muestra. Conteos definidos por el equipo:
--   Módulo 1 → [1, 1, 1, 3, 3]   Módulo 2 → [1, 1, 1, 1, 3]
-- Las dos lecciones de cierre (m1-l5, m2-l5) quedan afuera a propósito: ver
-- la nota al final.

insert into public.lesson_signs (lesson_id, video_id)
values
    -- ── MÓDULO 1 ───────────────────────────────────────────────────────────
    -- m1-l1 Presentarte → "¿Cómo te llamás?" (la seña que evalúa el quiz;
    -- "¿Cómo estás?" también se enseña pero no se evalúa).
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', '4035fa27-40d0-484d-847e-aad6b03c6621'),

    -- m1-l2 ¿Cómo te sentís? → "Bien" (la del quiz; Más o menos y Mal sólo se muestran).
    ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', '5d9a8a93-2748-47b4-a85e-3d1b53392143'),

    -- m1-l3 Desafío → "Más o menos" (la respuesta correcta del quiz).
    ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', '507226b9-e46f-48a3-b990-0e6ddc8262df'),

    -- m1-l4 Cortesía → las 3: es un `matching` que evalúa los 3 pares a la vez.
    -- 3 videos distintos con signs_reward = 1 cada uno.
    ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', '44436173-1589-4754-9825-cdbd4f42c9e2'), -- Por favor
    ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', '2f6b0774-5fd5-4d37-add2-d90a92fd619a'), -- Gracias
    ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'fc1abd05-093b-4a70-9523-971efeeb3d86'), -- Perdón

    -- ── MÓDULO 2 ───────────────────────────────────────────────────────────
    -- m2-l1 Presentaciones → "¿Cómo te llamás?", EL MISMO id que m1-l1.
    -- En LSA "¿Cuál es tu nombre?" y "¿Cómo te llamás?" son la misma seña, así
    -- que se acredita la misma fila a propósito: la RPC deduplica por
    -- (user_id, video_id), de modo que quien ya la aprendió en m1-l1 NO vuelve
    -- a sumarla acá. Es la decisión tomada (PENDIENTES_DB.md §0.5) — el
    -- contador mide señas distintas que sabe el usuario, no apariciones.
    -- ⚠️ No "arreglar" esto sembrando un id distinto ni duplicando el video.
    ('e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6', '4035fa27-40d0-484d-847e-aad6b03c6621'),

    -- m2-l2 Nombres → "Kai" (el nombre que evalúa el quiz).
    ('e7e7e7e7-e7e7-e7e7-e7e7-e7e7e7e7e7e7', '12801b9a-0dda-45dc-a41c-ce1cf88d0234'),

    -- m2-l3 Preguntar → la VARIANTE del ejercicio, no la plana: el quiz compara
    -- "correcto_ej_siguiente" contra "incorrecto", y acredita la bien hecha.
    -- Al ser una fila distinta de la plana de m1-l1, esta lección sí suma 1
    -- aunque el usuario ya venga de m1-l1.
    ('e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8', 'ad415ec9-c78f-4704-8396-be1497ed357d'),

    -- m2-l4 Objetos → "Teléfono" (la palabra que arma la composición; Luz y
    -- Casa se muestran pero no se evalúan).
    ('e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9', 'd0cb6486-11c2-4e67-93d9-659c95fbef37')
on conflict do nothing;

-- ── PENDIENTE: m1-l5 y m2-l5 ───────────────────────────────────────────────
-- Las dos lecciones de cierre acreditan 3 señas cada una, con UN solo video: el
-- de la conversación completa, que todavía no está grabado. Cuando exista:
--
--   1. insert into public.videos (..., signs_reward) values (..., 3);
--      ⚠️ signs_reward = 3, NO el default 1 — la RPC suma esa columna, no
--      cuenta filas de lesson_signs (ver full_schema.sql:192).
--   2. UNA sola fila acá:
--        ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', '<id del video de m1-l5>'),
--        ('eaeaeaea-eaea-eaea-eaea-eaeaeaeaeaea', '<id del video de m2-l5>')
--   3. cablear el id en los steps de src/types/lessons.ts.
--
-- Hasta entonces esas dos lecciones se pueden jugar y completar normalmente
-- (dan XP y puntos), sólo acreditan 0 señas. Ver PENDIENTES_DB.md §0.6.
