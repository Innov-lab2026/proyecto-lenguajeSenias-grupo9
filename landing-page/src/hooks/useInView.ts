import { useEffect, useRef, useState } from 'react';

/**
 * Detecta (una única vez) cuando el elemento entra al viewport.
 * Devuelve un ref para asignar al elemento y un booleano `inView`.
 */
export default function useInView<T extends HTMLElement>(threshold = 0.3) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}
