import ProjectFeatureCard from './ProjectFeatureCard'
import feature1 from '../../assets/images/project/icon-1.webp'
import feature2 from '../../assets/images/project/icon-2.webp'
import feature3 from '../../assets/images/project/icon-3.webp'

export default function ProjectFeatures() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-4 py-4 px-auto">
            <ProjectFeatureCard
                title="Lecciones cortas"
                description="Fijá conceptos en 5 minutos sin abrumarte."
                image={feature1}
            />
            <ProjectFeatureCard
                title="Aprendizaje interactivo"
                description="Practicá en tiempo real y recibí feedback al instante."
                image={feature2}
            />
            <ProjectFeatureCard
                title="Progreso motivador"
                description="Ganá recompensas, subí de nivel y mantené tu racha activa."
                image={feature3}
            />
        </div>
    )
}