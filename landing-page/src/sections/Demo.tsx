import SectionLayout from '../layout/SectionLayout'
import demo from '../assets/images/demo.png'

export default function Demo() {
    return (
        <SectionLayout
            id="demo"
            className="bg-surface">

            <div className="flex flex-col md:flex-row justify-center gap-6 p-8 text-center h-full">
                <div className="flex flex-col gap-4 max-w-1/3">
                    <h2 className="text-[56px] text-left">Jugá y aprendé desde ahora</h2>
                    <p className="text-[35px] text-left">Explora una lección del abecedario y descubrí como es aprender LSA de forma divertida</p>
                </div>
                <div className="bg-[#123062] w-xl text-white flex flex-col items-center justify-center gap-4 p-8 rounded-4xl">
                    <img src={demo} alt="Demo" className="w-48 h-auto" />
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
                            focus-within:ring-2 focus-within:ring-primary
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
                            focus-within:ring-2 focus-within:ring-primary
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
                            focus-within:ring-2 focus-within:ring-primary
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
                            focus-within:ring-2 focus-within:ring-primary"
                            >
                            Chequear respuesta
                        </button>
                    </fieldset>
                </div>
            </div>

        </SectionLayout>
    )
}