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
        first_name: data.user.user_metadata?.first_name,
        last_name: data.user.user_metadata?.last_name
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
        first_name,
        last_name,
        birth_date,
        gender,
        country
      }
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}