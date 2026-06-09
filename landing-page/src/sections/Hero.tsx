import ButtonSuccess from "../components/common/ButtonSuccess";
import SectionLayout from "../layout/SectionLayout";
import heroDivider from "../assets/images/hero-divider.png";

export default function Hero() {
  return (
    <SectionLayout
      id="home"
    >
      <div className="relative bg-surface grid grid-cols-1 lg:grid-cols-2 items-center px-6">
        <div className="max-w-6xl mx-auto px-6 mb-15 mt-15">
          <article className="flex flex-col gap-8 justify-center">
            <h1 className="text-4xl lg:text-[64px] xl:text-[64px] font-regular max-w-xl">
              Aprendé lengua de señas argentina jugando.
            </h1>

            <div className="text-lg lg:text-[30px] max-w-xl">
              <p>Una app divertida para aprender jugando a tu ritmo.
                Inclusiva, accesible y hecha para todos.</p>
            </div>
            {/* w-fit px-8 py-3 mt-4 border rounded-lg self-center */}
            <ButtonSuccess children="Probá la Demo" className="w-fit"></ButtonSuccess>
          </article>

        </div>
      </div>
      <div aria-hidden="true">
        <img
          src={heroDivider}
          alt="hero-divider"
          className="block w-full h-auto"
        />
      </div>

    </SectionLayout>
  );
}