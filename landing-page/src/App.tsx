import { useState, useEffect } from 'react'
import './index.css'
import Demo from './sections/Demo'
import Footer from './sections/Footer'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Project from './sections/Project'
import Team from './sections/Team'
import PrivacyPolicy from './sections/PrivacyPolicy'
import TermsAndConditions from './sections/TermsAndConditions'

function App() {
  const [currentView, setCurrentView] = useState(() => window.location.hash)

  useEffect(() => {
    let lastView = window.location.hash

    const handleHashChange = () => {
      const newHash = window.location.hash
      const oldView = lastView
      lastView = newHash
      setCurrentView(newHash)

      const isLegalPage = (hash: string) => hash === '#privacidad' || hash === '#terminos'

      if (isLegalPage(newHash)) {
        // Al ingresar a Políticas o Términos, subimos al tope
        window.scrollTo(0, 0)
      } else if (newHash === '' || newHash === '#home') {
        // Al regresar al inicio, también subimos
        window.scrollTo(0, 0)
      } else if (isLegalPage(oldView)) {
        // Si salimos de una página legal hacia una sección de la landing,
        // esperamos a que se renderice el home y nos desplazamos de forma suave
        setTimeout(() => {
          const element = document.querySelector(newHash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 0)
      }
      // En otros casos (navegación interna entre secciones), dejamos el comportamiento nativo de anclas
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <>
      <Header />
      <main>
        {currentView === '#privacidad' ? (
          <PrivacyPolicy />
        ) : currentView === '#terminos' ? (
          <TermsAndConditions />
        ) : (
          <>
            <Hero />
            <Project />
            <Demo />
            <Team />
          </>
        )}
      </main>
      <Footer />
    </>
  )
}

export default App
