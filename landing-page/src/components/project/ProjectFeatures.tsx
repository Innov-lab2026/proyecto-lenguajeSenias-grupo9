import ProjectFeatureCard from './ProjectFeatureCard'
import feature1 from '../../assets/images/icon_1.png'
import feature2 from '../../assets/images/icon_5.png'
import feature3 from '../../assets/images/icon_6.png'

export default function ProjectFeatures() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-4 px-auto">
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