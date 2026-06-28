import SectionLayout from '../layout/SectionLayout';

export default function TermsAndConditions() {
  return (
    <SectionLayout id="terms-and-conditions" className="bg-[#F8FAFC] py-10 px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-accent/20">
        
        {/* Back button */}
        <a href="#home" className="inline-flex items-center gap-2 text-accent hover:text-accent-light font-bold mb-8 transition-colors">
          ← Volver al inicio
        </a>

        <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[#123062]">
          Términos y Condiciones
        </h1>
        <p className="text-sm opacity-70 mb-8">
          Última actualización: 27/06/2026
        </p>

        <div className="flex flex-col gap-6 text-base sm:text-lg leading-relaxed text-foreground">
          <p>
            Bienvenido/a a <strong>Carpiseñas</strong>.
          </p>
          <p>
            Estos Términos y Condiciones regulan el acceso y uso de la aplicación Carpiseñas. Al acceder o utilizar nuestro servicio, aceptas quedar vinculado por estos Términos.
          </p>
          
          <div className="bg-[#ACDCFF]/20 p-6 rounded-xl border border-accent/20">
            <h3 className="font-bold text-accent mb-2">Página en Construcción</h3>
            <p className="text-sm">
              Estamos trabajando en redactar los términos y condiciones específicos para Carpiseñas. El contenido estará disponible a la brevedad. Si tienes consultas legales o técnicas, por favor contáctanos.
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            Contacto
          </h2>
          <p>
            Si tienes dudas o preguntas sobre los Términos y Condiciones, puedes escribirnos a:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base mb-4">
            <li><strong>Email:</strong> <a href="mailto:contacto@carpisenas.com" className="text-accent hover:underline">contacto@carpisenas.com</a></li>
            <li><strong>Organización:</strong> Carpiseñas</li>
            <li><strong>Ubicación:</strong> Argentina</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
