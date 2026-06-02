export default function Hero() {
  return (
<section
  className="
    grid
    grid-cols-1
    lg:grid-cols-2
    min-h-[calc(100vh-5rem)]
    items-center
    bg-gray-100
    px-6
    lg:px-16
  "
>
  <article className="flex flex-col gap-8">
    <h1 className="text-4xl lg:text-5xl xl:text-6xl max-w-xl">
      Aprende Lengua de Señas Argentina.
    </h1>

    <div className="text-lg lg:text-xl max-w-xl">
      <p>Una app divertida para aprender jugando a tu ritmo.</p>
      <p>Inclusiva, accesible y hecha para todos.</p>
    </div>

    <button className="w-fit px-8 py-3 border rounded-lg">
      Probar Demo
    </button>
  </article>

  <article className="flex justify-center lg:justify-end">
    <img
      src=""
      alt=""
      className="w-full max-w-137.5 h-auto"
    />
  </article>
</section>
  );
}

