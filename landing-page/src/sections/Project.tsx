import SectionLayout from '../layout/SectionLayout'

export default function Project() {
    return (
        <SectionLayout
            id="project"
        >
            <div className="max-w-6xl mx-auto px-6 lg:px-16 my-10">

                <h1 className="text-4xl text-center font-bold text-[56px] mb-16 pt-10">
                    ¿Qué es CarpiSeñas?
                </h1>

                <p className="text-center text-[30px] leading-relaxed max-w-5xl mx-auto">
                    Carpiseñas es una App pensada para acercar el Lenguaje de 
                    Señas Argentina a personas oyentes de manera accesible, 
                    divertida e inclusiva.
                </p>
            </div>

            <div className=" py-4">
                <div className=" max-w-6xl mx-auto px-6 lg:px-16">

                    <article className="grid md:grid-cols-3 gap-10 ">

                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-300 shrink-0" />

                            <div>
                                <h2 className="font-medium mb-2">
                                    Lecciones cortas
                                </h2>

                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Contenido modular de 5 minutos diseñado para fijar conceptos
                                    sin abrumarte.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-300 shrink-0" />

                            <div>
                                <h2 className="font-medium mb-2">
                                    Aprendizaje interactivo
                                </h2>

                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Aprende jugando con ejercicios dinámicos y desafíos
                                    divertidos.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-300 shrink-0" />

                            <div>
                                <h2 className="font-medium mb-2">
                                    Progreso motivador
                                </h2>

                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Sumá puntos, completá niveles y desbloqueá logros mientras
                                    aprendés.
                                </p>
                            </div>
                        </div>

                    </article>
                </div>
            </div>
        </SectionLayout>
    )
}