import { useRef, useState } from 'react'
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { TextInput as NativeTextInput } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterValues } from '@/src/schemas/auth'
import { GENDER_VALUES, type Gender } from '@/src/types/auth'
import { formatDdMmYyyy, parseDdMmYyyy } from '@/src/utils/date'
import { TextField } from '@/src/components/common/TextField'
import { Button } from '@/src/components/common/Button'
import { cn } from '@/src/utils/cn'

interface RegisterFormProps {
  onSubmit: (values: RegisterValues) => void
  submitting?: boolean
  /** Mensaje de error del backend a mostrar sobre el CTA. */
  serverError?: string | null
}

const GENDER_LABELS: Record<Gender, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
  prefiero_no_decir: 'Prefiero no decir',
}

function GenderField({
  value,
  onChange,
  error,
}: {
  value?: Gender
  onChange: (gender: Gender) => void
  error?: string
}) {
  return (
    <View className="w-full gap-1.5">
      <Text className="font-nunito text-xs font-bold uppercase tracking-wide text-muted">
        Género
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center gap-2 py-1"
      >
        {GENDER_VALUES.map((option) => {
          const selected = value === option
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className={cn(
                'rounded-full border px-4 py-2.5 shadow-sm',
                selected
                  ? 'border-secondary bg-secondary'
                  : 'border-muted/20 bg-white',
              )}
            >
              <Text
                className={cn(
                  'font-nunito text-sm font-bold',
                  selected ? 'text-white' : 'text-muted',
                )}
              >
                {GENDER_LABELS[option]}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
      {error ? <Text className="font-nunito text-xs font-bold text-red-500">{error}</Text> : null}
    </View>
  )
}

export function RegisterForm({ onSubmit, submitting = false, serverError }: RegisterFormProps) {
  const lastNameRef = useRef<NativeTextInput>(null)
  const birthDateRef = useRef<NativeTextInput>(null)
  const emailRef = useRef<NativeTextInput>(null)
  const passwordRef = useRef<NativeTextInput>(null)
  const confirmPasswordRef = useRef<NativeTextInput>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: undefined,
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDate, setTempDate] = useState(new Date())
  const [webDate, setWebDate] = useState(() => new Date().toISOString().slice(0, 10))
  const isWeb = Platform.OS === 'web'

  const submit = handleSubmit(onSubmit)

  const getInitialDate = (value: string) => parseDdMmYyyy(value) ?? new Date()

  const formatDateValue = (date: Date) =>
    formatDdMmYyyy(
      `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`,
    )

  const formatDateFromIso = (value: string) => {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }

  const handleOpenDatePicker = (value: string) => {
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

  const handleConfirmDate = (onChange: (value: string) => void) => {
    onChange(formatDateValue(tempDate))
    setShowDatePicker(false)
  }

  return (
    <View className="w-full">
      <View className="overflow-hidden rounded-[2rem] bg-white shadow-sm shadow-secondary/10">
        <View className="bg-secondary px-5 py-5 sm:px-6 sm:py-6">
          <Text className="font-nunito text-3xl font-bold text-white">Crear Cuenta</Text>
          <Text className="mt-2 text-sm font-normal leading-relaxed text-white/90">
            Empieza tu viaje con Carpiseñas y aprende LSA desde hoy.
          </Text>
        </View>

        <View className="bg-accent px-5 py-6 sm:px-6 sm:py-8">
          <View className="rounded-[2rem] bg-white p-5 shadow-sm shadow-secondary/10 sm:p-6">
            <View className="w-full gap-4">
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="Nombre"
                    placeholder="Tu nombre"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                    autoComplete="given-name"
                    textContentType="givenName"
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    submitBehavior="submit"
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    ref={lastNameRef}
                    label="Apellido"
                    placeholder="Tu apellido"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.lastName?.message}
                    autoComplete="family-name"
                    textContentType="familyName"
                    returnKeyType="next"
                    onSubmitEditing={() => birthDateRef.current?.focus()}
                    submitBehavior="submit"
                  />
                )}
              />

              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="w-full gap-1.5">
                    <TextField
                      ref={birthDateRef}
                      label="Fecha de nacimiento"
                      placeholder="DD/MM/AAAA"
                      value={value}
                      onChangeText={(text) => onChange(formatDdMmYyyy(text))}
                      onBlur={onBlur}
                      error={errors.birthDate?.message}
                      keyboardType="number-pad"
                      maxLength={10}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                      rightElement={
                        <Pressable
                          onPress={() => handleOpenDatePicker(value)}
                          className="rounded-full bg-surface p-2"
                          accessibilityRole="button"
                          accessibilityLabel="Abrir calendario"
                        >
                          <Ionicons name="calendar-outline" size={20} color="#6F706F" />
                        </Pressable>
                      }
                    />
                    {showDatePicker && !isWeb && Platform.OS === 'ios' ? (
                      <Modal transparent animationType="slide">
                        <View className="flex-1 justify-end bg-black/40">
                          <View className="rounded-t-3xl bg-white p-4 shadow-xl">
                            <View className="flex-row items-center justify-between pb-3">
                              <Pressable onPress={() => setShowDatePicker(false)} className="rounded-full p-2">
                                <Text className="font-nunito text-sm font-bold text-secondary">Cancelar</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => handleConfirmDate(onChange)}
                                className="rounded-full p-2"
                              >
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
                      <Modal transparent animationType="slide">
                        <View className="flex-1 justify-center bg-black/50 px-4">
                          <View className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl shadow-black/20">
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
                                onPress={() => setShowDatePicker(false)}
                                className="rounded-full border border-muted/20 bg-surface px-4 py-3"
                              >
                                <Text className="font-nunito text-sm font-bold text-muted">Cancelar</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  onChange(formatDateFromIso(webDate))
                                  setShowDatePicker(false)
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
                )}
              />

              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <GenderField value={value} onChange={onChange} error={errors.gender?.message} />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    ref={emailRef}
                    label="Correo electrónico"
                    placeholder="ejemplo@correo.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    submitBehavior="submit"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    ref={passwordRef}
                    label="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    ref={confirmPasswordRef}
                    label="Confirmar contraseña"
                    placeholder="Repite tu contraseña"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                  />
                )}
              />
            </View>

            {serverError ? (
              <Text className="mt-3 text-center font-nunito text-sm font-bold text-red-500">
                {serverError}
              </Text>
            ) : null}

            <Button label="Crear Cuenta" onPress={submit} loading={submitting} className="mt-5" />
          </View>
        </View>
      </View>
    </View>
  )
}
