import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'
import type { Href } from 'expo-router'

export interface NavigationItem {
  key: string
  label: string
  icon: ComponentProps<typeof Ionicons>['name']
  href: Href
}
