import ButtonSuccess from '../common/ButtonSuccess'
import FeatureCard from './FeatureCard'
import SectionHeader from '../common/SectionHeader'
import demo from '../../assets/images/demo/demo.png'
import letraA from '../../assets/images/demo/letra-A.webp'
import manito from '../../assets/images/demo/manito.svg'

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
                        description="Aprende las letras del abecedario con ejercicios interactivos. Puedes hacerlo por letra o ingresando la palabra que te interese."
                        image={letraA}
                        className="w-120" />

                    <FeatureCard
                        title="Palabras básicas"
                        description="Reconoce y practica palabras del vocabulario cotidiano mediante desafios."
                        image={manito}
                        className="w-70" />

                </div>

                { /* Demo mock temporal */}
                <div className="bg-[#123062]  text-white 
                                    flex flex-col items-center justify-center gap-4 
                                    p-8 rounded-4xl aspect-[1/1.39]">

                    <img src={demo} alt="Demo" className="w-48 h-auto" loading="lazy" />

                    <fieldset className="grid grid-cols-3 grid-rows-2 gap-8 py-8">

                        <legend className="grid col-span-3 row-span-1 text-center">
                            ¿Qué letra representa esta seña?
                        </legend>

                        <label className="
                            h-14 w-14 cursor-pointer
                            items-center justify-center
                            rounded-md border
                            grid col-span-1 row-span-1
                            hover:bg-accent
                            focus-within:ring-2 
                        ">
                            <input
                                type="radio"
                                name="answer"
                                value="A"
                                className="sr-only"
                            />
                            A
                        </label>

                        <label className="
                            h-14 w-14 cursor-pointer
                            items-center justify-center
                            rounded-md border
                            grid col-span-1 row-span-1
                            hover:bg-accent
                            focus-within:ring-2
                        ">
                            <input
                                type="radio"
                                name="answer"
                                value="B"
                                className="sr-only"
                            />
                            B
                        </label>

                        <label className="
                            h-14 w-14 cursor-pointer
                            items-center justify-center
                            rounded-md border
                            grid col-span-1 row-span-1
                            hover:bg-accent
                            focus-within:ring-2
                        ">
                            <input
                                type="radio"
                                name="answer"
                                value="C"
                                className="sr-only" />
                            C
                        </label>

                        <button className="
                            col-span-3 row-span-1 bg-primary 
                            text-white py-2 px-4 rounded-md
                            border border-white hover:bg-accent
                            focus-within:ring-2"
                        >
                            Chequear respuesta
                        </button>

                    </fieldset>

                </div>

            </div>

            <ButtonSuccess>
                Comenzar gratis
            </ButtonSuccess>

        </div>
    )
}