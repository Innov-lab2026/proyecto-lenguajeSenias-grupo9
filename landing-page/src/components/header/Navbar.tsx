import { useState } from "react";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import ToggleMenu from "./ToggleMenu";

const navLinks = [
  { name: "Inicio", href: "#home" },
  { name: "Proyecto", href: "#project" },
  { name: "Demo", href: "#demo" },
  { name: "Equipo", href: "#team" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Desktop menu */}
      <DesktopMenu navLinks={navLinks} />

      { /* Toggle menu */}
      <ToggleMenu menuOpen={menuOpen} toggleMenu={toggleMenu} />

      {/* Mobile menu */}
      {menuOpen && (
        <MobileMenu closeMenu={closeMenu} navLinks={navLinks} />
      )}
    </>
  );
}
