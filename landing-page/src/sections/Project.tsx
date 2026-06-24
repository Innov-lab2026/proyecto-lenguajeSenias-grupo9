import SectionLayout from '../layout/SectionLayout'
import ProjectFeatures from '../components/project/ProjectFeatures'
import SectionHeader from '../components/common/SectionHeader'


export default function Project() {
    return (
        <SectionLayout
            id="project"
            className="mt-25"
        >
            <SectionHeader
                title="¿Qué es CarpiSeñas?"
                text="Carpiseñas es una App pensada para acercar el Lenguaje de
                    Señas Argentina a personas oyentes de manera accesible,
                    divertida e inclusiva."
                className="my-10"
            />
            <ProjectFeatures />

        </SectionLayout>
    )
}