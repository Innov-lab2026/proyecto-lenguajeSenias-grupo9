export default function FeatureCard(
    { title, description, image, className }:
        { title: string, description: string, image: string, className?: string }) {

    return (
        <div className="bg-[#F5FBFF]/40 flex flex-col min-[470px]:flex-row gap-4 p-6 max-w-md rounded-xl text-left border-4 border-accent">
            <div>
                <img src={image} alt={title} className={className} loading="lazy" />
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-2xl">{title}</h3>
                <p className="text-base">{description}</p>
            </div>
        </div>
    )
}