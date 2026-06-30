/**
 * Calcula el offset horizontal para un nodo de la lección en base a su índice
 * usando una función sinusoidal para dar un efecto de curva suave (estilo Duolingo).
 * 
 * @param index - Índice de la lección (0-based)
 * @param amplitude - Amplitud máxima del movimiento en píxeles (por defecto 50)
 * @param period - Cuántos nodos toma completar un ciclo de onda (por defecto 4)
 * @returns Offset horizontal en píxeles
 */
export function getHorizontalOffset(
  index: number,
  amplitude: number = 50,
  period: number = 4
): number {
  return Math.sin((index * 2 * Math.PI) / period) * amplitude
}
