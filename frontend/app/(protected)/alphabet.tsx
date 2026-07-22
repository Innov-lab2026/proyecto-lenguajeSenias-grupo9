import { useEffect, useState } from 'react'
import { FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { cn } from '@/src/utils/cn'

const LSA_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
]

function getNumColumns(width: number): number {
  if (width >= 1024) return 8
  if (width >= 600) return 6
  return 4
}

const visitedLettersCache: string[] = []

export default function AlphabetScreen() {
  const router = useRouter()
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [visitedLetters, setVisitedLetters] = useState<string[]>(() => [...visitedLettersCache])
  const [contentWidth, setContentWidth] = useState<number | null>(null)
  const { width } = useWindowDimensions()

  const hasMeasuredWidth = contentWidth !== null
  const availableWidth = contentWidth ?? width
  const numColumns = getNumColumns(availableWidth)
  // Padding total horizontal: 20px a cada lado + gaps entre columnas
  const HORIZONTAL_PADDING = 40
  const GAP = 12
  const cardSize = Math.floor((availableWidth - HORIZONTAL_PADDING - GAP * (numColumns - 1)) / numColumns)

  const handleLetterPress = (letter: string) => {
    setSelectedLetter(letter)
    setVisitedLetters((current) => {
      if (current.includes(letter)) return current
      const next = [...current, letter]
      visitedLettersCache.splice(0, visitedLettersCache.length, ...next)
      return next
    })
    router.push({ pathname: '/alphabet/[letter]', params: { letter } })
  }

  useEffect(() => {
    setVisitedLetters([...visitedLettersCache])
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 max-w-4xl mx-auto w-full" onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
        {/* Encabezado */}
        <View className="px-5 pt-8 pb-6">
          <Text className="font-nunito text-4xl font-bold text-ink">Abecedario</Text>
          <Text className="font-nunito text-base text-muted mt-2">
            Seleccioná una letra para ver su seña
          </Text>
        </View>

        {/* Grilla de letras */}
        {hasMeasuredWidth && (
          <FlatList
            data={LSA_ALPHABET}
            keyExtractor={(item) => item}
            numColumns={numColumns}
            key={numColumns} // fuerza re-render al cambiar columnas
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
            style={{ flex: 1 }}
            renderItem={({ item: letter }) => {
              const isSelected = selectedLetter === letter
              const isVisited = visitedLetters.includes(letter)

              return (
                <Pressable
                  onPress={() => handleLetterPress(letter)}
                  accessibilityRole="button"
                  accessibilityLabel={`Letra ${letter}`}
                  accessibilityState={{ selected: isSelected }}
                  style={{ width: cardSize, height: cardSize }}
                  className={cn(
                    'items-center justify-center rounded-[24px] border-b-4 active:mt-1 active:border-b-0',
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
                    style={{ fontSize: cardSize * 0.38 }}
                  >
                    {letter}
                  </Text>
                </Pressable>
              )
            }}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

