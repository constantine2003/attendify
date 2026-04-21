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


  const { data: attendanceSessions } = await locals.supabase
    .from('attendance_sessions')
    .select('id, label, expires_at, created_at, token')
    .eq('class_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch students using get_class_students RPC
  const { data: students } = await locals.supabase
    .rpc('get_class_students', { p_class_id: params.id })

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', locals.session.user.id)
    .single()

  // For each session, get attendance count
  const sessionsWithCount = await Promise.all(
    (attendanceSessions ?? []).map(async (session) => {
      const { data: records } = await locals.supabase
        .rpc('get_attendance_records', { p_session_id: session.id })
      return { ...session, records: records ?? [], count: records?.length ?? 0 }
    })
  )

  // For student: get their own attendance records
  let myAttendance: string[] = []
  if (!isTeacher) {
    const { data: myRecords } = await locals.supabase
      .from('attendance_records')
      .select('session_id')
      .eq('student_id', locals.session.user.id)
    myAttendance = myRecords?.map(r => r.session_id) ?? []
  }

  return {
    cls,
    announcements: announcements ?? [],
    attendanceSessions: sessionsWithCount,
    students: students ?? [],
    myAttendance,
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

    if (!title || !content) return { error: 'Title and content are required' }

    const { error: err } = await locals.supabase.from('announcements').insert({
      class_id: params.id,
      teacher_id: locals.session.user.id,
      title,
      content
    })

    if (err) return { error: err.message }
    return { success: true }
  },

  startAttendance: async ({ locals, params, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const label = formData.get('label')?.toString().trim() || 'Attendance'
    const startTime = formData.get('start_time')?.toString()
    const duration = parseInt(formData.get('duration')?.toString() ?? '10')

    // Calculate expires_at from start time + duration
    const now = new Date()
    let startDate = new Date()

    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number)
      startDate.setHours(hours, minutes, 0, 0)
      // If start time is in the past today, still use it
    }

    const expiresAt = new Date(startDate.getTime() + duration * 60000)

    const { error: err } = await locals.supabase.from('attendance_sessions').insert({
      class_id: params.id,
      teacher_id: locals.session.user.id,
      label,
      expires_at: expiresAt.toISOString()
    })

    if (err) return { error: err.message }
    return { success: true }
  }
}