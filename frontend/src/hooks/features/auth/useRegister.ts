import { useMutation } from '@tanstack/react-query'
import { register, toRegisterRequest } from '@/src/services/auth'
import type { RegisterValues } from '@/src/schemas/auth'

/**
 * Registro con los datos del formulario (se mapean al contrato del endpoint).
 * El backend NO devuelve token (confirmación por email), así que NO hay auto-login:
 * el manejo de éxito (mostrar "revisá tu correo" y volver a login) se hace en el consumidor.
 */
export function useRegister() {
  return useMutation({
    mutationFn: (values: RegisterValues) => register(toRegisterRequest(values)),
  })
}
