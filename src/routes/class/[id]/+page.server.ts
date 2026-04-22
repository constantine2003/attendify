import { redirect, error, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

interface QuestionInput {
  type: 'multiple_choice' | 'short_answer'
  text: string
  choices?: string[]
  correct_answer?: string
  points?: number
}

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
    .select('id, title, content, created_at, teacher:profiles!announcements_teacher_id_fkey(full_name)')
    .eq('class_id', params.id)
    .order('created_at', { ascending: false })

  const { data: attendanceSessions } = await locals.supabase
    .from('attendance_sessions')
    .select('id, label, expires_at, created_at, token')
    .eq('class_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: students } = await locals.supabase
    .rpc('get_class_students', { p_class_id: params.id })

  const { data: quizzes } = await locals.supabase
    .from('quizzes')
    .select('id, title, description, deadline, created_at')
    .eq('class_id', params.id)
    .order('created_at', { ascending: false })

  const quizzesWithMeta = await Promise.all(
    (quizzes ?? []).map(async (quiz) => {
      const { count: questionCount } = await locals.supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id)

      let mySubmission = null
      if (!isTeacher) {
        const { data: sub } = await locals.supabase
          .from('submissions')
          .select('id, auto_score, final_score, is_graded, submitted_at')
          .eq('quiz_id', quiz.id)
          .eq('student_id', locals.session!.user.id)
          .single()
        mySubmission = sub
      }

      let submissionCount = 0
      if (isTeacher) {
        const { count } = await locals.supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('quiz_id', quiz.id)
        submissionCount = count ?? 0
      }

      return { ...quiz, questionCount, mySubmission, submissionCount }
    })
  )

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', locals.session.user.id)
    .single()

  const sessionsWithCount = await Promise.all(
    (attendanceSessions ?? []).map(async (session) => {
      const { data: records } = await locals.supabase
        .rpc('get_attendance_records', { p_session_id: session.id })
      return { ...session, records: records ?? [], count: records?.length ?? 0 }
    })
  )

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
    quizzes: quizzesWithMeta,
    myAttendance,
    profile,
    isTeacher
  }
}

export const actions: Actions = {
  createQuiz: async ({ locals, params, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const title = formData.get('title')?.toString().trim()
    const description = formData.get('description')?.toString().trim() || null
    const deadline = formData.get('deadline')?.toString()
    const questionsJson = formData.get('questions')?.toString()

    if (!title) return fail(400, { error: 'Title is required' })
    if (!deadline) return fail(400, { error: 'Deadline is required' })
    if (!questionsJson) return fail(400, { error: 'Add at least one question' })

    let questions: QuestionInput[]
    try {
      questions = JSON.parse(questionsJson)
    } catch (e) {
      return fail(400, { error: 'Invalid questions format' })
    }
    if (!questions.length) return fail(400, { error: 'Add at least one question' })

    const { data: quiz, error: quizErr } = await locals.supabase
      .from('quizzes')
      .insert({
        class_id: params.id,
        title,
        description,
        deadline: new Date(deadline).toISOString()
      })
      .select('id')
      .single()

    if (quizErr) return fail(500, { error: quizErr.message })

    const questionsToInsert = questions.map((q: QuestionInput, i: number) => ({
      quiz_id: quiz.id,
      type: q.type,
      text: q.text,
      choices: q.type === 'multiple_choice' ? q.choices : null,
      correct_answer: q.type === 'multiple_choice' ? q.correct_answer : null,
      points: q.points ?? 1,
      order_index: i
    }))

    const { error: qErr } = await locals.supabase
      .from('questions')
      .insert(questionsToInsert)

    if (qErr) return fail(500, { error: qErr.message })

    // Auto-announce the quiz
    await locals.supabase.from('announcements').insert({
      class_id: params.id,
      teacher_id: locals.session.user.id,
      title: `📝 New quiz: ${title}`,
      content: `A new quiz has been posted — "${title}". Deadline: ${new Date(deadline).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. Head to the Quizzes tab to answer it!`
    })
    return { success: true }
  },

  postAnnouncement: async ({ locals, params, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const title = formData.get('title')?.toString().trim()
    const content = formData.get('content')?.toString().trim()

    if (!title || !content) return fail(400, { error: 'Title and content are required' })

    const { error: err } = await locals.supabase.from('announcements').insert({
      class_id: params.id,
      teacher_id: locals.session.user.id,
      title,
      content
    })

    if (err) return fail(500, { error: err.message })
    return { success: true }
  },

  startAttendance: async ({ locals, params, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const label = formData.get('label')?.toString().trim() || 'Attendance'
    const startTime = formData.get('start_time')?.toString()
    const duration = parseInt(formData.get('duration')?.toString() ?? '10')

    const now = new Date()
    let startDate = new Date()

    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number)
      startDate.setHours(hours, minutes, 0, 0)
    }

    const expiresAt = new Date(startDate.getTime() + duration * 60000)

    const { error: err } = await locals.supabase.from('attendance_sessions').insert({
      class_id: params.id,
      teacher_id: locals.session.user.id,
      label,
      expires_at: expiresAt.toISOString()
    })

    if (err) return fail(500, { error: err.message })
    await locals.supabase.from('announcements').insert({
      class_id: params.id,
      teacher_id: locals.session.user.id,
      title: `📋 Attendance is open — ${label}`,
      content: `Attendance has started! Scan the QR code or go to the Attendance tab and tap "Mark me present" before ${expiresAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`
    })
    return { success: true }
  }

  ,
  tsupdateClass: async ({ locals, params, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const name = formData.get('name')?.toString().trim()
    const description = formData.get('description')?.toString().trim() || null

    if (!name) return fail(400, { error: 'Class name is required' })

    const { error } = await locals.supabase
      .from('classes')
      .update({ name, description })
      .eq('id', params.id)
      .eq('teacher_id', locals.session.user.id)

    if (error) return fail(500, { error: error.message })
    return { success: true }
  },

  deleteAnnouncement: async ({ locals, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const announcementId = formData.get('announcement_id')?.toString()

    const { error } = await locals.supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId)
      .eq('teacher_id', locals.session.user.id)

    if (error) return fail(500, { error: error.message })
    return { success: true }
  },

  editAnnouncement: async ({ locals, request }) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const announcementId = formData.get('announcement_id')?.toString()
    const title = formData.get('title')?.toString().trim()
    const content = formData.get('content')?.toString().trim()

    if (!title || !content) return fail(400, { error: 'Title and content are required' })

    const { error } = await locals.supabase
      .from('announcements')
      .update({ title, content })
      .eq('id', announcementId)
      .eq('teacher_id', locals.session.user.id)

    if (error) return fail(500, { error: error.message })
    return { success: true }
  }
}