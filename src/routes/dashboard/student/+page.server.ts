import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) redirect(303, '/login')
  if (locals.userRole !== 'student') redirect(303, '/dashboard/teacher')

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('full_name')
    .eq('id', locals.session.user.id)
    .single()

  const { data: classes } = await locals.supabase
    .from('class_members')
    .select('class_id, classes(id, name, code, teacher_id, profiles(full_name))')
    .eq('student_id', locals.session.user.id)

  return {
    profile,
    classes: classes ?? []
  }
}