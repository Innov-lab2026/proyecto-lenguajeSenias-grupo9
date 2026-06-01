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
      user: data.user,
      token: data.session?.access_token
    })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}

export const register = async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body

  if (!email || !password || !full_name) {
    res.status(400).json({ error: 'Email, password y nombre son requeridos' })
    return
  }

  try {
    const data = await registerService(email, password, full_name)
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: data.user
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}