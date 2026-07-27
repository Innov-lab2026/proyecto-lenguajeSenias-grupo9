-- Retira el modelo de progreso viejo (por módulo): queda reemplazado por
-- user_stats + user_lessons_completed del esquema nuevo (full_schema.sql).
-- Se agrega como migración nueva (no se edita 20260722000000_create_user_progress.sql)
-- porque esa migración ya pudo haberse aplicado contra la base real.
drop trigger if exists on_progress_updated on public.user_progress;
drop function if exists public.handle_updated_at();
drop table if exists public.user_progress;
