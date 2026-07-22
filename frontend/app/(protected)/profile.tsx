import { useEffect, useState } from 'react'
import { Alert, Image, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/src/components/common/Button'
import { TextField } from '@/src/components/common/TextField'
import { BirthDateField } from '@/src/components/features/auth/BirthDateField'
import { Select } from '@/src/components/common/Select'
import { GENDER_OPTIONS } from '@/src/constants/gender'
import { useLogout } from '@/src/hooks/features/auth/useLogout'
import { useProfile } from '@/src/hooks/features/profile/useProfile'
import { useUpdateProfile } from '@/src/hooks/features/profile/useUpdateProfile'
import { useSessionStore } from '@/src/store/sessionStore'
import { useRouter } from 'expo-router'
import { deleteAvatar, updateCredentials, uploadAvatar } from '@/src/services/profile'
import { getApiErrorMessage } from '@/src/services/http'
import { saveUser } from '@/src/lib/storage'
import { ddMmYyyyToIso, parseDdMmYyyy } from '@/src/utils/date'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="rounded-3xl border border-muted/20 bg-surface p-5 shadow-sm shadow-black/5 sm:p-6">
      <Text className="mb-4 font-nunito text-xl font-bold text-ink">{title}</Text>
      {children}
    </View>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-b border-muted/15 py-3 last:border-b-0">
      <Text className="font-nunito text-xs font-semibold text-muted">{label}</Text>
      <Text className="mt-0.5 font-nunito text-base font-bold text-ink">{value}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const logout = useLogout()
  const { data: profile, refetch } = useProfile()
  const updateProfile = useUpdateProfile()
  const user = useSessionStore((state) => state.user)
  const token = useSessionStore((state) => state.token)
  const setSession = useSessionStore((state) => state.setSession)
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingSecurity, setEditingSecurity] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<string | undefined>()
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingSecurity, setSavingSecurity] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [audio, setAudio] = useState(true)

  useEffect(() => {
    const parts = (profile?.full_name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Usuario').split(' ')
    setFirstName(parts[0] || '')
    setLastName(parts.slice(1).join(' '))
    setGender(profile?.gender || undefined)
    setBirthDate(profile?.birth_date ? profile.birth_date.split('-').reverse().join('/') : '')
    setEmail(user?.email || '')
  }, [profile?.birth_date, profile?.full_name, profile?.gender, user?.email, user?.firstName, user?.lastName])

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Usuario'

  const savePersonal = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Datos incompletos', 'Nombre y apellido son requeridos.')
      return
    }
    if (!parseDdMmYyyy(birthDate)) {
      Alert.alert('Fecha de nacimiento', 'Usá el formato DD/MM/AAAA con una fecha válida.')
      return
    }
    updateProfile.mutate(
      { full_name: `${firstName.trim()} ${lastName.trim()}`, gender, birth_date: ddMmYyyyToIso(birthDate) },
      {
        onSuccess: async () => {
          if (user && token) {
            const updatedUser = { ...user, firstName: firstName.trim(), lastName: lastName.trim() }
            await saveUser(updatedUser)
            setSession(updatedUser, token)
          }
          setEditingPersonal(false)
        },
        onError: (error) => Alert.alert('Error', getApiErrorMessage(error)),
      },
    )
  }

  const saveSecurity = async () => {
    if (!currentPassword) return Alert.alert('Contraseña actual', 'Ingresá tu contraseña actual para continuar.')
    if (newPassword && newPassword !== confirmPassword) return Alert.alert('Contraseña', 'Las contraseñas no coinciden.')
    if (newPassword && newPassword.length < 8) return Alert.alert('Contraseña', 'La nueva contraseña debe tener al menos 8 caracteres.')
    if (!newPassword && email === user?.email) return Alert.alert('Sin cambios', 'Modificá el correo o la contraseña.')

    setSavingSecurity(true)
    try {
      await updateCredentials({ currentPassword, ...(email !== user?.email ? { email } : {}), ...(newPassword ? { password: newPassword } : {}) })
      if (user && token && email !== user.email) {
        const updatedUser = { ...user, email }
        await saveUser(updatedUser)
        setSession(updatedUser, token)
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setEditingSecurity(false)
      Alert.alert('Listo', 'Tus datos de seguridad fueron actualizados.')
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error))
    } finally {
      setSavingSecurity(false)
    }
  }

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return Alert.alert('Permiso requerido', 'Permití el acceso a tus fotos para cambiar la imagen.')
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true })
    if (result.canceled || !result.assets[0]?.base64) return
    setSavingAvatar(true)
    try {
      const mime = result.assets[0].mimeType || 'image/jpeg'
      await uploadAvatar(`data:${mime};base64,${result.assets[0].base64}`)
      await refetch()
      Alert.alert('Listo', 'Tu foto fue actualizada.')
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error))
    } finally {
      setSavingAvatar(false)
    }
  }

  const removeAvatar = async () => {
    setSavingAvatar(true)
    try {
      await deleteAvatar()
      await refetch()
      Alert.alert('Listo', 'Tu foto fue eliminada.')
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error))
    } finally {
      setSavingAvatar(false)
    }
  }

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Querés cerrar sesión?')) void logout()
      return
    }

    Alert.alert('Cerrar sesión', '¿Querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void logout() },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="mx-auto w-full max-w-6xl gap-5 px-5 pb-8 pt-5 sm:px-8" showsVerticalScrollIndicator={false}>
        <View className="items-center rounded-3xl border border-muted/20 bg-surface p-6 sm:flex-row sm:items-center">
          <Pressable onPress={() => void pickAvatar()} disabled={savingAvatar} accessibilityLabel="Cambiar foto de perfil" className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-primary bg-accent/30">
            {profile?.avatar_url ? <Image source={{ uri: profile.avatar_url }} className="h-full w-full" /> : <Ionicons name="person" size={64} color="#FFFFFF" />}
            <View className="absolute bottom-1 right-1 h-8 w-8 items-center justify-center rounded-full bg-secondary"><Ionicons name="pencil" size={15} color="#FFFFFF" /></View>
          </Pressable>
          <View className="mt-3 items-center sm:ml-5 sm:mt-0 sm:items-start"><Text className="font-nunito text-3xl font-bold text-ink">{fullName}</Text><Text className="mt-1 font-nunito text-sm text-muted">{email}</Text></View>
          {profile?.avatar_url ? <Pressable onPress={() => void removeAvatar()} className="mt-3 sm:ml-auto sm:mt-0"><Text className="font-nunito text-sm font-bold text-red-600">Eliminar foto</Text></Pressable> : null}
        </View>

        <View className="gap-5 lg:flex-row"><View className="gap-5 lg:flex-1">
          <Section title="Datos Personales">
            {editingPersonal ? <View className="gap-3"><TextField label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Nombre" /><TextField label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Apellido" /><Select label={'G\u00e9nero'} options={GENDER_OPTIONS} value={gender} onChange={setGender} /><BirthDateField label="Fecha de Nacimiento" value={birthDate} onChange={setBirthDate} /><Button label="Guardar cambios" onPress={savePersonal} loading={updateProfile.isPending} /><Pressable onPress={() => setEditingPersonal(false)}><Text className="text-center font-nunito font-bold text-secondary">Cancelar</Text></Pressable></View> : <><Row label="Nombre" value={firstName} /><Row label="Apellido" value={lastName || '-'} /><Row label={'G\u00e9nero'} value={gender || '-'} /><Row label="Fecha de Nacimiento" value={birthDate || '-'} /><Pressable onPress={() => setEditingPersonal(true)} className="mt-4"><Text className="font-nunito font-bold text-secondary">Editar datos personales</Text></Pressable></>}
          </Section>
          <Section title="Datos de Seguridad">
            {editingSecurity ? <View className="gap-3"><TextField label={'Correo Electr\u00f3nico'} value={email} onChangeText={setEmail} placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" /><TextField label="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Contraseña actual" secureTextEntry /><TextField label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} placeholder="Nueva contraseña" secureTextEntry /><TextField label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar contraseña" secureTextEntry /><Button label="Guardar seguridad" onPress={() => void saveSecurity()} loading={savingSecurity} /><Pressable onPress={() => setEditingSecurity(false)}><Text className="text-center font-nunito font-bold text-secondary">Cancelar</Text></Pressable></View> : <><Row label={'Correo Electr\u00f3nico'} value={email} /><Row label={'Contrase\u00f1a'} value={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'} /><Row label={'Confirmar Contrase\u00f1a'} value={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'} /><Pressable onPress={() => setEditingSecurity(true)} className="mt-4"><Text className="font-nunito font-bold text-secondary">Editar datos de seguridad</Text></Pressable></>}
          </Section>
        </View><View className="gap-5 lg:flex-1">
          <Section title="Historico"><View className="flex-row flex-wrap gap-3"><View className="min-w-[120px] flex-1 rounded-2xl bg-accent/30 p-4"><Text className="font-nunito text-2xl font-bold text-ink">1540</Text><Text className="font-nunito text-xs text-muted">Experiencia</Text></View><View className="min-w-[120px] flex-1 rounded-2xl bg-primary/15 p-4"><Text className="font-nunito text-2xl font-bold text-ink">15</Text><Text className="font-nunito text-xs text-muted">Estrellas</Text></View><View className="min-w-[120px] flex-1 rounded-2xl bg-secondary/15 p-4"><Text className="font-nunito text-2xl font-bold text-ink">15</Text><Text className="font-nunito text-xs text-muted">Se{'\u00f1'}as</Text></View><View className="min-w-[120px] flex-1 rounded-2xl bg-orange-100 p-4"><Text className="font-nunito text-2xl font-bold text-ink">7</Text><Text className="font-nunito text-xs text-muted">Rachas</Text></View></View></Section>
          <Section title="Preferencias"><View className="flex-row items-center justify-between border-b border-muted/15 py-3"><Text className="font-nunito text-base font-semibold text-ink">Notificaciones</Text><Switch value={notifications} onValueChange={setNotifications} /></View><View className="flex-row items-center justify-between py-3"><Text className="font-nunito text-base font-semibold text-ink">Audio</Text><Switch value={audio} onValueChange={setAudio} /></View></Section>
          <Section title={'M\u00e1s Informaci\u00f3n'}><Pressable onPress={() => router.push('/about')} accessibilityRole="link"><Text className="font-nunito text-base text-ink">Acerca de Carpise{'\u00f1'}as</Text></Pressable><Pressable onPress={() => router.push('./help')} accessibilityRole="link" className="mt-3"><Text className="font-nunito text-base text-ink">Ayuda</Text></Pressable></Section>
        </View></View>
        <Button label={'Cerrar Sesi\u00f3n'} variant="white" onPress={confirmLogout} />
        <Pressable
          onPress={() => Alert.alert('Borrar Cuenta', 'Esta acci\u00f3n no se puede deshacer. \u00bfQuer\u00e9s continuar?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Borrar Cuenta', style: 'destructive', onPress: () => Alert.alert('Pr\u00f3ximamente', 'La eliminaci\u00f3n de cuenta estar\u00e1 disponible pr\u00f3ximamente.') }])}
          accessibilityRole="button"
          className="h-14 w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 web:hover:bg-red-100"
        >
          <Text className="font-nunito text-base font-bold text-red-600">Borrar Cuenta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
