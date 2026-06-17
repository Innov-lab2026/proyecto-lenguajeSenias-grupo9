import type { TeamInfo } from '../../types/team';
import linkedinIcon from '../../assets/images/team/linkedin-icon.svg';
import githubIcon from '../../assets/images/team/github-icon.svg';

// Icono pintado con máscara CSS para poder cambiarle el color en hover
// (los SVG son monocromos negros)
function MemberIcon({ icon, alt, dimmed = false }:
    { icon: string; alt: string; dimmed?: boolean }) {
    return (
        <span
            role="img"
            aria-label={alt}
            className={`inline-block w-5 h-5 cursor-pointer transition-colors
                        ${dimmed ? 'bg-foreground/40' : 'bg-foreground'}
                        hover:bg-accent`}
            style={{
                maskImage: `url("${icon}")`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
            }}
        />
    );
}

function MemberLink({ href, icon, alt }: { href: string; icon: string; alt: string }) {
    if (!href) {
        // Link pendiente: icono atenuado, pero con hover/pointer
        return <MemberIcon icon={icon} alt={alt} dimmed />;
    }
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className="transition-transform hover:scale-110">
            <MemberIcon icon={icon} alt={alt} />
        </a>
    );
}

export default function TeamCard({ team }: { team: TeamInfo }) {
    return (
        <div className="flex flex-col gap-3 p-6 w-full max-w-md text-left
                        bg-white rounded-xl border-2 border-accent shadow-md">
            <h3 className="font-bold text-[24px] text-accent">{team.title}</h3>
            <p className="text-[15px]">{team.description}</p>

            <ul className="flex flex-col divide-y divide-accent/30 border-t border-accent/30">
                {team.members.map((member) => (
                    <li key={member.name}
                        className="flex items-center justify-between py-2">
                        <span className="text-[16px] font-semibold">{member.name}</span>
                        <span className="flex items-center gap-2">
                            <span aria-hidden="true" className="text-accent/50">|</span>
                            <MemberLink href={member.linkedin} icon={linkedinIcon} alt={`LinkedIn de ${member.name}`} />
                            <MemberLink href={member.github} icon={githubIcon} alt={`GitHub de ${member.name}`} />
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
