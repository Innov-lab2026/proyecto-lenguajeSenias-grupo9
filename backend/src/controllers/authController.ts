import { Request, Response } from 'express'
import { loginService, registerService } from '../services/authService'

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
        full_name: data.user.user_metadata?.full_name
      },
      session: {
        token: data.session?.access_token,
        expires_in: data.session?.expires_in
      }
    })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}

export const register = async (req: Request, res: Response) => {
  const { email, password, full_name, birth_date } = req.body

  if (!email || !password || !full_name || !birth_date) {
    res.status(400).json({ error: 'Email, password, nombre y fecha de nacimiento son requeridos' })
    return
  }

  try {
    const data = await registerService(email, password, full_name, new Date(birth_date))
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name,
        birth_date
      }
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}