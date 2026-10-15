import "server-only"

function readEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function getSupabaseServerConfig() {
  return {
    url: readEnv("SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: readEnv("SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  }
}

export function getSupabaseServiceConfig() {
  return {
    url: readEnv("SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  }
}
