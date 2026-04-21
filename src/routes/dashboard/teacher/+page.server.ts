import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) redirect(303, '/login')
  if (locals.userRole !== 'teacher') redirect(303, '/dashboard/student')

  const userId = locals.session.user.id

  console.log('=== LOAD DEBUG ===')
  console.log('userId:', userId)

  const [{ data: profile }, { data: classes, error: classesError }] = await Promise.all([
    locals.supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single(),
    locals.supabase
      .from('classes')
      .select('id, name, code, description, created_at')
      .eq('teacher_id', userId)
      .order('created_at', { ascending: false })
  ])

  console.log('classes:', classes)
  console.log('classesError:', classesError)
  console.log('==================')

  return {
    profile,
    classes: classes ?? []
  }
}

export const actions: Actions = {
  createClass: async ({ locals, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const name = formData.get('name')?.toString().trim()
    const description = formData.get('description')?.toString().trim() || null

    if (!name) return fail(400, { error: 'Class name is required' })

    const { error } = await locals.supabase.from('classes').insert({
      name,
      description,
      code: generateCode(),
      teacher_id: locals.session.user.id
    })

    if (error) return fail(500, { error: error.message })

    return { success: true }
  }
}