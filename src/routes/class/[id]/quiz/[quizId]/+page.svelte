<script lang="ts">
  import { enhance } from '$app/forms'

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

<div class="min-h-screen bg-[#F1EFE8]">

  <!-- Navbar -->
  <nav class="bg-[#534AB7] h-11 flex items-center px-3 gap-2.5">
    <a href="/class/{data.cls.id}" class="w-7 h-7 bg-[#3C3489] rounded-lg flex items-center justify-center hover:bg-[#2A2570] transition-colors">
      <svg class="w-3.5 h-3.5 fill-[#EEEDFE]" viewBox="0 0 24 24">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
    </a>
    <div class="flex items-center gap-1.5 text-[12px] min-w-0 overflow-hidden">
      <a href="/class/{data.cls.id}" class="text-[#C4C0F5] hover:text-white transition-colors shrink-0">{data.cls.name}</a>
      <span class="text-[#AFA9EC] opacity-60 shrink-0">/</span>
      <span class="text-[#EEEDFE] font-medium truncate">{data.quiz.title}</span>
    </div>
    <div class="ml-auto flex items-center gap-2.5">
      <span class="text-[11px] text-[#C4C0F5] hidden sm:block">{data.profile?.full_name}</span>
      <div class="w-7 h-7 rounded-full bg-[#7F77DD] border-[1.5px] border-[#AFA9EC] flex items-center justify-center text-[10px] font-semibold text-[#EEEDFE]">
        {getInitials(data.profile?.full_name ?? '')}
      </div>
    </div>
  </nav>

  <div class="max-w-3xl mx-auto px-4 py-8">

    <!-- Quiz header -->
    <div class="bg-white rounded-2xl border border-[#D3D1C7] p-6 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-lg bg-[#FAEEDA] flex items-center justify-center">
              <svg class="w-4 h-4 fill-[#EF9F27]" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <span class="text-[11px] font-semibold uppercase tracking-wide text-[#888780]">Quiz</span>
          </div>
          <h1 class="text-lg font-semibold text-[#2C2C2A] mb-1">{data.quiz.title}</h1>
          {#if data.quiz.description}
            <p class="text-sm text-[#888780]">{data.quiz.description}</p>
          {/if}
        </div>
        <div class="shrink-0 text-right">
          <div class="text-[11px] text-[#888780] mb-1">deadline</div>
          <div class="text-[12px] font-semibold {isPastDeadline ? 'text-[#E24B4A]' : 'text-[#2C2C2A]'}">
            {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4 mt-4 pt-4 border-t border-[#F1EFE8]">
        <div class="text-[12px] text-[#888780]">
          <span class="font-semibold text-[#2C2C2A]">{data.questions.length}</span> questions
        </div>
        <div class="text-[12px] text-[#888780]">
          <span class="font-semibold text-[#2C2C2A]">{totalPoints}</span> total points
        </div>
        {#if isPastDeadline}
          <span class="ml-auto bg-[#FCEBEB] text-[#791F1F] text-[11px] font-semibold px-2.5 py-1 rounded-full">closed</span>
        {:else}
          <span class="ml-auto bg-[#E1F5EE] text-[#085041] text-[11px] font-semibold px-2.5 py-1 rounded-full">open</span>
        {/if}
      </div>
    </div>

    {#if data.isTeacher}
      <div class="bg-white rounded-2xl border border-[#D3D1C7] p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="text-[13px] font-semibold text-[#2C2C2A]">Submissions</div>
          <span class="bg-[#EEEDFE] text-[#534AB7] text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {data.allSubmissions.length} submitted
          </span>
        </div>

        {#if data.allSubmissions.length === 0}
          <div class="text-center py-8 text-sm text-[#888780]">no submissions yet</div>
        {:else}
          <div class="space-y-2">
            {#each data.allSubmissions as sub}
              <div class="border border-[#D3D1C7] rounded-xl overflow-hidden">
                <button
                  onclick={() => activeSubmission = activeSubmission === sub.id ? null : sub.id}
                  class="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F1EFE8] transition-colors cursor-pointer text-left"
                >
                  <div class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
                    {getInitials(sub.full_name ?? '')}
                  </div>
                  <div class="flex-1">
                    <div class="text-[13px] font-medium text-[#2C2C2A]">{sub.full_name ?? 'Unknown student'}</div>
                    <div class="text-[11px] text-[#888780]">
                      submitted {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                  <svg class="w-4 h-4 fill-[#888780] transition-transform {activeSubmission === sub.id ? 'rotate-180' : ''}" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>

                {#if activeSubmission === sub.id}
                  <div class="border-t border-[#F1EFE8] p-4 bg-[#FAFAF8]">
                    <form
                      method="POST"
                      action="?/gradeSubmission"
                      use:enhance={() => {
                        return async ({ update }) => { await update() }
                      }}
                    >
                      <input type="hidden" name="submission_id" value={sub.id} />
                      <div class="flex items-center gap-3">
                        <label class="text-[12px] font-semibold text-[#5F5E5A]">Final score:</label>
                        <input
                          type="number"
                          name="final_score"
                          value={sub.final_score ?? sub.auto_score}
                          min="0"
                          max={totalPoints}
                          class="w-20 bg-white border-[1.5px] border-[#D3D1C7] rounded-lg px-2 py-1.5 text-[13px] text-center focus:outline-none focus:border-[#7F77DD]"
                        />
                        <span class="text-[12px] text-[#888780]">/ {totalPoints}</span>
                        <button
                          type="submit"
                          class="ml-auto bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          save grade
                        </button>
                      </div>
                    </form>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>

    {:else}
      {#if data.submission}
        <div class="bg-white rounded-2xl border border-[#D3D1C7] p-6 text-center mb-6">
          <div class="w-12 h-12 bg-[#E1F5EE] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 fill-[#1D9E75]" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <h2 class="text-[15px] font-semibold text-[#2C2C2A] mb-1">quiz submitted!</h2>
          <p class="text-[13px] text-[#888780] mb-4">
            submitted {new Date(data.submission.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          {#if data.submission.is_graded}
            <div class="bg-[#E1F5EE] rounded-xl px-4 py-3 inline-block">
              <div class="text-2xl font-bold text-[#085041]">{data.submission.final_score ?? data.submission.auto_score}/{totalPoints}</div>
              <div class="text-[12px] text-[#0F6E56]">your score</div>
            </div>
          {:else}
            <div class="bg-[#FAEEDA] rounded-xl px-4 py-3 inline-block">
              <div class="text-[13px] font-semibold text-[#633806]">waiting for teacher to grade</div>
            </div>
          {/if}
        </div>

        <div class="space-y-3">
          {#each data.questions as q, i}
            {@const myAnswer = data.answers.find((a: any) => a.question_id === q.id)}
            <div class="bg-white rounded-xl border border-[#D3D1C7] p-4">
              <div class="flex items-start gap-3 mb-3">
                <div class="w-6 h-6 rounded-full bg-[#F1EFE8] flex items-center justify-center text-[11px] font-semibold text-[#888780] shrink-0">{i + 1}</div>
                <div class="flex-1">
                  <div class="text-[13px] font-medium text-[#2C2C2A] mb-2">{q.text}</div>
                  <div class="bg-[#F1EFE8] rounded-lg px-3 py-2 text-[13px] text-[#2C2C2A]">
                    {myAnswer?.answer || '—'}
                  </div>
                  {#if q.type === 'multiple_choice'}
                    {#if myAnswer?.is_correct}
                      <div class="flex items-center gap-1.5 mt-2 text-[12px] text-[#1D9E75] font-semibold">
                        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        correct · +{q.points} pts
                      </div>
                    {:else}
                      <div class="flex items-center gap-1.5 mt-2 text-[12px] text-[#E24B4A] font-semibold">
                        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        incorrect · correct answer: {q.correct_answer}
                      </div>
                    {/if}
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>

      {:else if isPastDeadline}
        <div class="bg-white rounded-2xl border border-[#D3D1C7] p-12 text-center">
          <div class="w-12 h-12 bg-[#FCEBEB] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 fill-[#E24B4A]" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-[#2C2C2A] mb-1">deadline passed</p>
          <p class="text-xs text-[#888780]">you did not submit this quiz</p>
        </div>

      {:else}
        {#if submitError}
          <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-sm rounded-xl px-4 py-3 mb-4">{submitError}</div>
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

          <div class="space-y-4 mb-6">
            {#each data.questions as q, i}
              <div class="bg-white rounded-xl border border-[#D3D1C7] p-5">
                <div class="flex items-start gap-3 mb-4">
                  <div class="w-6 h-6 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-semibold text-[#534AB7] shrink-0">{i + 1}</div>
                  <div class="flex-1">
                    <div class="text-[13.5px] font-medium text-[#2C2C2A] mb-1">{q.text}</div>
                    <div class="text-[11px] text-[#888780]">{q.points} {q.points === 1 ? 'point' : 'points'}</div>
                  </div>
                </div>

                {#if q.type === 'multiple_choice'}
                  <div class="space-y-2 ml-9">
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
                        <span class="text-[13px] text-[#2C2C2A] group-hover:text-[#534AB7] transition-colors">{choice}</span>
                      </label>
                    {/each}
                  </div>
                {:else}
                  <textarea
                    rows={3}
                    placeholder="write your answer here…"
                    style="width: calc(100% - 2.25rem)"
                    class="ml-9 bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all resize-none"
                    oninput={(e) => answers[q.id] = (e.target as HTMLTextAreaElement).value}
                  ></textarea>
                {/if}
              </div>
            {/each}
          </div>

          <button
            type="submit"
            disabled={submitting}
            class="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white rounded-xl py-3 text-[14px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'submitting...' : 'submit quiz'}
          </button>
        </form>
      {/if}
    {/if}
  </div>
</div>