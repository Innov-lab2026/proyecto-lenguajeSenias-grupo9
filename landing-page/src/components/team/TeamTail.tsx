import useRevealPulse from '../../hooks/useRevealPulse';

/** Cola recta que baja del último arco hacia el botón final */
export default function TeamTail() {
    const { ref, inView, highlight } = useRevealPulse<HTMLDivElement>(0.5);

    return (
        <div ref={ref}
            className={`hidden md:block self-center w-1 h-14 origin-top
                        transition-all duration-700
                        ${highlight ? 'bg-accent' : 'bg-black'}
                        hover:bg-accent
                        ${inView ? 'scale-y-100' : 'scale-y-0'}`} />
    );
}
