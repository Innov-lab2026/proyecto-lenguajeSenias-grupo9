import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { cssInterop } from 'nativewind'

const { LinearGradient } = require('expo-linear-gradient')

const StyledGradient: React.FC<any> = (props: any) => {
  return <LinearGradient {...props} />
}

cssInterop(StyledGradient, {
  className: 'style',
})

const ACHIEVEMENTS = [
  {
    id: 'bronze',
    title: 'Copa de Bronce',
    description: '¡Completa todos los modulos para obtenerla!',
    colors: ['#ACDCFF', '#FFFFFF'] as [string, string],
    textColor: '#1F2937',
  },
  {
    id: 'silver',
    title: 'Copa de Plata',
    description: '¡Completa todos los modulos al 100% para obtenerla!',
    colors: ['#6B7280', '#D1D5DB'] as [string, string],
    textColor: '#1F2937',
  },
  {
    id: 'gold',
    title: 'Copa de Oro',
    description: '¡Completa todos los modulos al 100% sin errores para obtenerla!',
    colors: ['#F7BB18', '#FEF3C7'] as [string, string],
    textColor: '#92400E',
  },
]

export function AchievementsList() {
  return (
    <View className="mt-10 px-5">
      <View className="flex-row items-center gap-2 mb-1">
        <Text className="font-nunito text-4xl font-bold text-ink">Logros</Text>
      </View>
      <Text className="font-nunito text-xl font-bold text-ink mb-4">Modulos 1-2</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
      >
        {ACHIEVEMENTS.map((item) => (
          <AchievementCard key={item.id} {...item} />
        ))}
      </ScrollView>
    </View>
  )
}

interface AchievementCardProps {
  title: string
  description: string
  colors: [string, string]
  textColor: string
}

function AchievementCard({ title, description, colors, textColor }: AchievementCardProps) {
  return (
    <StyledGradient
      colors={colors}
      className="w-40 h-56 rounded-2xl p-4 justify-end border border-black/10 shadow-sm"
    >
      <View>
        <Text className="font-nunito text-sm font-bold mb-1" style={{ color: textColor }}>
          {title}
        </Text>
        <Text className="font-nunito text-[10px] leading-tight" style={{ color: textColor }}>
          {description}
        </Text>
      </View>
    </StyledGradient>
  )
}
