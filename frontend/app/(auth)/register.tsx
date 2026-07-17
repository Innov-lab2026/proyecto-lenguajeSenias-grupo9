import { useRouter } from 'expo-router'
import { AuthShell } from '@/src/components/features/auth/AuthShell'
import { RegisterForm } from '@/src/components/features/auth/RegisterForm'
import type { RegisterValues } from '@/src/schemas/auth'
import { useRegister } from '@/src/hooks/features/auth/useRegister'
import { setFlashMessage } from '@/src/lib/flashMessage'
import { getApiErrorMessage } from '@/src/services/http'

export default function RegisterScreen() {
  const router = useRouter()
  const register = useRegister()

  const handleSubmit = (values: RegisterValues) => {
    register.mutate(values, {
      onSuccess: (data) => {
        // Sin auto-login: volvemos a login. El mensaje viaja por flash (no por la
        // URL) para que no quede pegado como query param.
        setFlashMessage(data.message)
        router.replace('/login')
      },
    })
  }

  const serverError = register.error ? getApiErrorMessage(register.error) : null

  return (
    <AuthShell eyebrow="Regístrate en" title="CarpiSeñas" titleLinksToHome>
      <RegisterForm onSubmit={handleSubmit} submitting={register.isPending} serverError={serverError} />
    </AuthShell>
  )
}
