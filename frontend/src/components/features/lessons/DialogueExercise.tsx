import { useRef, type Dispatch, type SetStateAction } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { cn } from '@/src/utils/cn'
import type { DialogueLine } from '@/src/types/lessons'
import { DraggableWord } from './DraggableWord'

interface DialogueExerciseProps {
  question?: string
  dialogue: DialogueLine[]
  options: string[]
  answers: Record<number, string>
  onAnswersChange: Dispatch<SetStateAction<Record<number, string>>>
}

interface WindowRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Isla 5: completar una conversación arrastrando palabras a los blancos.
 *
 * La detección de "dónde cayó" usa coordenadas ABSOLUTAS de pantalla
 * (measureInWindow para los blancos, absoluteX/absoluteY del gesto para el
 * punto de soltado) — es la única forma robusta acá, porque el banco de
 * palabras y el área de diálogo (que además scrollea) NO comparten un mismo
 * padre de coordenadas locales.
 *
 * Cada blanco se re-mide en su propio onLayout, así que si completar un
 * blanco cambia el ancho de la línea (y reordena los siguientes), las
 * medidas quedan solas al día — no hace falta re-medir todo a mano.
 */
export function DialogueExercise({
  question,
  dialogue,
  options,
  answers,
  onAnswersChange,
}: DialogueExerciseProps) {
  const blankRefs = useRef<Record<number, View | null>>({})
  const blankRects = useRef<Record<number, WindowRect>>({})

  const measureBlank = (globalIdx: number) => {
    blankRefs.current[globalIdx]?.measureInWindow((x, y, width, height) => {
      blankRects.current[globalIdx] = { x, y, width, height }
    })
  }

  const handleDrop = (word: string, absoluteX: number, absoluteY: number) => {
    const target = Object.entries(blankRects.current).find(([, rect]) =>
      absoluteX >= rect.x &&
      absoluteX <= rect.x + rect.width &&
      absoluteY >= rect.y &&
      absoluteY <= rect.y + rect.height,
    )
    if (!target) return

    const globalIdx = Number(target[0])
    onAnswersChange((prev) => ({ ...prev, [globalIdx]: word }))
  }

  const clearBlank = (globalIdx: number) => {
    onAnswersChange((prev) => {
      if (!(globalIdx in prev)) return prev
      const next = { ...prev }
      delete next[globalIdx]
      return next
    })
  }

  return (
    <View className="flex-1">
      <Text className="font-nunito text-sm font-bold text-ink text-center mb-2">{question}</Text>

      {/* Dialogue Area */}
      <View className="flex-1 bg-surface rounded-2xl border-2 border-black/5 p-3 mb-3">
        <ScrollView showsVerticalScrollIndicator={false}>
          {dialogue.map((line, lineIdx) => {
            const parts = line.text.split('[blank]')
            let blankCounter = 0
            const previousLinesBlanks = dialogue
              .slice(0, lineIdx)
              .reduce((acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0), 0)

            return (
              <View key={lineIdx} className="mb-2">
                <Text className="font-nunito text-[10px] font-bold text-secondary mb-0.5">{line.speaker}:</Text>
                <View className="flex-row flex-wrap items-center">
                  {parts.map((part, partIdx) => (
                    <View key={partIdx} className="flex-row items-center flex-wrap">
                      <Text className="font-nunito text-xs text-ink">{part}</Text>
                      {partIdx < parts.length - 1 &&
                        (() => {
                          const globalIdx = previousLinesBlanks + blankCounter
                          blankCounter++
                          return (
                            <Pressable
                              ref={(el) => {
                                blankRefs.current[globalIdx] = el
                              }}
                              onLayout={() => measureBlank(globalIdx)}
                              onPress={() => clearBlank(globalIdx)}
                              className={cn(
                                'mx-1 min-w-[50px] h-5 rounded-md border-b-2 items-center justify-center px-1',
                                answers[globalIdx] ? 'bg-accent/20 border-secondary' : 'bg-slate-100 border-slate-300',
                              )}
                            >
                              <Text className="font-nunito text-[10px] font-bold text-ink">
                                {answers[globalIdx] || ''}
                              </Text>
                            </Pressable>
                          )
                        })()}
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>

      {/* Word Bank */}
      <View className="flex-row flex-wrap gap-2 justify-center mb-1">
        {options.map((option) => {
          const isUsed = Object.values(answers).includes(option)
          return <DraggableWord key={option} word={option} disabled={isUsed} onDrop={handleDrop} />
        })}
      </View>
    </View>
  )
}
