import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  cookies: {
    get(key) {
      if (isBrowser()) {
        const cookie = parse(document.cookie)
        return cookie[key]
      }
      return null
    },
    set(key, value) {
      if (isBrowser()) {
        document.cookie = `${key}=${value}; path=/; max-age=2592000` // 30 hari
      }
    },
    remove(key) {
      if (isBrowser()) {
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
      }
    }
  }
})

// Hapus atau rename fungsi proxy jika masih dibutuhkan
// async function fetchFromProxy... 

// Hapus export supabaseClient kedua
// export const supabaseClient = { ... } 