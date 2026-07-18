import { ISLANDS_PER_MODULE } from '@/src/constants/home'
import type { HomeModule, IslandState } from '@/src/types/home'

/** Progreso (0-100) del módulo abierto según sus islas completadas. */
export function getModuleProgress(module: HomeModule): number {
  return Math.round((module.completedIslands / ISLANDS_PER_MODULE) * 100)
}

/**
 * Estado de una isla (1-5) dentro de un módulo: las completadas y la siguiente
 * están disponibles (verde brillante); el resto, bloqueadas (versión -blocked).
 */
export function getIslandState(module: HomeModule, islandNumber: number): IslandState {
  if (module.state === 'locked') return 'blocked'
  return islandNumber <= module.completedIslands + 1 ? 'available' : 'blocked'
}

/**
 * Mensaje de la vista de módulo bloqueado: lista los módulos previos que
 * faltan completar (ej. "Completa el módulo 1 y el módulo 2 para desbloquear
 * más lecciones.").
 */
export function getLockedModuleMessage(modules: HomeModule[], locked: HomeModule): string {
  const index = modules.findIndex((m) => m.id === locked.id)
  const pending = modules
    .slice(0, index)
    .filter((m) => m.completedIslands < ISLANDS_PER_MODULE)
    .map((m) => `el ${m.title.toLowerCase()}`)

  if (pending.length === 0) return 'Este módulo todavía no está disponible.'

  const list =
    pending.length > 1
      ? `${pending.slice(0, -1).join(', ')} y ${pending[pending.length - 1]}`
      : pending[0]

  return `Completa ${list} para desbloquear más lecciones.`
}
