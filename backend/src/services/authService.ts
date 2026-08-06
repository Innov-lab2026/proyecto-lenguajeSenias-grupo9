import { supabase, supabaseAdmin } from '../config/supabaseClient'
import { deleteAvatarService } from './profileService'

export const loginService = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  // Se propaga el error de Supabase tal cual (no envuelto en un Error genérico)
  // para no perder `.code`/`.status`, que el controller usa para distinguir
  // credenciales inválidas de una caída del servicio.
  if (error) throw error

  return data
}

export const registerService = async (email: string, password: string, first_name: string, last_name: string, birth_date: Date, gender: string, country: string) => {
  const full_name = `${first_name} ${last_name}`.trim();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name,
        birth_date,
        gender,
        country
       }
    }
  })

  if (error) throw error

  return data
}

/**
 * Borra la cuenta del usuario. `admin.deleteUser` borra la fila de auth.users;
 * el resto (profiles, user_stats, user_lessons_completed, user_favorites, etc.)
 * cae en cascada por el `on delete cascade` del schema — no hace falta borrar
 * tabla por tabla. Lo único que la cascada no cubre es Storage (el avatar), por
 * eso se limpia antes; si esa limpieza falla no bloquea el borrado de la cuenta
 * (un archivo huérfano en Storage es preferible a una cuenta que no se puede borrar).
 */
export const deleteAccountService = async (userId: string) => {
  try {
    await deleteAvatarService(userId)
  } catch (error) {
    console.error('[deleteAccountService] no se pudo limpiar el avatar:', error)
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) throw error
}

