import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useSessionStore } from '@/src/store/sessionStore'
import { useSessionHydration } from '@/src/hooks/features/auth/useSessionHydration'
import '../global.css'

// Mantener el splash visible hasta cargar fuentes y resolver el estado de sesión.
void SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito: require('../assets/fonts/Nunito-VariableFont_wght.ttf'),
  })

  const status = useSessionStore((s) => s.status)
  useSessionHydration()

  // Listo cuando las fuentes cargaron (o fallaron) y la sesión ya se hidrató.
  const ready = (fontsLoaded || fontError != null) && status !== 'loading'

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync()
    }
  }, [ready])

  // Mientras no esté listo, el splash sigue visible (evita parpadeo entre rutas).
  if (!ready) return null

  const isAuthenticated = status === 'authenticated'

  return (
    <QueryClientProvider client={queryClient}>
      {/* initialMetrics: evita el "flash" de insets en 0 (contenido pegado al
          borde superior, tapado por la barra de estado, que luego "salta" a
          su posición) — sin esto, react-native-safe-area-context arranca sin
          insets y los actualiza recién tras la primera medición nativa. */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(protected)" />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
