import { Request, Response } from 'express'
import { deleteAccountService, loginService, registerService } from '../services/authService'
import { supabase, supabaseAdmin } from '../config/supabaseClient'
import type { LoginInput, RegisterInput, UpdateCredentialsInput } from '../schemas/authSchema'
import {
  resolveDeleteAccountError,
  resolveLoginError,
  resolveRegisterError,
  resolveUpdateCredentialsError,
} from '../utils/authErrorResponse'

export const login = async (req: Request<{}, {}, LoginInput>, res: Response) => {
  const { email, password } = req.body

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
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in
      }
    })
  } catch (error) {
    const { status, message } = resolveLoginError(error)
    res.status(status).json({ error: message })
  }
}

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  const { email, password, first_name, last_name, birth_date, gender, country } = req.body

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
  } catch (error) {
    const { status, message } = resolveRegisterError(error)
    res.status(status).json({ error: message })
  }
}

export const updateCredentials = async (req: Request<{}, {}, UpdateCredentialsInput>, res: Response) => {
  const { currentPassword, email, password } = req.body
  const user = (req as any).user

  const { error: verificationError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (verificationError) return res.status(401).json({ error: 'La contraseña actual es incorrecta.' })

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    ...(email ? { email } : {}),
    ...(password ? { password } : {}),
  })
  if (error) {
    const { status, message } = resolveUpdateCredentialsError(error)
    return res.status(status).json({ error: message })
  }

  return res.status(200).json({ message: 'Datos de seguridad actualizados.', user: { email: data.user.email } })
}

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await deleteAccountService(userId)
    return res.status(200).json({ message: 'Cuenta eliminada correctamente.' })
  } catch (error) {
    const { status, message } = resolveDeleteAccountError(error)
    return res.status(status).json({ error: message })
  }
}
