import { Stack } from 'expo-router'

// Guard de sesión se agrega en el paso 8 (hidratación + protección de rutas).
export default function ProtectedLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
