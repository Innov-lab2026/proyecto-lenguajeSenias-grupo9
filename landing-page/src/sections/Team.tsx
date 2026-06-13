import SectionLayout from '../layout/SectionLayout'
import ButtonSuccess from '../components/common/ButtonSuccess'
import TeamTimelineItem from '../components/team/TeamTimelineItem'
import TeamTail from '../components/team/TeamTail'
import { teamData } from '../data/TeamData'

import dataIcon from '../assets/images/data-icon.svg'
import uxuiIcon from '../assets/images/ux-ui-icon.svg'
import frontIcon from '../assets/images/front-icon.svg'
import backIcon from '../assets/images/back-icon.svg'
import testingIcon from '../assets/images/testing-icon.svg'

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
                <h1 className="text-4xl font-bold mb-12">Personas que hacen posible CarpiSeñas</h1>

                <div className="flex flex-col w-full max-w-5xl">
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

                <p className="self-center md:self-end md:mr-[10%] text-[15px] font-semibold">
                    Coordinador: Gustavo Ovejero
                </p>

                <ButtonSuccess className="px-10">Comienza ya</ButtonSuccess>
            </div>

        </SectionLayout>
    );
}
