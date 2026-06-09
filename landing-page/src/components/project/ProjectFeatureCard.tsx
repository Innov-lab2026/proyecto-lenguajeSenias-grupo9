export default function ProjectFeatureCard({ title, description, image }: { title: string, description: string, image: string }) {
    return (

        <div className="flex flex-col gap-2 max-w-71 mx-auto">
            <img src={image} alt={title} className="w-80" />
            <h2 className="font-extrabold text-[24px] mb-2 whitespace-nowrap">{title}</h2>
            <p className="text-[20px]">{description}</p>
        </div>

    )
}