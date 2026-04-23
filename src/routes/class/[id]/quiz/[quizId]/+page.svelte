<script lang="ts">
  import { enhance } from '$app/forms'
  import Navbar from '$lib/components/Navbar.svelte'
  
  let { data } = $props()

  let answers = $state<Record<string, string>>({})
  let submitting = $state(false)
  let submitError = $state('')
  let activeSubmission = $state<string | null>(null)

  const deadline = new Date(data.quiz.deadline)
  const isPastDeadline = new Date() > deadline
  const totalPoints = data.questions.reduce((sum: number, q: any) => sum + q.points, 0)

  function getInitials(name: string) {
    return name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '??'
  }
</script>

<div class="min-h-screen bg-[#F1EFE8] flex flex-col">

  <Navbar
    fullName={data.profile?.full_name ?? ''}
    role={data.isTeacher ? 'teacher' : 'student'}
    backHref="/class/{data.cls.id}"
    backLabel={data.cls.name}
    currentPage={data.quiz.title}
  />

  <div class="max-w-3xl mx-auto w-full px-5 py-6 flex flex-col gap-4">

    <!-- Quiz header card -->
    <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden border-l-[3px] {isPastDeadline ? 'border-l-[#D3D1C7]' : 'border-l-[#EF9F27]'}">
      <div class="px-5 pt-5 pb-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-lg bg-[#FAEEDA] flex items-center justify-center shrink-0">
              <svg class="w-4.5 h-4.5 fill-[#EF9F27]" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-[15px] font-semibold text-[#2C2C2A] leading-snug">{data.quiz.title}</h1>
              {#if data.quiz.description}
                <p class="text-[12px] text-[#888780] mt-0.5">{data.quiz.description}</p>
              {/if}
            </div>
          </div>
          <div class="shrink-0 text-right">
            <div class="text-[10.5px] text-[#888780] mb-0.5 uppercase tracking-wide font-semibold">Deadline</div>
            <div class="text-[12px] font-semibold {isPastDeadline ? 'text-[#E24B4A]' : 'text-[#2C2C2A]'}">
              {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4 px-5 py-3 border-t border-[#F1EFE8]">
        <span class="text-[12px] text-[#888780]">
          <span class="font-semibold text-[#2C2C2A]">{data.questions.length}</span> question{data.questions.length !== 1 ? 's' : ''}
        </span>
        <span class="text-[12px] text-[#888780]">
          <span class="font-semibold text-[#2C2C2A]">{totalPoints}</span> total pts
        </span>
        {#if isPastDeadline}
          <span class="ml-auto bg-[#F1EFE8] text-[#888780] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">closed</span>
        {:else}
          <span class="ml-auto bg-[#FAEEDA] text-[#633806] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">open</span>
        {/if}
      </div>
    </div>

    <!-- ── TEACHER VIEW ── -->
    {#if data.isTeacher}
      <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-[#F1EFE8] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-[10.5px] font-semibold uppercase tracking-widest text-[#888780]">Submissions</span>
            {#if data.allSubmissions.length > 0}
              <span class="bg-[#D3D1C7] text-[#5F5E5A] text-[10px] font-semibold rounded-full px-2 py-0.5">{data.allSubmissions.length}</span>
            {/if}
          </div>
          <span class="bg-[#EEEDFE] text-[#534AB7] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{data.allSubmissions.length} submitted</span>
        </div>

        {#if data.allSubmissions.length === 0}
          <div class="flex flex-col items-center justify-center gap-3 text-center py-12">
            <div class="w-10 h-10 bg-[#EEEDFE] rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 fill-[#7F77DD]" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">No submissions yet</p>
              <p class="text-[12px] text-[#888780]">Students haven't submitted this quiz yet</p>
            </div>
          </div>
        {:else}
          <div class="divide-y divide-[#F1EFE8]">
            {#each data.allSubmissions as sub}
              <div>
                <button
                  onclick={() => activeSubmission = activeSubmission === sub.id ? null : sub.id}
                  class="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F1EFE8] transition-colors cursor-pointer text-left"
                >
                  <div class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
                    {getInitials(sub.full_name ?? '')}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-medium text-[#2C2C2A] truncate">{sub.full_name ?? 'Unknown student'}</div>
                    <div class="text-[11px] text-[#888780]">
                      {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    {#if sub.is_graded}
                      <div class="text-[13px] font-semibold text-[#2C2C2A]">{sub.final_score ?? sub.auto_score}/{totalPoints}</div>
                      <div class="text-[10px] text-[#1D9E75] font-semibold">graded</div>
                    {:else}
                      <div class="text-[13px] font-semibold text-[#EF9F27]">{sub.auto_score}/{totalPoints}</div>
                      <div class="text-[10px] text-[#EF9F27] font-semibold">needs review</div>
                    {/if}
                  </div>
                  <svg class="w-4 h-4 fill-[#B4B2A9] transition-transform shrink-0 {activeSubmission === sub.id ? 'rotate-180' : ''}" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>

                {#if activeSubmission === sub.id}
                  <div class="border-t border-[#F1EFE8] bg-[#F1EFE8]">

                    <!-- Answers review -->
                    <div class="px-5 py-4 flex flex-col gap-3">
                      <div class="text-[10.5px] font-semibold uppercase tracking-wide text-[#888780]">Student answers</div>

                      {#each (sub.answers ?? []) as ans}
                        <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden
                          {ans.is_correct === true ? 'border-l-[3px] border-l-[#1D9E75]' :
                          ans.is_correct === false ? 'border-l-[3px] border-l-[#E24B4A]' :
                          'border-l-[3px] border-l-[#EF9F27]'}">
                          <div class="px-4 py-2.5 border-b border-[#F1EFE8] flex items-center justify-between">
                            <div class="flex items-center gap-2">
                              <span class="text-[11px] font-semibold text-[#888780]">
                                {ans.question_type === 'multiple_choice' ? 'Multiple choice' : 'Short answer'}
                              </span>
                              <span class="text-[10px] text-[#B4B2A9]">· {ans.points} pts</span>
                            </div>
                            {#if ans.is_correct === true}
                              <span class="text-[11px] font-semibold text-[#1D9E75] flex items-center gap-1">
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                Correct · +{ans.points} pts
                              </span>
                            {:else if ans.is_correct === false}
                              <span class="text-[11px] font-semibold text-[#E24B4A] flex items-center gap-1">
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                                Incorrect
                              </span>
                            {:else}
                              <span class="text-[11px] font-semibold text-[#EF9F27]">needs review</span>
                            {/if}
                          </div>
                          <div class="px-4 py-3">
                            <div class="text-[12.5px] font-medium text-[#2C2C2A] mb-2">{ans.question_text}</div>
                            <div class="bg-[#F1EFE8] border border-[#D3D1C7] rounded-lg px-3 py-2 text-[13px] text-[#2C2C2A] mb-1.5">
                              {ans.answer || '—'}
                            </div>
                            {#if ans.is_correct === false && ans.correct_answer}
                              <div class="text-[11px] text-[#888780]">
                                Correct answer: <span class="font-semibold text-[#2C2C2A]">{ans.correct_answer}</span>
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>

                    <!-- Grade form -->
                    <div class="px-5 pb-4">
                      <form
                        method="POST"
                        action="?/gradeSubmission"
                        use:enhance={() => {
                          return async ({ update }) => { await update() }
                        }}
                      >
                        <input type="hidden" name="submission_id" value={sub.id} />
                        <div class="bg-white border border-[#D3D1C7] rounded-xl px-4 py-3 flex items-center gap-3">
                          <label class="text-[11px] font-semibold uppercase tracking-wide text-[#888780]">Final score</label>
                          <input
                            type="number"
                            name="final_score"
                            value={sub.final_score ?? sub.auto_score}
                            min="0"
                            max={totalPoints}
                            class="w-20 bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-2 py-1.5 text-[13px] text-center focus:outline-none focus:border-[#7F77DD] transition-all"
                          />
                          <span class="text-[12px] text-[#888780]">/ {totalPoints}</span>
                          <button
                            type="submit"
                            class="ml-auto bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Save grade
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>

    <!-- ── STUDENT VIEW: already submitted ── -->
    {:else if data.submission}
      <!-- Score banner -->
      <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden
        {data.submission.is_graded ? 'border-l-[3px] border-l-[#1D9E75]' : 'border-l-[3px] border-l-[#EF9F27]'}">
        <div class="px-5 py-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            {data.submission.is_graded ? 'bg-[#E1F5EE]' : 'bg-[#FAEEDA]'}">
            {#if data.submission.is_graded}
              <svg class="w-5 h-5 fill-[#1D9E75]" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            {:else}
              <svg class="w-5 h-5 fill-[#EF9F27]" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
            {/if}
          </div>
          <div class="flex-1">
            <div class="text-[13.5px] font-semibold text-[#2C2C2A]">
              {data.submission.is_graded ? 'Quiz graded' : 'Quiz submitted'}
            </div>
            <div class="text-[11px] text-[#888780]">
              Submitted {new Date(data.submission.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          {#if data.submission.is_graded}
            <div class="text-right shrink-0">
              <div class="text-[22px] font-semibold text-[#085041] leading-none">{data.submission.final_score ?? data.submission.auto_score}</div>
              <div class="text-[11px] text-[#0F6E56]">/ {totalPoints} pts</div>
            </div>
          {:else}
            <span class="bg-[#FAEEDA] text-[#633806] text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0">
              Awaiting grade
            </span>
          {/if}
        </div>
      </div>

      <!-- Answer review -->
      <div class="flex items-center gap-2">
        <span class="text-[10.5px] font-semibold uppercase tracking-widest text-[#888780]">Your answers</span>
      </div>

      {#each data.questions as q, i}
        {@const myAnswer = data.answers.find((a: any) => a.question_id === q.id)}
        {@const isCorrect = q.type === 'multiple_choice' ? myAnswer?.is_correct : null}
        <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden
          {isCorrect === true ? 'border-l-[3px] border-l-[#1D9E75]' : isCorrect === false ? 'border-l-[3px] border-l-[#E24B4A]' : 'border-l-[3px] border-l-[#D3D1C7]'}">
          <div class="px-4 py-3 border-b border-[#F1EFE8] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full bg-[#F1EFE8] flex items-center justify-center text-[10px] font-semibold text-[#888780]">{i + 1}</div>
              <span class="text-[11px] text-[#888780]">{q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
            </div>
            {#if isCorrect === true}
              <div class="flex items-center gap-1 text-[11px] font-semibold text-[#1D9E75]">
                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Correct · +{q.points} pts
              </div>
            {:else if isCorrect === false}
              <div class="flex items-center gap-1 text-[11px] font-semibold text-[#E24B4A]">
                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                Incorrect
              </div>
            {/if}
          </div>
          <div class="px-4 py-3">
            <div class="text-[13px] font-medium text-[#2C2C2A] mb-2">{q.text}</div>
            <div class="bg-[#F1EFE8] border border-[#D3D1C7] rounded-lg px-3 py-2 text-[13px] text-[#2C2C2A]">
              {myAnswer?.answer || '—'}
            </div>
            {#if isCorrect === false}
              <div class="text-[11.5px] text-[#888780] mt-1.5">
                Correct answer: <span class="font-semibold text-[#2C2C2A]">{q.correct_answer}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}

    <!-- ── STUDENT VIEW: deadline passed, not submitted ── -->
    {:else if isPastDeadline}
      <div class="flex flex-col items-center justify-center gap-3 text-center py-16">
        <div class="w-11 h-11 bg-[#FCEBEB] rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 fill-[#E24B4A]" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
          </svg>
        </div>
        <div>
          <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">Deadline passed</p>
          <p class="text-[12px] text-[#888780]">You did not submit this quiz</p>
        </div>
      </div>

    <!-- ── STUDENT VIEW: take quiz ── -->
    {:else}
      {#if submitError}
        <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-[12px] rounded-xl px-4 py-3 flex items-start gap-2">
          <span class="mt-0.5 w-4 h-4 min-w-4 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-[10px] font-bold shrink-0">!</span>
          {submitError}
        </div>
      {/if}

      <form
        method="POST"
        action="?/submitQuiz"
        use:enhance={() => {
          submitting = true
          submitError = ''
          return async ({ result, update }) => {
            submitting = false
            if (result.type === 'failure') {
              submitError = (result.data as any)?.error ?? 'Something went wrong'
            } else {
              await update()
            }
          }
        }}
        onsubmit={(e) => {
          const answersInput = (e.target as HTMLFormElement).querySelector('input[name="answers"]') as HTMLInputElement
          answersInput.value = JSON.stringify(answers)
        }}
      >
        <input type="hidden" name="answers" value="" />

        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10.5px] font-semibold uppercase tracking-widest text-[#888780]">Questions</span>
          <span class="bg-[#D3D1C7] text-[#5F5E5A] text-[10px] font-semibold rounded-full px-2 py-0.5">{data.questions.length}</span>
        </div>

        <div class="flex flex-col gap-3 mb-4">
          {#each data.questions as q, i}
            <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden
              {answers[q.id] ? 'border-l-[3px] border-l-[#1D9E75]' : 'border-l-[3px] border-l-[#D3D1C7]'}">
              <div class="px-4 py-3 border-b border-[#F1EFE8] flex items-center gap-2">
                <div class="w-5 h-5 rounded-full {answers[q.id] ? 'bg-[#E1F5EE]' : 'bg-[#F1EFE8]'} flex items-center justify-center text-[10px] font-semibold {answers[q.id] ? 'text-[#1D9E75]' : 'text-[#888780]'} transition-colors shrink-0">{i + 1}</div>
                <span class="text-[11px] text-[#888780]">{q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
                {#if answers[q.id]}
                  <svg class="ml-auto w-3.5 h-3.5 fill-[#1D9E75]" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                {/if}
              </div>
              <div class="px-4 py-3">
                <div class="text-[13.5px] font-medium text-[#2C2C2A] mb-3">{q.text}</div>

                {#if q.type === 'multiple_choice'}
                  <div class="space-y-2">
                    {#each (q.choices as string[]) as choice}
                      <label class="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="q_{q.id}"
                          value={choice}
                          class="sr-only peer"
                          onchange={() => answers[q.id] = choice}
                        />
                        <div class="w-4 h-4 rounded-full border-[1.5px] border-[#D3D1C7] peer-checked:border-[#7F77DD] peer-checked:bg-[#7F77DD] flex items-center justify-center shrink-0 transition-all">
                          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                        <span class="text-[13px] text-[#2C2C2A] group-hover:text-[#534AB7] transition-colors peer-checked:font-medium">{choice}</span>
                      </label>
                    {/each}
                  </div>
                {:else}
                  <textarea
                    rows={3}
                    placeholder="Write your answer here…"
                    class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all resize-none"
                    oninput={(e) => answers[q.id] = (e.target as HTMLTextAreaElement).value}
                  ></textarea>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <button
          type="submit"
          disabled={submitting}
          class="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white rounded-lg py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {#if submitting}
            Submitting…
          {:else}
            <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            Submit quiz
          {/if}
        </button>
      </form>
    {/if}

  </div>
</div>