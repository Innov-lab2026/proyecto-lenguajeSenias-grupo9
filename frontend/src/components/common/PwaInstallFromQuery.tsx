import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { usePwaInstall } from '@/src/hooks/usePwaInstall'

/**
 * Si la landing redirige a ?install=1, dispara el prompt nativo
 * apenas el navegador lo permita (Chrome/Edge/Android).
 */
export function PwaInstallFromQuery() {
  const { canInstall, install, isStandalone } = usePwaInstall()
  const tried = useRef(false)

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    if (isStandalone || tried.current) return

    const params = new URLSearchParams(window.location.search)
    if (params.get('install') !== '1') return
    if (!canInstall) return

    tried.current = true
    void install().finally(() => {
      params.delete('install')
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`
      window.history.replaceState({}, '', next)
    })
  }, [canInstall, install, isStandalone])

  return null
}
