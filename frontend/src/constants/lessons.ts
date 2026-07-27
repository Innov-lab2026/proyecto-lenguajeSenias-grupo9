/** Columna de la lección: mobile-first a ancho completo, acotada y centrada en desktop. */
export const LESSON_SHELL = 'mx-auto w-full max-w-5xl'

/** XP otorgado al completar cada step (por índice), haya o no errores en el camino. */
export const XP_POR_STEP = [15, 15, 20, 25, 25]

/** Puntos si el step se resolvió sin ningún error. */
export const PUNTOS_SIN_ERRORES = [100, 100, 150, 200, 250]

/** Puntos si el step se resolvió pero hubo al menos un error en el camino. */
export const PUNTOS_CON_ERRORES = [50, 50, 75, 100, 125]

/**
 * Señas que se acreditan al completar cada lección (por índice de lección).
 * A diferencia del XP/puntos, no varía según si hubo errores en el camino:
 * las señas enseñadas son las mismas, haya costado o no acertar el ejercicio.
 */
export const SEÑAS_POR_STEP = [2, 2, 1, 3, 4]
