import useInView from '../../hooks/useInView';

/** Cola recta que baja del último arco hacia el botón final */
export default function TeamTail() {
    const { ref, inView } = useInView<HTMLDivElement>(0.5);

    return (
        <div ref={ref}
            className={`hidden lg:block self-center w-1 h-14 origin-top bg-accent
                        transition-all duration-700
                        ${inView ? 'scale-y-100' : 'scale-y-0'}`} />
    );
}
