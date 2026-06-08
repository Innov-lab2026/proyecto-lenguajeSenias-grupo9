import SectionLayout from '../layout/SectionLayout'

export default function Project() {
    return (
        <SectionLayout
            id="project"
            className="
                bg-gray-200
                "
        >
            <div className="max-w-6xl mx-auto px-6 lg:px-16 mb-15">

                <h1 className="text-4xl text-center font-medium mb-16">
                    ¿Qué es LSA App?
                </h1>

                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    <article className="flex justify-center">
                        <div className="w-64 h-64 bg-gray-300" />
                    </article>

                    <article className="max-w-md">
                        <p className="text-lg leading-relaxed mb-8">
                            Una app pensada para acercar el Lenguaje de Señas Argentina a
                            personas oyentes de manera accesible, divertida e inclusiva.
                        </p>

                        <p className="text-lg leading-relaxed">
                            Creemos en un mundo donde la comunicación no tenga barreras y el
                            aprendizaje sea una experiencia significativa para todos.
                        </p>
                    </article>
                </div>
            </div>

            <div className="bg-gray-200 py-4">
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