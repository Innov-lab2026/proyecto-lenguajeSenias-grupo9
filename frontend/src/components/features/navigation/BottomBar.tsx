import { Pressable, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { NAVIGATION_ITEMS } from './constants'
import { cn } from '@/src/utils/cn'
import { NavBarIcon } from './NavBarIcon'

export function BottomBar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    // "Borde" superior celeste como capa de fondo (pt-px): en nativo un border-t
    // con esquinas redondeadas no pinta la parte lateral de la curva.
    // Sin pb-safe acá: el SafeAreaView del layout (edges bottom) ya aplica el inset.
    <View className="w-full rounded-t-[30px] bg-accent pt-px">
      <View className="h-20 w-full flex-row justify-around items-center rounded-t-[30px] bg-surface px-2">
        {NAVIGATION_ITEMS.map((item) => {
          const hrefStr = item.href as string
          const isActive =
            hrefStr === '/'
              ? pathname === '/'
              : pathname === hrefStr || pathname.startsWith(hrefStr + '/')

          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              // Área táctil de 48px sobre el círculo de 40px.
              hitSlop={4}
              // Fondo del activo y feedback active: en el Pressable, no en un View
              // interno: NativeWind convierte un View con active: en Pressable
              // (nativo) y captura el tap; además el View anidado renderizaba el
              // rounded-full como cuadrado en Android.
              className={cn(
                'h-10 w-10 items-center justify-center rounded-full',
                isActive ? 'bg-active-icon' : 'active:bg-muted/5'
              )}
            >
              <NavBarIcon
                name={item.icon as any}
                active={isActive}
                size={22}
                color={isActive ? '#4A90E2' : '#1F2937'}
              />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
