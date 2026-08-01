import { useEffect } from 'react'
import { Stack } from 'expo-router'
import Head from 'expo-router/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useSessionStore } from '@/src/store/sessionStore'
import { useSessionHydration } from '@/src/hooks/features/auth/useSessionHydration'
import { AppAlertProvider } from '@/src/components/common/AppAlertProvider'
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
  if (!ready) {
    return (
      <Head>
        <title>CarpiSeñas</title>
      </Head>
    )
  }

  const isAuthenticated = status === 'authenticated'

  return (
    // Requerido por react-native-gesture-handler para que CUALQUIER gesto
    // (Gesture.Pan, etc.) funcione en la app — sin este wrapper en la raíz,
    // los gestos no responden en ningún lado. Usado por primera vez en el
    // drag & drop de la isla 5 (DraggableWord).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Head>
        <title>CarpiSeñas</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        {/* initialMetrics: evita el "flash" de insets en 0 (contenido pegado al
            borde superior, tapado por la barra de estado, que luego "salta" a
            su posición) — sin esto, react-native-safe-area-context arranca sin
            insets y los actualiza recién tras la primera medición nativa. */}
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <AppAlertProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="(protected)" />
                {/* Fuera de (protected) a propósito: pantalla inmersiva, sin
                    SideBar/BottomBar. Declarada acá para que quede protegida
                    igual — antes no estaba en ningún Stack.Protected y el
                    routing por archivos la registraba accesible sin sesión.
                    Nota: al no colgar de (protected) tampoco pasa por el gate
                    de perfil completo; sólo se llega desde el home, que sí. */}
                <Stack.Screen name="lesson/[id]" />
              </Stack.Protected>
              <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
            </Stack>
          </AppAlertProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
