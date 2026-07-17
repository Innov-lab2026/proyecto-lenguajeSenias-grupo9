import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'
import type { Href } from 'expo-router'
import type { NavbarIconName } from '@/src/components/features/navigation/NavBarIcon'

export interface NavigationItem {
  key: string
  label: string
  icon: NavbarIconName | ComponentProps<typeof Ionicons>['name']
  href: Href
}
