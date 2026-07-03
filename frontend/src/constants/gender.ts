import type { SelectOption } from '@/src/components/common/Select'
import { GENDER_VALUES, GENDER_API_VALUE } from '@/src/types/auth'

/** Opciones para el Select de género (reutiliza GENDER_API_VALUE como label). */
export const GENDER_OPTIONS: SelectOption[] = GENDER_VALUES.map((value) => ({
  value,
  label: GENDER_API_VALUE[value],
}))
