import { forwardRef, useState } from 'react'
import {
  Modal,
  Platform,
  Pressable,
  Text,
  View,
  type TextInput as NativeTextInput,
  type TextInputProps,
} from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { TextField } from '@/src/components/common/TextField'
import { formatDdMmYyyy, parseDdMmYyyy } from '@/src/utils/date'

interface BirthDateFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: TextInputProps['onBlur']
  onSubmitEditing?: () => void
  error?: string
  label?: string
}

/**
 * Input de fecha de nacimiento con máscara DD/MM/AAAA + selector nativo
 * (calendario iOS/Android) o <input type="date"> en web.
 * Reutilizado por RegisterForm y CompleteProfileScreen.
 */
export const BirthDateField = forwardRef<NativeTextInput, BirthDateFieldProps>(
  ({ value, onChange, onBlur, onSubmitEditing, error, label = 'Fecha de nacimiento' }, ref) => {
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [tempDate, setTempDate] = useState(new Date())
    const [webDate, setWebDate] = useState(() => new Date().toISOString().slice(0, 10))
    const isWeb = Platform.OS === 'web'

    const getInitialDate = (current: string) => parseDdMmYyyy(current) ?? new Date()

    const formatDateValue = (date: Date) =>
      formatDdMmYyyy(
        `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`,
      )

    const formatDateFromIso = (isoValue: string) => {
      const [year, month, day] = isoValue.split('-')
      return `${day}/${month}/${year}`
    }

    const handleOpenDatePicker = () => {
      const initialDate = getInitialDate(value)
      setTempDate(initialDate)
      setWebDate(initialDate.toISOString().slice(0, 10))
      setShowDatePicker(true)
    }

    const handleCalendarChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        if (event.type === 'dismissed') {
          setShowDatePicker(false)
          return
        }

        const currentDate = selectedDate ?? tempDate
        setShowDatePicker(false)
        setTempDate(currentDate)
        return
      }

      if (selectedDate) {
        setTempDate(selectedDate)
      }
    }

    // Si el input de fecha (web) u otro elemento del modal tiene foco, hay que
    // sacárselo antes de ocultar el modal: si no, el navegador marca
    // aria-hidden sobre un ancestro con foco retenido adentro (warning de a11y).
    const closeDatePicker = () => {
      if (Platform.OS === 'web') {
        ;(document.activeElement as HTMLElement | null)?.blur?.()
      }
      setShowDatePicker(false)
    }

    const handleConfirmDate = () => {
      onChange(formatDateValue(tempDate))
      closeDatePicker()
    }

    return (
      <View className="w-full gap-1.5">
        <TextField
          ref={ref}
          label={label}
          placeholder={label}
          value={value}
          onChangeText={(text) => onChange(formatDdMmYyyy(text))}
          onBlur={onBlur}
          error={error}
          keyboardType="number-pad"
          maxLength={10}
          returnKeyType="next"
          onSubmitEditing={onSubmitEditing}
          rightElement={
            <Pressable
              onPress={handleOpenDatePicker}
              className="rounded-full bg-surface p-2"
              accessibilityRole="button"
              accessibilityLabel="Abrir calendario"
            >
              <Ionicons name="calendar-outline" size={20} color="#6F706F" />
            </Pressable>
          }
        />
        {showDatePicker && !isWeb && Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide" onRequestClose={closeDatePicker}>
            <View className="flex-1 justify-end bg-black/40">
              <View className="w-full max-w-md self-center rounded-t-3xl bg-white p-4 shadow-xl">
                <View className="flex-row items-center justify-between pb-3">
                  <Pressable onPress={closeDatePicker} className="rounded-full p-2">
                    <Text className="font-nunito text-sm font-bold text-secondary">Cancelar</Text>
                  </Pressable>
                  <Pressable onPress={handleConfirmDate} className="rounded-full p-2">
                    <Text className="font-nunito text-sm font-bold text-secondary">Confirmar</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={handleCalendarChange}
                  style={{ width: '100%' }}
                />
              </View>
            </View>
          </Modal>
        ) : null}
        {showDatePicker && !isWeb && Platform.OS === 'android' ? (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="calendar"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              handleCalendarChange(event, selectedDate)
              if (selectedDate) {
                onChange(formatDateValue(selectedDate))
              }
            }}
          />
        ) : null}
        {showDatePicker && isWeb ? (
          <Modal transparent animationType="slide" onRequestClose={closeDatePicker}>
            <View className="flex-1 justify-center bg-black/50 px-4">
              <View className="w-full max-w-md self-center overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl shadow-black/20">
                <View className="mb-4 rounded-3xl bg-secondary px-4 py-4">
                  <Text className="font-nunito text-base font-bold text-white">
                    Seleccionar fecha
                  </Text>
                </View>
                <View className="mb-5 rounded-2xl border border-muted/20 bg-surface px-4 py-4">
                  <input
                    type="date"
                    value={webDate}
                    onChange={(event) => setWebDate(event.target.value)}
                    className="w-full bg-transparent text-base font-bold text-ink outline-none"
                  />
                </View>
                <View className="flex-row justify-end gap-3">
                  <Pressable
                    onPress={closeDatePicker}
                    className="rounded-full border border-muted/20 bg-surface px-4 py-3"
                  >
                    <Text className="font-nunito text-sm font-bold text-muted">Cancelar</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      onChange(formatDateFromIso(webDate))
                      closeDatePicker()
                    }}
                    className="rounded-full bg-secondary px-4 py-3"
                  >
                    <Text className="font-nunito text-sm font-bold text-white">Confirmar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        ) : null}
      </View>
    )
  },
)

BirthDateField.displayName = 'BirthDateField'
