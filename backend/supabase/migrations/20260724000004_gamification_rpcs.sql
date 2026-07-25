-- Lógica de gamificación que full_schema.sql dejó pendiente (tablas creadas,
-- sin lógica): comprar stickers y otorgar logros. Migración nueva porque
-- full_schema.sql ya está aplicada — no se edita una migración que ya corrió.

-- Compra de stickers: descuenta puntos y registra la propiedad en una sola
-- transacción (RPC), para que el saldo se valide en el servidor (no en el
-- cliente) y una doble confirmación no pueda comprar el mismo sticker dos
-- veces ni dejar los puntos en negativo.
create or replace function public.purchase_sticker(
    p_user_id uuid,
    p_sticker_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_price integer;
    v_current_points integer;
    v_exists boolean;
begin
    select exists(select 1 from public.user_stickers where user_id = p_user_id and sticker_id = p_sticker_id) into v_exists;
    if v_exists then
        return json_build_object('success', false, 'message', 'Sticker already owned');
    end if;

    select price into v_price from public.stickers where id = p_sticker_id;
    if v_price is null then
        return json_build_object('success', false, 'message', 'Sticker not found');
    end if;

    select total_points into v_current_points from public.user_stats where user_id = p_user_id;
    if v_current_points is null or v_current_points < v_price then
        return json_build_object(
            'success', false,
            'message', 'Not enough points',
            'required', v_price,
            'available', coalesce(v_current_points, 0)
        );
    end if;

    update public.user_stats
    set total_points = total_points - v_price,
        updated_at = now()
    where user_id = p_user_id;

    insert into public.user_stickers (user_id, sticker_id) values (p_user_id, p_sticker_id);

    return json_build_object('success', true, 'spent_points', v_price, 'remaining_points', v_current_points - v_price);
end;
$$;

-- Evaluación de logros. Por ahora sólo entiende requirement_type =
-- 'lessons_completed' (el único que existe hoy en el seed); otros tipos
-- (rachas, señas, etc.) quedan sin implementar hasta que el contenido los
-- necesite. Se llama desde el backend después de completar una lección;
-- devuelve sólo los logros recién otorgados (para que el front pueda mostrar
-- el popup de "nuevo logro"), no todos los que el usuario ya tenía.
create or replace function public.evaluate_achievements(
    p_user_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_lessons_completed integer;
    v_granted json;
begin
    select count(*) into v_lessons_completed
    from public.user_lessons_completed
    where user_id = p_user_id;

    with newly_granted as (
        insert into public.user_achievements (user_id, achievement_id)
        select p_user_id, a.id
        from public.achievements a
        where a.requirement_type = 'lessons_completed'
          and a.requirement_count <= v_lessons_completed
          and not exists (
              select 1 from public.user_achievements ua
              where ua.user_id = p_user_id and ua.achievement_id = a.id
          )
        returning achievement_id
    )
    select coalesce(json_agg(json_build_object('id', a.id, 'name', a.name)), '[]'::json)
    into v_granted
    from newly_granted ng
    join public.achievements a on a.id = ng.achievement_id;

    return v_granted;
end;
$$;

-- Restricción de ejecución: mismo criterio que el resto de las RPC (sólo
-- service_role, ya que reciben p_user_id explícito en vez de leer auth.uid()).
revoke execute on function public.purchase_sticker(uuid, uuid) from public;
grant execute on function public.purchase_sticker(uuid, uuid) to service_role;

revoke execute on function public.evaluate_achievements(uuid) from public;
grant execute on function public.evaluate_achievements(uuid) to service_role;
