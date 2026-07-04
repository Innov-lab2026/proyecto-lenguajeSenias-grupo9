export default function Footer() {
  return (
    <footer className="bg-surface rounded-t-[2.5rem] md:rounded-t-[4rem] px-6 sm:px-12 md:px-20 lg:px-24 pt-12 pb-8 text-foreground relative z-10">
      <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 md:gap-6">
        
        {/* Marca / Branding */}
        <div className="flex flex-col gap-3 max-w-sm">
          <span className="font-bold text-3xl tracking-wide text-foreground">
            CarpiSeñas
          </span>
          <p className="text-sm leading-relaxed opacity-85">
            Acercando la Lengua de Señas Argentina (LSA) a todas las personas de forma accesible, divertida e interactiva.
          </p>
        </div>

        {/* Mapa de página / Sitemap */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-base uppercase tracking-wider text-foreground/80">
            Mapa de página
          </h4>
          <ul className="flex flex-col gap-2 text-sm font-semibold">
            <li>
              <a href="#home" className="hover:text-white hover:underline transition-all duration-200">
                Inicio
              </a>
            </li>
            <li>
              <a href="#project" className="hover:text-white hover:underline transition-all duration-200">
                Proyecto
              </a>
            </li>
            <li>
              <a href="#demo" className="hover:text-white hover:underline transition-all duration-200">
                Demo
              </a>
            </li>
            <li>
              <a href="#team" className="hover:text-white hover:underline transition-all duration-200">
                Equipo
              </a>
            </li>
          </ul>
        </div>

        {/* Enlaces Legales / Legal links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-base uppercase tracking-wider text-foreground/80">
            Legal
          </h4>
          <ul className="flex flex-col gap-2 text-sm font-semibold">
            <li>
              <a href="#terminos" className="hover:text-white hover:underline transition-all duration-200">
                Términos y Condiciones
              </a>
            </li>
            <li>
              <a href="#privacidad" className="hover:text-white hover:underline transition-all duration-200">
                Política de Privacidad
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Línea divisoria y Copyright */}
      <div className="max-w-7xl w-full mx-auto border-t border-foreground/15 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs sm:text-sm opacity-80 text-center sm:text-right">
          &copy; 2026 Carpiseñas. Todos los derechos reservados.
        </p>
        <div className="flex gap-4 text-xs sm:text-sm opacity-85">
          <span>Hecho con 💙 por el Grupo 9</span>
        </div>
      </div>
    </footer>
  );
}