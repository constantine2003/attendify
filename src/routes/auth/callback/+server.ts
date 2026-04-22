import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code')

  if (code) {
    await locals.supabase.auth.exchangeCodeForSession(code)
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