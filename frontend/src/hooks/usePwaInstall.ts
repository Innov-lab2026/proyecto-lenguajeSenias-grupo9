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

/**
 * Los snapshots son PRIMITIVOS, no un objeto con los dos valores.
 *
 * `useSyncExternalStore` compara el snapshot con el anterior usando `Object.is`.
 * Devolver `{ deferredPrompt, standalone }` construía un objeto nuevo en cada
 * llamada, así que la comparación siempre daba distinto: React re-renderizaba,
 * pedía el snapshot otra vez, volvía a diferir, y entraba en un bucle infinito
 * que cortaba con "Maximum update depth exceeded".
 *
 * Con booleanos la comparación es por valor y el problema no puede repetirse.
 * El evento en sí no hace falta durante el render — `install()` lo lee del
 * módulo.
 */
function getHasPrompt() {
  return deferredPrompt !== null
}

function getStandalone() {
  return standalone
}

/** Snapshot de servidor: en el prerender estático no hay ni evento ni display-mode. */
function getFalse() {
  return false
}

/**
 * Maneja beforeinstallprompt en web con estado a nivel de módulo
 * (sobrevive remounts del root layout).
 */
export function usePwaInstall() {
  const hasPrompt = useSyncExternalStore(subscribe, getHasPrompt, getFalse)
  const isStandalone = useSyncExternalStore(subscribe, getStandalone, getFalse)

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
    canInstall: Platform.OS === 'web' && ready && hasPrompt && !isStandalone,
    isStandalone,
    install,
  }
}
