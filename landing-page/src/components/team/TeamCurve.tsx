// Tramo de la línea central: arco elíptico extraído del Figma
// (viewBox 132x260, trazo #4A90E2 de 4px). Se estira a la altura
// de la fila con preserveAspectRatio="none" y se anima el dibujado
// del trazo con stroke-dashoffset al entrar al viewport.

const PATHS = {
    right: 'M0 0 C71.797 0 131.182 58.203 131.182 130 C131.182 201.797 71.797 260 0 260',
    // Espejo exacto del arco derecho
    left: 'M132 0 C60.203 0 0.818 58.203 0.818 130 C0.818 201.797 60.203 260 132 260',
} as const;

export default function TeamCurve(
    { side, active, highlight, icon, title }:
        {
            side: 'left' | 'right'; active: boolean; highlight: boolean;
            icon: string; title: string
        }) {

    const path = PATHS[side];

    return (
        <div className="group relative hidden md:block h-full w-[264px] shrink-0">
            {/* Arco: nace y termina en el eje central, se curva hacia un lado.
                Se revela de arriba hacia abajo (clip-path) en accent y decanta
                a negro (currentColor). No se usa stroke-dasharray porque, junto
                con non-scaling-stroke, deja huecos en las uniones entre tramos */}
            <svg
                className={`absolute inset-y-0 w-[132px] h-full overflow-visible
                            transition-colors duration-700
                            ${highlight ? 'text-accent' : 'text-black'}
                            group-hover:text-accent
                            ${side === 'right' ? 'left-1/2' : 'right-1/2'}`}
                viewBox="0 0 132 260"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
                style={{
                    clipPath: active
                        ? 'inset(-4px)'
                        : 'inset(-4px -4px 100% -4px)',
                    transition: 'clip-path 1.2s ease-in-out',
                }}
            >
                <path
                    d={path}
                    stroke="currentColor"
                    strokeWidth={4}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* Icono del equipo, apoyado del lado interno de la curva */}
            <div
                className={`absolute top-1/2 -translate-y-1/2
                            ${side === 'right' ? 'right-9' : 'left-9'}
                            transition-all duration-700 delay-500
                            hover:scale-110
                            ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            >
                <img src={icon} alt={title}
                    className={`w-14 h-14 transition-[filter] duration-700
                                ${highlight ? '' : 'brightness-0'}
                                group-hover:brightness-100`} />
            </div>
        </div>
    );
}
