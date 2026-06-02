import Navbar from "../components/navbar";
import Title from "../components/tittle";
export default function Header() {
  return (
    <header className="flex items-center justify-between bg-gray-800 text-white sticky top-0 z-50 h-20 px-10">
      <Title />
      <Navbar />
    </header>
  );
}
