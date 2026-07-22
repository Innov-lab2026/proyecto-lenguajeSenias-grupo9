import ButtonSuccess from "../common/ButtonSuccess";

export default function DesktopMenu({ navLinks }: { navLinks: { name: string, href: string }[] }) {
    return (
        <nav
            className="
              hidden sm:flex
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

            <ButtonSuccess children="Entrar" span={true}/>
        </nav>
    )
}
