import FeatureCard from '../components/features/FeatureCard'
import letraA from '../assets/images/letra-A.png'
import manito from '../assets/images/manito.svg'

import SectionLayout from '../layout/SectionLayout'

export default function Features() {
    return (
        <SectionLayout
            id="features">

            <div className="flex flex-col items-center justify-center gap-6 pt-22 text-center h-full">
                <h2 className="text-[56px] pb-12">Aprende paso a paso</h2>
                <div className="flex flex-col md:flex-row gap-6">
                    <FeatureCard
                        title="Abecedarios LSA"
                        description="Aprende las letras del abecedario con ejercicios interactivos. Puedes hacerlo por letra o ingresando la palabra que te interese."
                        image={letraA}
                        className="w-120" />
                    <FeatureCard
                        title="Palabras básicas"
                        description="Reconoce y practica palabras del vocabulario cotidiano mediante desafios."
                        image={manito}
                        className="w-70" />
                </div>
            </div>

        </SectionLayout>
    );
}