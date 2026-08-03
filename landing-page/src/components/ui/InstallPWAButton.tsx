import { useEffect, useState } from 'react'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import pawIcon from '../../assets/logoDownload-paw.png'

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * Botón flotante de instalación PWA.
 * Pata + flecha alineadas al SVG original (viewBox 183×183).
 */
export default function InstallPWAButton() {
  const { canInstall, isInstalled, install, ready } = usePwaInstall()
  const [tip, setTip] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!tip) return
    const t = window.setTimeout(() => setTip(null), 10000)
    return () => window.clearTimeout(t)
  }, [tip])

  if (!ready || isInstalled) return null

  async function onInstallClick() {
    if (busy) return
    setBusy(true)
    setTip(null)

    try {
      if (canInstall) {
        const result = await install()
        if (result.ok) {
          setTip('¡Listo! CarpiSeñas se instaló en tu dispositivo.')
        } else if (result.reason === 'dismissed') {
          setTip('Cancelaste la instalación. Podés intentarlo de nuevo.')
        }
        return
      }

      if (isIos()) {
        setTip('En iPhone/iPad: tocá Compartir → “Agregar a pantalla de inicio”.')
        return
      }

      setTip(
        'Chrome aún no ofrece reinstalar. En la PC: chrome://apps → quitar CarpiSeñas, o Configuración → Aplicaciones → desinstalar. Después borrá datos del sitio y recargá.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void onInstallClick()}
        aria-label="Instalar CarpiSeñas"
        title="Instalar app"
        disabled={busy}
        className="
          group fixed bottom-5 right-5 z-50
          size-[4.75rem] md:size-[7.25rem]
          bg-transparent border-0 p-0 cursor-pointer
          transition-transform duration-300 ease-out
          hover:scale-110
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
          animate-[fadeIn_500ms_ease-out]
          disabled:opacity-70
        "
      >
        {/* Misma geometría que logoDownload.svg: pata a pantalla completa + flecha original */}
        <svg
          className="size-full drop-shadow-[0_8px_18px_rgba(15,23,42,0.28)]"
          viewBox="0 0 183 183"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <image
            href={pawIcon}
            width="183"
            height="183"
            preserveAspectRatio="xMidYMid slice"
          />
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
        </svg>
      </button>

      {tip ? (
        <div
          role="status"
          className="
            fixed bottom-[7.5rem] right-5 z-50 max-w-[18rem] md:bottom-[9.5rem]
            rounded-2xl bg-[#0f172a] px-4 py-3 text-sm text-white shadow-lg
            animate-[fadeIn_500ms_ease-out]
          "
        >
          {tip}
        </div>
      ) : null}
    </>
  )
}
