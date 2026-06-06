import './index.css'
import Demo from './sections/Demo'
import Footer from './sections/Footer'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Project from './sections/Project'
import Team from './sections/Team'
import Info from './sections/Info'

function App() {

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Info />
        <Demo />
        <Project />
        <Team />
      </main>
      <Footer />
    </>
  )
}

export default App
