/**
 * Modo mock: desarrollar/QA sin backend (login, registro y perfil responden con
 * datos de prueba). Se activa con EXPO_PUBLIC_USE_MOCK_AUTH=true en el .env.
 * Google OAuth NO se mockea (usa Supabase real), por eso en mock se oculta el botón.
 */
export const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true'
