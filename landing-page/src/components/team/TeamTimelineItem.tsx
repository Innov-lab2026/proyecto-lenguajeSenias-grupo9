import useInView from '../../hooks/useInView';
import type { TeamInfo } from '../../types/team';
import TeamCard from './TeamCard';
import TeamCurve from './TeamCurve';

export default function TeamTimelineItem(
    { team, icon, index }:
        { team: TeamInfo; icon: string; index: number }) {

    const { ref, inView } = useInView<HTMLDivElement>(0.35);

    // El arco alterna de lado y la card se ubica del lado opuesto
    const curveSide = index % 2 === 0 ? 'right' : 'left';
    const cardOnLeft = curveSide === 'right';

    const cardReveal = `transition-all duration-700 delay-300 ease-out
        ${inView
            ? 'opacity-100 translate-x-0'
            : `opacity-0 ${cardOnLeft ? '-translate-x-12' : 'translate-x-12'}`}`;

    return (
        <div ref={ref} className="flex flex-col items-center gap-10
                                  lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-0
                                  lg:min-h-65">

            {/* Icono visible en mobile/tablet (la curva se oculta) */}
            <div className={`flex lg:hidden items-center justify-center
                             transition-all duration-700
                             ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <img src={icon} alt={team.title} className="w-10 h-10" />
            </div>

            <div className={`hidden lg:flex items-center justify-end
                             ${cardOnLeft ? '' : 'invisible'}`}>
                {cardOnLeft && <div className={cardReveal}><TeamCard team={team} /></div>}
            </div>

            <TeamCurve side={curveSide} active={inView}
                icon={icon} title={team.title} />

            <div className={`flex items-center w-full lg:w-auto justify-center
                             lg:justify-start ${cardOnLeft ? 'lg:invisible' : ''}`}>
                {/* En mobile/tablet se muestra siempre acá; en desktop solo si va a la derecha */}
                <div className={`${cardReveal} ${cardOnLeft ? 'lg:hidden' : ''}`}>
                    <TeamCard team={team} />
                </div>
            </div>
        </div>
    );
}
