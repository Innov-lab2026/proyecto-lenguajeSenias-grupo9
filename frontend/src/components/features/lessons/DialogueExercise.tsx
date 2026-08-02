import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
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
 * Completar un blanco cambia el ancho de esa línea y puede empujar hacia
 * abajo las líneas siguientes — mueve a los demás blancos de posición SIN
 * cambiarles el tamaño. En React Native Web, onLayout está implementado con
 * ResizeObserver, que sólo detecta cambios de tamaño, no de posición: el
 * onLayout individual de esos blancos nunca vuelve a dispararse, sus
 * coordenadas quedan viejas, y soltar ahí no encuentra ningún blanco (el
 * effect de abajo, atado a `answers`, re-mide todos después de cada cambio).
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

  useEffect(() => {
    Object.keys(blankRefs.current).forEach((key) => measureBlank(Number(key)))
  }, [answers])

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

  const handlePressWord = (word: string) => {
    const totalBlanksCount = dialogue.reduce(
      (acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0),
      0
    )
    let firstEmptyIdx = -1
    for (let i = 0; i < totalBlanksCount; i++) {
      if (!answers[i]) {
        firstEmptyIdx = i
        break
      }
    }
    if (firstEmptyIdx !== -1) {
      onAnswersChange((prev) => ({ ...prev, [firstEmptyIdx]: word }))
    }
  }

  // Obtener los nombres de speakers únicos para diferenciar alineación y colores
  const uniqueSpeakers = Array.from(new Set(dialogue.map((d) => d.speaker.toLowerCase())))

  return (
    <View className="flex-1">
      <Text className="font-nunito text-xl font-bold text-ink text-center py-4 px-2">{question}</Text>

      {/* Dialogue Area */}
      <View className="flex-1 bg-surface rounded-2xl border-2 border-black/5 p-3 mb-3">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {dialogue.map((line, lineIdx) => {
            const parts = line.text.split('[blank]')
            let blankCounter = 0
            const previousLinesBlanks = dialogue
              .slice(0, lineIdx)
              .reduce((acc, l) => acc + (l.text.match(/\[blank\]/g)?.length || 0), 0)

            const speakerIdx = uniqueSpeakers.indexOf(line.speaker.toLowerCase())
            const isFirstSpeaker = speakerIdx === 0

            return (
              <View
                key={lineIdx}
                className={cn(
                  "mb-3 p-2.5 rounded-2xl max-w-[85%]",
                  isFirstSpeaker
                    ? "bg-[#EAF8FF] border border-[#BEE3F8] self-start items-start"
                    : "bg-orange-50 border border-[#FFEBC2] self-end items-start"
                )}
              >
                <Text
                  className={cn(
                    "font-nunito text-xs font-bold mb-1",
                    isFirstSpeaker ? "text-secondary" : "text-[#D97706]"
                  )}
                >
                  {line.speaker}
                </Text>
                <View className="flex-row items-center flex-wrap gap-x-1 gap-y-1">
                  {parts.map((part, partIdx) => (
                    <View key={partIdx} className="flex-row items-center flex-wrap">
                      {part ? <Text className="font-nunito text-sm md:text-base text-ink">{part}</Text> : null}
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
                                'mx-1 min-w-[64px] h-7 rounded-md border-b-2 items-center justify-center px-1.5',
                                answers[globalIdx] ? 'bg-accent/20 border-secondary' : 'bg-slate-100 border-slate-300',
                              )}
                            >
                              <Text className="font-nunito text-sm md:text-base font-bold text-ink">
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
          return (
            <DraggableWord
              key={option}
              word={option}
              disabled={isUsed}
              onDrop={handleDrop}
              onPress={handlePressWord}
            />
          )
        })}
      </View>
    </View>
  )
}
