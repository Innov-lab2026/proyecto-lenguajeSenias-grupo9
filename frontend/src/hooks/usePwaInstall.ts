import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { Platform } from 'react-native'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Listener = () => void

let deferredPrompt: BeforeInstallPromptEvent | null = null
let standalone = false
let listening = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const media = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return media || iosStandalone
}

function ensureListening() {
  if (listening || typeof window === 'undefined') return
  listening = true
  standalone = isStandaloneDisplay()

  const mql = window.matchMedia('(display-mode: standalone)')
  mql.addEventListener('change', () => {
    standalone = isStandaloneDisplay()
    emit()
  })

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    emit()
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    standalone = true
    emit()
  })
}

function subscribe(listener: Listener) {
  ensureListening()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return { deferredPrompt, standalone }
}

/**
 * Maneja beforeinstallprompt en web con estado a nivel de módulo
 * (sobrevive remounts del root layout).
 */
export function usePwaInstall() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => ({ deferredPrompt: null, standalone: false }),
  )

  const [ready, setReady] = useState(Platform.OS !== 'web')

  useEffect(() => {
    if (Platform.OS !== 'web') return
    ensureListening()
    setReady(true)
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return false
    const promptEvent = deferredPrompt
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    deferredPrompt = null
    if (outcome === 'accepted') standalone = true
    emit()
    return outcome === 'accepted'
  }, [])

  return {
    canInstall:
      Platform.OS === 'web' &&
      ready &&
      !!snapshot.deferredPrompt &&
      !snapshot.standalone,
    isStandalone: snapshot.standalone,
    install,
  }
}
