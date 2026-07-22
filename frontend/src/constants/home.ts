import type { HomeModule, HomeStats } from '@/src/types/home'

/** Islas (steps) por módulo. */
export const ISLANDS_PER_MODULE = 5

/**
 * Datos mock del home (todavía no hay tablas en el backend): usuario nuevo,
 * todo en cero. Módulo 1 desbloqueado con la primera isla disponible; el resto
 * de los módulos se desbloquean secuencialmente al completar los anteriores.
 */
export const MOCK_HOME_STATS: HomeStats = { xp: 60, stars: 150, paws: 15 }

export const MOCK_HOME_MODULES: HomeModule[] = [
  { id: 'modulo-1', title: 'Módulo 1', state: 'unlocked', completedIslands: 0 },
  { id: 'modulo-2', title: 'Módulo 2', state: 'locked', completedIslands: 0 },
  { id: 'modulo-3', title: 'Módulo 3', state: 'locked', completedIslands: 0 },
]
