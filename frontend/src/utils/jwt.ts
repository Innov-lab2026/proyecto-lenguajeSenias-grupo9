/**
 * Lectura del vencimiento de un JWT SIN validar la firma.
 *
 * La validación real (firma + expiración) la hace el backend vía
 * `supabase.auth.getUser`. Acá sólo decodificamos el payload para leer `exp` y
 * decidir localmente, sin red, si el access token conviene renovarlo antes de
 * usarlo (refresh proactivo en la hidratación).
 */

interface JwtPayload {
  exp?: number
}

/** Decodifica el payload (parte central) de un JWT. Devuelve null si no es un JWT. */
function decodePayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    // atob → binario; lo reconvertimos a UTF-8 por si el payload trae acentos
    // (ej. el nombre en user_metadata).
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(padded), (char: string) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

/** Epoch (en segundos) en que expira el token, o null si no se puede leer. */
export function getTokenExpiry(token: string): number | null {
  const payload = decodePayload(token)
  return typeof payload?.exp === 'number' ? payload.exp : null
}

/**
 * ¿El token está vencido, o lo estará dentro de `marginSec`?
 *
 * El margen cubre desfasajes de reloj y latencia: evita mandar un token que
 * muere en los próximos segundos. Si no se puede leer el `exp` (ej. el token
 * mock, que no es un JWT) devuelve false: no forzamos refresh/logout por no
 * poder parsearlo — el interceptor 401 queda como red de seguridad.
 */
export function isExpired(token: string, marginSec = 60): boolean {
  const exp = getTokenExpiry(token)
  if (exp === null) return false
  const nowSec = Math.floor(Date.now() / 1000)
  return exp <= nowSec + marginSec
}
