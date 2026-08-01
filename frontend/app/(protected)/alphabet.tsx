import { useState, useEffect } from 'react'
import { Pressable, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useAlphabetProgress } from '@/src/hooks/features/alphabet/useAlphabetProgress'
import { PauseModal } from '@/src/components/features/lessons/PauseModal'
import { getItem, deleteItem } from '@/src/lib/storage'
import { cn } from '@/src/utils/cn'

// Orden tradicional del alfabeto español (el que usan las cartillas de LSA):
// CH, LL y RR son letras propias del abecedario dactilológico, con seña
// distinta a la de sus letras sueltas — van intercaladas, no al final.
const LSA_ALPHABET = [
  'A', 'B', 'C', 'CH', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'LL', 'M',
  'N', 'Ñ', 'O', 'P', 'Q', 'R', 'RR', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
]

function getNumColumns(width: number): number {
  if (width >= 1024) return 8
  if (width >= 600) return 6
  return 4
}

const GAP = 8
const HORIZONTAL_PADDING = 32 // 16px por lado

export default function AlphabetScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [contentWidth, setContentWidth] = useState<number | null>(null)
  const [gridHeight, setGridHeight] = useState<number | null>(null)
  const { width } = useWindowDimensions()
  const [pausedLetter, setPausedLetter] = useState<string | null>(null)

  useEffect(() => {
    async function checkPausedLetter() {
      try {
        const val = await getItem('paused_letter')
        if (val) {
          setPausedLetter(val)
        }
      } catch (err) {
        console.error('[alphabet] error al chequear letra pausada:', err)
      }
    }
    checkPausedLetter()
  }, [])

  const progressQuery = useAlphabetProgress()
  const visitedLetters = new Set(progressQuery.data?.map((p) => p.letter))

  const hasMeasured = contentWidth !== null && gridHeight !== null
  const availableWidth = contentWidth ?? width
  const numColumns = getNumColumns(availableWidth)
  const numRows = Math.ceil(LSA_ALPHABET.length / numColumns)

  // Tamaño de tarjeta: el menor entre lo que cabe horizontalmente y
  // verticalmente, para que todas las letras sean visibles sin scroll.
  const cardByWidth = Math.floor((availableWidth - HORIZONTAL_PADDING - GAP * (numColumns - 1)) / numColumns)
  const cardByHeight = gridHeight != null
    ? Math.floor((gridHeight - 48 - GAP * (numRows - 1)) / numRows)
    : cardByWidth
  const cardSize = Math.min(cardByWidth, cardByHeight)

  const handleLetterPress = (letter: string) => {
    setSelectedLetter(letter)
    router.push({ pathname: '/alphabet/[letter]', params: { letter } })
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 max-w-4xl mx-auto w-full" onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
        {/* Encabezado azul con imagen nubeblanca_abc.svg */}
        <View
          className="w-full bg-[#4A90E2] items-center justify-end pb-5 relative"
          style={{ paddingTop: insets.top + 14 }}
        >
          <Image
            source={require('@/assets/images/abecedario/nubeblanca_abc.svg')}
            className="absolute top-0 bottom-0"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 120,
            }}
            contentFit="fill"
          />
          <Text className="font-nunito text-3xl font-bold text-white text-center z-10 relative mt-10">
            Abecedario
          </Text>
        </View>

        {/* Grilla con fondo blanco y esquinas superiores redondeadas con padding superior e inferior */}
        <View
          className="flex-1 bg-background rounded-t-4xl -mt-0 pt-8 pb-4"
          onLayout={(event) => setGridHeight(event.nativeEvent.layout.height)}
        >
          {hasMeasured && (
            <View
              className="flex-1 flex-row flex-wrap items-start justify-center content-center"
              style={{ paddingHorizontal: 16, gap: GAP }}
            >
              {LSA_ALPHABET.map((letter) => {
                // Estado de la letra actual: seleccionada, visitada o no visitada
                const isSelected = selectedLetter === letter
                const isVisited = visitedLetters.has(letter)

                return (
                  <Pressable
                    key={letter}
                    onPress={() => handleLetterPress(letter)}
                    accessibilityRole="button"
                    accessibilityLabel={`Letra ${letter}`}
                    accessibilityState={{ selected: isSelected }}
                    style={{ width: cardSize, height: cardSize }}
                    className={cn(
                      'items-center justify-center rounded-[20px] border-b-4 active:mt-1 active:border-b-0',
                      isSelected
                        ? 'bg-accent border-secondary'
                        : isVisited
                          // Letras visitadas: fondo azul y sombra oscura en el borde inferior
                          ? 'bg-secondary border-black/15'
                          // Letras no visitadas: fondo blanco estándar y borde gris tenue
                          : 'bg-surface border-black/5'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-nunito font-bold',
                        isSelected
                          ? 'text-secondary'
                          : isVisited
                            // Letras visitadas: texto blanco para contraste con fondo azul
                            ? 'text-white'
                            // Letras no visitadas: texto gris tenue
                            : 'text-ink/40',
                      )}
                      style={{ fontSize: cardSize * 0.36 }}
                    >
                      {letter}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>
      </View>

      <PauseModal
        visible={pausedLetter !== null}
        title="Pausa"
        message={`Pausaste la práctica de la letra ${pausedLetter}. ¿Querés continuar con ella o elegir otra?`}
        closeLabel="Continuar"
        exitLabel="Elegir otra"
        onClose={() => {
          const letterToResume = pausedLetter
          setPausedLetter(null)
          if (letterToResume) {
            router.push({ pathname: '/alphabet/[letter]', params: { letter: letterToResume } })
          }
        }}
        onExit={() => {
          deleteItem('paused_letter').catch((err) =>
            console.error('[alphabet] error eliminando letra pausada:', err)
          )
          setPausedLetter(null)
        }}
      />
    </View>
  )
}
