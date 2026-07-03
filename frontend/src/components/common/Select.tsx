import { useState } from 'react'
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/src/utils/cn'

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label: string
  value?: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  searchable?: boolean
  searchPlaceholder?: string
}

// El input de búsqueda no debe mostrar el outline nativo del navegador (web).
const webNoOutline =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : undefined

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * Desplegable reutilizable (Modal + lista), con buscador opcional.
 * Mismo look que TextField. Usado por género (sin buscador) y país (con buscador).
 */
export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccioná una opción',
  error,
  searchable = false,
  searchPlaceholder = 'Buscar...',
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((option) => option.value === value)
  const filtered =
    searchable && query.trim() !== ''
      ? options.filter((option) => normalize(option.label).includes(normalize(query)))
      : options

  const close = () => {
    // Si el buscador (u otro elemento del modal) tiene foco, hay que sacárselo
    // antes de ocultar el modal: si no, el navegador marca aria-hidden sobre
    // un ancestro con foco retenido adentro (warning de accesibilidad).
    if (Platform.OS === 'web') {
      ;(document.activeElement as HTMLElement | null)?.blur?.()
    }
    setQuery('')
    setOpen(false)
  }

  const handleSelect = (next: string) => {
    onChange(next)
    close()
  }

  return (
    <View className="w-full gap-1.5">
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={cn(
          'h-14 w-full flex-row items-center justify-between rounded-full border bg-surface px-5 shadow-sm shadow-black/5',
          error ? 'border-red-400' : 'border-transparent',
        )}
      >
        <Text
          className={cn(
            'font-nunito text-base font-bold',
            selected ? 'text-ink' : 'text-muted',
          )}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6F706F" />
      </Pressable>

      {error ? (
        <Text className="px-2 font-nunito text-xs font-bold text-red-500">{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View className="flex-1 justify-center px-6">
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            className="absolute inset-0 bg-black/50"
          />

          <View className="w-full max-w-md max-h-[70%] self-center overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/20">
            <View className="flex-row items-center justify-between bg-secondary px-5 py-4">
              <Text className="font-nunito text-base font-bold text-white">{label}</Text>
              <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={8}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            {searchable ? (
              <View className="flex-row items-center gap-2 border-b border-muted/20 px-4 py-3">
                <Ionicons name="search" size={18} color="#6F706F" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#6F706F"
                  autoCapitalize="none"
                  className="flex-1 font-nunito text-base font-bold text-ink"
                  style={webNoOutline}
                />
              </View>
            ) : null}

            <ScrollView keyboardShouldPersistTaps="handled">
              {filtered.length === 0 ? (
                <Text className="px-5 py-6 text-center font-nunito text-sm font-bold text-muted">
                  Sin resultados
                </Text>
              ) : (
                filtered.map((option) => {
                  const isSelected = option.value === value
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      accessibilityRole="menuitem"
                      accessibilityState={{ selected: isSelected }}
                      className={cn(
                        'flex-row items-center justify-between px-5 py-3.5',
                        isSelected ? 'bg-accent' : 'bg-white',
                      )}
                    >
                      <Text
                        className={cn(
                          'font-nunito text-base font-bold',
                          isSelected ? 'text-secondary' : 'text-ink',
                        )}
                      >
                        {option.label}
                      </Text>
                      {isSelected ? <Ionicons name="checkmark" size={20} color="#4A90E2" /> : null}
                    </Pressable>
                  )
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}
