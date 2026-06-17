
/* Header for Demo and Project sections */
export default function SectionHeader({ title, text, className }:
    { title: string, text: string, className?: string }) {

    return (
        <div className={`mx-auto px-6 lg:px-16 ${className}`}>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl 
                           text-center font-bold mb-10 pt-10">
                {title}
            </h2>

            <p className="text-xl sm:text-2xl lg:text-3xl text-center 
                          leading-relaxed max-w-5xl mx-auto">
                {text}
            </p>
        </div>
    )
}