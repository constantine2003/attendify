import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) redirect(303, '/login')
  if (locals.userRole !== 'student') redirect(303, '/dashboard/teacher')

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('full_name')
    .eq('id', locals.session.user.id)
    .single()

  const { data: memberships } = await locals.supabase
    .from('class_members')
    .select('class_id, classes(id, name, code, description, profiles(full_name))')
    .eq('student_id', locals.session.user.id)

  return {
    profile,
    classes: memberships ?? []
  }
}

export const actions: Actions = {
  joinClass: async ({ locals, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const code = formData.get('code')?.toString().trim().toUpperCase()

    if (!code || code.length !== 6) {
      return fail(400, { error: 'Please enter a valid 6-character class code' })
    }

    // Find the class using security definer function
    const { data: classes } = await locals.supabase
      .rpc('get_class_by_code', { class_code: code })

    const cls = classes?.[0]

    if (!cls) {
      return fail(404, { error: 'Class not found — double check the code' })
    }

    // Check already a member
    const { data: existing } = await locals.supabase
      .from('class_members')
      .select('id')
      .eq('class_id', cls.id)
      .eq('student_id', locals.session.user.id)
      .single()

    if (existing) {
      return fail(400, { error: 'You are already in this class' })
    }

    // Join
    const { error } = await locals.supabase.from('class_members').insert({
      class_id: cls.id,
      student_id: locals.session.user.id
    })

    if (error) return fail(500, { error: error.message })

    return { success: true }
  }
}