import { z } from 'zod'
import { GENDER_VALUES } from '@/src/types/auth'
import { parseDdMmYyyy } from '@/src/utils/date'

export const loginSchema = z.object({
  email: z.email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const registerSchema = loginSchema
  .extend({
    firstName: z.string().trim().min(2, 'Mínimo 2 caracteres'),
    lastName: z.string().trim().min(2, 'Mínimo 2 caracteres'),
    birthDate: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Usá el formato DD/MM/AAAA')
      .refine((value) => parseDdMmYyyy(value) !== null, 'Fecha inválida')
      .refine((value) => {
        const date = parseDdMmYyyy(value)
        return date !== null && date <= new Date() && date.getFullYear() >= 1900
      }, 'Fecha fuera de rango'),
    gender: z.enum(GENDER_VALUES, { error: 'Seleccioná una opción' }),
    confirmPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden',
      })
    }
  })

export const forgotPasswordSchema = z.object({
  email: z.email('Correo inválido'),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
