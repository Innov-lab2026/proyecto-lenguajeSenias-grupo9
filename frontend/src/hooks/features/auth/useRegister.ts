import { useMutation } from '@tanstack/react-query'
import { register } from '@/src/services/auth'

/**
 * Registro con email + password.
 * El backend NO devuelve token (confirmación por email), así que NO hay auto-login:
 * el manejo de éxito (mostrar "revisá tu correo" y volver a login) se hace en el consumidor.
 */
export function useRegister() {
  return useMutation({
    mutationFn: register,
  })
}
