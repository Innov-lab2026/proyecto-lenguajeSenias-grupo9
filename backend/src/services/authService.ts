import { supabase, supabaseAdmin } from '../config/supabaseClient'

export const loginService = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw new Error(error.message)

  return data
}

export const registerService = async (email: string, password: string, full_name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name }
    }
  })

  if (error) throw new Error(error.message)

  if (data.user) {
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name
      })

    if (insertError) throw new Error(insertError.message)
  }

  return data
}