import { Image } from 'expo-image'

export type NavbarIconName = 'abc' | 'fav' | 'home' | 'star' | 'user'

interface NavBarIconProps {
  name: NavbarIconName
  active?: boolean
  size?: number
  color?: string
}

const ICONS: Record<NavbarIconName, { outline: number; filled: number }> = {
  abc: {
    outline: require('@/assets/icons/navbar/abc-outline.svg'),
    filled: require('@/assets/icons/navbar/abc-filled.svg'),
  },
  fav: {
    outline: require('@/assets/icons/navbar/fav-outline.svg'),
    filled: require('@/assets/icons/navbar/fav-filled.svg'),
  },
  home: {
    outline: require('@/assets/icons/navbar/home-outline.svg'),
    filled: require('@/assets/icons/navbar/home-filled.svg'),
  },
  star: {
    outline: require('@/assets/icons/navbar/star-outline.svg'),
    filled: require('@/assets/icons/navbar/star-filled.svg'),
  },
  user: {
    outline: require('@/assets/icons/navbar/user-outline.svg'),
    filled: require('@/assets/icons/navbar/user-filled.svg'),
  },
}

export function NavBarIcon({ name, active = false, size = 24, color = '#1F2937' }: NavBarIconProps) {
  const source = active ? ICONS[name].filled : ICONS[name].outline

  return (
    <Image
      source={source}
      style={{ width: size, height: size, tintColor: color }}
      contentFit="contain"
    />
  )
}
