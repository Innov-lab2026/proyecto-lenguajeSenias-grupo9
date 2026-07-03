import { Text, View } from 'react-native'
import { Button } from '@/src/components/common/Button'
import { GoogleIcon } from './GoogleIcon'
import { useGoogleAuth } from '@/src/hooks/features/auth/useGoogleAuth'

/**
 * Botón "Continuar con Google". Sirve tanto para login como para registro
 * (Supabase crea la cuenta en el primer ingreso). La navegación la resuelve
 * el guard de rutas al pasar a "authenticated".
 */
export function GoogleButton() {
  const { signInWithGoogle, isLoading, error } = useGoogleAuth()

  return (
    <View className="w-full gap-2">
      <Button
        label="Continuar con Google"
        variant="white"
        onPress={signInWithGoogle}
        loading={isLoading}
        leftIcon={<GoogleIcon size={20} />}
      />
      {error ? (
        <Text className="text-center font-nunito text-sm font-bold text-red-500">{error}</Text>
      ) : null}
    </View>
  )
}
