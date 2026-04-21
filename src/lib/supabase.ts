import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export function createSupabaseLoadClient(fetchFn: typeof fetch) {
  return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: { fetch: fetchFn }
  })
}

export function createSupabaseServerClient(event: any) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) =>
        event.cookies.set(name, value, { ...options, path: '/' })
      )
    }
  })
}