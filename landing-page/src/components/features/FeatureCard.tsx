export default function FeatureCard(
    { title, description, image, className }:
        { title: string, description: string, image: string, className?: string }) {

    return (
        <div className="flex gap-4 p-6 max-w-md rounded-xl text-left border-4 border-accent">
            <div>
                <img src={image} alt={title} className={className}  />
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-[24px]">{title}</h3>
                <p className="text-[16px]">{description}</p>
            </div>
        </div>
    )
}