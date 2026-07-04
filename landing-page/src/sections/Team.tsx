import SectionLayout from '../layout/SectionLayout'
import ButtonSuccess from '../components/common/ButtonSuccess'
import TeamTimelineItem from '../components/team/TeamTimelineItem'
import TeamTail from '../components/team/TeamTail'
import { teamData } from '../data/TeamData'

import dataIcon from '../assets/images/team/data-icon.svg'
import uxuiIcon from '../assets/images/team/ux-ui-icon.svg'
import frontIcon from '../assets/images/team/front-icon.svg'
import backIcon from '../assets/images/team/back-icon.svg'
import testingIcon from '../assets/images/team/testing-icon.svg'

const teamIcons: Record<string, string> = {
    data: dataIcon,
    uxui: uxuiIcon,
    frontend: frontIcon,
    backend: backIcon,
    qa: testingIcon,
};

export default function Team() {
    return (
        <SectionLayout
            id="team">

            <div className="flex flex-col items-center gap-6 p-8 text-center">
                <h2 className="text-4xl font-bold mb-12">Personas que hacen posible CarpiSeñas</h2>

                <div className="flex flex-col w-full max-w-5xl gap-10 lg:gap-0">
                    {Object.entries(teamData).map(([key, team], index) => (
                        <TeamTimelineItem
                            key={key}
                            team={team}
                            icon={teamIcons[key]}
                            index={index}
                        />
                    ))}

                    {/* Cola recta que baja del último arco hacia el botón */}
                    <TeamTail />
                </div>

                <p className="self-center lg:self-end lg:mr-[10%] text-base font-semibold">
                    Coordinador: Gustavo Ovejero
                </p>

                <ButtonSuccess className="px-10">Comienza Ya</ButtonSuccess>
            </div>

        </SectionLayout>
    );
}
