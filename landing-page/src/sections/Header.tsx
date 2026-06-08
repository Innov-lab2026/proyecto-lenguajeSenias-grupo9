import Navbar from "../components/navbar";
import LogoText from "../components/logo-text";
export default function Header() {
  return (
    <header className="flex bg-surface items-center justify-between sticky top-0 z-50 h-(--header-height) px-10">
      <LogoText />
      <Navbar />
    </header>
  );
}
