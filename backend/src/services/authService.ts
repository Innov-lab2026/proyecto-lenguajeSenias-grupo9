import { supabase, supabaseAdmin } from '../config/supabaseClient'

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

  if (data.user) {
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        provider: 'email'
      })
    if (userError) throw new Error(userError.message)
     
    const {error: profileError} = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        first_name,
        last_name,
        birth_date,
        gender
      })
    if(profileError) throw new Error(profileError.message)

   
  }

  return data
}