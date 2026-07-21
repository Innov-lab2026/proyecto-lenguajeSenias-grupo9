import { Request, Response } from 'express'
import { loginService, registerService } from '../services/authService'
import { supabase, supabaseAdmin } from '../config/supabaseClient'

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email y password son requeridos' })
    return
  }

  try {
    const data = await loginService(email, password)
    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user?.user_metadata?.full_name,
      },
      session: {
        access_token: data.session?.access_token,
        expires_in: data.session?.expires_in
      }
    })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}

export const register = async (req: Request, res: Response) => {
  const { email, password, first_name, last_name, birth_date, gender, country } = req.body

  if (!email || !password || !first_name || !last_name || !birth_date || !country) {
    res.status(400).json({ error: 'Email, password, nombre, apellido, fecha de nacimiento y país son requeridos' })
    return
  }

  try {
    const data = await registerService(email, password, first_name, last_name, new Date(birth_date), gender, country)
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name: data.user?.user_metadata?.full_name,
        birth_date: data.user?.user_metadata?.birth_date,
        gender: data.user?.user_metadata?.gender,
        country: data.user?.user_metadata?.country
      }
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const updateCredentials = async (req: Request, res: Response) => {
  const { currentPassword, email, password } = req.body
  const user = (req as any).user

  if (!currentPassword || (!email && !password)) {
    return res.status(400).json({ error: 'La contraseña actual y un cambio son requeridos.' })
  }
  if (password && password.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' })
  }

  const { error: verificationError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (verificationError) return res.status(401).json({ error: 'La contraseña actual es incorrecta.' })

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    ...(email ? { email } : {}),
    ...(password ? { password } : {}),
  })
  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ message: 'Datos de seguridad actualizados.', user: { email: data.user.email } })
}
