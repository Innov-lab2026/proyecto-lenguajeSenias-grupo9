import SectionLayout from "../layout/SectionLayout";

export default function Hero() {
  return (
    <SectionLayout
      id="home"
      className="grid grid-cols-1 lg:grid-cols-2 items-center bg-gray-100 px-6 lg:px-16">

      <div className="max-w-6xl mx-auto px-6 lg:px-16 mb-15">
        <article className="flex flex-col gap-8 justify-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl max-w-xl">
            Aprende Lengua de Señas Argentina.
          </h1>

          <div className="text-lg lg:text-xl max-w-xl">
            <p>Una app divertida para aprender jugando a tu ritmo.</p>
            <p>Inclusiva, accesible y hecha para todos.</p>
          </div>

          <button className="w-fit px-8 py-3 mt-4 border rounded-lg self-center">
            Probar Demo
          </button>
        </article>

        <article className="flex justify-center lg:justify-end">
          <img src="" alt="" className="w-full max-w-137.5 h-auto" />
        </article>
      </div>

    </SectionLayout>
  );
}