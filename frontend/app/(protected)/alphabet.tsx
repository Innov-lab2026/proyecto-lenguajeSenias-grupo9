import { useState } from 'react'
import { Alert, FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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

export default function AlphabetScreen() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [contentWidth, setContentWidth] = useState<number | null>(null)
  const { width } = useWindowDimensions()

  const availableWidth = contentWidth ?? width
  const numColumns = getNumColumns(availableWidth)
  // Padding total horizontal: 16px a cada lado + gaps entre columnas
  const HORIZONTAL_PADDING = 32
  const GAP = 10
  const cardSize = Math.floor((availableWidth - HORIZONTAL_PADDING - GAP * (numColumns - 1)) / numColumns)

  const handleLetterPress = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter)
    // TODO: abrir video de la letra en LSA
    Alert.alert(`Seña: ${letter}`, 'Próximamente se mostrará el video de esta seña en LSA.')
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1" onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
        {/* Encabezado */}
        <View className="px-4 pt-5 pb-3">
          <Text className="font-nunito text-2xl font-bold text-ink">Abecedario LSA</Text>
          <Text className="font-nunito text-sm text-muted mt-0.5">
            Seleccioná una letra para ver su seña
          </Text>
        </View>

        {/* Grilla de letras */}
        <FlatList
          data={LSA_ALPHABET}
          keyExtractor={(item) => item}
          numColumns={numColumns}
          key={numColumns} // fuerza re-render al cambiar columnas
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          style={{ flex: 1 }}
          renderItem={({ item: letter }) => {
            const isSelected = selectedLetter === letter

            return (
              <Pressable
                onPress={() => handleLetterPress(letter)}
                accessibilityRole="button"
                accessibilityLabel={`Letra ${letter}`}
                accessibilityState={{ selected: isSelected }}
                style={{ width: cardSize, height: cardSize }}
                className={cn(
                  'items-center justify-center rounded-2xl',
                  isSelected
                    ? 'bg-accent border-2 border-secondary'
                    : 'bg-muted/15 border-2 border-transparent'
                )}
              >
                <Text
                  className={cn(
                    'font-nunito font-bold',
                    isSelected ? 'text-secondary' : 'text-ink/60',
                  )}
                  style={{ fontSize: cardSize * 0.38 }}
                >
                  {letter}
                </Text>
              </Pressable>
            )
          }}
        />
      </View>
    </SafeAreaView>
  )
}

