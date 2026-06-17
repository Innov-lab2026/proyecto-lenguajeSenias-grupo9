import carpiArg from '../../assets/images/demo/carpi-arg.png'

export default function BenefitsIlustration() {
    
    return (
        <div className="transform scale-125 max-w-sm sm:max-w-none mx-auto sm:mx-0">
            <img
                src={carpiArg}
                alt="Carpincho usando la camiseta de argentina"
                className="w-full h-auto mb-15 "
            />
        </div>
    )
}