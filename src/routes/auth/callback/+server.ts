import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code')
  if (code) {
    const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code)
    console.log('=== AUTH CALLBACK ===')
    console.log('exchange error:', error?.message ?? 'none')
    console.log('session user:', data.session?.user?.id ?? 'NULL')
    console.log('====================')
  }

  const { data: { session } } = await locals.supabase.auth.getSession()
  if (!session) redirect(303, '/login')

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile) redirect(303, '/signup')
  if (profile.role === 'teacher') redirect(303, '/dashboard/teacher')
  if (profile.role === 'student') redirect(303, '/dashboard/student')
  redirect(303, '/login')
}