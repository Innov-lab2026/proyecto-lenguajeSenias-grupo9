
import { useEffect } from "react";
import ButtonSuccess from "../common/ButtonSuccess";

export default function MobileMenu({ closeMenu, navLinks }:
    { closeMenu: () => void, navLinks: { name: string, href: string }[] }) {

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    return (
        <>
            <div
                className="fixed top-0 left-0 w-full h-full z-10
                               bg-background pointer-events-none
                               animate-fade-in"
                onClick={closeMenu}
                aria-hidden="true">
            </div>

            <nav className="fixed bg-background top-30 left-1/2 w-full max-w-100 rounded-lg
                        text-xl transform translate-x-[-50%] text-center p-10
                        animate-slide-down z-20"
                aria-label="Mobile navigation">
                <ul className="flex flex-col gap-6">
                    {navLinks.map(link => (
                        <li key={link.name}>
                            <a href={link.href} onClick={closeMenu}>{link.name}</a>
                        </li>
                    ))}
                    <ButtonSuccess children="Descargar" span={true} className="mx-auto" />
                </ul>
            </nav>

        </>
    )
}