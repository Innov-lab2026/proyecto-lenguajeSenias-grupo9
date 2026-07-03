/**
 * Mensaje "flash" de un solo uso para pasar entre pantallas sin ensuciar la URL
 * (ej. "cuenta creada" del registro → login). Se setea al navegar y la pantalla
 * destino lo consume una vez al montar. Se pierde al recargar la app (deseado).
 */
let pending: string | null = null

export function setFlashMessage(message: string) {
  pending = message
}

export function consumeFlashMessage(): string | null {
  const message = pending
  pending = null
  return message
}
