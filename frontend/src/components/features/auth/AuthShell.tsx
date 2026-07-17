import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

interface AuthShellProps {
  /** Texto chico arriba del título (ej. "Regístrate en"). Si no se pasa, el título va primero. */
  eyebrow?: string
  title: string
  /** Texto chico debajo del título (ej. la bajada de la pantalla de inicio). */
  subtitle?: string
  children: ReactNode
  /** Contenido extra en el header (ej. la ilustración del carpincho al completar perfil de Google). */
  headerContent?: ReactNode
  /**
   * Hace que el título navegue a la pantalla de inicio de auth (vuelta atrás).
   * No activar en el inicio mismo ni en el gate de completar perfil.
   */
  titleLinksToHome?: boolean
}

/**
 * Layout compartido de las pantallas de auth: header azul (eyebrow/título/subtítulo +
 * contenido opcional) y panel celeste redondeado que lo solapa, con el
 * contenido de la pantalla (formularios, botones, links) adentro.
 * Mobile-first: el contenido se acota a `max-w-md` y se centra en web.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  headerContent,
  titleLinksToHome = false,
}: AuthShellProps) {
  const router = useRouter()

  // navigate (no push): si el inicio ya está en el stack vuelve a él, evita duplicados.
  const titleElement = (
    <Text className="text-center font-nunito text-5xl font-extrabold text-ink">{title}</Text>
  )

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1">
            <View className="items-center gap-2 px-6 pb-14 pt-6">
              {eyebrow ? (
                <Text className="text-center font-nunito text-lg font-semibold text-ink/80">
                  {eyebrow}
                </Text>
              ) : null}
              {titleLinksToHome ? (
                <Pressable
                  onPress={() => router.navigate('/')}
                  accessibilityRole="link"
                  accessibilityLabel="Volver al inicio"
                  hitSlop={8}
                >
                  {titleElement}
                </Pressable>
              ) : (
                titleElement
              )}
              {subtitle ? (
                <Text className="text-center font-nunito text-lg font-semibold text-ink/80">
                  {subtitle}
                </Text>
              ) : null}
              {headerContent}
            </View>

            <View className="-mt-8 flex-1 rounded-t-[2.5rem] bg-accent px-5 pb-8 pt-8">
              <View className="mx-auto w-full max-w-md gap-4">{children}</View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
