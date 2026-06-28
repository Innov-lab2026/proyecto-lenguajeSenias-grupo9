import SectionLayout from '../layout/SectionLayout';

export default function PrivacyPolicy() {
  return (
    <SectionLayout id="privacy-policy" className="bg-[#F8FAFC] py-10 px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-accent/20">
        
        {/* Back button */}
        <a href="#home" className="inline-flex items-center gap-2 text-accent hover:text-accent-light font-bold mb-8 transition-colors">
          ← Volver al inicio
        </a>

        <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[#123062]">
          Política de Privacidad
        </h1>
        <p className="text-sm opacity-70 mb-8">
          Última actualización: 27/06/2026
        </p>

        <div className="flex flex-col gap-6 text-base sm:text-lg leading-relaxed text-foreground">
          <p>
            Bienvenido/a a <strong>Carpiseñas</strong>.
          </p>
          <p>
            La presente Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos los datos personales de los usuarios de nuestra plataforma de aprendizaje de lengua de señas.
          </p>
          <div className="bg-[#ACDCFF]/20 p-4 rounded-xl border-l-4 border-accent text-sm sm:text-base">
            Al utilizar la Aplicación, usted acepta las prácticas descriptas en esta Política.
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            1. Responsable del tratamiento de datos
          </h2>
          <p>
            El responsable de la base de datos y del tratamiento de los datos personales es:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-sm sm:text-base">
            <li><strong>Nombre o Razón Social:</strong> Carpiseñas</li>
            <li><strong>Domicilio:</strong> Argentina</li>
            <li><strong>Correo electrónico de contacto:</strong> <a href="mailto:contacto@carpisenas.com" className="text-accent hover:underline">contacto@carpisenas.com</a></li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            2. Datos que recopilamos
          </h2>
          <p>
            Podemos recopilar las siguientes categorías de información:
          </p>
          
          <h3 className="text-lg sm:text-xl font-bold mt-4 text-accent">
            2.1 Datos de registro y autenticación
          </h3>
          <p>
            Cuando crea una cuenta o inicia sesión, podemos recopilar:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>Nombre y apellido.</li>
            <li>Dirección de correo electrónico.</li>
            <li>Contraseña cifrada o credenciales autenticadas mediante terceros.</li>
            <li>Identificador de usuario.</li>
            <li>Fecha de registro.</li>
            <li>Información básica del perfil.</li>
          </ul>

          <h3 className="text-lg sm:text-xl font-bold mt-4 text-accent">
            2.2 Datos de uso y métricas
          </h3>
          <p>
            Con el fin de mejorar la experiencia de aprendizaje y el funcionamiento de la Aplicación, recopilamos:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>Progreso de aprendizaje.</li>
            <li>Lecciones completadas.</li>
            <li>Tiempo de uso.</li>
            <li>Tipo de dispositivo.</li>
            <li>Dirección IP aproximada.</li>
          </ul>

          <h3 className="text-lg sm:text-xl font-bold mt-4 text-accent">
            2.3 Datos para recomendaciones personalizadas
          </h3>
          <p>
            Podemos utilizar información relacionada con:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>Nivel de aprendizaje.</li>
            <li>Preferencias de contenido.</li>
            <li>Historial de uso.</li>
            <li>Interacciones con ejercicios y lecciones.</li>
          </ul>
          <p>
            Esto nos permite ofrecer contenido, ejercicios o recomendaciones adaptadas al usuario.
          </p>

          <h3 className="text-lg sm:text-xl font-bold mt-4 text-accent">
            2.4 Datos sensibles
          </h3>
          <p>
            La Aplicación no solicita ni requiere datos sensibles en los términos de la normativa de protección de datos aplicable, salvo que el usuario los proporcione voluntariamente.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            3. Finalidad del tratamiento de los datos
          </h2>
          <p>
            Los datos personales serán utilizados para:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>Permitir el registro e inicio de sesión.</li>
            <li>Gestionar cuentas de usuario.</li>
            <li>Personalizar la experiencia de aprendizaje.</li>
            <li>Mejorar la calidad de la Aplicación.</li>
            <li>Obtener métricas y estadísticas de uso.</li>
            <li>Detectar errores, fraudes o usos indebidos.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            4. Base legal del tratamiento
          </h2>
          <p>
            El tratamiento de los datos se realiza sobre la base del:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>Consentimiento del usuario.</li>
            <li>Ejecución de la relación contractual derivada del uso de la Aplicación.</li>
            <li>Interés legítimo en mejorar y proteger nuestros servicios.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            5. Compartición de datos con terceros
          </h2>
          <p>
            Podemos compartir cierta información con proveedores tecnológicos que prestan servicios para el funcionamiento de la Aplicación, por ejemplo:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>Servicios de autenticación.</li>
            <li>Almacenamiento en la nube.</li>
            <li>Analítica y métricas.</li>
            <li>Procesamiento de errores y rendimiento.</li>
          </ul>
          <p>
            Estos terceros únicamente accederán a la información necesaria para prestar sus servicios y deberán cumplir obligaciones de confidencialidad y seguridad.
          </p>
          <p className="font-semibold text-accent">
            No comercializamos datos personales de nuestros usuarios.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            6. Transferencias internacionales
          </h2>
          <p>
            Algunos proveedores tecnológicos pueden almacenar o procesar información en servidores ubicados fuera de la República Argentina. En tales casos, adoptaremos medidas razonables para garantizar un nivel adecuado de protección de los datos personales conforme a la normativa aplicable.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            7. Conservación de los datos
          </h2>
          <p>
            Los datos personales serán conservados:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>Mientras la cuenta del usuario permanezca activa.</li>
            <li>Durante el tiempo necesario para cumplir las finalidades descriptas.</li>
            <li>Hasta que el usuario solicite su eliminación, salvo obligación legal de conservación.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            8. Seguridad de la información
          </h2>
          <p>
            Implementamos medidas técnicas y organizativas razonables para proteger los datos personales contra accesos no autorizados, pérdida, alteración, divulgación indebida o destrucción accidental. Sin embargo, ningún sistema es completamente seguro y no podemos garantizar seguridad absoluta.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            9. Derechos del titular de los datos
          </h2>
          <p>
            De conformidad con la legislación aplicable en materia de protección de datos personales, incluyendo la Ley N.º 25.326 de la República Argentina y, cuando corresponda, otras normativas internacionales aplicables, el usuario podrá ejercer los siguientes derechos respecto de sus datos personales:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-sm sm:text-base">
            <li>Acceso a sus datos personales.</li>
            <li>Rectificación de datos inexactos.</li>
            <li>Actualización.</li>
            <li>Supresión de datos.</li>
            <li>Revocación del consentimiento.</li>
          </ul>
          <p>
            Para ejercer estos derechos, podrá contactarse a: <a href="mailto:contacto@carpisenas.com" className="text-accent hover:underline">contacto@carpisenas.com</a>
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            10. Autoridad de control
          </h2>
          <p>
            En Argentina, la Agencia de Acceso a la Información Pública (AAIP), en su carácter de autoridad de control de la Ley N.º 25.326 de Protección de Datos Personales, tiene la facultad de atender denuncias y reclamos relacionados con el incumplimiento de las normas sobre protección de datos personales.
          </p>
          <p>
            Si usted reside en otra jurisdicción, también podrá tener derecho a presentar reclamaciones ante la autoridad de protección de datos competente de su país o región, de conformidad con la legislación aplicable.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            11. Menores de edad
          </h2>
          <p>
            La Aplicación no está dirigida a menores de 18 años sin autorización de sus representantes legales. Si detectamos que hemos recopilado datos personales de menores sin autorización válida, podremos eliminar dicha información.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            12. Cookies y tecnologías similares
          </h2>
          <p>
            La Aplicación puede utilizar cookies o tecnologías equivalentes para recordar sesiones, analizar uso y rendimiento, personalizar contenidos y mejorar la experiencia del usuario. El usuario puede configurar su navegador o dispositivo para rechazar ciertas cookies, aunque esto podría afectar funcionalidades.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            13. Eliminación de cuenta
          </h2>
          <p>
            El usuario podrá solicitar la eliminación de su cuenta y sus datos personales mediante la configuración de la Aplicación, o enviando una solicitud a: <a href="mailto:contacto@carpisenas.com" className="text-accent hover:underline">contacto@carpisenas.com</a>. La eliminación podrá estar sujeta a obligaciones legales de conservación.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            14. Cambios en esta Política
          </h2>
          <p>
            Podremos actualizar esta Política de Privacidad ocasionalmente. Las modificaciones entrarán en vigencia desde su publicación en la Aplicación. Recomendamos revisar periódicamente esta sección.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-6 text-[#123062] border-b border-accent/20 pb-2">
            15. Contacto
          </h2>
          <p>
            Si tiene preguntas sobre esta Política de Privacidad o sobre el tratamiento de sus datos personales, puede contactarnos:
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
