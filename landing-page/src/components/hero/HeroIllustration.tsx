import carpiLogo from "../../assets/images/hero/carpi_hero.webp";

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
                width={1500}
                height={1713}
                className="w-[85%] sm:w-[79%] max-w-153 h-auto transform
                            translate-x-[3.6%] sm:translate-x-[2.6%]
                            translate-y-[12.7%] sm:translate-y-[30%] md:translate-y-[15%] lg:translate-y-[30%] xl:translate-y-[15%]"
                fetchPriority="high"
            />
        </div>
    )
}