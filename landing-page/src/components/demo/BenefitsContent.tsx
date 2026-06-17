export default function BenefitsContent({ icon, title, text }:
    { icon: string, title: string, text: string }) {

    return (
        <div className="flex flex-col gap-1">
            <h3 className="flex items-center gap-2 text-2xl lg:text-3xl font-bold">
                <img src={icon} className="w-6 h-6" alt="" />
                {title}
            </h3>
            <p className="text-xl lg:text-2xl ">{text}</p>
        </div>
    )
}