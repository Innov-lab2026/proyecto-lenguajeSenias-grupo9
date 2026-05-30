export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white sticky top-0 z-50">
      <p className="font-bold">LSA APP</p>
      <nav className="flex justify-between gap-6">
        <a href="#home" className="header-link">Inicio</a>
        <a href="#demo" className="header-link">Demo</a>
        <a href="#project" className="header-link">Proyecto</a>
        <a href="#team" className="header-link">Equipo</a>
      </nav>
    </header>
  )
}