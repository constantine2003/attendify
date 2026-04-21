import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) redirect(303, '/login')
  
  if (locals.userRole === 'teacher') redirect(303, '/dashboard/teacher')
  if (locals.userRole === 'student') redirect(303, '/dashboard/student')

  redirect(303, '/login')
}