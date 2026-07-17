import type { NavigationItem } from '@/src/types/navigation'

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    key: 'alphabet',
    label: 'Abecedario',
    icon: 'abc',
    href: '/alphabet',
  },
  {
    key: 'favorites',
    label: 'Favoritos',
    icon: 'fav',
    href: '/favorites',
  },
  {
    key: 'home',
    label: 'Inicio',
    icon: 'home',
    href: '/',
  },
  {
    key: 'rewards',
    label: 'Recompensas',
    icon: 'star',
    href: '/rewards',
  },
  {
    key: 'profile',
    label: 'Perfil',
    icon: 'user',
    href: '/profile',
  }
]
