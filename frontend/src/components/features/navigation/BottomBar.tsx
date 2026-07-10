import { Pressable, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { NAVIGATION_ITEMS } from './constants'
import { cn } from '@/src/utils/cn'
import { NavBarIcon } from './NavBarIcon'

export function BottomBar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <View className="h-20 w-full flex-row justify-around items-center border-t border-accent rounded-t-[30px] bg-surface px-2 pb-safe">
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
            className="h-12 w-12 items-center justify-center rounded-full"
          >
            <View
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
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}
