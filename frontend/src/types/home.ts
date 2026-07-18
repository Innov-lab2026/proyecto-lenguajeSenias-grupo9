export type HomeModuleState = 'unlocked' | 'locked'

export type IslandState = 'available' | 'blocked'

export interface HomeModule {
  id: string
  title: string
  state: HomeModuleState
  /** Islas completadas (0-5): define el progreso del módulo y la próxima isla disponible. */
  completedIslands: number
}

/** Contadores del header del home (XP, estrellas, huellas). */
export interface HomeStats {
  xp: number
  stars: number
  paws: number
}
