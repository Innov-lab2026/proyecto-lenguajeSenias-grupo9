import type { SelectOption } from '@/src/components/common/Select'

/**
 * Países hispanohablantes + "Otro" (para quien no encuentre el suyo).
 * El valor enviado al backend es el nombre tal cual (campo `country` es texto libre en la DB).
 */
export const COUNTRY_VALUES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Guinea Ecuatorial',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Puerto Rico',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro',
] as const

export type Country = (typeof COUNTRY_VALUES)[number]

export const COUNTRY_OPTIONS: SelectOption[] = COUNTRY_VALUES.map((value) => ({
  label: value,
  value,
}))
