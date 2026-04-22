import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  // Only redirect if already logged in
  if (locals.session) {
    if (locals.userRole === 'teacher') redirect(303, '/dashboard/teacher')
    if (locals.userRole === 'student') redirect(303, '/dashboard/student')
  }

  // Not logged in → show landing page
  return {}
}