-- SCRIPT DE SEED - DATOS INICIALES (Módulo 1, Lecciones y Stickers)

-- 1. INSERTAR MÓDULO 1
insert into public.modules (id, title, description, "order")
values ('df3e1b7a-1b1e-4b1e-8b1e-1b1e1b1e1b1e', 'Módulo 1: Introducción', 'Primeros pasos en lengua de señas: Saludos, identidad y cortesía.', 1)
on conflict (id) do nothing;

-- 2. INSERTAR LECCIONES DEL MÓDULO 1
-- Basado en las reglas de puntos: 
-- Lección 1: 15 XP, 100 Perfect, 50 Retry
-- Lección 2: 15 XP, 100 Perfect, 50 Retry
-- Lección 3: 20 XP, 150 Perfect, 75 Retry
-- Lección 4: 25 XP, 200 Perfect, 100 Retry
-- Lección 5: 25 XP, 250 Perfect, 125 Retry

insert into public.lessons (id, module_id, title, description, lesson_number, xp_reward, points_perfect, points_retry, "order")
values 
    -- Lección 1: Saludos
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'df3e1b7a-1b1e-4b1e-8b1e-1b1e1b1e1b1e', 'Saludos', 'Aprende los saludos básicos en lengua de señas.', 1, 15, 100, 50, 1),
    -- Lección 2: Posesivos
    ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'df3e1b7a-1b1e-4b1e-8b1e-1b1e1b1e1b1e', 'Posesivos', 'Aprende a indicar posesión: Mío y Tuyo.', 2, 15, 100, 50, 2),
    -- Lección 3: Identidad
    ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'df3e1b7a-1b1e-4b1e-8b1e-1b1e1b1e1b1e', 'Identidad', 'Aprende a decir tu nombre en lengua de señas.', 3, 20, 150, 75, 3),
    -- Lección 4: Cortesía
    ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'df3e1b7a-1b1e-4b1e-8b1e-1b1e1b1e1b1e', 'Cortesía', 'Las palabras mágicas: Por favor, Gracias y De nada.', 4, 25, 200, 100, 4),
    -- Lección 5: Conversación
    ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'df3e1b7a-1b1e-4b1e-8b1e-1b1e1b1e1b1e', 'Conversación', 'Practica una conversación básica con saludos y nombres.', 5, 25, 250, 125, 5)
on conflict (id) do nothing;

-- 3. INSERTAR VIDEOS UTILIZADOS (Basado en el archivo lessons.ts)
-- Nota: Las URLs son las del placeholder por ahora.
-- IDs fijos: hacen falta literales para poder referenciarlos desde el seed de
-- lesson_signs (paso 3.1) sin depender de un SELECT por título.
-- signs_reward = 1: una fila de lesson_signs = una seña acreditada (ver full_schema.sql).
insert into public.videos (id, title, url, signs_reward)
values
    ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'Hola', 'https://placeholder.com/video1', 1),
    ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Adiós', 'https://placeholder.com/video2', 1),
    ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'Mío', 'https://placeholder.com/video-mio', 1),
    ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'Tuyo', 'https://placeholder.com/video-tuyo', 1),
    ('f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5', 'Nombre', 'https://placeholder.com/video-nombre', 1),
    ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'Por favor', 'https://placeholder.com/video-porfavor', 1),
    ('f7f7f7f7-f7f7-f7f7-f7f7-f7f7f7f7f7f7', 'Gracias', 'https://placeholder.com/video-gracias', 1),
    ('f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8', 'De nada', 'https://placeholder.com/video-denada', 1),
    ('f9f9f9f9-f9f9-f9f9-f9f9-f9f9f9f9f9f9', 'Conversación Base', 'https://placeholder.com/video-conversation', 1)
on conflict (id) do nothing;

-- 3.1. SEÑAS ACREDITADAS POR LECCIÓN (lesson_signs)
-- No son "todos los videos de la lección": son las que el ejercicio de interacción
-- EVALÚA. Lección 1 enseña Hola y Adiós pero sólo pregunta por Hola → 1 fila.
-- Lección 4 es un "match" que evalúa los 3 pares a la vez → 3 filas.
-- Lección 5 es un placeholder (1 fila, "Conversación Base"): a diferencia de las
-- demás, su cantidad real de señas depende de cuántas palabras tenga la
-- conversación a completar, contenido que todavía no está definido (ver plan).
insert into public.lesson_signs (lesson_id, video_id)
values
    -- Lección 1 · Saludos → Hola
    ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'),
    -- Lección 2 · Posesivos → Mío
    ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3'),
    -- Lección 3 · Identidad → Nombre
    ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5'),
    -- Lección 4 · Cortesía → Por favor, Gracias, De nada (match: evalúa los 3 pares)
    ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6'),
    ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'f7f7f7f7-f7f7-f7f7-f7f7-f7f7f7f7f7f7'),
    ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8'),
    -- Lección 5 · Conversación → Conversación Base (placeholder, ver nota arriba)
    ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'f9f9f9f9-f9f9-f9f9-f9f9-f9f9f9f9f9f9')
on conflict do nothing;

-- 4. INSERTAR STICKERS INICIALES
insert into public.stickers (id, name, tier, price, image_url)
values 
    (gen_random_uuid(), 'Sticker Básico 1', 'Básico', 300, 'https://placeholder.com/sticker-basic'),
    (gen_random_uuid(), 'Sticker Estándar 1', 'Estándar', 600, 'https://placeholder.com/sticker-standard'),
    (gen_random_uuid(), 'Sticker Premium 1', 'Premium', 1200, 'https://placeholder.com/sticker-premium')
on conflict do nothing;

-- 5. INSERTAR LOGROS (Achievement Base)
insert into public.achievements (id, name, description, requirement_type, requirement_count)
values 
    (gen_random_uuid(), 'Copa Bronce', 'Completa tu primer módulo con éxito.', 'lessons_completed', 5),
    (gen_random_uuid(), 'Copa Plata', 'Completa 3 módulos completos.', 'lessons_completed', 15),
    (gen_random_uuid(), 'Copa Oro', 'Conviértete en un experto de la lengua de señas.', 'lessons_completed', 30)
on conflict do nothing;
