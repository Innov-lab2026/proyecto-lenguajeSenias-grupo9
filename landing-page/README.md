# 🌟 CarpiSeñas - Landing Page

**CarpiSeñas** es una aplicación interactiva diseñada para acercar la **Lengua de Señas Argentina (LSA)** a personas de una manera accesible, divertida e inclusiva. A través de la gamificación y el uso de tecnologías modernas, el proyecto busca fomentar el respeto, la empatía y la inclusión a nivel social.

🔗 **Sitio desplegado:** [carpilanding.netlify.app](https://carpilanding.netlify.app/)

---

## 🛠️ Stack Tecnológico

El proyecto está construido sobre las siguientes tecnologías y herramientas modernas:

| Componente | Tecnología | Versión | Descripción |
| :--- | :--- | :--- | :--- |
| **Biblioteca Principal** | [React](https://react.dev/) | `^19.2.6` | Biblioteca para la construcción de interfaces de usuario reactivas. |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | `~6.0.2` | Superconjunto de JavaScript que añade tipado estático estricto. |
| **Entorno de Desarrollo** | [Vite](https://vite.dev/) | `^8.0.12` | Herramienta de compilación ultrarrápida para desarrollo frontend. |
| **Estilos (CSS)** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3.0` | Framework de CSS utilitario moderno (v4.3 con plugins nativos de Vite). |
| **Utilidad de clases** | [tailwind-merge](https://github.com/dcastil/tailwind-merge) | `^3.6.0` | Resuelve conflictos entre clases de Tailwind al componerlas. |
| **Linter / Estilo** | [ESLint](https://eslint.org/) | `^10.3.0` | Herramienta de análisis estático para garantizar la calidad del código. |

---

## 🔗 Relación con la app

La landing es la puerta de entrada: **todos los CTAs redirigen a la aplicación**, cuya URL está
centralizada en `src/constants/app.ts` (constante `APP_URL`). Si la app cambia de dominio, se
modifica en ese único lugar.

Además, la landing ofrece **instalar la app como PWA** sin salir del sitio:

| Pieza | Rol |
|---|---|
| `src/hooks/usePwaInstall.ts` | Escucha el evento `beforeinstallprompt` del navegador y expone si la app se puede instalar, si ya está instalada y la función para lanzar el instalador. |
| `src/components/ui/InstallPWAButton.tsx` | Botón flotante de instalación. Se oculta solo si la app ya está instalada y muestra instrucciones manuales en iOS, donde el navegador no permite el instalador automático. |

---

## 📁 Arquitectura de Carpetas

A continuación se detalla la estructura y propósito de los directorios del proyecto:

```text
landing-page/
├── public/                     # Recursos estáticos servidos tal cual desde la raíz
│   ├── favicon.svg             # Favicon del sitio
│   ├── icons.svg               # Sprite de iconos
│   └── og-image.png            # Imagen para Open Graph / Twitter cards
└── src/                        # Código fuente principal de la aplicación
    ├── assets/                 # Recursos visuales y tipografías
    │   ├── fonts/              # Fuentes tipográficas del proyecto (e.g., Nunito)
    │   └── images/             # Imágenes, iconos y recursos gráficos
    │       ├── demo/           # Fondos, iconos e ilustraciones de Demo y Beneficios
    │       ├── header/         # Iconos de la cabecera (hamburguesa, cerrar)
    │       ├── hero/           # Logo e ilustraciones de fondo de la sección Hero
    │       ├── project/        # Iconos de las características de la sección Project
    │       └── team/           # Iconos de redes sociales y roles del equipo
    ├── components/             # Componentes React reutilizables organizados por módulo
    │   ├── common/             # Genéricos compartidos (ButtonSuccess, SectionHeader)
    │   ├── demo/               # BenefitsSection, BenefitsContent, BenefitsIllustration,
    │   │                       #   DemoSection, DemoFeatureCard, InteractiveDemo y DataDemo
    │   ├── header/             # Navbar, DesktopMenu, MobileMenu, ToggleMenu, LogoText
    │   ├── hero/               # HeroContent y HeroIllustration
    │   ├── project/            # ProjectFeatures y ProjectFeatureCard
    │   ├── team/               # Línea de tiempo del equipo (TeamCard, TeamCurve,
    │   │                       #   TeamTail, TeamTimelineItem)
    │   └── ui/                 # InstallPWAButton: botón flotante para instalar la app
    ├── constants/              # Constantes compartidas
    │   └── app.ts              # APP_URL: destino de todos los CTAs hacia la aplicación
    ├── data/                   # Información estática y mockups
    │   ├── TeamData.js         # Datos del equipo (áreas, integrantes, enlaces)
    │   └── TeamData.d.ts       # Declaración de tipos para TeamData.js
    ├── hooks/                  # Custom Hooks de React
    │   ├── useInView.ts        # Detecta cuándo un elemento entra en pantalla (animaciones)
    │   └── usePwaInstall.ts    # Maneja la instalación de la app como PWA
    ├── layout/                 # Contenedores y estructuras de diseño (SectionLayout.tsx)
    ├── sections/               # Secciones principales renderizadas en App.tsx
    │   ├── Demo.tsx            # Sección que unifica Beneficios y la Demo de señas
    │   ├── Footer.tsx          # Pie de página
    │   ├── Header.tsx          # Barra de navegación principal
    │   ├── Hero.tsx            # Pantalla de inicio de la landing
    │   ├── PrivacyPolicy.tsx   # Página de política de privacidad
    │   ├── Project.tsx         # Introducción a CarpiSeñas
    │   ├── Team.tsx            # Presentación del equipo de colaboradores
    │   └── TermsAndConditions.tsx # Página de términos y condiciones
    ├── types/              # Declaraciones de interfaces y tipos TypeScript (team.ts)
    ├── App.tsx                 # Componente raíz de la aplicación
    ├── index.css               # Estilos globales y configuración/directivas de Tailwind CSS v4
    └── main.tsx                # Punto de entrada de la aplicación en React
```

---

## 💻 Configuración del Entorno de Desarrollo

Para ejecutar el proyecto de forma local, sigue estos pasos:

### 1. Clonar el repositorio e instalar dependencias
```bash
# Navegar al directorio del proyecto
cd landing-page

# Instalar dependencias
npm install
```

### 2. Comandos disponibles
* **Iniciar servidor de desarrollo:**
  ```bash
  npm run dev
  ```
  Esto inicia la aplicación en `http://localhost:5173/` con recarga rápida (HMR).

* **Compilar para producción:**
  ```bash
  npm run build
  ```
  Compila y optimiza los archivos TypeScript y CSS para el despliegue productivo.

* **Ejecutar el linter:**
  ```bash
  npm run lint
  ```
  Analiza el código buscando posibles errores o malas prácticas.

* **Previsualizar la build de producción:**
  ```bash
  npm run preview
  ```
  Permite levantar localmente la versión ya compilada del proyecto.

* **Publicar el sitio:**
  ```bash
  npm run deploy
  ```
  Compila el proyecto (`predeploy` ejecuta `npm run build`) y publica la carpeta `dist/`
  mediante `gh-pages`.

> ℹ️ El comando `build` corre `tsc -b` antes de compilar con Vite, así que **un error de tipos
> detiene el build**. Conviene correr `npm run lint` y `npm run build` antes de publicar.

---