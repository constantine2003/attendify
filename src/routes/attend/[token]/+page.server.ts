import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.session) redirect(303, `/login?redirect=/attend/${params.token}`)

  // Find the session by token
  const { data: session } = await locals.supabase
    .from('attendance_sessions')
    .select('id, label, expires_at, class_id, classes(name)')
    .eq('token', params.token)
    .single()

  if (!session) {
    return { status: 'invalid' }
  }

  const now = new Date()
  const expiresAt = new Date(session.expires_at)

  if (now > expiresAt) {
    return { status: 'expired', session }
  }

  // Check if already marked
  const { data: existing } = await locals.supabase
    .from('attendance_records')
    .select('id')
    .eq('session_id', session.id)
    .eq('student_id', locals.session.user.id)
    .single()

  if (existing) {
    return { status: 'already_marked', session }
  }

  // Check if student is a member
  const { data: member } = await locals.supabase
    .from('class_members')
    .select('id')
    .eq('class_id', session.class_id)
    .eq('student_id', locals.session.user.id)
    .single()

  if (!member) {
    return { status: 'not_member', session }
  }

  // Mark present
  const { error } = await locals.supabase.from('attendance_records').insert({
    session_id: session.id,
    student_id: locals.session.user.id
  })

  if (error) return { status: 'error', message: error.message }

  return { status: 'success', session }
}