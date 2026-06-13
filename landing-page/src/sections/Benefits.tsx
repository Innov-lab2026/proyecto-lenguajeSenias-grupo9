import SectionLayout from '../layout/SectionLayout'
import carpiArg from '../assets/images/CarpiArg.png'

export default function Benefits() {
    return (
        <SectionLayout
            id="benefits"
            className="bg-surface max-h-194.75">

            <div className="">
                <h2 className="text-[56px] font-bold text-center pb-20">¿Por qué usar CarpiSeñas?</h2>
                <div className="flex flex-col md:flex-row justify-evenly items-stretch gap-6 max-w-7xl mx-auto">
                    <div className="flex flex-col justify-center align-start gap-10 w-auto max-w-150 h-full">
                        <div className="flex flex-col gap-1 max-w-96">
                            <h3 className="text-[32px] font-bold">Inclusión y empatía</h3>
                            <p className="text-[24px]">Promovemos el respeto y la comprensión a través del lenguaje.</p>
                        </div>
                        <div className="flex flex-col gap-1 max-w-96">
                            <h3 className="text-[32px] font-bold">Educación innovadora</h3>
                            <p className="text-[24px]">Utilizamos la tecnología y el juego para mejorar el aprendizaje.</p>
                        </div>
                        <div className="flex flex-col gap-1 max-w-96">
                            <h3 className="text-[32px] font-bold">Comunidad</h3>
                            <p className="text-[24px]">Construimos un espacio para aprender y crecer juntos.</p>
                        </div>
                    </div>
                    <div className="min-w-[60%]  
                                    shrink-0 overflow-hidden bg-[url('./assets/images/benefits-bg.png')] 
                                    bg-no-repeat bg-contain bg-position-[10%_70%]">
                        
                        <img
                            src={carpiArg}
                            alt="Carpincho usando la camiseta de argentina"
                            className="w-10/12 h-auto transform translate-y-[-12%] max-w-none"
                        />
                    </div>
                </div>
            </div>

        </SectionLayout>
    );
}

// /* Vector 40 */

// position: absolute;
// width: 734px;
// height: 434px;
// left: 576px;
// top: 405px;

// background: #6CB6FF;
// box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);


// /* ChatGPT_Image_Jun_8__2026__04_57_51_PM-removebg-preview 1 */

// position: absolute;
// width: 694px;
// height: 761px;
// left: 541px;
// top: 110px;

// background: url(ChatGPT_Image_Jun_8__2026__04_57_51_PM-removebg-preview.png);
// filter: drop-shadow(0px 5px 25px rgba(0, 0, 0, 0.25));

/*
<SectionLayout
            id="benefits"
            className="bg-surface">

            <div className="flex flex-col items-center justify-center gap-6 p-8 h-full">
                <h2 className="text-[56px] font-bold">¿Por qué usar CarpiSeñas?</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4 max-w-96">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[32px] font-bold">Inclusión y empatía</h3>
                            <p className="text-[24px]">Promovemos el respeto y la comprensión a través del lenguaje.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[32px] font-bold">Educación innovadora</h3>
                            <p className="text-[24px]">Utilizamos la tecnología y el juego para mejorar el aprendizaje.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[32px] font-bold">Comunidad</h3>
                            <p className="text-[24px]">Construimos un espacio para aprender y crecer juntos.</p>
                        </div>
                    </div>
                    <div className="relative right-26 -bottom-10">
                        <img
                            src={benefitsBg}
                            alt=""
                            aria-hidden="true"
                            className="absolute left-[-49.5px] w-xl bottom-0 max-w-none"
                        />
                        <img
                            src={carpiArg}
                            alt="Carpincho usando la camiseta de argentina"
                            className="absolute w-2xl max-w-none"
                        />
                    </div>
                </div>
            </div>

        </SectionLayout>
*/