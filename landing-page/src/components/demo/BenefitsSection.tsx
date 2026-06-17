import BenefitsContent from './BenefitsContent'
import iconCheck from '../../assets/images/demo/icon-check.svg'
import BenefitsIlustration from './BenefitsIlustration'

export default function BenefitsSection() {
    { /* First section of Demo.tsx */ }

    return (

        <div className="
            max-[430px]:bg-[url('./assets/images/demo/bg-demo-mobile.svg')]
            min-[430px]:max-[640px]:bg-[url('./assets/images/demo/bg-demo-tablet.svg')]
            min-[640px]:max-[1300px]:bg-[url('./assets/images/demo/bg-demo-desktop.svg')]
            min-[1300px]:max-[1635px]:bg-[url('./assets/images/demo/bg-demo-full.svg')]
            min-[1635px]:bg-[url('./assets/images/demo/bg-demo-full-2.svg')]
            bg-no-repeat bg-top bg-size-[100%_auto]
            flex flex-col items-center py-10 sm:py-20 lg:py-35 overflow-hidden">

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center">
                ¿Por qué usar CarpiSeñas?
            </h2>


            <div className="grid grid-cols-1 sm:grid-cols-2 mt-10 sm:mt-20 gap-6 w-full px-5 md:px-10 lg:px-20 max-w-7xl">
                { /* Content */}
                <div className="flex flex-col align-start gap-5 lg:gap-10 w-80 md:w-100 h-full px-auto sm:px-0">

                    <BenefitsContent
                        icon={iconCheck}
                        title="Inclusión y empatía"
                        text="Promovemos el respeto y la comprensión a través del lenguaje."
                    />

                    <BenefitsContent
                        icon={iconCheck}
                        title="Educación innovadora"
                        text="Utilizamos la tecnología y el juego para mejorar el aprendizaje."
                    />

                    <BenefitsContent
                        icon={iconCheck}
                        title="Comunidad"
                        text="Construimos un espacio para aprender y crecer juntos."
                    />
                </div>

                { /* Image */}
                <BenefitsIlustration />

            </div>

        </div>
    )
}