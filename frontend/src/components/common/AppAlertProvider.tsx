import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { Button } from './Button'

export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Pinta el botón de confirmar en rojo, para acciones irreversibles. */
  destructive?: boolean
}

export interface NotifyOptions {
  title: string
  message?: string
  buttonLabel?: string
}

interface AppAlertContextValue {
  /** Diálogo de confirmar/cancelar. Resuelve `true` si el usuario confirmó. */
  confirm: (options: ConfirmOptions) => Promise<boolean>
  /** Diálogo de un solo botón, para avisos. */
  notify: (options: NotifyOptions) => Promise<void>
}

const AppAlertContext = createContext<AppAlertContextValue | null>(null)

type PendingRequest =
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: 'notify'; options: NotifyOptions; resolve: () => void }

/**
 * Reemplazo propio de `Alert.alert` / `window.confirm` / `window.alert` para
 * diálogos de confirmación y aviso, con el mismo look que ya usan "Cerrar
 * sesión" y "Borrar Cuenta" en profile.tsx: un único <Modal> compartido,
 * montado una vez en la raíz.
 *
 * Por qué existe: `Alert.alert` es un no-op en web (react-native-web no lo
 * implementa) — las 14+ llamadas sueltas en el código quedaban silenciosas en
 * la versión web. Y los diálogos nativos del navegador (`window.confirm`/
 * `alert`) no se pueden personalizar: siempre muestran el prefijo
 * "localhost:xxxx dice", que no es amigable para el usuario final.
 *
 * Un único slot de "pendiente" (no una cola): estos diálogos son secuenciales
 * por naturaleza (el usuario cierra uno antes de disparar el próximo), igual
 * que `Alert.alert`.
 */
export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingRequest | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ kind: 'confirm', options, resolve })
    })
  }, [])

  const notify = useCallback((options: NotifyOptions) => {
    return new Promise<void>((resolve) => {
      setPending({ kind: 'notify', options, resolve })
    })
  }, [])

  const close = (result: boolean) => {
    setPending((current) => {
      if (!current) return null
      if (current.kind === 'confirm') current.resolve(result)
      else current.resolve()
      return null
    })
  }

  return (
    <AppAlertContext.Provider value={{ confirm, notify }}>
      {children}

      <Modal visible={pending !== null} transparent animationType="fade" onRequestClose={() => close(false)}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full max-w-[340px] bg-white rounded-3xl p-6 items-center shadow-lg border border-black/5">
            <Text className="font-nunito text-xl font-bold text-ink text-center mb-2 mt-2 leading-relaxed">
              {pending?.options.title}
            </Text>
            {pending?.options.message ? (
              <Text className="font-nunito text-sm text-muted text-center mb-6 leading-relaxed">
                {pending.options.message}
              </Text>
            ) : (
              <View className="mb-4" />
            )}

            {pending?.kind === 'confirm' ? (
              <View className="flex-row gap-3 w-full">
                <Button
                  label={pending.options.cancelLabel ?? 'Cancelar'}
                  variant="white"
                  onPress={() => close(false)}
                  className="flex-1"
                  textClassName="text-sm"
                />
                {pending.options.destructive ? (
                  <Pressable
                    onPress={() => close(true)}
                    className="flex-1 h-14 items-center justify-center rounded-full bg-red-600 active:bg-red-700 px-4"
                  >
                    <Text className="font-nunito text-sm font-bold text-white">
                      {pending.options.confirmLabel ?? 'Confirmar'}
                    </Text>
                  </Pressable>
                ) : (
                  <Button
                    label={pending.options.confirmLabel ?? 'Confirmar'}
                    onPress={() => close(true)}
                    className="flex-1"
                    textClassName="text-sm"
                  />
                )}
              </View>
            ) : (
              <Button
                label={pending?.options.buttonLabel ?? 'Entendido'}
                onPress={() => close(true)}
                className="w-full"
                textClassName="text-sm"
              />
            )}
          </View>
        </View>
      </Modal>
    </AppAlertContext.Provider>
  )
}

export function useAppAlert(): AppAlertContextValue {
  const ctx = useContext(AppAlertContext)
  if (!ctx) throw new Error('useAppAlert debe usarse dentro de <AppAlertProvider>')
  return ctx
}
