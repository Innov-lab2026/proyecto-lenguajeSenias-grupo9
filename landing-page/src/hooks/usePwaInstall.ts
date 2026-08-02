import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Listener = () => void

const STORAGE_KEY = 'carpisenias-pwa-installed'

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
  } catch {
    // ignore quota / private mode
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

/** Arrancar lo antes posible para no perder beforeinstallprompt. */
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
}

function subscribe(listener: Listener) {
  startPwaInstallListener()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Snapshots primitivos: un objeto nuevo en cada getSnapshot rompe useSyncExternalStore. */
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
 * Prompt nativo de instalación PWA en la landing (mismo origen / Netlify).
 */
export function usePwaInstall() {
  const hasPrompt = useSyncExternalStore(subscribe, getHasPrompt, getFalse)
  const storedInstalled = useSyncExternalStore(subscribe, getInstalled, getFalse)

  const [ready, setReady] = useState(false)
  const [relatedInstalled, setRelatedInstalled] = useState(false)

  useEffect(() => {
    startPwaInstallListener()
    setReady(true)

    const nav = navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<Array<{ platform: string }>>
    }
    if (typeof nav.getInstalledRelatedApps !== 'function') return

    let cancelled = false
    void nav
      .getInstalledRelatedApps()
      .then((apps) => {
        if (!cancelled && apps.length > 0) setRelatedInstalled(true)
      })
      .catch(() => {
        // API no disponible
      })
    return () => {
      cancelled = true
    }
  }, [])

  const install = useCallback(async () => {
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

  const isInstalled = storedInstalled || relatedInstalled

  return {
    ready,
    canInstall: ready && hasPrompt && !isInstalled,
    isInstalled,
    hasPrompt,
    install,
  }
}
