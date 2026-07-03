import type { NavigationItem } from '@/src/types/navigation'

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    key: 'home',
    label: 'Inicio',
    icon: 'home',
    href: '/',
  },
  {
    key: 'alphabet',
    label: 'Abecedario',
    icon: 'text',
    href: '/alphabet',
  },
  {
    key: 'favorites',
    label: 'Favoritos',
    icon: 'heart',
    href: '/favorites',
  },
  {
    key: 'profile',
    label: 'Perfil',
    icon: 'person',
    href: '/profile',
  },
  {
    key: 'settings',
    label: 'Ajustes',
    icon: 'settings',
    href: '/settings',
  },
]
