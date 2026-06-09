import SectionLayout from '../layout/SectionLayout'
import ProjectFeatures from '../components/project/ProjectFeatures'
import ProjectHeader from '../components/project/ProjectHeader'


export default function Project() {
    return (
        <SectionLayout
            id="project"
        >
            <ProjectHeader />
            <ProjectFeatures />
            
        </SectionLayout>
    )
}