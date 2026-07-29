import { useState } from 'react'
import { Pressable, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAlphabetProgress } from '@/src/hooks/features/alphabet/useAlphabetProgress'
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
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [contentWidth, setContentWidth] = useState<number | null>(null)
  const [gridHeight, setGridHeight] = useState<number | null>(null)
  const { width } = useWindowDimensions()

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
    ? Math.floor((gridHeight - GAP * (numRows - 1)) / numRows)
    : cardByWidth
  const cardSize = Math.min(cardByWidth, cardByHeight)

  const handleLetterPress = (letter: string) => {
    setSelectedLetter(letter)
    router.push({ pathname: '/alphabet/[letter]', params: { letter } })
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary" edges={['top']}>
      <View className="flex-1 max-w-4xl mx-auto w-full" onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
        {/* Encabezado azul */}
        <View className="bg-secondary px-5 pt-6 pb-10 items-center">
          <Text className="font-nunito text-3xl font-bold text-white">Abecedario</Text>
          <Text className="font-nunito text-sm text-white/70 mt-1">
            Seleccioná una letra para ver su seña
          </Text>
        </View>

        {/* Grilla con fondo blanco y esquinas superiores redondeadas */}
        <View
          className="flex-1 bg-background rounded-t-3xl -mt-4"
          onLayout={(event) => setGridHeight(event.nativeEvent.layout.height)}
        >
          {hasMeasured && (
            <View
              className="flex-1 flex-row flex-wrap items-start justify-center content-center"
              style={{ paddingHorizontal: 16, gap: GAP }}
            >
              {LSA_ALPHABET.map((letter) => {
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
                          ? 'bg-surface border-secondary/30'
                          : 'bg-surface border-black/5'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-nunito font-bold',
                        isSelected
                          ? 'text-secondary'
                          : isVisited
                            ? 'text-secondary/70'
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
    </SafeAreaView>
  )
}
