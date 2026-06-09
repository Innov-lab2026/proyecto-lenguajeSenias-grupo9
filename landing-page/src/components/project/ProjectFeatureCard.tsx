export default function ProjectFeatureCard({title, description, image}: {title: string, description: string, image: string}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="w-16 h-16  shrink-0" />
            <div>
                <img src={image} alt={title} />
                <h2 className="font-medium mb-2">{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    )
}