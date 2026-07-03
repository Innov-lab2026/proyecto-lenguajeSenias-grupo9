import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { completeProfileSchema, type CompleteProfileValues } from '@/src/schemas/profile'
import { GENDER_API_VALUE } from '@/src/types/auth'
import { GENDER_OPTIONS } from '@/src/constants/gender'
import { COUNTRY_OPTIONS } from '@/src/constants/countries'
import { ddMmYyyyToIso } from '@/src/utils/date'
import { AuthShell } from '@/src/components/features/auth/AuthShell'
import { BirthDateField } from '@/src/components/features/auth/BirthDateField'
import { Select } from '@/src/components/common/Select'
import { Button } from '@/src/components/common/Button'
import { useUpdateProfile } from '@/src/hooks/features/profile/useUpdateProfile'
import { useLogout } from '@/src/hooks/features/auth/useLogout'
import { getApiErrorMessage } from '@/src/services/http'

const ILLUSTRATION_SIZE = 176

function CarpiIllustration() {
  return (
    <View
      className="relative -mb-10 items-center"
      style={{ width: ILLUSTRATION_SIZE, height: ILLUSTRATION_SIZE }}
    >
      <Image
        source={require('@/assets/images/auth/capi-body.webp')}
        style={{ width: ILLUSTRATION_SIZE, height: ILLUSTRATION_SIZE }}
        contentFit="contain"
      />
      {/* Solapa el borde header/panel; posición aproximada, puede necesitar ajuste visual fino. */}
      <Image
        source={require('@/assets/images/auth/capi-hand.webp')}
        style={{ width: 48, height: 48, position: 'absolute', bottom: -12, left: 4 }}
        contentFit="contain"
      />
    </View>
  )
}

/**
 * Paso obligatorio para cuentas que entraron por Google: completa país,
 * género y fecha de nacimiento (Google no los provee). Se muestra a pantalla
 * completa desde el gate en app/(protected)/_layout.tsx hasta que el perfil
 * quede completo (la mutación invalida ['profile'] y el gate deja pasar).
 */
export function CompleteProfileScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { birthDate: '', gender: undefined, country: undefined },
  })

  const updateProfile = useUpdateProfile()
  const logout = useLogout()

  const submit = handleSubmit((values) => {
    updateProfile.mutate({
      birth_date: ddMmYyyyToIso(values.birthDate),
      gender: GENDER_API_VALUE[values.gender],
      country: values.country,
    })
  })

  const serverError = updateProfile.error ? getApiErrorMessage(updateProfile.error) : null

  return (
    <AuthShell eyebrow="Regístrate en" title="CarpiSeñas" headerContent={<CarpiIllustration />}>
      <Text className="text-center font-nunito text-lg font-bold text-ink">
        ¡Gracias por continuar con Google!
      </Text>
      <Text className="-mt-2 text-center font-nunito text-sm font-normal text-muted">
        Necesitamos algunos datos extra para completar tu registro.
      </Text>

      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <Select
            label="Género"
            placeholder="Género"
            options={GENDER_OPTIONS}
            value={value}
            onChange={onChange}
            error={errors.gender?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="birthDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <BirthDateField
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.birthDate?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, value } }) => (
          <Select
            label="País"
            placeholder="País"
            options={COUNTRY_OPTIONS}
            value={value}
            onChange={onChange}
            error={errors.country?.message}
            searchable
            searchPlaceholder="Buscar país..."
          />
        )}
      />

      {serverError ? (
        <Text className="text-center font-nunito text-sm font-bold text-red-500">{serverError}</Text>
      ) : null}

      <Button label="Continuar" onPress={submit} loading={updateProfile.isPending} className="mt-1" />

      <Pressable onPress={logout} accessibilityRole="link" className="items-center pt-1">
        <Text className="font-nunito text-sm font-bold text-secondary">Cerrar sesión</Text>
      </Pressable>
    </AuthShell>
  )
}
