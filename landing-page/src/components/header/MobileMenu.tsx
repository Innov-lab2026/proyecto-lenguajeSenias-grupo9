
import { useEffect, useRef } from "react";
import ButtonSuccess from "../common/ButtonSuccess";

export default function MobileMenu({ closeMenu, navLinks }:
    { closeMenu: () => void, navLinks: { name: string, href: string }[] }) {

    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    // Focus-trap: enfoca el primer elemento al abrir, mantiene el foco dentro
    // del menú con Tab/Shift+Tab y lo devuelve al disparador al cerrar.
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;

        const getFocusable = () =>
            Array.from(
                nav.querySelectorAll<HTMLElement>(
                    'a[href], button, input, [tabindex]:not([tabindex="-1"])'
                )
            );

        getFocusable()[0]?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Tab") return;

            const focusable = getFocusable();
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        nav.addEventListener("keydown", handleKeyDown);

        return () => {
            nav.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus();
        };
    }, []);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeMenu]);

    return (
        <>
            <div
                className="fixed top-0 left-0 w-full h-full z-10
                               bg-background animate-fade-in"
                onClick={closeMenu}
                aria-hidden="true">
            </div>

            <nav ref={navRef} className="fixed bg-background top-30 left-1/2 w-full max-w-100 rounded-lg
                        text-xl transform translate-x-[-50%] text-center p-10
                        animate-slide-down z-20"
                aria-label="Mobile navigation">
                <ul className="flex flex-col gap-6">
                    {navLinks.map(link => (
                        <li key={link.name}>
                            <a href={link.href} onClick={closeMenu}>{link.name}</a>
                        </li>
                    ))}
                    <ButtonSuccess children="Entrar" span={true} className="mx-auto" href="https://carpisenias.vercel.app/" />
                </ul>
            </nav>

        </>
    )
}
