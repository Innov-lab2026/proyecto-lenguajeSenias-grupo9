import { z } from 'zod'

/**
 * El frontend usa 'masculino'/'femenino'/'otro' como valor interno del form, pero
 * antes de mandarlo al backend lo mapea a estos 3 (ver `GENDER_API_VALUE` en
 * frontend/src/types/auth.ts) — son los que realmente viajan por HTTP.
 */
const GENDER_VALUES = ['Masculino', 'Femenino', 'Otro'] as const

/** El frontend manda `birth_date` en ISO `YYYY-MM-DD` (ver `ddMmYyyyToIso`). */
const birthDateSchema = z
  .string({ error: 'La fecha de nacimiento es requerida' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
  .refine((value) => {
    const date = new Date(value)
    return !isNaN(date.getTime()) && date <= new Date() && date.getFullYear() >= 1900
  }, 'Fecha de nacimiento inválida')

export const loginSchema = z.object({
  email: z.email({ error: 'Correo inválido' }),
  password: z.string({ error: 'La contraseña es requerida' }).min(1, 'La contraseña es requerida'),
})

export const registerSchema = z.object({
  email: z.email({ error: 'Correo inválido' }),
  password: z
    .string({ error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  first_name: z
    .string({ error: 'El nombre es requerido' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z
    .string({ error: 'El apellido es requerido' })
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  birth_date: birthDateSchema,
  gender: z.enum(GENDER_VALUES, { error: 'Género inválido' }),
  country: z
    .string({ error: 'El país es requerido' })
    .trim()
    .min(1, 'El país es requerido')
    .max(100, 'País inválido'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
