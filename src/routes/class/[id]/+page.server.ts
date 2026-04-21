import { redirect, error } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.session) redirect(303, '/login')

  const { data: cls } = await locals.supabase
    .from('classes')
    .select('id, name, code, description, teacher_id, profiles(full_name)')
    .eq('id', params.id)
    .single()

  if (!cls) error(404, 'Class not found')

  const isTeacher = cls.teacher_id === locals.session.user.id

  if (!isTeacher) {
    const { data: member } = await locals.supabase
      .from('class_members')
      .select('id')
      .eq('class_id', params.id)
      .eq('student_id', locals.session.user.id)
      .single()

    if (!member) error(403, 'You are not a member of this class')
  }

  const { data: announcements } = await locals.supabase
    .from('announcements')
    .select('id, title, content, created_at, profiles(full_name)')
    .eq('class_id', params.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', locals.session.user.id)
    .single()

  return {
    cls,
    announcements: announcements ?? [],
    profile,
    isTeacher
  }
}

export const actions: Actions = {
  postAnnouncement: async ({ locals, params, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const title = formData.get('title')?.toString().trim()
    const content = formData.get('content')?.toString().trim()

    if (!title || !content) {
      return { error: 'Title and content are required' }
    }

    const { error: err } = await locals.supabase.from('announcements').insert({
      class_id: params.id,
      teacher_id: locals.session.user.id,
      title,
      content
    })

    if (err) return { error: err.message }

    return { success: true }
  }
}