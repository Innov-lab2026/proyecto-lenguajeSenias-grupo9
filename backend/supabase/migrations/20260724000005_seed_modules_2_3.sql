-- Restaura los tabs de "Módulo 2" y "Módulo 3" bloqueados en el home. Antes
-- de conectar el frontend al backend real, esos tabs eran un placeholder
-- hardcodeado en el front (MOCK_HOME_MODULES); al pasar a leer /api/modules
-- desaparecieron porque sólo el Módulo 1 estaba sembrado.
--
-- Sin lecciones todavía (no existe contenido más allá del Módulo 1) — quedan
-- bloqueados por diseño: el home desbloquea sólo el módulo de menor `order`
-- (ver PLAN_FRONTEND_CONECTAR_BACKEND.md §5.4). No hace falta ningún cambio
-- de frontend para que vuelvan a aparecer.
insert into public.modules (title, description, "order")
values
    ('Módulo 2', 'Próximamente.', 2),
    ('Módulo 3', 'Próximamente.', 3)
on conflict ("order") do nothing;
