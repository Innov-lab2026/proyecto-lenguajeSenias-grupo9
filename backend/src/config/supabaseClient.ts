import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente público
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente admin
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)