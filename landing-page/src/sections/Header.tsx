import Navbar from "../components/header/Navbar";
import LogoText from "../components/header/LogoText";
export default function Header() {
  return (
    <header className="flex bg-surface items-center justify-between sticky top-0 z-50 h-(--header-height) px-10">
      <LogoText />
      <Navbar />
    </header>
  );
}
