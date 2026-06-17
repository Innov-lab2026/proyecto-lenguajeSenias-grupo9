import ButtonSuccess from "../common/ButtonSuccess";

export default function HeroContent() {

    return (
        <div className="flex flex-col justify-start sm:justify-center 
                    text-center sm:text-left items-center sm:items-start 
                    gap-4 md:gap-10 w-full sm:min-w-85 md:min-w-100 lg:min-w-148 
                    max-w-11/12 sm:max-w-2xl h-auto sm:h-full 
                    p-0 px-[5%] sm:px-0 sm:py-0 sm:pl-17 z-10"
        >

            <h1 className="text-4xl  lg:text-6xl font-bold leading-[1.1]">
                Aprendé lengua de señas argentina jugando.
            </h1>

            <p className="text-xl lg:text-3xl leading-[1.3]">
                Una app divertida e interactiva para aprender LSA a tu ritmo.
                Inclusiva, accesible y hecha para todos.
            </p>

            <div>
                <ButtonSuccess className="mb-10">
                    Probá la Demo
                </ButtonSuccess>
            </div>

        </div>
    )
}