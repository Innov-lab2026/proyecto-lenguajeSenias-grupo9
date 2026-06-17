import carpiLogo from "../../assets/images/hero/carpi-logo.webp";

export default function HeroIllustration() {

    return (
        <div className="relative left-10 md:shrink-0 
                     w-full sm:min-w-80 md:w-1/2 md:max-w-192.5 
                     bg-[url('./assets/images/hero/hero-bg.webp')] 
                     bg-no-repeat bg-position-[10%_103%] 
                     bg-size-[100%_auto] sm:overflow-visible"
        >
            <img
                src={carpiLogo}
                alt="Carpincho usando la app CarpiSeñas en un celular"
                className="w-[70%] max-w-125 h-auto transform   
                        translate-x-[18.25%] sm:translate-x-[17%]
                        translate-y-[5%] sm:translate-y-[10%]"
            />
        </div>
    )
}