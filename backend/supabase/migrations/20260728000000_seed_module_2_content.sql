-- Módulo 2 (lecciones 1-5) + reescritura del currículum del Módulo 1.
--
-- NO incluye lesson_signs: las señas acreditadas son filas que apuntan a videos
-- concretos de public.videos, y todavía falta definir qué seña evalúa cada
-- lección nueva. Va en una migración aparte para no sembrar datos inventados
-- (hasta entonces, completar una lección del Módulo 2 acredita 0 señas).

-- 1. CLAVE DE CONTENIDO
-- El frontend elige qué contenido mostrar a partir de esta clave. Antes usaba
-- `lesson_number`, pero eso es 1-5 DENTRO de cada módulo: con un segundo módulo
-- sembrado, `n=1` dejaba de identificar unívocamente una lección.
-- Nullable a propósito: el Módulo 3 todavía no tiene lecciones.
alter table public.lessons add column if not exists content_key text;

create unique index if not exists uq_lessons_content_key
    on public.lessons (content_key);

comment on column public.lessons.content_key is
    'Clave estable (m<modulo>-l<leccion>) con la que el frontend mapea el contenido del ejercicio. Estable entre entornos, a diferencia del id.';

-- 2. MÓDULO 1: content_key + currículum actualizado
-- Los id NO cambian: el progreso ya registrado en user_lessons_completed se
-- conserva, sólo se renombra lo que ve el usuario.
update public.lessons set
    content_key = 'm1-l1',
    title = 'Presentarte',
    description = 'Aprendé las señas para comenzar una conversación.'
where id = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1';

update public.lessons set
    content_key = 'm1-l2',
    title = '¿Cómo te sentís?',
    description = 'Expresá tu estado de ánimo con señas básicas.'
where id = 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2';

update public.lessons set
    content_key = 'm1-l3',
    title = 'Desafío',
    description = '¡Demostrá lo que ya aprendiste!'
where id = 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3';

update public.lessons set
    content_key = 'm1-l4',
    title = 'Cortesía',
    description = 'Aprendé expresiones para comunicarte con respeto.'
where id = 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4';

update public.lessons set
    content_key = 'm1-l5',
    title = 'Conversar',
    description = 'Combiná las señas aprendidas para mantener una conversación.'
where id = 'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5';

-- 3. MÓDULO 2
-- Upsert por "order" (no por id): 20260724000005_seed_modules_2_3.sql lo creó
-- con gen_random_uuid(), así que su id es distinto en cada entorno. Este insert
-- también sirve de guard si esa migración no llegó a correr.
insert into public.modules (title, description, "order")
values ('Módulo 2: Presentaciones', 'Formá tus primeras frases, reconocé nombres y mantené una conversación.', 2)
on conflict ("order") do update set
    title = excluded.title,
    description = excluded.description;

-- 4. LECCIONES DEL MÓDULO 2
-- Misma escala de recompensas que el Módulo 1 (ver 20260724000003):
--   1: 15 XP · 100/50   2: 15 XP · 100/50   3: 20 XP · 150/75
--   4: 25 XP · 200/100  5: 25 XP · 250/125
with m2 as (
    select id from public.modules where "order" = 2
)
insert into public.lessons (
    id, module_id, title, description, lesson_number,
    xp_reward, points_perfect, points_retry, "order", content_key
)
select v.id, m2.id, v.title, v.description, v.lesson_number,
       v.xp_reward, v.points_perfect, v.points_retry, v.lesson_number, v.content_key
from m2, (values
    ('e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6'::uuid, 'Presentaciones', 'Aprendé a formar tus primeras frases en LSA.', 1, 15, 100, 50, 'm2-l1'),
    ('e7e7e7e7-e7e7-e7e7-e7e7-e7e7e7e7e7e7'::uuid, 'Nombres', 'Aprendé a reconocer nombres deletreados en LSA.', 2, 15, 100, 50, 'm2-l2'),
    ('e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8'::uuid, 'Preguntar', 'Aprendé a preguntar el nombre de otra persona.', 3, 20, 150, 75, 'm2-l3'),
    ('e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9'::uuid, 'Objetos', 'Aprendé nuevas palabras de uso cotidiano.', 4, 25, 200, 100, 'm2-l4'),
    ('eaeaeaea-eaea-eaea-eaea-eaeaeaeaeaea'::uuid, 'Conversar', 'Combiná las frases aprendidas para mantener una conversación.', 5, 25, 250, 125, 'm2-l5')
) as v(id, title, description, lesson_number, xp_reward, points_perfect, points_retry, content_key)
on conflict (id) do nothing;
