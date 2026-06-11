import { useEffect, useState } from 'react';
import useInView from './useInView';

/**
 * useInView + pulso de revelado: `highlight` queda activo durante
 * `pulseMs` desde que el elemento entra al viewport y luego se apaga
 * (la línea/iconos se "encienden" en accent y decantan a negro).
 */
export default function useRevealPulse<T extends HTMLElement>(
    threshold = 0.3, pulseMs = 1700) {

    const { ref, inView } = useInView<T>(threshold);

    const [pulseDone, setPulseDone] = useState(false);
    useEffect(() => {
        if (!inView) return;
        const timer = setTimeout(() => setPulseDone(true), pulseMs);
        return () => clearTimeout(timer);
    }, [inView, pulseMs]);

    return { ref, inView, highlight: inView && !pulseDone };
}
