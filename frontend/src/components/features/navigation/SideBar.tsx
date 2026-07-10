import { Pressable, Text, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { NAVIGATION_ITEMS } from './constants'
import { cn } from '@/src/utils/cn'
import { NavBarIcon } from './NavBarIcon'

interface SideBarProps {
  isTablet: boolean
}

export function SideBar({ isTablet }: SideBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <View
      className={cn(
        'h-full border-r border-muted/10 bg-background py-6',
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
          <NavBarIcon name="home" active size={22} />
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

          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="flex-row items-center rounded-full p-3 gap-3 w-full"
            >
              <View
                className={cn(
                  'h-10 w-10 items-center justify-center rounded-full',
                  isActive ? 'bg-active-icon' : ''
                )}
              >
                <NavBarIcon
                  name={item.icon as any}
                  active={isActive}
                  size={24}
                  color={isActive ? '#4A90E2' : '#1F2937'}
                />
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

