import { useCallback, useEffect, useState } from "react"
import { Image, Modal, Pressable, ScrollView, Switch, Text, View } from "react-native"
import * as ImagePicker from "expo-image-picker"
import Constants from "expo-constants"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { Button } from "@/src/components/common/Button"
import { TextField } from "@/src/components/common/TextField"
import { BirthDateField } from "@/src/components/features/auth/BirthDateField"
import { Select } from "@/src/components/common/Select"
import { GENDER_OPTIONS } from "@/src/constants/gender"
import { GENDER_API_VALUE, GENDER_FROM_API_VALUE, type Gender } from "@/src/types/auth"
import { useLogout } from "@/src/hooks/features/auth/useLogout"
import { useProfile } from "@/src/hooks/features/profile/useProfile"
import { useUpdateProfile } from "@/src/hooks/features/profile/useUpdateProfile"
import { useSessionStore } from "@/src/store/sessionStore"
import { useRouter } from "expo-router"
import { deleteAccount, deleteAvatar, updateCredentials, uploadAvatar } from "@/src/services/profile"
import { getApiErrorMessage } from "@/src/services/http"
import { saveUser } from "@/src/lib/storage"
import { usePreferencesStore } from "@/src/store/preferencesStore"
import { useAppAlert } from "@/src/components/common/AppAlertProvider"

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
  const { notify } = useAppAlert()
  const { data: profile, refetch } = useProfile()
  const updateProfile = useUpdateProfile()
  const user = useSessionStore((state) => state.user)
  const token = useSessionStore((state) => state.token)
  const updateUser = useSessionStore((state) => state.updateUser)

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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const isMuted = usePreferencesStore((s) => s.isMuted)
  const setIsMuted = usePreferencesStore((s) => s.setIsMuted)
  const audio = !isMuted
  const setAudio = (enabled: boolean) => setIsMuted(!enabled)

  // Recalcula los campos editables a partir de los datos ya guardados (perfil
  // + sesión). Se usa tanto para hidratar al cargar como para descartar
  // ediciones sin guardar al tocar "Cancelar" — sin esto, "Cancelar" sólo
  // apagaba el modo edición pero dejaba lo tipeado en el estado local, que la
  // vista de sólo-lectura sigue mostrando hasta el próximo refetch/reload.
  // useCallback acá no es por performance: es para que el useEffect de abajo
  // pueda declarar la dependencia sin recrearla en cada render.
  const resetPersonalFields = useCallback(() => {
    const parts = (profile?.full_name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Usuario").split(" ")
    setFirstName(parts[0] || "")
    setLastName(parts.slice(1).join(" "))
    setGender(profile?.gender ? GENDER_FROM_API_VALUE[profile.gender] : undefined)
    setBirthDate(profile?.birth_date ? profile.birth_date.split("-").reverse().join("/") : "")
  }, [profile?.birth_date, profile?.full_name, profile?.gender, user?.firstName, user?.lastName])

  const resetSecurityFields = useCallback(() => {
    setEmail(user?.email || "")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }, [user?.email])

  useEffect(() => {
    resetPersonalFields()
    resetSecurityFields()
  }, [resetPersonalFields, resetSecurityFields])

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Usuario"

  const savePersonal = async () => {
    if (!firstName.trim()) {
      await notify({ title: "Error", message: "El nombre es obligatorio" })
      return
    }

    try {
      const birthDateIso = birthDate ? birthDate.split("/").reverse().join("-") : undefined
      await updateProfile.mutateAsync({
        full_name: fullName,
        gender: gender ? GENDER_API_VALUE[gender as Gender] : undefined,
        birth_date: birthDateIso
      })
      setEditingPersonal(false)
      await notify({ title: "Listo", message: "Perfil actualizado correctamente" })
    } catch (error) {
      await notify({ title: "Error", message: getApiErrorMessage(error) })
    }
  }

  const saveSecurity = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      await notify({ title: "Error", message: "Las contraseñas no coinciden." })
      return
    }
    if (newPassword && newPassword.length < 8) {
      await notify({ title: "Contraseña", message: "La nueva contraseña debe tener al menos 8 caracteres." })
      return
    }
    if (!newPassword && email === user?.email) {
      await notify({ title: "Sin cambios", message: "Modificá el correo o la contraseña." })
      return
    }

    setSavingSecurity(true)
    try {
      await updateCredentials({ currentPassword, ...(email !== user?.email ? { email } : {}), ...(newPassword ? { password: newPassword } : {}) })
      if (user && token && email !== user.email) {
        const updatedUser = { ...user, email }
        await saveUser(updatedUser)
        updateUser(updatedUser)
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setEditingSecurity(false)
      await notify({ title: "Listo", message: "Tus datos de seguridad fueron actualizados." })
    } catch (error) {
      await notify({ title: "Error", message: getApiErrorMessage(error) })
    } finally {
      setSavingSecurity(false)
    }
  }

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      await notify({ title: "Permiso requerido", message: "Permití el acceso a tus fotos para cambiar la imagen." })
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true })
    if (result.canceled || !result.assets[0]?.base64) return
    setSavingAvatar(true)
    try {
      const mime = result.assets[0].mimeType || "image/jpeg"
      await uploadAvatar(`data:${mime};base64,${result.assets[0].base64}`)
      await refetch()
      await notify({ title: "Listo", message: "Tu foto fue actualizada." })
    } catch (error) {
      await notify({ title: "Error", message: getApiErrorMessage(error) })
    } finally {
      setSavingAvatar(false)
    }
  }

  const removeAvatar = async () => {
    setSavingAvatar(true)
    try {
      await deleteAvatar()
      await refetch()
      await notify({ title: "Listo", message: "Tu foto fue eliminada." })
    } catch (error) {
      await notify({ title: "Error", message: getApiErrorMessage(error) })
    } finally {
      setSavingAvatar(false)
    }
  }

  const confirmLogout = () => {
    setShowLogoutModal(true)
  }

  return (
    <View className="flex-1 bg-background">
      {/* Cabecera Estática (Congelada) */}
      <View className="w-full items-center bg-background z-20">
        {/* Banner azul de perfil */}
        <View
          className="w-full bg-[#4A90E2] rounded-b-[40px] items-center pb-20 relative"
          style={{ paddingTop: insets.top + 14, zIndex: 1 }}
        >
          <Text className="font-nunito text-3xl font-bold text-white text-center mt-4">
            Perfil
          </Text>
        </View>

        {/* Contenedor del Avatar y Nombre (Superpuesto en la extremidad inferior del banner) */}
        <View className="items-center -mt-14 z-10 w-full px-5">
          <View className="relative">
            <View className="w-28 h-28 rounded-full bg-surface border-4 border-accent items-center justify-center overflow-hidden shadow-md">
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
              ) : (
                <Ionicons name="person" size={60} color="#D1D5DB" />
              )}
            </View>
            <Pressable
              className="absolute bottom-0 right-0 bg-[#A3D0FC] w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-sm"
              onPress={() => setShowAvatarModal(true)}
              disabled={savingAvatar}
            >
              <Ionicons name="pencil" size={16} color="#1F2937" />
            </Pressable>
          </View>

          <Text className="font-nunito text-3xl font-bold text-ink mt-4 mb-2 text-center">
            {fullName}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-4xl gap-6 px-5 pb-8 pt-4 sm:px-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 mt-2 lg:flex-row">
          <View className="gap-6 lg:flex-1">
            <Section title="Información Personal">
              {editingPersonal ? (
                <View className="gap-4">
                  <TextField label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Ingresá tu nombre" />
                  <TextField label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Ingresá tu apellido" />
                  <Select
                    label="Género"
                    options={GENDER_OPTIONS}
                    value={gender}
                    onChange={setGender}
                  />
                  <BirthDateField value={birthDate} onChange={setBirthDate} />
                  <View className="flex-row gap-3 mt-2">
                    <Button
                      label="Cancelar"
                      variant="white"
                      onPress={() => {
                        resetPersonalFields()
                        setEditingPersonal(false)
                      }}
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
                    onPress={() => setEditingPersonal(true)}
                    className="mt-4"
                    textClassName="text-sm"
                  />
                </View>
              )}
            </Section>

            <Section title="Datos de Seguridad">
              {editingSecurity ? (
                <View className="gap-4">
                  <TextField label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Ingresá tu correo electrónico" />
                  <TextField label="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Ingresá tu contraseña actual" />
                  <TextField label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Ingresá tu nueva contraseña" />
                  <TextField label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirmá tu nueva contraseña" />
                  <View className="flex-row gap-3 mt-2">
                    <Button
                      label="Cancelar"
                      variant="white"
                      onPress={() => {
                        resetSecurityFields()
                        setEditingSecurity(false)
                      }}
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
                    onPress={() => setEditingSecurity(true)}
                    className="mt-4"
                    textClassName="text-sm"
                  />
                </View>
              )}
            </Section>
          </View>

          <View className="gap-6 lg:flex-1">
            <Section title="Preferencias">
              <View className="flex-row items-center justify-between py-1">
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
              onPress={confirmLogout}
              className="mt-2"
            />

            {/* Botón para borrar la cuenta */}
            <Pressable
              onPress={() => { setDeleteStep(1); setShowDeleteModal(true) }}
              className="mt-2 h-14 w-full self-center items-center justify-center rounded-full border border-red-200 bg-red-50 px-4"
            >
              <Text className="font-nunito text-base font-bold text-red-600">Borrar cuenta</Text>
            </Pressable>

            {/* Versión de la app */}
            <Text className="font-nunito text-xs text-muted text-center mt-4 mb-2">
              Carpiseñas v{Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Confirmación de Cierre de Sesión */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full max-w-[340px] bg-white rounded-3xl p-6 items-center shadow-lg border border-black/5">
            <Text className="font-nunito text-xl font-bold text-ink text-center mb-6 mt-2 leading-relaxed">
              ¿Seguro que desea cerrar sesión?
            </Text>

            <View className="flex-row gap-3 w-full">
              <Button
                label="Volver"
                variant="white"
                onPress={() => setShowLogoutModal(false)}
                className="flex-1"
                textClassName="text-sm"
              />
              <Button
                label="Confirmar"
                variant="primary"
                onPress={() => {
                  setShowLogoutModal(false)
                  void logout()
                }}
                className="flex-1"
                textClassName="text-sm"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación de Borrar Cuenta (2 pasos) */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full max-w-[340px] bg-white rounded-3xl p-6 items-center shadow-lg border border-black/5">
            {deleteStep === 1 ? (
              <>
                <Ionicons name="warning" size={40} color="#EF4444" style={{ marginBottom: 8 }} />
                <Text className="font-nunito text-xl font-bold text-ink text-center mb-2 leading-relaxed">
                  ¿Querés borrar tu cuenta?
                </Text>
                <Text className="font-nunito text-sm text-muted text-center mb-6">
                  Esta acción es irreversible. Se eliminarán todos tus datos, progreso y logros.
                </Text>

                <View className="flex-row gap-3 w-full">
                  <Button
                    label="Cancelar"
                    variant="white"
                    onPress={() => setShowDeleteModal(false)}
                    className="flex-1"
                    textClassName="text-sm"
                  />
                  <Button
                    label="Continuar"
                    variant="primary"
                    onPress={() => setDeleteStep(2)}
                    className="flex-1"
                    textClassName="text-sm"
                  />
                </View>
              </>
            ) : (
              <>
                <Ionicons name="alert-circle" size={40} color="#EF4444" style={{ marginBottom: 8 }} />
                <Text className="font-nunito text-xl font-bold text-red-600 text-center mb-2 leading-relaxed">
                  ¿Estás completamente seguro?
                </Text>
                <Text className="font-nunito text-sm text-muted text-center mb-6">
                  No podrás recuperar tu cuenta ni tus datos después de confirmar.
                </Text>

                <View className="flex-row gap-3 w-full">
                  <Button
                    label="Volver"
                    variant="white"
                    onPress={() => setDeleteStep(1)}
                    className="flex-1"
                    textClassName="text-sm"
                  />
                  <Pressable
                    onPress={async () => {
                      setDeletingAccount(true)
                      try {
                        await deleteAccount()
                        setShowDeleteModal(false)
                        void logout()
                      } catch (error) {
                        await notify({ title: "Error", message: getApiErrorMessage(error) })
                      } finally {
                        setDeletingAccount(false)
                      }
                    }}
                    disabled={deletingAccount}
                    className="flex-1 h-14 items-center justify-center rounded-full bg-red-600 active:bg-red-700 px-4"
                  >
                    <Text className="font-nunito text-sm font-bold text-white">
                      {deletingAccount ? "Borrando..." : "Borrar Cuenta"}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Foto de Perfil */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full max-w-[340px] bg-white rounded-3xl p-6 items-center shadow-lg border border-black/5">
            <Text className="font-nunito text-xl font-bold text-ink text-center mb-6 mt-2 leading-relaxed">
              Editar foto de perfil
            </Text>

            <View className="w-full gap-3 mb-4 items-center">
              <Button
                label="Cambiar foto"
                variant="primary"
                onPress={() => {
                  setShowAvatarModal(false)
                  void pickAvatar()
                }}
                disabled={savingAvatar}
                className="w-1/2 h-12"
                textClassName="text-sm"
              />
              {profile?.avatar_url ? (
                <Button
                  label="Borrar foto"
                  variant="white"
                  onPress={() => {
                    setShowAvatarModal(false)
                    void removeAvatar()
                  }}
                  disabled={savingAvatar}
                  className="w-1/2 h-12 border border-red-200"
                  textClassName="text-sm text-red-600 font-bold"
                />
              ) : null}
            </View>

            <Button
              label="Cancelar"
              variant="white"
              onPress={() => setShowAvatarModal(false)}
              className="w-1/2 border border-gray-200 mt-2"
              textClassName="text-sm"
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}