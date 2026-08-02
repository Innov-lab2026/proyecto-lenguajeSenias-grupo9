import { useEffect, useState } from 'react'
import { APP_URL } from '../../constants/app'
import pawIcon from '../../assets/logoDownload-paw.png'

function isAppAlreadyInstalled(): boolean {
  if (typeof window === 'undefined') return true
  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return mediaStandalone || iosStandalone
}

/**
 * Botón flotante para instalar la PWA de CarpiSeñas.
 * Usa la pata de logoDownload.svg (sin círculo) + flecha de descarga animada.
 * Se oculta si ya está instalada / en modo standalone.
 */
export default function InstallPWAButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isAppAlreadyInstalled()) {
      setVisible(false)
      return
    }

    let cancelled = false

    const reveal = () => {
      if (!cancelled) setVisible(true)
    }

    const hide = () => {
      if (!cancelled) setVisible(false)
    }

    async function checkRelatedApps() {
      const nav = navigator as Navigator & {
        getInstalledRelatedApps?: () => Promise<Array<{ platform: string }>>
      }
      if (typeof nav.getInstalledRelatedApps === 'function') {
        try {
          const apps = await nav.getInstalledRelatedApps()
          if (apps.length > 0) {
            hide()
            return
          }
        } catch {
          // API no disponible o sin permiso: seguimos mostrando el botón
        }
      }
      reveal()
    }

    void checkRelatedApps()

    const mql = window.matchMedia('(display-mode: standalone)')
    const onDisplayMode = () => {
      if (isAppAlreadyInstalled()) hide()
    }
    mql.addEventListener('change', onDisplayMode)

    return () => {
      cancelled = true
      mql.removeEventListener('change', onDisplayMode)
    }
  }, [])

  if (!visible) return null

  const installHref = new URL(APP_URL)
  installHref.searchParams.set('install', '1')

  return (
    <a
      href={installHref.toString()}
      aria-label="Instalar CarpiSeñas"
      title="Instalar app"
      className="
        group fixed bottom-5 right-5 z-50
        size-[4.75rem] md:size-[7.25rem]
        bg-transparent
        transition-transform duration-300 ease-out
        hover:scale-110
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
        animate-[fadeIn_500ms_ease-out]
      "
    >
      <svg
        className="size-full drop-shadow-[0_8px_18px_rgba(15,23,42,0.28)]"
        viewBox="0 0 183 183"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <image
          href={pawIcon}
          x="0"
          y="0"
          width="183"
          height="183"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Misma flecha que logoDownload.svg, animada */}
        <g transform="translate(0 8)">
          <g className="pwa-download-arrow">
            <path
              d="M89.3706 116.413C90.1516 117.194 91.4179 117.194 92.199 116.413L104.928 103.687C105.709 102.906 105.709 101.639 104.928 100.858C104.147 100.077 102.881 100.077 102.1 100.858L90.7852 112.171L79.4723 100.856C78.6913 100.075 77.425 100.075 76.6439 100.856C75.8628 101.637 75.8627 102.903 76.6437 103.684L89.3706 116.413ZM90.7871 87L88.7871 86.9998L88.7849 114.999L90.7849 114.999L92.7849 114.999L92.7871 87.0002L90.7871 87Z"
              fill="#1F2937"
            />
            <path
              d="M110 117L106.5 123H79L73 117"
              stroke="#1F2937"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </a>
  )
}
