<script lang="ts">
  import { enhance } from '$app/forms'
  import { createSupabaseLoadClient } from '$lib/supabase'
  import Navbar from '$lib/components/Navbar.svelte'
  
  let { data } = $props()
  const supabase = createSupabaseLoadClient(fetch)

  let showPostModal = $state(false)
  let posting = $state(false)
  let postError = $state('')
  let activeTab = $state('announcements')
  let editingAnnouncement = $state<any | null>(null)
  let editTitle = $state('')
  let editContent = $state('')
  let editing = $state(false)
  let editError = $state('')

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '??'
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const tabs = [
    { id: 'announcements', label: 'Announcements', shortLabel: 'Posts',    icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' },
    { id: 'quizzes',       label: 'Quizzes',       shortLabel: 'Quizzes',  icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
    { id: 'attendance',    label: 'Attendance',    shortLabel: 'Attend.',  icon: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z' },
    { id: 'students',      label: 'Students',      shortLabel: 'Students', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
    ...(data.isTeacher ? [{ id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' }] : [])
  ]

  const activeTabMeta = $derived(tabs.find(t => t.id === activeTab)!)

  function dateBucket(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  }

  const groupedAnnouncements = $derived(() => {
    const groups: { label: string; posts: typeof data.announcements }[] = []
    for (const post of data.announcements) {
      const label = dateBucket(post.created_at)
      const existing = groups.find(g => g.label === label)
      if (existing) existing.posts.push(post)
      else groups.push({ label, posts: [post] })
    }
    return groups
  })

  // Quiz modal state
  let showQuizModal = $state(false)
  let quizCreating = $state(false)
  let quizError = $state('')
  let quizQuestions = $state<any[]>([])
  let newQuestionType = $state<'multiple_choice' | 'short_answer'>('multiple_choice')

  function addQuestion() {
    quizQuestions = [...quizQuestions, {
      type: newQuestionType,
      text: '',
      choices: newQuestionType === 'multiple_choice' ? ['', '', '', ''] : [],
      correct_answer: '',
      points: 1
    }]
  }

  function removeQuestion(i: number) {
    quizQuestions = quizQuestions.filter((_, idx) => idx !== i)
  }
</script>

<svelte:head> 
  <title>{data.cls.name} | Attendify</title>
</svelte:head>

<div class="h-screen bg-[#F1EFE8] flex flex-col overflow-hidden">

  <!-- Top command bar -->
  <Navbar
    fullName={data.profile?.full_name ?? ''}
    role={data.isTeacher ? 'teacher' : 'student'}
    backHref={data.isTeacher ? '/dashboard/teacher' : '/dashboard/student'}
    backLabel="My classes"
    currentPage={data.cls.name}
  />

  <div class="flex flex-1 overflow-hidden">

    <!-- Icon rail: vertical on sm+, hidden on mobile (replaced by bottom bar) -->
    <aside class="hidden sm:flex w-14 bg-[#3C3489] flex-col items-center py-2 gap-0.5 shrink-0">
      {#each tabs as tab}
        <button
          onclick={() => activeTab = tab.id}
          class="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors
            {activeTab === tab.id ? 'bg-white/15' : 'hover:bg-white/8'}"
          title={tab.label}
        >
          <svg
            class="w-4.5 h-4.5 transition-colors {activeTab === tab.id ? 'fill-[#EEEDFE]' : 'fill-[#AFA9EC]'}"
            viewBox="0 0 24 24"
          ><path d={tab.icon}/></svg>
          <span class="text-[9px] font-medium leading-none {activeTab === tab.id ? 'text-[#EEEDFE]' : 'text-[#AFA9EC]'}">
            {tab.shortLabel}
          </span>
        </button>
        {#if tab.id === 'announcements'}
          <div class="w-7 h-px bg-[#534AB7] my-1"></div>
        {/if}
      {/each}
    </aside>

    <!-- Channel sidebar: only on sm+ -->
    <aside class="w-56 bg-white border-r border-[#D3D1C7] hidden sm:flex flex-col overflow-hidden shrink-0">
      <div class="p-3.5 border-b border-[#F1EFE8]">
        <div class="w-9 h-9 rounded-lg bg-[#EEEDFE] flex items-center justify-center mb-2.5">
          <svg class="w-4.5 h-4.5 fill-[#7F77DD]" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 12H7v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"/>
          </svg>
        </div>
        <div class="text-[13px] font-semibold text-[#2C2C2A] leading-snug mb-0.5">{data.cls.name}</div>
        {#if data.cls.description}
          <div class="text-[11px] text-[#888780] mb-2">{data.cls.description}</div>
        {/if}
        <div class="flex items-center gap-1.5 mt-1.5">
          <span class="text-[10px] text-[#B4B2A9]">code</span>
          <span class="bg-[#EEEDFE] text-[#534AB7] text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider">{data.cls.code}</span>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto py-2">
        <div class="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#B4B2A9]">Channels</div>
        {#each tabs as tab}
          <button
            onclick={() => activeTab = tab.id}
            class="w-full flex items-center gap-2.5 px-3.5 py-1.75 text-left relative cursor-pointer transition-colors
              {activeTab === tab.id ? 'bg-[#EEEDFE] text-[#534AB7]' : 'text-[#5F5E5A] hover:bg-[#F1EFE8]'}"
          >
            {#if activeTab === tab.id}
              <div class="absolute left-0 top-1 bottom-1 w-0.75 bg-[#7F77DD] rounded-r"></div>
            {/if}
            <svg
              class="w-3.5 h-3.5 shrink-0 {activeTab === tab.id ? 'fill-[#534AB7]' : 'fill-[#888780]'}"
              viewBox="0 0 24 24"
            ><path d={tab.icon}/></svg>
            <span class="text-[12.5px] {activeTab === tab.id ? 'font-semibold' : ''}">{tab.label}</span>
          </button>
        {/each}
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#F1EFE8] pb-14 sm:pb-0">

      <!-- Channel header -->
      <div class="bg-white border-b border-[#D3D1C7] px-3 sm:px-5 py-2.5 flex items-center gap-3 shrink-0">
        <div class="w-7 h-7 rounded-md bg-[#EEEDFE] flex items-center justify-center">
          <svg class="w-3.5 h-3.5 fill-[#7F77DD]" viewBox="0 0 24 24">
            <path d={activeTabMeta.icon}/>
          </svg>
        </div>
        <div>
          <div class="text-[14px] font-semibold text-[#2C2C2A]">{activeTabMeta.label}</div>
          {#if activeTab === 'announcements'}
            <div class="text-[11px] text-[#888780]">{data.announcements.length} post{data.announcements.length !== 1 ? 's' : ''} · {data.cls.name}</div>
          {:else if activeTab === 'attendance'}
            <div class="text-[11px] text-[#888780]">{data.attendanceSessions.length} session{data.attendanceSessions.length !== 1 ? 's' : ''} · {data.cls.name}</div>
          {/if}
        </div>
        <!-- Header action buttons -->
        {#if data.isTeacher && activeTab === 'announcements'}
          <div class="ml-auto">
            <button
              onclick={() => showPostModal = true}
              class="flex items-center gap-1.5 bg-[#7F77DD] hover:bg-[#534AB7] text-[#EEEDFE] text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg class="w-3 h-3 fill-[#EEEDFE]" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              New post
            </button>
          </div>
        {/if}
      </div>

      <!-- ── ANNOUNCEMENTS ── -->
      {#if activeTab === 'announcements'}
        <div class="flex-1 px-3 sm:px-5 py-4 flex flex-col gap-2.5">
          {#if data.announcements.length === 0}
            <div class="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
              <div class="w-11 h-11 bg-[#EEEDFE] rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 fill-[#7F77DD]" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              </div>
              <div>
                <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">no announcements yet</p>
                <p class="text-[12px] text-[#888780]">
                  {data.isTeacher ? 'post something to get started' : "your teacher hasn't posted anything yet"}
                </p>
              </div>
            </div>
          {:else}
            {#each groupedAnnouncements() as group}
              <div class="flex items-center gap-3 my-1">
                <div class="flex-1 h-px bg-[#D3D1C7]"></div>
                <span class="text-[11px] text-[#888780] whitespace-nowrap">{group.label}</span>
                <div class="flex-1 h-px bg-[#D3D1C7]"></div>
              </div>
              {#each group.posts as post}
                <div class="bg-white border border-[#D3D1C7] hover:border-[#AFA9EC] rounded-xl p-4 transition-colors">
                  <div class="flex items-center gap-2.5 mb-3">
                    <div class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
                      {getInitials(post.teacher?.[0]?.full_name ?? '')}
                    </div>
                    <div class="min-w-0">
                      <div class="text-[13px] font-semibold text-[#2C2C2A] truncate">{post.teacher?.[0]?.full_name ?? 'Teacher'}</div>
                      <div class="text-[11px] text-[#888780]">{timeAgo(post.created_at)}</div>
                    </div>
                    <span class="ml-auto shrink-0 bg-[#EEEDFE] text-[#534AB7] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Announcement</span>
                  </div>
                  <div class="text-[13.5px] font-semibold text-[#2C2C2A] mb-1.5">{post.title}</div>
                  <div class="text-[12.5px] text-[#5F5E5A] leading-relaxed">{post.content}</div>

                  {#if data.isTeacher}
                    <div class="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#F1EFE8]">
                      <button
                        onclick={() => { editingAnnouncement = post; editTitle = post.title; editContent = post.content }}
                        class="flex items-center gap-1.5 text-[11px] text-[#888780] hover:text-[#534AB7] hover:bg-[#EEEDFE] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        Edit
                      </button>
                      <form
                        method="POST"
                        action="?/deleteAnnouncement"
                        use:enhance={() => {
                          return async ({ update }) => { await update() }
                        }}
                        class="ml-auto"
                      >
                        <input type="hidden" name="announcement_id" value={post.id} />
                        <button
                          type="submit"
                          class="flex items-center gap-1.5 text-[11px] text-[#888780] hover:text-[#E24B4A] hover:bg-[#FCEBEB] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          onclick={(e) => { if (!confirm('Delete this announcement?')) e.preventDefault() }}
                        >
                          <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                          Delete
                        </button>
                      </form>
                    </div>
                  {/if}
                </div>
              {/each}
            {/each}
          {/if}
        </div>
        {#if data.isTeacher}
          <div class="sticky bottom-0 bg-white border-t border-[#D3D1C7] px-3 sm:px-5 py-2.5 shrink-0 z-10">
            <button
              onclick={() => showPostModal = true}
              class="w-full flex items-center gap-2.5 bg-[#F1EFE8] hover:border-[#AFA9EC] border border-[#D3D1C7] rounded-lg px-3 py-2.5 cursor-pointer transition-colors text-left"
            >
              <div class="w-6 h-6 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[9px] font-semibold text-[#534AB7] shrink-0">
                {getInitials(data.profile?.full_name ?? '')}
              </div>
              <span class="text-[12px] text-[#B4B2A9] flex-1">Share something with your class…</span>
              <div class="w-6 h-6 rounded-md bg-[#7F77DD] flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 fill-[#EEEDFE]" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </div>
            </button>
          </div>
        {/if}

      <!-- ── QUIZZES ── -->
      {:else if activeTab === 'quizzes'}
      <div class="flex-1 px-5 py-4 flex flex-col gap-3">

        {#if data.isTeacher}
          <div class="bg-white border border-[#D3D1C7] rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-6 h-6 rounded-md bg-[#FAEEDA] flex items-center justify-center">
                <svg class="w-3.5 h-3.5 fill-[#EF9F27]" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </div>
              <span class="text-[13px] font-semibold text-[#2C2C2A]">Create new quiz</span>
            </div>
            <button
              onclick={() => showQuizModal = true}
              class="w-full flex items-center justify-center gap-2 bg-[#EF9F27] hover:bg-[#BA7517] text-white text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              New quiz
            </button>
          </div>
        {/if}

        {#if data.quizzes.length === 0}
          <div class="flex flex-col items-center justify-center gap-3 text-center py-16">
            <div class="w-11 h-11 bg-[#FAEEDA] rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 fill-[#EF9F27]" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </div>
            <div>
              <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">No quizzes yet</p>
              <p class="text-[12px] text-[#888780]">
                {data.isTeacher ? 'Create your first quiz above' : "Your teacher hasn't created any quizzes yet"}
              </p>
            </div>
          </div>
        {:else}
          <!-- Section label -->
          <div class="flex items-center gap-2">
            <span class="text-[10.5px] font-semibold uppercase tracking-widest text-[#888780]">Quizzes</span>
            <span class="bg-[#D3D1C7] text-[#5F5E5A] text-[10px] font-semibold rounded-full px-2 py-0.5">{data.quizzes.length}</span>
          </div>

          {#each data.quizzes as quiz}
            {@const isPast = new Date() > new Date(quiz.deadline)}
            <a
              href="/class/{data.cls.id}/quiz/{quiz.id}"
              class="bg-white border border-[#D3D1C7] hover:border-[#AFA9EC] rounded-xl overflow-hidden transition-colors block
                {!isPast ? 'border-l-[3px] border-l-[#EF9F27]' : 'border-l-[3px] border-l-[#D3D1C7]'}"
            >
              <div class="px-4 pt-4 pb-3 flex items-start gap-3">
                <!-- Icon -->
                <div class="w-8 h-8 rounded-lg bg-[#FAEEDA] flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4 fill-[#EF9F27]" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-[13.5px] font-semibold text-[#2C2C2A] mb-0.5 truncate">{quiz.title}</div>
                  {#if quiz.description}
                    <div class="text-[12px] text-[#888780] mb-1 truncate">{quiz.description}</div>
                  {/if}
                  <div class="text-[11px] text-[#888780]">
                    {quiz.questionCount} question{quiz.questionCount !== 1 ? 's' : ''} · due {new Date(quiz.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <!-- Status -->
                <div class="shrink-0 flex flex-col items-end gap-1.5">
                  {#if isPast}
                    <span class="bg-[#F1EFE8] text-[#888780] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">closed</span>
                  {:else}
                    <span class="bg-[#FAEEDA] text-[#633806] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">open</span>
                  {/if}
                  {#if data.isTeacher}
                    <span class="text-[11px] text-[#888780]">{quiz.submissionCount} submitted</span>
                  {:else if quiz.mySubmission}
                    {#if quiz.mySubmission.is_graded}
                      <div class="flex items-center gap-1">
                        <svg class="w-3 h-3 fill-[#1D9E75]" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span class="text-[11px] font-semibold text-[#1D9E75]">
                          {quiz.mySubmission.final_score ?? quiz.mySubmission.auto_score} pts
                        </span>
                      </div>
                    {:else}
                      <div class="flex items-center gap-1">
                        <svg class="w-3 h-3 fill-[#EF9F27]" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                        <span class="text-[11px] text-[#EF9F27] font-semibold">submitted</span>
                      </div>
                    {/if}
                  {/if}
                </div>
              </div>
            </a>
          {/each}
        {/if}

      </div>

      <!-- ── ATTENDANCE ── -->
      {:else if activeTab === 'attendance'}
        <div class="flex-1 px-3 sm:px-5 py-4 flex flex-col gap-3">

          <!-- Teacher: start session form -->
          {#if data.isTeacher}
            <div class="bg-white border border-[#D3D1C7] rounded-xl p-4 sm:p-5">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-6 h-6 rounded-md bg-[#E1F5EE] flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 fill-[#1D9E75]" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </div>
                <span class="text-[13px] font-semibold text-[#2C2C2A]">Start new session</span>
              </div>
              <form
                method="POST"
                action="?/startAttendance"
                use:enhance={() => {
                  return async ({ result, update }) => {
                    if (result.type !== 'failure') await update()
                  }
                }}
              >
                <!-- Stacked on mobile, 2-col on sm+ -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label for="attendance-label" class="block text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-1.5">Label</label>
                    <input
                      id="attendance-label"
                      name="label"
                      type="text"
                      placeholder="e.g. Morning session"
                      class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2 text-[12.5px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label for="attendance-start-time" class="block text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-1.5">Start time</label>
                    <input
                      id="attendance-start-time"
                      name="start_time"
                      type="time"
                      class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2 text-[12.5px] text-[#2C2C2A] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <div class="block text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-1.5">Duration</div>
                  <div class="flex gap-2">
                    {#each [5, 10, 15, 30] as mins}
                      <label class="flex-1">
                        <input type="radio" name="duration" value={mins} class="sr-only peer" checked={mins === 10} />
                        <div class="text-center py-2 rounded-lg border-[1.5px] border-[#D3D1C7] text-[12px] text-[#5F5E5A] cursor-pointer
                          peer-checked:border-[#1D9E75] peer-checked:bg-[#E1F5EE] peer-checked:text-[#085041] peer-checked:font-semibold transition-all">
                          {mins}m
                        </div>
                      </label>
                    {/each}
                  </div>
                </div>

                <button
                  type="submit"
                  class="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-lg py-2.5 text-[12.5px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                  </svg>
                  Generate QR &amp; start session
                </button>
              </form>
            </div>
          {/if}

          <!-- Sessions list -->
          {#if data.attendanceSessions.length === 0}
            <div class="flex flex-col items-center justify-center gap-3 text-center py-12">
              <div class="w-11 h-11 bg-[#E1F5EE] rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 fill-[#1D9E75]" viewBox="0 0 24 24">
                  <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                </svg>
              </div>
              <div>
                <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">No sessions yet</p>
                <p class="text-[12px] text-[#888780]">
                  {data.isTeacher ? 'Start a session above to generate a QR code' : "Your teacher hasn't started attendance yet"}
                </p>
              </div>
            </div>
          {:else}
            {#each data.attendanceSessions as session}
            {@const expired = new Date() > new Date(session.expires_at)}
            {@const isMarked = data.myAttendance.includes(session.id)}

            <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden
              {!expired ? 'border-l-[3px] border-l-[#1D9E75]' : 'border-l-[3px] border-l-[#D3D1C7]'}">

              <!-- Session header -->
              <div class="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5 truncate">{session.label}</div>
                  <div class="text-[11px] text-[#888780]">
                    {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    · expires {new Date(session.expires_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  {#if !expired}
                    <span class="bg-[#E1F5EE] text-[#0F6E56] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">active</span>
                  {:else}
                    <span class="bg-[#F1EFE8] text-[#888780] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">expired</span>
                  {/if}
                  {#if data.isTeacher}
                    <span class="bg-[#EEEDFE] text-[#534AB7] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{session.count} present</span>
                  {/if}
                </div>
              </div>

              {#if data.isTeacher}

                <!-- QR block (active only) -->
                {#if !expired}
                  <div class="mx-4 mb-3 bg-[#F1EFE8] border border-[#D3D1C7] rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div class="bg-white rounded-lg p-2 shrink-0 border border-[#D3D1C7]">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data={encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/attend/${session.token}`)}"
                        alt="QR Code"
                        class="w-24 h-24 block"
                      />
                    </div>
                    <div class="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-left">
                      <div class="text-[11.5px] font-semibold text-[#2C2C2A] mb-0.5">Students scan to mark attendance</div>
                      <div class="text-[10.5px] text-[#888780] mb-2">Or share the direct link</div>
                      <div class="font-mono text-[10.5px] text-[#534AB7] bg-[#EEEDFE] border border-[#AFA9EC] px-2.5 py-1.5 rounded-md truncate">
                        /attend/{session.token}
                      </div>
                    </div>
                  </div>
                {/if}

                <!-- Student list -->
                <div class="px-4 pb-4">
                  {#if session.records && session.records.length > 0}
                    <div class="text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-2">
                      Present · {session.records.length}
                    </div>
                    <div class="space-y-1 max-h-48 overflow-y-auto">
                      {#each session.records as record}
                        <div class="flex items-center gap-2.5 bg-[#F1EFE8] border border-[#D3D1C7] rounded-lg px-3 py-2">
                          <div class="w-6 h-6 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[9px] font-semibold text-[#534AB7] shrink-0">
                            {record.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <span class="flex-1 text-[12.5px] font-medium text-[#2C2C2A] truncate">{record.full_name}</span>
                          <span class="text-[10.5px] text-[#888780] shrink-0">
                            {new Date(record.scanned_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div class="w-4 h-4 rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0">
                            <svg class="w-2.5 h-2.5 fill-[#1D9E75]" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <div class="flex items-center gap-2 text-[12px] text-[#888780] py-2">
                      <svg class="w-3.5 h-3.5 fill-[#B4B2A9] shrink-0" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      No students have scanned in yet
                    </div>
                  {/if}
                </div>

              {:else}

                <!-- Student action -->
                <div class="px-4 pb-4">
                  {#if isMarked}
                    <div class="flex items-center gap-2 bg-[#E1F5EE] border border-[#5DCAA5] rounded-lg px-4 py-2.5">
                      <svg class="w-4 h-4 fill-[#1D9E75] shrink-0" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span class="text-[12.5px] text-[#085041] font-semibold">You are marked present</span>
                    </div>
                  {:else if !expired}
                    <a
                      href="/attend/{session.token}"
                      class="flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-lg px-4 py-2.5 text-[12.5px] font-semibold text-center transition-colors"
                    >
                      <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Mark me present
                    </a>
                  {:else}
                    <div class="flex items-center gap-2 bg-[#F1EFE8] border border-[#D3D1C7] rounded-lg px-4 py-2.5">
                      <svg class="w-4 h-4 fill-[#888780] shrink-0" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                      </svg>
                      <span class="text-[12.5px] text-[#888780]">Session expired — not marked</span>
                    </div>
                  {/if}
                </div>

              {/if}
            </div>
          {/each}
          {/if}
        </div>

      <!-- ── STUDENTS ── -->
      {:else if activeTab === 'students'}
       <div class="flex-1 px-5 py-4 flex flex-col gap-3">

          {#if data.students.length === 0}
            <div class="flex flex-col items-center justify-center gap-3 text-center py-16">
              <div class="w-11 h-11 bg-[#EEEDFE] rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 fill-[#7F77DD]" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div>
                <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">No students yet</p>
                <p class="text-[12px] text-[#888780]">
                  Share the class code <span class="font-semibold text-[#534AB7]">{data.cls.code}</span> to get students to join
                </p>
              </div>
            </div>
          {:else}
            <!-- Roster header -->
            <div class="flex items-center gap-2">
              <span class="text-[10.5px] font-semibold uppercase tracking-widest text-[#888780]">Enrolled students</span>
              <span class="bg-[#D3D1C7] text-[#5F5E5A] text-[10px] font-semibold rounded-full px-2 py-0.5">{data.students.length}</span>
            </div>

            <!-- Student list -->
            <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden">
              {#each data.students as student, i}
                <div class="flex items-center gap-3 px-4 py-3 {i !== data.students.length - 1 ? 'border-b border-[#F1EFE8]' : ''}">
                  <!-- Avatar -->
                  <div class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
                    {student.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>

                  <!-- Name + joined -->
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-medium text-[#2C2C2A] truncate">{student.full_name}</div>
                    <div class="text-[11px] text-[#888780]">
                      Joined {new Date(student.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <!-- Active indicator -->
                  <div class="flex items-center gap-1.5 shrink-0">
                    <div class="w-1.5 h-1.5 rounded-full bg-[#5DCAA5]"></div>
                    <span class="text-[10.5px] text-[#888780]">enrolled</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}

        </div>

      {:else if activeTab === 'settings'}
        <div class="flex-1 overflow-y-auto px-3 sm:px-5 py-4 flex flex-col gap-4">

          <div class="bg-white border border-[#D3D1C7] rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-6 h-6 rounded-md bg-[#EEEDFE] flex items-center justify-center">
                <svg class="w-3.5 h-3.5 fill-[#7F77DD]" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
              </div>
              <span class="text-[13px] font-semibold text-[#2C2C2A]">Class settings</span>
            </div>

            <form
              method="POST"
              action="?/tsupdateClass"
              use:enhance={() => {
                return async ({ result, update }) => {
                  if (result.type !== 'failure') await update()
                }
              }}
            >
              <div class="space-y-3 mb-4">
                <div>
                  <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-1.5">Class name</label>
                  <input
                    name="name"
                    type="text"
                    value={data.cls.name}
                    class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label class="block text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-1.5">Description <span class="normal-case font-normal text-[#B4B2A9]">(optional)</span></label>
                  <input
                    name="description"
                    type="text"
                    value={data.cls.description ?? ''}
                    placeholder="e.g. Monday & Wednesday, 8AM"
                    class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                class="bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Save changes
              </button>
            </form>
          </div>

          <div class="bg-white border border-[#D3D1C7] rounded-xl p-5">
            <div class="text-[13px] font-semibold text-[#2C2C2A] mb-1">Class code</div>
            <div class="text-[12px] text-[#888780] mb-3">Share this code with students to join your class</div>
            <div class="flex items-center gap-3">
              <div class="bg-[#EEEDFE] text-[#534AB7] text-[18px] font-bold px-5 py-2.5 rounded-xl tracking-widest">
                {data.cls.code}
              </div>
              <button
                onclick={() => navigator.clipboard.writeText(data.cls.code)}
                class="text-[12px] text-[#7F77DD] hover:underline cursor-pointer font-medium"
              >
                copy
              </button>
            </div>
          </div>

        </div>
      {/if}

    </main>
  </div>

  <!-- Bottom tab bar: mobile only -->
  <nav class="fixed bottom-0 left-0 right-0 h-14 bg-[#3C3489] flex items-center sm:hidden z-40 border-t border-[#534AB7]">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        class="flex-1 flex flex-col items-center justify-center gap-0.5 h-full cursor-pointer transition-colors
          {activeTab === tab.id ? 'bg-white/15' : ''}"
      >
        <svg
          class="w-4.5 h-4.5 transition-colors {activeTab === tab.id ? 'fill-[#EEEDFE]' : 'fill-[#AFA9EC]'}"
          viewBox="0 0 24 24"
        ><path d={tab.icon}/></svg>
        <span class="text-[9px] font-medium leading-none {activeTab === tab.id ? 'text-[#EEEDFE]' : 'text-[#AFA9EC]'}">
          {tab.shortLabel}
        </span>
      </button>
    {/each}
  </nav>

</div>

<!-- Post announcement modal -->
{#if showPostModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
    onclick={() => showPostModal = false}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && (showPostModal = false)}
  >
    <div
      class="bg-white rounded-t-2xl sm:rounded-2xl border border-[#AFA9EC] p-6 w-full sm:max-w-lg"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div class="flex items-start justify-between mb-5">
        <div>
          <h2 class="text-[15px] font-semibold text-[#2C2C2A]">New announcement</h2>
          <p class="text-[12px] text-[#888780] mt-0.5">Post to {data.cls.name}</p>
        </div>
        <button
          onclick={() => showPostModal = false}
          aria-label="Close modal"
          class="w-7 h-7 rounded-full bg-[#F1EFE8] hover:bg-[#D3D1C7] flex items-center justify-center transition-colors cursor-pointer text-[#5F5E5A] ml-4 shrink-0"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      {#if postError}
        <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-[12px] rounded-xl px-4 py-3 mb-4">{postError}</div>
      {/if}

      <form
        method="POST"
        action="?/postAnnouncement"
        use:enhance={() => {
          posting = true
          return async ({ result, update }) => {
            posting = false
            if (result.type === 'failure') {
              postError = (result.data as any)?.error ?? 'Something went wrong'
            } else {
              showPostModal = false
              postError = ''
              await update()
            }
          }
        }}
      >
        <div class="space-y-4 mb-5">
          <div>
            <label for="announcement-title" class="block text-[11px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">Title</label>
            <input
              id="announcement-title"
              name="title"
              type="text"
              placeholder="e.g. Quiz tomorrow — chapter 3"
              class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
            />
          </div>
          <div>
            <label for="announcement-content" class="block text-[11px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">Message</label>
            <textarea
              id="announcement-content"
              name="content"
              rows={4}
              placeholder="Write your announcement here…"
              class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all resize-none"
            ></textarea>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            onclick={() => showPostModal = false}
            class="flex-1 border-[1.5px] border-[#D3D1C7] rounded-lg py-2.5 text-[13px] font-medium text-[#5F5E5A] hover:bg-[#F1EFE8] transition-colors cursor-pointer"
          >Cancel</button>
          <button
            type="submit"
            disabled={posting}
            class="flex-1 bg-[#7F77DD] hover:bg-[#534AB7] text-[#EEEDFE] rounded-lg py-2.5 text-[13px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            {posting ? 'Posting…' : 'Post announcement'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if showQuizModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
    onclick={() => showQuizModal = false}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && (showQuizModal = false)}
  >
    <div
      class="bg-white rounded-t-2xl sm:rounded-2xl border border-[#AFA9EC] w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >

      <!-- Modal header -->
      <div class="px-6 py-4 border-b border-[#F1EFE8] flex items-start justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-md bg-[#FAEEDA] flex items-center justify-center">
            <svg class="w-3.5 h-3.5 fill-[#EF9F27]" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div>
            <h2 class="text-[15px] font-semibold text-[#2C2C2A] leading-none">Create quiz</h2>
            <p class="text-[11px] text-[#888780] mt-0.5">Add questions below</p>
          </div>
        </div>
        <button
          onclick={() => showQuizModal = false}
          aria-label="Close quiz modal"
          class="w-7 h-7 rounded-full bg-[#F1EFE8] hover:bg-[#D3D1C7] flex items-center justify-center transition-colors cursor-pointer text-[#5F5E5A] ml-4 shrink-0"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto px-6 py-5">

        {#if quizError}
          <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-[12px] rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
            <span class="mt-0.5 w-4 h-4 min-w-4 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-[10px] font-bold shrink-0">!</span>
            {quizError}
          </div>
        {/if}

        <form
          method="POST"
          action="?/createQuiz"
          id="quiz-form"
          use:enhance={() => {
            quizCreating = true
            quizError = ''
            return async ({ result, update }) => {
              quizCreating = false
              if (result.type === 'failure') {
                quizError = (result.data as any)?.error ?? 'Something went wrong'
              } else {
                showQuizModal = false
                quizQuestions = []
                quizError = ''
                await update()
              }
            }
          }}
          onsubmit={() => {
            const questionsInput = document.getElementById('quiz-questions-input') as HTMLInputElement
            questionsInput.value = JSON.stringify(quizQuestions)
          }}
        >
          <input type="hidden" name="questions" id="quiz-questions-input" value="" />

          <!-- Quiz details -->
          <div class="space-y-3 mb-5">
            <div>
              <label for="quiz-title" class="block text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-1.5">Quiz title</label>
              <input
                id="quiz-title"
                name="title"
                type="text"
                placeholder="e.g. Chapter 3 review"
                class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label for="quiz-description" class="block text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-1.5">
                Description <span class="normal-case font-normal text-[#B4B2A9]">(optional)</span>
              </label>
              <input
                id="quiz-description"
                name="description"
                type="text"
                placeholder="e.g. Covers vocabulary and comprehension"
                class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label for="quiz-deadline" class="block text-[10.5px] font-semibold uppercase tracking-wide text-[#888780] mb-1.5">Deadline</label>
              <input
                id="quiz-deadline"
                name="deadline"
                type="datetime-local"
                class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
              />
            </div>
          </div>

          <!-- Questions section -->
          <div class="border-t border-[#F1EFE8] pt-5">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-[10.5px] font-semibold uppercase tracking-widest text-[#888780]">Questions</span>
              {#if quizQuestions.length > 0}
                <span class="bg-[#D3D1C7] text-[#5F5E5A] text-[10px] font-semibold rounded-full px-2 py-0.5">{quizQuestions.length}</span>
              {/if}
            </div>

            <!-- Question cards -->
            {#each quizQuestions as q, i}
              <div class="bg-[#F1EFE8] border border-[#D3D1C7] rounded-xl overflow-hidden mb-3
                {q.type === 'multiple_choice' ? 'border-l-[3px] border-l-[#7F77DD]' : 'border-l-[3px] border-l-[#EF9F27]'}">

                <!-- Question header -->
                <div class="flex items-center justify-between px-4 py-2.5 border-b border-[#D3D1C7] bg-white">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-semibold text-[#888780]">Q{i + 1}</span>
                    <span class="text-[10px] text-[#888780]">·</span>
                    <span class="text-[10px] font-semibold {q.type === 'multiple_choice' ? 'text-[#534AB7]' : 'text-[#BA7517]'}">
                      {q.type === 'multiple_choice' ? 'Multiple choice' : 'Short answer'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onclick={() => removeQuestion(i)}
                    class="text-[11px] text-[#E24B4A] hover:bg-[#FCEBEB] px-2 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <div class="p-4">
                  <!-- Question text -->
                  <input
                    type="text"
                    placeholder="Question text"
                    bind:value={quizQuestions[i].text}
                    class="w-full bg-white border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] transition-all mb-3"
                  />

                  <!-- Choices (MC only) -->
                  {#if q.type === 'multiple_choice'}
                    <div class="space-y-1.5 mb-3">
                      {#each q.choices as _, ci}
                        <div class="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_{i}"
                            checked={quizQuestions[i].correct_answer === quizQuestions[i].choices[ci]}
                            onchange={() => {
                              quizQuestions[i].correct_answer = quizQuestions[i].choices[ci]
                              quizQuestions = [...quizQuestions]
                            }}
                            class="shrink-0 accent-[#7F77DD]"
                          />
                          <input
                            type="text"
                            placeholder="Choice {ci + 1}"
                            bind:value={quizQuestions[i].choices[ci]}
                            class="flex-1 bg-white border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-1.5 text-[12.5px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] transition-all"
                          />
                        </div>
                      {/each}
                    </div>
                    <div class="flex items-center gap-1.5 text-[11px] text-[#888780] mb-3">
                      <svg class="w-3 h-3 fill-[#B4B2A9]" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                      Select the radio button next to the correct answer
                    </div>
                  {/if}

                  <!-- Points -->
                  <div class="flex items-center gap-2">
                    <label for="points_{i}" class="text-[10.5px] font-semibold uppercase tracking-wide text-[#888780]">Points</label>
                    <input
                      id="points_{i}"
                      type="number"
                      bind:value={quizQuestions[i].points}
                      min="1"
                      class="w-16 bg-white border-[1.5px] border-[#D3D1C7] rounded-lg px-2 py-1 text-[12.5px] text-center focus:outline-none focus:border-[#7F77DD] transition-all"
                    />
                  </div>
                </div>
              </div>
            {/each}

            <!-- Add question row -->
            <div class="flex items-center gap-2 mt-1">
              <select
                bind:value={newQuestionType}
                class="flex-1 bg-white border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2 text-[12.5px] text-[#2C2C2A] focus:outline-none focus:border-[#7F77DD] transition-all"
              >
                <option value="multiple_choice">Multiple choice</option>
                <option value="short_answer">Short answer</option>
              </select>
              <button
                type="button"
                onclick={addQuestion}
                class="flex items-center gap-1.5 bg-[#EEEDFE] hover:bg-[#AFA9EC] text-[#534AB7] text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <svg class="w-3 h-3 fill-[#534AB7]" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Add question
              </button>
            </div>
          </div>

        </form>
      </div>

      <!-- Footer actions (sticky) -->
      <div class="px-6 py-4 border-t border-[#F1EFE8] flex gap-3 shrink-0 bg-white">
        <button
          type="button"
          onclick={() => showQuizModal = false}
          class="flex-1 border-[1.5px] border-[#D3D1C7] rounded-lg py-2.5 text-[13px] font-medium text-[#5F5E5A] hover:bg-[#F1EFE8] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="quiz-form"
          disabled={quizCreating || quizQuestions.length === 0}
          class="flex-1 bg-[#7F77DD] hover:bg-[#534AB7] text-white rounded-lg py-2.5 text-[13px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
        >
          {quizCreating ? 'Creating…' : 'Create quiz'}
        </button>
      </div>

    </div>
  </div>
{/if}

{#if editingAnnouncement}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
    onclick={() => editingAnnouncement = null}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && (editingAnnouncement = null)}
  >
    <div
      class="bg-white rounded-t-2xl sm:rounded-2xl border border-[#AFA9EC] p-6 w-full sm:max-w-lg"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div class="flex items-start justify-between mb-5">
        <div>
          <h2 class="text-[15px] font-semibold text-[#2C2C2A]">Edit announcement</h2>
          <p class="text-[12px] text-[#888780] mt-0.5">update your post</p>
        </div>
        <button
          onclick={() => editingAnnouncement = null}
          class="w-7 h-7 rounded-full bg-[#F1EFE8] hover:bg-[#D3D1C7] flex items-center justify-center transition-colors cursor-pointer text-[#5F5E5A] ml-4 shrink-0"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      {#if editError}
        <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-[12px] rounded-xl px-4 py-3 mb-4">{editError}</div>
      {/if}

      <form
        method="POST"
        action="?/editAnnouncement"
        use:enhance={() => {
          editing = true
          editError = ''
          return async ({ result, update }) => {
            editing = false
            if (result.type === 'failure') {
              editError = (result.data as any)?.error ?? 'Something went wrong'
            } else {
              editingAnnouncement = null
              editError = ''
              await update()
            }
          }
        }}
      >
        <input type="hidden" name="announcement_id" value={editingAnnouncement.id} />
        <div class="space-y-4 mb-5">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">Title</label>
            <input
              name="title"
              type="text"
              bind:value={editTitle}
              class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
            />
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">Message</label>
            <textarea
              name="content"
              rows={4}
              bind:value={editContent}
              class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all resize-none"
            ></textarea>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            onclick={() => editingAnnouncement = null}
            class="flex-1 border-[1.5px] border-[#D3D1C7] rounded-lg py-2.5 text-[13px] font-medium text-[#5F5E5A] hover:bg-[#F1EFE8] transition-colors cursor-pointer"
          >Cancel</button>
          <button
            type="submit"
            disabled={editing}
            class="flex-1 bg-[#7F77DD] hover:bg-[#534AB7] text-white rounded-lg py-2.5 text-[13px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            {editing ? 'saving...' : 'save changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}