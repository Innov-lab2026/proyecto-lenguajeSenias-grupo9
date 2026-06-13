import ButtonSuccess from "../components/common/ButtonSuccess";
import SectionLayout from "../layout/SectionLayout";
import carpiLogo from "../assets/images/carpi_Logo.png";

export default function Hero() {
  return (
    <SectionLayout
      id="home"
      className="flex flex-col sm:flex-row justify-stretch sm:justify-evenly 
                items-center sm:items-stretch pb-12 sm:pb-0 
                bg-[url('./assets/images/hero-bg2.png')] bg-no-repeat bg-cover 
                min-h-0 max-h-166.75 overflow-x-clip"
    >

      <div className="flex flex-col justify-start sm:justify-center
                    items-center sm:items-start gap-4 md:gap-10 sm:min-w-85 md:min-w-100 lg:min-w-148 max-w-2xl
                    h-auto sm:h-full p-0 sm:py-0 pl-17"
      >

        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-[1.1]">
          Aprendé lengua de señas argentina jugando.
        </h1>

        <p className="text-lg md:text-xl lg:text-3xl leading-[1.3]">
          Una app divertida e interactiva para aprender LSA a tu ritmo.
          Inclusiva, accesible y hecha para todos.
        </p>

        <div>
          <ButtonSuccess>
            Probá la Demo
          </ButtonSuccess>
        </div>

      </div>
      <div className="relative left-20 md:shrink-0 w-full sm:min-w-80 md:w-1/2 md:max-w-192.5 
                     bg-[url('./assets/images/hero-bg.png')] 
                     bg-no-repeat bg-position-[left_70%] sm:bg-position-[10%_103%] 
                     bg-size-[100%_132%] sm:bg-size-[100%_auto]"
      >
        <img
          src={carpiLogo}
          alt="Carpincho usando la app CarpiSeñas en un celular"
          className="w-[70%] max-w-125 h-auto transform  
                        translate-x-[5.25%] sm:translate-x-[17%] translate-y-[-29%]
                        sm:translate-y-[10%]"
        />
      </div>

    </SectionLayout>
  );
}
