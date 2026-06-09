import ButtonSuccess from "../components/common/ButtonSuccess";
import SectionLayout from "../layout/SectionLayout";
import heroDivider from "../assets/images/hero-divider.png";
import heroBg from "../assets/images/hero-bg.png";
import carpiLogo from "../assets/images/carpi_Logo.png";

/**
 * Hero reproducido desde el comp de Figma (lienzo fijo 1280px).
 * Coordenadas relativas al "stage" de 1280px (las del Figma menos los 140px
 * del header). El fondo celeste y el divisor van full-bleed; el texto y la
 * ilustración (domo + carpincho) quedan posicionados en absoluto para que no
 * se desacomoden entre sí al cambiar el tamaño de pantalla.
 */
export default function Hero() {
  return (
    <SectionLayout
      id="home"
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Fondo celeste (full-bleed), termina donde empieza el divisor */}
      <div className="absolute inset-x-0 top-0 z-0 h-138 bg-surface" />

      {/* Divisor curvo (full-bleed), continúa el celeste con borde curvo sobre el blanco */}
      <img
        src={heroDivider}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-138 z-1 w-full select-none"
      />

      {/* Stage fijo de 1280px centrado */}
      <div className="relative z-10 mx-auto h-173 w-7xl">
        <h1 className="absolute left-27.25 top-11 w-155.75 text-[64px] font-bold leading-[1.1]">
          Aprendé lengua de señas argentina jugando.
        </h1>

        <p className="absolute left-28 top-71.75 w-129.75 text-[30px] leading-[1.3]">
          Una app divertida e interactiva para aprender LSA a tu ritmo.
          Inclusiva, accesible y hecha para todos.
        </p>

        <div className="absolute left-28 top-111.25">
          <ButtonSuccess>Probá la Demo</ButtonSuccess>
        </div>

        {/* Ilustración: domo detrás + carpincho/celular, bloqueados como unidad */}
        <div className="absolute right-26 top-2.5">
          <img
            src={heroBg}
            alt=""
            aria-hidden="true"
            className="absolute left-[-49.5px] top-34.75 -z-10 h-111.25 w-[672.5px] max-w-none"
          />
          <img
            src={carpiLogo}
            alt="Carpincho usando la app CarpiSeñas en un celular"
            className="relative h-163.5 w-116.5 max-w-none drop-shadow-[5px_5px_20px_rgba(0,0,0,0.25)]"
          />
        </div>
      </div>
    </SectionLayout>
  );
}
