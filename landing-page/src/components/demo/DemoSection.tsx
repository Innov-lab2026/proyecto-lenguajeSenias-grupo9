import ButtonSuccess from '../common/ButtonSuccess'
import FeatureCard from './DemoFeatureCard'
import SectionHeader from '../common/SectionHeader'
import letraA from '../../assets/images/demo/letra-A.webp'
import manito from '../../assets/images/demo/manito.svg'
import InteractiveDemo from './InteractiveDemo'

export default function DemoSection() {
    { /* Second section of Demo.tsx */ }

    return (
        <div className="
            bg-[url('./assets/images/demo/bg-demo-bottom.svg')] 
            bg-no-repeat bg-bottom bg-size-[100%_auto]
            flex flex-col items-center pb-20">

            { /* Titulo y descripcion */}
            <SectionHeader
                title="Aprendé jugando"
                text="Desde el abecedario hasta conversaciones cotidianas,
                    avanzá a tu ritmo mediante juegos y desafíos"
            />

            { /* Contenido principal */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 
                            mt-10 mb-20 mx-5 text-center h-full">

                { /* Cards */}
                <div className="flex flex-col gap-15 mb-10">

                    <FeatureCard
                        title="Abecedarios LSA"
                        description="Aprendé las letras del abecedario con ejercicios interactivos. Podés hacerlo por letra o ingresando la palabra que te interese."
                        image={letraA}
                        className="w-120" />

                    <FeatureCard
                        title="Palabras básicas"
                        description="Reconocé y practicá palabras del vocabulario cotidiano mediante desafios."
                        image={manito}
                        className="w-70" />

                </div>

                <InteractiveDemo />

            </div>

            <ButtonSuccess href="https://carpisenias.vercel.app/">
                Comenzar Gratis
            </ButtonSuccess>

        </div>
    )
}