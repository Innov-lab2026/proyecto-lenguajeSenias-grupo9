import SectionLayout from '../layout/SectionLayout'

export default function Team() {
    return (
        <SectionLayout
            id="team"
            className="bg-gray-100">

            <div className="flex flex-col items-center justify-center gap-6 p-8 text-center h-full">
                <h1 className="text-4xl font-bold">Personas que hacen posible CarpiSeñas</h1>
            </div>

        </SectionLayout>
    );
}