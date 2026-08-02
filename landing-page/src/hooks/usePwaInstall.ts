import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Listener = () => void

/** v2: invalida el flag viejo del fallback .url que abría Vercel. */
const STORAGE_KEY = 'carpisenias-pwa-installed-v2'

let deferredPrompt: BeforeInstallPromptEvent | null = null
let installedFlag = false
let listening = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

function readStoredInstalled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markInstalled() {
  installedFlag = true
  deferredPrompt = null
  try {
    localStorage.setItem(STORAGE_KEY, '1')
    localStorage.removeItem('carpisenias-pwa-installed')
  } catch {
    // ignore
  }
  emit()
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const media = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return media || iosStandalone
}

export function startPwaInstallListener() {
  if (listening || typeof window === 'undefined') return
  listening = true
  installedFlag = readStoredInstalled() || isStandaloneDisplay()

  const mql = window.matchMedia('(display-mode: standalone)')
  mql.addEventListener('change', () => {
    if (isStandaloneDisplay()) markInstalled()
    else emit()
  })

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    emit()
  })

  window.addEventListener('appinstalled', () => {
    markInstalled()
  })

  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Chrome moderno puede instalar sin SW
    })
  }
}

function subscribe(listener: Listener) {
  startPwaInstallListener()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getHasPrompt() {
  return deferredPrompt !== null
}

function getInstalled() {
  return installedFlag || isStandaloneDisplay()
}

function getFalse() {
  return false
}

/**
 * Prompt nativo del navegador (manifest / beforeinstallprompt).
 * Nunca navega ni descarga archivos .url (eso abría Vercel).
 */
export function usePwaInstall() {
  const hasPrompt = useSyncExternalStore(subscribe, getHasPrompt, getFalse)
  const storedInstalled = useSyncExternalStore(subscribe, getInstalled, getFalse)

  const [ready, setReady] = useState(false)

  useEffect(() => {
    startPwaInstallListener()
    setReady(true)
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      await new Promise((r) => setTimeout(r, 500))
    }
    if (!deferredPrompt) return { ok: false as const, reason: 'unavailable' as const }

    const promptEvent = deferredPrompt
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    deferredPrompt = null
    if (outcome === 'accepted') markInstalled()
    else emit()
    return outcome === 'accepted'
      ? { ok: true as const, reason: 'accepted' as const }
      : { ok: false as const, reason: 'dismissed' as const }
  }, [])

  return {
    ready,
    /** Solo true cuando el navegador YA puede mostrar el diálogo Instalar. */
    canInstall: ready && hasPrompt && !storedInstalled,
    isInstalled: storedInstalled,
    hasPrompt,
    install,
  }
}
