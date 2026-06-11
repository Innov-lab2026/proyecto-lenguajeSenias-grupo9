import useRevealPulse from '../../hooks/useRevealPulse';
import type { TeamInfo } from '../../types/team';
import TeamCard from './TeamCard';
import TeamCurve from './TeamCurve';

export default function TeamTimelineItem(
    { team, icon, index }:
        { team: TeamInfo; icon: string; index: number }) {

    // Pulso al revelarse: línea e iconos se "encienden" en accent
    // mientras se dibujan y luego decantan a negro
    const { ref, inView, highlight } = useRevealPulse<HTMLDivElement>(0.35);

    // El arco alterna de lado y la card se ubica del lado opuesto
    const curveSide = index % 2 === 0 ? 'right' : 'left';
    const cardOnLeft = curveSide === 'right';

    const cardReveal = `transition-all duration-700 delay-300 ease-out
        ${inView
            ? 'opacity-100 translate-x-0'
            : `opacity-0 ${cardOnLeft ? '-translate-x-12' : 'translate-x-12'}`}`;

    return (
        <div ref={ref} className="flex flex-col items-center gap-4
                                  md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-0
                                  md:min-h-[260px]">

            {/* Icono visible solo en mobile (la curva se oculta) */}
            <div className={`flex md:hidden items-center justify-center
                             transition-all duration-700
                             ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <img src={icon} alt={team.title}
                    className={`w-10 h-10 transition-[filter] duration-700
                                ${highlight ? '' : 'brightness-0'}`} />
            </div>

            <div className={`hidden md:flex items-center justify-end
                             ${cardOnLeft ? '' : 'invisible'}`}>
                {cardOnLeft && <div className={cardReveal}><TeamCard team={team} /></div>}
            </div>

            <TeamCurve side={curveSide} active={inView} highlight={highlight}
                icon={icon} title={team.title} />

            <div className={`flex items-center w-full md:w-auto justify-center
                             md:justify-start ${cardOnLeft ? 'md:invisible' : ''}`}>
                {/* En mobile se muestra siempre acá; en desktop solo si va a la derecha */}
                <div className={`${cardReveal} ${cardOnLeft ? 'md:hidden' : ''}`}>
                    <TeamCard team={team} />
                </div>
            </div>
        </div>
    );
}
