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
            Los presentes Términos y Condiciones regulan el acceso, la navegación y el uso de la plataforma Carpiseñas (en adelante, la <strong>"Aplicación"</strong>), una aplicación educativa gamificada de microaprendizaje orientada a la enseñanza de la Lengua de Señas Argentina (LSA).
          </p>

          <p>
            Al registrarse, acceder o utilizar la Aplicación, el usuario declara haber leído, comprendido y aceptado estos Términos y Condiciones, así como la Política de Privacidad vigente.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">1. Objeto</h2>
          <p>
            Carpiseñas tiene como finalidad facilitar el aprendizaje progresivo de la Lengua de Señas Argentina mediante lecciones interactivas, contenido audiovisual, ejercicios prácticos, desafíos y recursos educativos diseñados para promover una comunicación más inclusiva.
          </p>
          <p>
            La Aplicación constituye una herramienta educativa y no reemplaza cursos oficiales, certificaciones profesionales ni formación académica especializada.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">2. Requisitos para el uso</h2>
          <p>
            Para utilizar determinadas funcionalidades será necesario crear una cuenta.
          </p>
          <p>
            El usuario declara que:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>posee capacidad legal para aceptar estos Términos;</li>
            <li>la información proporcionada durante el registro es verdadera, completa y actualizada;</li>
            <li>mantendrá la confidencialidad de sus credenciales de acceso;</li>
            <li>será responsable de toda actividad realizada desde su cuenta.</li>
          </ul>
          <p>
            Si el usuario es menor de 18 años, deberá contar con la autorización de sus padres o representantes legales.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">3. Registro de usuario</h2>
          <p>
            El usuario podrá registrarse utilizando los métodos de autenticación habilitados por la Aplicación.
          </p>
          <p>
            Cada cuenta es personal e intransferible. Carpiseñas podrá suspender o cancelar cuentas cuando detecte información falsa, uso fraudulento, incumplimiento de estos Términos o actividades que afecten la seguridad de la plataforma o de otros usuarios.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">4. Licencia de uso</h2>
          <p>
            Carpiseñas concede al usuario una licencia limitada, personal, revocable, no exclusiva e intransferible para utilizar la Aplicación únicamente con fines personales y educativos.
          </p>
          <p>
            El usuario no podrá copiar o distribuir el contenido sin autorización, modificar o realizar ingeniería inversa de la Aplicación, utilizar la plataforma con fines comerciales sin autorización expresa, intentar vulnerar los sistemas de seguridad ni utilizar bots o mecanismos automatizados para alterar el funcionamiento normal de la plataforma.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">5. Contenido educativo</h2>
          <p>
            El contenido disponible en Carpiseñas incluye videos, ilustraciones, imágenes, ejercicios interactivos, cuestionarios, desafíos, textos educativos y contenido multimedia.
          </p>
          <p>
            Todo el contenido tiene fines exclusivamente educativos. Procuramos mantener la información actualizada, aunque no garantizamos que esté completamente libre de errores u omisiones.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">6. Gamificación</h2>
          <p>
            La Aplicación puede incluir niveles, experiencia (XP), insignias, logros, rachas de aprendizaje, rankings y recompensas virtuales.
          </p>
          <p>
            Estos elementos tienen una finalidad motivacional y educativa y podrán modificarse, actualizarse o eliminarse para mejorar la experiencia de uso.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">7. Propiedad intelectual</h2>
          <p>
            Todos los derechos sobre la Aplicación, incluyendo software, diseño, contenido, imágenes, videos, logotipos, textos y bases de datos, pertenecen a Carpiseñas o a sus respectivos titulares.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">8. Conducta del usuario</h2>
          <p>
            El usuario se compromete a utilizar la Aplicación de forma responsable, respetuosa y conforme a la legislación vigente.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">9. Disponibilidad del servicio</h2>
          <p>
            La Aplicación podrá experimentar interrupciones temporales por mantenimiento, actualizaciones, fallas técnicas o causas de fuerza mayor.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">10. Actualizaciones</h2>
          <p>
            Carpiseñas podrá modificar funcionalidades, contenidos o características de la Aplicación cuando resulte necesario para mejorar el servicio.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">11. Servicios de terceros</h2>
          <p>
            La Aplicación puede utilizar servicios de terceros para autenticación, almacenamiento, analítica, notificaciones y monitoreo de errores.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">12. Suscripciones y funciones premium</h2>
          <p>
            En caso de incorporarse planes pagos, las condiciones económicas serán informadas antes de su contratación.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">13. Limitación de responsabilidad</h2>
          <p>
            Carpiseñas no será responsable por interrupciones temporales, pérdidas derivadas de factores ajenos a su control o daños indirectos ocasionados por el uso de la Aplicación.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">14. Protección de datos personales</h2>
          <p>
            El tratamiento de los datos personales se realiza conforme a la Política de Privacidad de Carpiseñas.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">15. Eliminación de la cuenta</h2>
          <p>
            El usuario podrá solicitar la eliminación de su cuenta mediante la Aplicación o escribiendo a <strong>contacto@carpisenas.com</strong>.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">16. Modificaciones</h2>
          <p>
            Carpiseñas podrá actualizar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor desde su publicación.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">17. Legislación aplicable</h2>
          <p>
            Estos Términos se regirán por las leyes de la República Argentina.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">18. Contacto</h2>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base mb-4">
            <li><strong>Carpiseñas</strong></li>
            <li><strong>Correo electrónico:</strong> contacto@carpisenas.com</li>
            <li><strong>Ubicación:</strong> República Argentina</li>
          </ul>
        </div>
      </div>
    </SectionLayout>
  );
}
