export default function ProjectFeatureCard({ title, description, image }: { title: string, description: string, image: string }) {
    return (

        <div className="flex flex-col gap-0 md:gap-2 max-w-60 lg:max-w-71 mx-auto">

            <div className="flex items-center w-60 lg:w-80 h-60 lg:h-80">
                <img src={image} alt={title} className="w-full" loading="lazy"/>
            </div>

            <h3 className="font-extrabold 
                           text-xl lg:text-2xl 
                           text-center lg:text-left 
                           mb-2 whitespace-nowrap">
                {title}
            </h3>

            <p className="text-lg lg:text-xl 
                          text-center lg:text-left">
                {description}
            </p>
        </div>

    )
}