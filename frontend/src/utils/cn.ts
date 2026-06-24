import { twMerge } from 'tailwind-merge'

type ClassValue = string | false | null | undefined

/** Combina clases de Tailwind resolviendo conflictos (la última gana). */
export function cn(...classes: ClassValue[]): string {
  return twMerge(classes.filter(Boolean).join(' '))
}
