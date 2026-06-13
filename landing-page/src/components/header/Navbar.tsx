import ButtonSuccess from "../common/ButtonSuccess";

const navLinks = [
  { name: "Inicio", href: "#home" },
  { name: "Proyecto", href: "#project" },
  { name: "Demo", href: "#demo" },
  { name: "Equipo", href: "#team" },
];

export default function Navbar() {
  return (
    <nav
      className="
      flex
      items-center
      gap-4 md:gap-6 xl:gap-16
      text-sm md:text-base lg:text-2xl xl:text-3xl
      font-semibold
    "
    >
      {navLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="hover:text-success transition-colors"
        >
          {link.name}
        </a>
      ))}

      <ButtonSuccess children="Descargar" span={true} />
    </nav>
  );
}
