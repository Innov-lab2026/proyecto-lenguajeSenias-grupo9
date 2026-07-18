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
