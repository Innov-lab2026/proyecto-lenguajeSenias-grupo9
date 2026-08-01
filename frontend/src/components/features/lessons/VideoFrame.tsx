import { useState, type ReactNode } from 'react'
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native'
import { cn } from '@/src/utils/cn'

/**
 * Relación de aspecto de los videos de señas: todos se graban en 1080x1920.
 * Es el ancho MÁXIMO del marco en relación a su alto: pasarse de acá hace que
 * el `contentFit="cover"` de LessonVideo recorte arriba y abajo, y en LSA eso
 * se come la cara y las manos, que es justo lo que hay que ver.
 */
export const VIDEO_ASPECT = 9 / 16

/**
 * Relación mínima: cuán angosto puede quedar el marco antes de dejar de estirarse
 * a lo alto. Más angosto que esto, `cover` empieza a recortar de más a los costados.
 * El valor sale de las capturas: 0.369 fue el marco más angosto validado como
 * aceptable, así que 0.36 es el borde de lo ya visto funcionando.
 */
const MIN_ASPECT = 0.36

interface VideoFrameProps {
  children: ReactNode
  /** Separación entre el borde del marco y el video. */
  padding?: number
  /** Clases del contenedor que mide (márgenes, peso del flex). */
  className?: string
  /** Estilos del contenedor, para topes que no se pueden expresar en clases (ej. `maxHeight: '68%'`). */
  style?: StyleProp<ViewStyle>
  /** Clases visuales del marco (borde, fondo, sombra, radio). */
  frameClassName?: string
}

/**
 * Marco vertical del video: usa todo el alto disponible y limita el ancho a
 * 9:16, de modo que nunca quede más apaisado que el propio video.
 *
 * El bug que resuelve: antes el marco era `w-full flex-1`, así que su forma
 * dependía del espacio que sobrara. En pantallas anchas o bajas (tablets,
 * apaisado, celulares cortos) quedaba apaisado y `cover` recortaba arriba y
 * abajo, cortando cabeza y manos.
 *
 * ⚠️ Se mide con `onLayout` en vez de resolverlo con `aspectRatio` + `maxWidth`:
 * ese combo depende de cómo Yoga (nativo) y CSS (web) resuelven la relación de
 * aspecto cuando además hay un máximo, y no se comportan igual. Medir da el
 * mismo resultado en ambas plataformas, que es la condición del arreglo.
 */
export function VideoFrame({
  children,
  padding = 8,
  className,
  style,
  frameClassName,
}: VideoFrameProps) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null)

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    // Sin este guard, cada medición crea un objeto nuevo → re-render en bucle.
    setBox((prev) =>
      prev && prev.width === width && prev.height === height ? prev : { width, height },
    )
  }

  const frame = (() => {
    if (!box || box.width <= 0 || box.height <= 0) return null

    const innerMaxWidth = box.width - padding * 2
    const innerMaxHeight = box.height - padding * 2
    if (innerMaxWidth <= 0 || innerMaxHeight <= 0) return null

    // El marco copia la forma del espacio disponible, pero acotada a la banda
    // [MIN_ASPECT, 9:16]. Después se encaja lo más grande que entre:
    //  - Espacio dentro de la banda → el marco lo llena entero.
    //  - Espacio más ancho (tablets, apaisado) → se topea en 9:16 y llena el
    //    alto, que es lo que evita el recorte vertical de cara y manos.
    //  - Espacio más angosto (ventanas altas y finitas) → se topea en el mínimo
    //    y deja aire arriba y abajo, en vez de recortar de más a los costados.
    const ratio = Math.min(Math.max(innerMaxWidth / innerMaxHeight, MIN_ASPECT), VIDEO_ASPECT)
    const innerWidth = Math.min(innerMaxWidth, innerMaxHeight * ratio)

    return {
      width: innerWidth + padding * 2,
      height: innerWidth / ratio + padding * 2,
      padding,
    }
  })()

  return (
    <View
      className={cn('flex-1 w-full items-center justify-center', className)}
      style={style}
      onLayout={handleLayout}
    >
      {frame ? (
        <View
          style={frame}
          className={cn(
            'relative rounded-[40px] border border-muted/20 bg-surface shadow-sm',
            frameClassName,
          )}
        >
          {children}
        </View>
      ) : null}
    </View>
  )
}
