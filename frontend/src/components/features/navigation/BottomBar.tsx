import { Pressable, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { NAVIGATION_ITEMS } from './constants'
import { cn } from '@/src/utils/cn'

export function BottomBar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <View className="h-16 w-full flex-row justify-around items-center border-t border-muted/10 bg-surface px-2 pb-safe shadow-sm">
      {NAVIGATION_ITEMS.map((item) => {
        // Evaluar si está activo de manera precisa
        const hrefStr = item.href as string
        const isActive =
          hrefStr === '/'
            ? pathname === '/'
            : pathname === hrefStr || pathname.startsWith(hrefStr + '/')

        const iconName = isActive ? item.icon : (`${item.icon}-outline` as typeof item.icon)
        const iconColor = isActive ? '#0581C3' : '#6F706F' // secondary o muted

        return (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.href)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={cn(
              'h-12 w-12 items-center justify-center rounded-xl',
              isActive ? 'bg-accent/60' : 'active:bg-muted/5'
            )}
          >
            <Ionicons name={iconName} size={26} color={iconColor} />
          </Pressable>
        )
      })}
    </View>
  )
}
