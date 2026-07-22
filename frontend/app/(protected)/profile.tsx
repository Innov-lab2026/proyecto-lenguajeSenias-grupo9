import { useEffect, useState } from "react"
import { Alert, Image, Platform, Pressable, ScrollView, Switch, Text, View } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { Button } from "@/src/components/common/Button"
import { TextField } from "@/src/components/common/TextField"
import { BirthDateField } from "@/src/components/features/auth/BirthDateField"
import { Select } from "@/src/components/common/Select"
import { GENDER_OPTIONS } from "@/src/constants/gender"
import { useLogout } from "@/src/hooks/features/auth/useLogout"
import { useProfile } from "@/src/hooks/features/profile/useProfile"
import { useUpdateProfile } from "@/src/hooks/features/profile/useUpdateProfile"
import { useSessionStore } from "@/src/store/sessionStore"
import { useRouter } from "expo-router"
import { deleteAvatar, updateCredentials, uploadAvatar } from "@/src/services/profile"
import { getApiErrorMessage } from "@/src/services/http"
import { saveUser } from "@/src/lib/storage"
import { ddMmYyyyToIso, parseDdMmYyyy } from "@/src/utils/date"

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
  
  const insets = useSafeAreaInsets()

  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingSecurity, setEditingSecurity] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState<string | undefined>()
  const [birthDate, setBirthDate] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingSecurity, setSavingSecurity] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [audio, setAudio] = useState(true)

  useEffect(() => {
    const parts = (profile?.full_name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Usuario").split(" ")
    setFirstName(parts[0] || "")
    setLastName(parts.slice(1).join(" "))
    setGender(profile?.gender || undefined)
    setBirthDate(profile?.birth_date ? profile.birth_date.split("-").reverse().join("/") : "")
    setEmail(user?.email || "")
  }, [profile?.birth_date, profile?.full_name, profile?.gender, user?.email, user?.firstName, user?.lastName])

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Usuario"

  const savePersonal = async () => {
    if (!firstName.trim()) return Alert.alert("Error", "El nombre es obligatorio")
    
    try {
      const birthDateIso = birthDate ? birthDate.split("/").reverse().join("-") : null
      await updateProfile.mutateAsync({
        full_name: fullName,
        gender,
        birth_date: birthDateIso
      })
      setEditingPersonal(false)
      Alert.alert("Listo", "Perfil actualizado correctamente")
    } catch (error) { 
      Alert.alert("Error", getApiErrorMessage(error))
    }
  }

  const saveSecurity = async () => {
    if (newPassword && newPassword !== confirmPassword) return Alert.alert("Error", "As senhas não coincidem.")
    if (newPassword && newPassword.length < 8) return Alert.alert("Contraseña", "La nueva contraseña debe tener al menos 8 caracteres.")
    if (!newPassword && email === user?.email) return Alert.alert("Sin cambios", "Modificá el correo o la contraseña.")

    setSavingSecurity(true)
    try {
      await updateCredentials({ currentPassword, ...(email !== user?.email ? { email } : {}), ...(newPassword ? { password: newPassword } : {}) })
      if (user && token && email !== user.email) {
        const updatedUser = { ...user, email }
        await saveUser(updatedUser)
        setSession(updatedUser, token)
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setEditingSecurity(false)
      Alert.alert("Listo", "Tus datos de seguridad fueron actualizados.")
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error))
    } finally {
      setSavingSecurity(false)
    }
  }

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return Alert.alert("Permiso requerido", "Permití el acceso a tus fotos para cambiar la imagen.")
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true })
    if (result.canceled || !result.assets[0]?.base64) return
    setSavingAvatar(true)
    try {
      const mime = result.assets[0].mimeType || "image/jpeg"
      await uploadAvatar(`data:${mime};base64,${result.assets[0].base64}`)
      await refetch()
      Alert.alert("Listo", "Tu foto fue actualizada.")
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error))
    } finally {
      setSavingAvatar(false)
    }
  }

  const removeAvatar = async () => {
    setSavingAvatar(true)
    try {
      await deleteAvatar()
      await refetch()
      Alert.alert("Listo", "Tu foto fue eliminada.")
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error))
    } finally {
      setSavingAvatar(false)
    }
  }

  const confirmLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("¿Querés cerrar sesión?")) void logout()
      return
    }

    Alert.alert("Cerrar sesión", "¿Querés cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => void logout() },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="mx-auto w-full max-w-4xl gap-5 px-5 pb-8 pt-5 sm:px-8" showsVerticalScrollIndicator={false}>
          <View className="items-center rounded-3xl border border-muted/20 bg-surface p-6 sm:flex-row sm:items-center">
            <View className="relative">
              <View className="w-28 h-28 rounded-full bg-surface border-4 border-accent items-center justify-center overflow-hidden shadow-sm">
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={60} color="#D1D5DB" />
                )}
              </View>
              <Pressable 
                className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full items-center justify-center border-4 border-background"
                onPress={() => void pickAvatar()}
                disabled={savingAvatar}
              >
                <Ionicons name="camera" size={20} color="white" />
              </Pressable>
            </View>
            <View className="mt-3 items-center sm:ml-5 sm:mt-0 sm:items-start">
              <Text className="font-nunito text-3xl font-bold text-ink">{fullName}</Text>
              <View className="bg-secondary/10 px-4 py-1 rounded-full mt-2">
                <Text className="font-nunito text-sm font-bold text-secondary">Nivel 1 • Principiante</Text>
              </View>
            </View>
            {profile?.avatar_url && (
              <Pressable onPress={() => void removeAvatar()} className="mt-3 sm:ml-auto sm:mt-0">
                <Text className="font-nunito text-sm font-bold text-red-600">Eliminar foto</Text>
              </Pressable>
            )}
          </View>

          <View className="gap-6 mt-5 lg:flex-row">
            <View className="gap-6 lg:flex-1">
              <Section title="Información Personal">
                {editingPersonal ? (
                  <View className="gap-4">
                    <TextField label="Nombre" value={firstName} onChangeText={setFirstName} />
                    <TextField label="Apellido" value={lastName} onChangeText={setLastName} />
                    <Select 
                      label="Género" 
                      options={GENDER_OPTIONS} 
                      value={gender} 
                      onValueChange={setGender} 
                    />
                    <BirthDateField value={birthDate} onChangeText={setBirthDate} />
                    <View className="flex-row gap-3 mt-2">
                      <Button 
                        label="Cancelar" 
                        variant="ghost" 
                        onPress={() => setEditingPersonal(false)} 
                        className="flex-1"
                      />
                      <Button 
                        label="Guardar" 
                        onPress={savePersonal} 
                        className="flex-1"
                        loading={updateProfile.isPending}
                      />
                    </View>
                  </View>
                ) : (
                  <View>
                    <Row label="NOMBRE Y APELLIDO" value={fullName} />
                    <Row label="GÉNERO" value={gender || "No especificado"} />
                    <Row label="FECHA DE NACIMIENTO" value={birthDate || "No especificada"} />
                    <Button 
                      label="Editar información" 
                      variant="ghost" 
                      onPress={() => setEditingPersonal(true)} 
                      className="mt-4"
                    />
                  </View>
                )}
              </Section>

              <Section title="Datos de Seguridad">
                {editingSecurity ? (
                  <View className="gap-4">
                    <TextField label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                    <TextField label="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
                    <TextField label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                    <TextField label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                    <View className="flex-row gap-3 mt-2">
                      <Button 
                        label="Cancelar" 
                        variant="ghost" 
                        onPress={() => setEditingSecurity(false)} 
                        className="flex-1"
                      />
                      <Button 
                        label="Guardar" 
                        onPress={saveSecurity} 
                        className="flex-1"
                        loading={savingSecurity}
                      />
                    </View>
                  </View>
                ) : (
                  <View>
                    <Row label="CORREO ELECTRÓNICO" value={email} />
                    <Row label="CONTRASEÑA" value="••••••••" />
                    <Button 
                      label="Editar seguridad" 
                      variant="ghost" 
                      onPress={() => setEditingSecurity(true)} 
                      className="mt-4"
                    />
                  </View>
                )}
              </Section>
            </View>

            <View className="gap-6 lg:flex-1">
              <Section title="Preferencias">
                <View className="flex-row items-center justify-between py-3 border-b border-muted/15">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                      <Ionicons name="notifications" size={18} color="#5F9BA4" />
                    </View>
                    <Text className="font-nunito text-base font-bold text-ink">Notificaciones</Text>
                  </View>
                  <Switch 
                    value={notifications} 
                    onValueChange={setNotifications}
                    trackColor={{ false: "#D1D5DB", true: "#5F9BA4" }}
                  />
                </View>
                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center">
                      <Ionicons name="volume-high" size={18} color="#4A90E2" />
                    </View>
                    <Text className="font-nunito text-base font-bold text-ink">Efectos de sonido</Text>
                  </View>
                  <Switch 
                    value={audio} 
                    onValueChange={setAudio}
                    trackColor={{ false: "#D1D5DB", true: "#5F9BA4" }}
                  />
                </View>
              </Section>

              <Section title="Más Información">
                <Pressable onPress={() => router.push("/about")} className="flex-row items-center justify-between py-3 border-b border-muted/15">
                  <Text className="font-nunito text-base font-bold text-ink">Acerca de CarpiSeñas</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>
                <Pressable onPress={() => router.push("/help")} className="flex-row items-center justify-between py-3">
                  <Text className="font-nunito text-base font-bold text-ink">Ayuda y Soporte</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>
              </Section>
              
              <Button 
                label="Cerrar sesión" 
                variant="outline" 
                onPress={confirmLogout}
                className="mt-2"
              />

              <Pressable
                onPress={() => Alert.alert("Borrar Cuenta", "Esta acción no se puede deshacer. ¿Querés continuar?", [{ text: "Cancelar", style: "cancel" }, { text: "Borrar Cuenta", style: "destructive", onPress: () => Alert.alert("Próximamente", "La eliminación de cuenta estará disponible próximamente.") }])}
                className="mt-2 h-14 w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-4"
              >
                <Text className="font-nunito text-base font-bold text-red-600">Borrar Cuenta</Text>
              </Pressable>
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  )
}