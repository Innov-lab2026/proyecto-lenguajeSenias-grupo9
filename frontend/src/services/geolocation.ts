import { COUNTRY_VALUES, type Country } from '@/src/constants/countries'

const normalizeCountry = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const COUNTRY_BY_NORMALIZED_NAME = new Map(
  COUNTRY_VALUES.map((country) => [normalizeCountry(country), country]),
)

/** Obtém o país aproximado pela IP pública sem interromper o cadastro se falhar. */
export async function getCountryFromIp(): Promise<Country> {
  try {
    const response = await fetch('https://ipwho.is/')
    if (!response.ok) return 'Otro'

    const data: unknown = await response.json()
    if (!data || typeof data !== 'object' || !('country' in data) || typeof data.country !== 'string') {
      return 'Otro'
    }

    return COUNTRY_BY_NORMALIZED_NAME.get(normalizeCountry(data.country)) ?? 'Otro'
  } catch {
    return 'Otro'
  }
}
