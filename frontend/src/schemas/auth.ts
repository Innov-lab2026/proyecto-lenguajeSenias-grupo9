import { z } from 'zod'

/** Login y registro comparten campos (decisión de diseño: sólo email + password). */
export const loginSchema = z.object({
  email: z.email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const registerSchema = loginSchema

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
