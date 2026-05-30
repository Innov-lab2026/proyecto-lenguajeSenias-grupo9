import './index.css'
import Demo from './sections/Demo'
import Footer from './sections/Footer'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Project from './sections/Project'
import Team from './sections/Team'

function App() {

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Demo />
        <Project />
        <Team />
      </main>
      <Footer />
    </>
  )
}

export default App
