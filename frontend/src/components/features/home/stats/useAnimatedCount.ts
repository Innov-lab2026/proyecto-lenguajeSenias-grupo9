import { useEffect, useRef, useState } from 'react'

/**
 * Contador estilo videojuego — port de animateCount de icons.js: al aumentar
 * `value`, el número mostrado sube desde el valor anterior con easing
 * cubic-out (~900ms). Las bajadas (p. ej. ajustes) se aplican sin animación.
 */
export function useAnimatedCount(value: number) {
  const [display, setDisplay] = useState(value)
  const [isCounting, setIsCounting] = useState(false)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    prevRef.current = value
    if (value === from) return
    if (value < from) {
      setDisplay(value)
      return
    }

    setIsCounting(true)
    const start = Date.now()
    const duration = 900
    let raf = 0

    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setIsCounting(false)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [value])

  return { display, isCounting }
}
