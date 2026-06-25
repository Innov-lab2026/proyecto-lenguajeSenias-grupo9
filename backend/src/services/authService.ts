import { supabase } from '../config/supabaseClient'

export const loginService = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw new Error(error.message)

  return data
}

export const registerService = async (email: string, password: string, first_name: string, last_name: string, birth_date: Date, gender: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        first_name,
        last_name,
        birth_date,
        gender
       }
    }
  })

  if (error) throw new Error(error.message)

  return data
}