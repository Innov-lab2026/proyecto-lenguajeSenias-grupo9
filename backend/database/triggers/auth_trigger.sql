create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
    -- 1. Insertar en public.users
    insert into public.users (id, email, provider)
    values (
        new.id,
        new.email,
        coalesce(new.raw_app_meta_data ->> 'provider', 'email')
    );


    -- 2. Insertar en public.profiles
    insert into public.profiles (
        id,
        full_name,
        birth_date,
        gender,
        country,
        avatar_url
    )
    values (
        new.id,
        coalesce(
		    new.raw_user_meta_data ->> 'full_name',
		    'Usuario'
	    ),
        (new.raw_user_meta_data ->> 'birth_date')::date,
        new.raw_user_meta_data ->> 'gender',
        new.raw_user_meta_data ->> 'country',
        new.raw_user_meta_data ->> 'avatar_url'
    );

    return new;
end;
$$;

-- Reiniciar el trigger de manera limpia
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert
on auth.users
for each row
execute function public.handle_new_user();