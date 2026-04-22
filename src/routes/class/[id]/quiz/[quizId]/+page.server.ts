import { redirect, error, fail } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'

interface QuestionRow {
  id: string
  type: 'multiple_choice' | 'essay'
  correct_answer: string | null
  points: number
}

interface QuizParams {
  id: string
  quizId: string
}

type QuizEvent = RequestEvent<QuizParams>

export const load = async ({ locals, params }: QuizEvent) => {
  if (!locals.session) redirect(303, '/login')

  const { data: quiz } = await locals.supabase
    .from('quizzes')
    .select('id, title, description, deadline, class_id')
    .eq('id', params.quizId)
    .single()

  if (!quiz) error(404, 'Quiz not found')

  const { data: cls } = await locals.supabase
    .from('classes')
    .select('id, name, teacher_id')
    .eq('id', quiz.class_id)
    .single()

  if (!cls) error(404, 'Class not found')

  const isTeacher = cls.teacher_id === locals.session.user.id

  const { data: questions } = await locals.supabase
    .from('questions')
    .select('id, type, text, choices, correct_answer, points, order_index')
    .eq('quiz_id', params.quizId)
    .order('order_index')

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', locals.session.user.id)
    .single()

  const { data: submission } = await locals.supabase
    .from('submissions')
    .select('id, auto_score, final_score, is_graded, submitted_at')
    .eq('quiz_id', params.quizId)
    .eq('student_id', locals.session.user.id)
    .single()

  let answers: any[] = []
  if (submission) {
    const { data: ans } = await locals.supabase
      .from('answers')
      .select('question_id, answer, is_correct, points_awarded')
      .eq('submission_id', submission.id)
    answers = ans ?? []
  }

  let allSubmissions: any[] = []
  if (isTeacher) {
  const { data: subs } = await locals.supabase
    .rpc('get_quiz_submissions', { p_quiz_id: params.quizId })
    allSubmissions = subs ?? []
  }

  return {
    quiz,
    cls,
    questions: questions ?? [],
    profile,
    isTeacher,
    submission,
    answers,
    allSubmissions
  }
}

export const actions = {
  submitQuiz: async ({ locals, params, request }: QuizEvent) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const answersJson = formData.get('answers')?.toString()
    if (!answersJson) return fail(400, { error: 'No answers provided' })

    const studentAnswers: Record<string, string> = JSON.parse(answersJson)

    const { data: questions } = await locals.supabase
      .from('questions')
      .select('id, type, correct_answer, points')
      .eq('quiz_id', params.quizId)

    if (!questions) return fail(500, { error: 'Could not load questions' })

    const { data: quiz } = await locals.supabase
      .from('quizzes')
      .select('deadline')
      .eq('id', params.quizId)
      .single()

    if (quiz && new Date() > new Date(quiz.deadline)) {
      return fail(400, { error: 'The deadline for this quiz has passed' })
    }

    let autoScore = 0
    const answersToInsert: any[] = []

    for (const q of questions as QuestionRow[]) {
      const studentAnswer = studentAnswers[q.id] ?? ''
      const isCorrect = q.type === 'multiple_choice'
        ? studentAnswer.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()
        : null
      const pointsAwarded = isCorrect ? q.points : (isCorrect === false ? 0 : null)
      if (isCorrect) autoScore += q.points

      answersToInsert.push({
        question_id: q.id,
        answer: studentAnswer,
        is_correct: isCorrect,
        points_awarded: pointsAwarded
      })
    }

    const { data: submission, error: subErr } = await locals.supabase
      .from('submissions')
      .insert({
        quiz_id: params.quizId,
        student_id: locals.session.user.id,
        auto_score: autoScore,
        is_graded: (questions as QuestionRow[]).every(q => q.type === 'multiple_choice')
      })
      .select('id')
      .single()

    if (subErr) return fail(500, { error: subErr.message })

    const { error: ansErr } = await locals.supabase
      .from('answers')
      .insert(answersToInsert.map(a => ({ ...a, submission_id: submission.id })))

    if (ansErr) return fail(500, { error: ansErr.message })

    return { success: true }
  },

  gradeSubmission: async ({ locals, request }: QuizEvent) => {
    if (!locals.session) redirect(303, '/login')

    const formData = await request.formData()
    const submissionId = formData.get('submission_id')?.toString()
    const finalScore = parseInt(formData.get('final_score')?.toString() ?? '0')

    const { error: gradeErr } = await locals.supabase
      .from('submissions')
      .update({ final_score: finalScore, is_graded: true })
      .eq('id', submissionId)

    if (gradeErr) return fail(500, { error: gradeErr.message })
    return { success: true }
  }
}