import { createSupabaseServerClient } from '$lib/supabase'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient(event)

  const { data: { user }, error } = await event.locals.supabase.auth.getUser()

  console.log('=== AUTH DEBUG ===')
  console.log('user:', user?.id ?? 'NULL')
  console.log('error:', error?.message ?? 'none')
  console.log('cookies:', event.cookies.getAll().map(c => c.name))
  console.log('=================')

  if (user) {
    event.locals.session = { user } as any

    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    event.locals.userRole = profile?.role ?? null
  } else {
    event.locals.session = null
    event.locals.userRole = null
  }

  return resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-range'
  })
}