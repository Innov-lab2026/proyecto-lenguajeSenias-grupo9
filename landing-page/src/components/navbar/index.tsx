import ButtonDownload from "../button-dowload";

export default function Navbar() {
  return (
    <nav
      className="
    flex
    items-center
    gap-4 md:gap-6 lg:gap-8
    text-base lg:text-lg
  "
    >
      <a href="#home" className="header-link">
        Inicio
      </a>

      <a href="#project" className="header-link">
        Proyecto
      </a>

      <a href="#demo" className="header-link">
        Demo
      </a>

      <a href="#team" className="header-link">
        Equipo
      </a>

      <ButtonDownload />
    </nav>
  );
}
