import { useState } from 'react'
import { Pressable, ScrollView, Text, View, Modal, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { WebView } from 'react-native-webview'

export default function LetterScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ letter?: string }>()
  const letter = Array.isArray(params.letter) ? params.letter[0] : params.letter
  const [isFavorite, setIsFavorite] = useState(false)
  const [showPractice, setShowPractice] = useState(false)

  const practiceUrl = 'https://huggingface.co/spaces/matiascodeds/lsa-fingerspelling'

  const handleOpenPractice = () => {
    if (Platform.OS === 'web') {
      window.open(practiceUrl, '_blank')
    } else {
      setShowPractice(true)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-5 pb-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.replace('/alphabet')}
            accessibilityRole="button"
            accessibilityLabel="Volver al Abecedario"
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm shadow-black/10 web:hover:bg-muted/10"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </Pressable>
          <View className="flex-1">
            <Text className="font-nunito text-2xl font-bold text-ink">Letra {letter ?? '?'}</Text>
            <Text className="font-nunito text-xs text-muted">
              {'Seña y video correspondiente.'}
            </Text>
          </View>
          <Pressable
            onPress={() => setIsFavorite(!isFavorite)}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm shadow-black/10 web:hover:bg-muted/10"
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite ? "#EF4444" : "#1F2937"} 
            />
          </Pressable>
        </View>

        {/* Content Area */}
        <View className="flex-1 items-center justify-center py-2">
          <View className="w-full flex-1 max-h-[85%] rounded-[40px] border border-muted/20 bg-surface p-2 shadow-sm relative">
            <View className="flex-1 items-center justify-center rounded-[32px] border border-dashed border-muted/40 bg-muted/10 overflow-hidden">
              <Ionicons name="videocam-outline" size={80} color="#9BA8B1" />
              <Text className="px-4 mt-4 text-center font-nunito text-sm text-muted">
                {'Aquí aparecerá el video de la seña.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Action */}
        <View className="mt-auto">
          <Button
            label="Practicar"
            onPress={handleOpenPractice}
            leftIcon={<Ionicons name="play-outline" size={20} color="#1F2937" />}
          />
        </View>
      </View>

      {/* Practice Modal (Only for Mobile) */}
      {Platform.OS !== 'web' && (
        <Modal
          visible={showPractice}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPractice(false)}
        >
          <SafeAreaView className="flex-1 bg-surface">
            <View className="h-14 flex-row items-center justify-between px-5 border-b border-black/5">
              <Text className="font-nunito text-lg font-bold text-ink">Práctica de Señas</Text>
              <Pressable 
                onPress={() => setShowPractice(false)}
                className="p-1"
              >
                <Ionicons name="close" size={28} color="#1F2937" />
              </Pressable>
            </View>
            
            <WebView 
              source={{ uri: practiceUrl }}
              className="flex-1"
              startInLoadingState
              renderLoading={() => (
                <View className="absolute inset-0 items-center justify-center bg-surface">
                  <ActivityIndicator size="large" color="#4A90E2" />
                </View>
              )}
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  )
}