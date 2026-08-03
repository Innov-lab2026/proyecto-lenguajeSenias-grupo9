import carpiArg from '../../assets/images/demo/carpi_sena.webp'

export default function BenefitsIlustration() {
    
    return (
        <div className="transform sm:scale-120 max-w-sm sm:max-w-none mx-auto sm:mx-0">
            <img
                src={carpiArg}
                alt="Carpincho usando la camiseta de argentina"
                className="w-full h-auto mb-15"
                loading="lazy"
            />
        </div>
    )
}