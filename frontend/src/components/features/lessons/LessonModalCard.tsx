import type { ReactNode } from 'react'
import { Modal, View } from 'react-native'
import { cn } from '@/src/utils/cn'

interface LessonModalCardProps {
  visible: boolean
  children: ReactNode
  /** Sobrescribe el redondeado/padding por defecto (rounded-[32px] p-6). */
  className?: string
}

/** Overlay + card centrado y acotado (max-w-md) para los modales de la lección. */
export function LessonModalCard({ visible, children, className }: LessonModalCardProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className={cn('w-full max-w-md rounded-[32px] bg-surface p-6', className)}>{children}</View>
      </View>
    </Modal>
  )
}
