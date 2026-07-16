import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

// público
export const supabase = createClient(
  requireEnv('SUPABASE_URL', supabaseUrl),
  requireEnv('SUPABASE_ANON_KEY', supabaseAnonKey),
)

// admin (bypass RLS; usar sólo en servicios ya autenticados por middleware)
export const supabaseAdmin = createClient(
  requireEnv('SUPABASE_URL', supabaseUrl),
  requireEnv('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceKey),
)
