import { useState } from 'react'
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/src/schemas/auth'
import { Button } from '@/src/components/common/Button'
import { TextField } from '@/src/components/common/TextField'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const submit = handleSubmit(() => {
    setInfoMessage(
      'Si el email está registrado, recibirás un correo con instrucciones para recuperar tu contraseña.',
    )
  })

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-5 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-sm shadow-secondary/10">
            <View className="bg-secondary px-6 py-6 sm:px-8 sm:py-8">
              <Text className="font-nunito text-3xl font-bold text-white">Olvidaste tu contraseña?</Text>
              <Text className="mt-2 text-sm font-normal leading-relaxed text-white/90">
                Ingresa tu correo para que te enviemos las instrucciones de recuperación.
              </Text>
            </View>

            <View className="bg-accent px-5 py-6 sm:px-6 sm:py-8">
              <View className="rounded-[2rem] bg-white p-5 shadow-sm shadow-secondary/10 sm:p-6">
                <View className="w-full gap-4">
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
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
                        returnKeyType="go"
                        onSubmitEditing={submit}
                        submitBehavior="submit"
                      />
                    )}
                  />

                  {infoMessage ? (
                    <Text className="mt-2 rounded-xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-center font-nunito text-sm font-semibold text-secondary">
                      {infoMessage}
                    </Text>
                  ) : null}

                  <Button label="Recuperar Contraseña" onPress={submit} className="mt-4" />

                  <Pressable onPress={() => router.push('/login')} className="mt-4 rounded-xl bg-surface px-4 py-3">
                    <Text className="text-center font-nunito text-sm font-bold text-secondary">Volver a iniciar sesión</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
