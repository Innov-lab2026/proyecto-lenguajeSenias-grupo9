import { Pressable, Text, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { NAVIGATION_ITEMS } from './constants'
import { cn } from '@/src/utils/cn'

interface SideBarProps {
  isTablet: boolean
}

export function SideBar({ isTablet }: SideBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <View
      className={cn(
        'h-full border-r border-muted/10 bg-surface py-6',
        isTablet ? 'w-20 items-center' : 'w-64 px-4'
      )}
    >
      {/* Logo/Título de la App */}
      <View
        className={cn(
          'mb-8 items-center justify-center',
          isTablet ? '' : 'flex-row gap-3 px-3 justify-start'
        )}
      >
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
          <Ionicons name="school" size={22} color="#1F2937" />
        </View>
        {isTablet ? null : (
          <View>
            <Text className="font-nunito text-lg font-bold text-ink leading-5">Carpiseñas</Text>
            <Text className="font-nunito text-[10px] text-muted leading-3">Lengua de Señas</Text>
          </View>
        )}
      </View>

      {/* Listado de Navegación */}
      <View className="flex-1 gap-2 w-full">
        {NAVIGATION_ITEMS.map((item) => {
          const hrefStr = item.href as string
          const isActive =
            hrefStr === '/'
              ? pathname === '/'
              : pathname === hrefStr || pathname.startsWith(hrefStr + '/')

          const iconName = isActive ? item.icon : (`${item.icon}-outline` as typeof item.icon)
          const iconColor = isActive ? '#4A90E2' : '#6F706F'

          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className={cn(
                'flex-row items-center rounded-xl p-3 gap-3 w-full',
                isActive ? 'bg-accent/20' : 'active:bg-muted/5'
              )}
            >
              <View className="items-center justify-center w-6">
                <Ionicons name={iconName} size={24} color={iconColor} />
              </View>
              {isTablet ? null : (
                <Text
                  className={cn(
                    'font-nunito text-sm font-bold',
                    isActive ? 'text-secondary' : 'text-ink'
                  )}
                >
                  {item.label}
                </Text>
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

