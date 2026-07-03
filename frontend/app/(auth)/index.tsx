import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { AuthShell } from '@/src/components/features/auth/AuthShell'
import { Button } from '@/src/components/common/Button'
import { GoogleButton } from '@/src/components/features/auth/GoogleButton'
import { USE_MOCK_AUTH } from '@/src/constants/env'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <AuthShell title="CarpiSeñas" subtitle="Crea tu cuenta para comenzar">
      <Text className="text-center font-nunito text-lg font-bold text-ink">
        Elige cómo quieres registrarte
      </Text>

      <Button
        label="Registrarse con correo"
        variant="white"
        onPress={() => router.push('/register')}
        leftIcon={<Ionicons name="mail-outline" size={20} color="#1F2937" />}
      />

      {/* Google usa Supabase real (no se mockea) → se oculta en modo mock/QA. */}
      {USE_MOCK_AUTH ? null : (
        <>
          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-ink/10" />
            <View className="h-1.5 w-1.5 rounded-full bg-ink/20" />
            <View className="h-px flex-1 bg-ink/10" />
          </View>

          <GoogleButton />
        </>
      )}

      <View className="flex-row items-center justify-center gap-1 pt-2">
        <Text className="font-nunito text-sm font-normal text-ink/80">¿Ya tienes cuenta?</Text>
        <Pressable onPress={() => router.push('/login')} accessibilityRole="link">
          <Text className="font-nunito text-sm font-bold text-secondary">Inicia sesión</Text>
        </Pressable>
      </View>
    </AuthShell>
  )
}
