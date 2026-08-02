import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

/**
 * HTML raíz del export estático (web). Acá se linkea el manifest PWA.
 * @see https://docs.expo.dev/router/reference/static-rendering/#root-html
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4A90E2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="CarpiSeñas" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
