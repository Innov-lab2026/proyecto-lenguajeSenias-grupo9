import type { ComponentType } from 'react'
import { Island1, ISLAND1_RATIO } from './Island1'
import { Island2, ISLAND2_RATIO, ISLAND2_BLOCKED_RATIO } from './Island2'
import { Island3, ISLAND3_RATIO, ISLAND3_BLOCKED_RATIO } from './Island3'
import { Island4, ISLAND4_RATIO, ISLAND4_BLOCKED_RATIO } from './Island4'
import { Island5, ISLAND5_RATIO, ISLAND5_BLOCKED_RATIO } from './Island5'

export interface IslandSvgProps {
  width: number
  blocked?: boolean
}

/** Islas del camino por número (1 = abajo de todo, 5 = arriba de todo). */
export const ISLAND_COMPONENTS: Record<number, ComponentType<IslandSvgProps>> = {
  1: Island1,
  2: Island2,
  3: Island3,
  4: Island4,
  5: Island5,
}

// La isla 1 no tiene versión bloqueada (nunca se renderiza bloqueada).
const RATIOS: Record<number, { alive: number; blocked: number }> = {
  1: { alive: ISLAND1_RATIO, blocked: ISLAND1_RATIO },
  2: { alive: ISLAND2_RATIO, blocked: ISLAND2_BLOCKED_RATIO },
  3: { alive: ISLAND3_RATIO, blocked: ISLAND3_BLOCKED_RATIO },
  4: { alive: ISLAND4_RATIO, blocked: ISLAND4_BLOCKED_RATIO },
  5: { alive: ISLAND5_RATIO, blocked: ISLAND5_BLOCKED_RATIO },
}

/** Proporción alto/ancho de una isla según su estado (para el layout del camino). */
export function getIslandRatio(number: number, blocked = false): number {
  return blocked ? RATIOS[number].blocked : RATIOS[number].alive
}
