import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { useSessionStore } from '@/src/store/sessionStore'
import { useSessionHydration } from '@/src/hooks/features/auth/useSessionHydration'
import '../global.css'

// Mantener el splash visible hasta resolver el estado de sesión.
void SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export default function RootLayout() {
  const status = useSessionStore((s) => s.status)
  useSessionHydration()

  useEffect(() => {
    if (status !== 'loading') {
      void SplashScreen.hideAsync()
    }
  }, [status])

  // Mientras hidrata, el splash sigue visible (evita parpadeo entre rutas).
  if (status === 'loading') return null

  const isAuthenticated = status === 'authenticated'

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
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
