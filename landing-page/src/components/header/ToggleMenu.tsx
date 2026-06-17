import icon_burger from '../../assets/images/header/icon-hamburger.svg';
import icon_close from '../../assets/images/header/icon-close.svg';
export default function ToggleMenu({ menuOpen, toggleMenu }: { menuOpen: boolean, toggleMenu: () => void }) {
    
    return (
        <button
            className="flex justify-center items-center cursor-pointer sm:hidden z-20"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={toggleMenu}
        >
            <img
                src={menuOpen ? icon_close : icon_burger}
                alt=""
                aria-hidden="true"
            />
        </button>
    )
}