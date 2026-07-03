import { z } from 'zod'
import { GENDER_VALUES } from '@/src/types/auth'
import { COUNTRY_VALUES } from '@/src/constants/countries'
import { birthDateSchema } from './auth'

/** Datos faltantes tras un signup por Google (país, género, fecha de nacimiento). */
export const completeProfileSchema = z.object({
  birthDate: birthDateSchema,
  gender: z.enum(GENDER_VALUES, { error: 'Seleccioná una opción' }),
  country: z.enum(COUNTRY_VALUES, { error: 'Seleccioná un país' }),
})

export type CompleteProfileValues = z.infer<typeof completeProfileSchema>
