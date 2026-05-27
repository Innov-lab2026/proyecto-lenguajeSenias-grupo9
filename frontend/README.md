# Bienvenido a tu aplicación Expo 👋

Este es un proyecto de [Expo](https://expo.dev) creado con [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Cómo comenzar

1. Instalar dependencias

   ```bash
   cd frontend
   npm install
   ```

2. Iniciar la aplicación

   ```bash
   npx expo start
   ```

## Stack tecnológico

- Expo SDK 54
- Expo Router
- NativeWind v4 + Tailwind v3
- TanStack Query
- React Hook Form + Zod
- Axios
- Zustand
- tailwind-merge

## Estructura del proyecto

```
frontend/
├── app/                        ← routing (Expo Router)
│   ├── _layout.tsx             ← providers globales
│   ├── index.tsx               ← HomeScreen
│   ├── lessons/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           ← LessonList
│   │   └── [id].tsx            ← LessonDetail
│   └── practice/
│       └── index.tsx           ← PracticeScreen
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── features/           ← acá vive todo el contenido real
│   │       ├── lessons/
│   │       │   └── LessonCard.tsx    ← componente interno
│   │       ├── practice/
│   │       │   ├── SignPlayer.tsx
│   │       │   └── ExerciseCard.tsx
│   │       └── profile/
│   │           └── UserStats.tsx
│   ├── hooks/
│   │   ├── common/
│   │   │   └── useDebounce.ts
│   │   └── features/
│   │       ├── lessons/
│   │       │   └── useLessonProgress.ts
│   │       └── practice/
│   │           ├── useSignSession.ts
│   │           └── useCamera.ts
│   ├── services/
│   │   ├── http.ts
│   │   ├── lessons.ts
│   │   ├── practice.ts
│   │   └── users.ts
│   ├── store/
│   │   ├── sessionStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── lesson.ts
│   │   ├── practice.ts
│   │   └── user.ts
│   └── utils/
│       ├── score.ts
│       └── format.ts
├── assets/
│   ├── fonts/
│   └── images/
├── global.css
├── nativewind-env.d.ts
├── metro.config.js
├── tailwind.config.js
├── babel.config.js
├── app.json
├── tsconfig.json
└── package.json
```