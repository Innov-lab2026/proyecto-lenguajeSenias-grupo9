import { supabase, supabaseAdmin } from '../config/supabaseClient'

export const loginService = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw new Error(error.message)

  return data
}

export const registerService = async (email: string, password: string, full_name: string, birth_date: Date) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name,
        birth_date
       }
    }
  })

  if (error) throw new Error(error.message)

  if (data.user) {
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name,
        birth_date
      })

    if (insertError) throw new Error(insertError.message)
  }

  return data
}