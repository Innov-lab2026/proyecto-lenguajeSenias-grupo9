/** Formatea progresivamente a DD/MM/AAAA mientras el usuario escribe (sólo dígitos). */
export function formatDdMmYyyy(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  if (digits.length <= 2) return day
  if (digits.length <= 4) return `${day}/${month}`
  return `${day}/${month}/${year}`
}

/** Parsea una fecha DD/MM/AAAA. Devuelve null si el formato o la fecha son inválidos (ej. 31/02). */
export function parseDdMmYyyy(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  const valid =
    date.getFullYear() === Number(yyyy) &&
    date.getMonth() === Number(mm) - 1 &&
    date.getDate() === Number(dd)
  return valid ? date : null
}

/** Convierte DD/MM/AAAA → ISO YYYY-MM-DD (formato esperado por el backend). */
export function ddMmYyyyToIso(value: string): string {
  const [dd, mm, yyyy] = value.split('/')
  return `${yyyy}-${mm}-${dd}`
}
