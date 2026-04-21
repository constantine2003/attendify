<script lang="ts">
  import { enhance } from '$app/forms'
  import { createSupabaseLoadClient } from '$lib/supabase'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const supabase = createSupabaseLoadClient(fetch)

  let showPostModal = $state(false)
  let posting = $state(false)
  let postError = $state('')
  let activeTab = $state('announcements')

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
    { id: 'announcements', label: 'Announcements', shortLabel: 'Posts',   icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' },
    { id: 'quizzes',       label: 'Quizzes',       shortLabel: 'Quizzes', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
    { id: 'attendance',    label: 'Attendance',    shortLabel: 'Attend.', icon: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z' },
    { id: 'students',      label: 'Students',      shortLabel: 'Students',icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
  ]

  const activeTabMeta = $derived(tabs.find(t => t.id === activeTab)!)

  // Group announcements by date label
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
</script>

<div class="min-h-screen bg-[#F1EFE8] flex flex-col">

  <!-- Top command bar -->
  <nav class="bg-[#534AB7] h-11 flex items-center px-3 gap-2.5 shrink-0">
    <!-- Brand -->
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 bg-[#3C3489] rounded-lg flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 fill-[#EEEDFE]" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </div>
      <span class="text-[#EEEDFE] font-semibold text-[13px] tracking-tight hidden sm:block">
        attend<span class="text-[#AFA9EC]">ify</span>
      </span>
    </div>

    <!-- Divider -->
    <div class="w-px h-5 bg-[#AFA9EC] opacity-40 mx-1"></div>

    <!-- Breadcrumb -->
    <div class="flex items-center gap-1.5 text-[12px]">
      <a
        href={data.isTeacher ? '/dashboard/teacher' : '/dashboard/student'}
        class="text-[#C4C0F5] hover:text-white transition-colors"
      >My classes</a>
      <span class="text-[#AFA9EC] opacity-60">/</span>
      <span class="text-[#EEEDFE] font-medium">{data.cls.name}</span>
    </div>

    <!-- Right side -->
    <div class="ml-auto flex items-center gap-2.5">
      <span class="text-[11px] text-[#C4C0F5] hidden sm:block">{data.profile?.full_name}</span>
      <div class="w-7 h-7 rounded-full bg-[#7F77DD] border-[1.5px] border-[#AFA9EC] flex items-center justify-center text-[10px] font-semibold text-[#EEEDFE]">
        {getInitials(data.profile?.full_name ?? '')}
      </div>
      <button
        onclick={handleLogout}
        class="text-[11px] text-[#C4C0F5] hover:text-white hover:bg-white/10 transition-colors px-2 py-1 rounded cursor-pointer"
      >
        log out
      </button>
    </div>
  </nav>

  <!-- Body: rail + sidebar + main -->
  <div class="flex flex-1 overflow-hidden">

    <!-- Icon rail -->
    <aside class="w-14 bg-[#3C3489] flex flex-col items-center py-2 gap-0.5 shrink-0">
      {#each tabs as tab}
        <button
          onclick={() => activeTab = tab.id}
          class="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors
            {activeTab === tab.id
              ? 'bg-white/15'
              : 'hover:bg-white/8'}"
          title={tab.label}
        >
          <svg
            class="w-[18px] h-[18px] transition-colors {activeTab === tab.id ? 'fill-[#EEEDFE]' : 'fill-[#AFA9EC]'}"
            viewBox="0 0 24 24"
          >
            <path d={tab.icon}/>
          </svg>
          <span class="text-[9px] font-medium leading-none {activeTab === tab.id ? 'text-[#EEEDFE]' : 'text-[#AFA9EC]'}">
            {tab.shortLabel}
          </span>
        </button>
        {#if tab.id === 'announcements'}
          <div class="w-7 h-px bg-[#534AB7] my-1"></div>
        {/if}
      {/each}
    </aside>

    <!-- Channel sidebar -->
    <aside class="w-56 bg-white border-r border-[#D3D1C7] flex flex-col overflow-hidden shrink-0">
      <!-- Class info -->
      <div class="p-3.5 border-b border-[#F1EFE8]">
        <div class="w-9 h-9 rounded-lg bg-[#EEEDFE] flex items-center justify-center mb-2.5">
          <svg class="w-[18px] h-[18px] fill-[#7F77DD]" viewBox="0 0 24 24">
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

      <!-- Nav list -->
      <nav class="flex-1 overflow-y-auto py-2">
        <div class="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#B4B2A9]">Channels</div>
        {#each tabs as tab}
          <button
            onclick={() => activeTab = tab.id}
            class="w-full flex items-center gap-2.5 px-3.5 py-[7px] text-left relative cursor-pointer transition-colors
              {activeTab === tab.id
                ? 'bg-[#EEEDFE] text-[#534AB7]'
                : 'text-[#5F5E5A] hover:bg-[#F1EFE8]'}"
          >
            {#if activeTab === tab.id}
              <div class="absolute left-0 top-1 bottom-1 w-[3px] bg-[#7F77DD] rounded-r"></div>
            {/if}
            <svg
              class="w-3.5 h-3.5 shrink-0 {activeTab === tab.id ? 'fill-[#534AB7]' : 'fill-[#888780]'}"
              viewBox="0 0 24 24"
            >
              <path d={tab.icon}/>
            </svg>
            <span class="text-[12.5px] {activeTab === tab.id ? 'font-semibold' : ''}">{tab.label}</span>
          </button>
        {/each}
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-hidden bg-[#F1EFE8]">

      <!-- Channel header -->
      <div class="bg-white border-b border-[#D3D1C7] px-5 py-2.5 flex items-center gap-3 shrink-0">
        <div class="w-7 h-7 rounded-md bg-[#EEEDFE] flex items-center justify-center">
          <svg class="w-3.5 h-3.5 fill-[#7F77DD]" viewBox="0 0 24 24">
            <path d={activeTabMeta.icon}/>
          </svg>
        </div>
        <div>
          <div class="text-[14px] font-semibold text-[#2C2C2A]">{activeTabMeta.label}</div>
          {#if activeTab === 'announcements'}
            <div class="text-[11px] text-[#888780]">{data.announcements.length} post{data.announcements.length !== 1 ? 's' : ''} · {data.cls.name}</div>
          {/if}
        </div>
        {#if data.isTeacher && activeTab === 'announcements'}
          <div class="ml-auto">
            <button
              onclick={() => showPostModal = true}
              class="flex items-center gap-1.5 bg-[#7F77DD] hover:bg-[#534AB7] text-[#EEEDFE] text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg class="w-3 h-3 fill-[#EEEDFE]" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              New post
            </button>
          </div>
        {/if}
      </div>

      <!-- Tab content -->
      {#if activeTab === 'announcements'}
        <!-- Feed -->
        <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
          {#if data.announcements.length === 0}
            <div class="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
              <div class="w-11 h-11 bg-[#EEEDFE] rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 fill-[#7F77DD]" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
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
              <!-- Date divider -->
              <div class="flex items-center gap-3 my-1">
                <div class="flex-1 h-px bg-[#D3D1C7]"></div>
                <span class="text-[11px] text-[#888780] whitespace-nowrap">{group.label}</span>
                <div class="flex-1 h-px bg-[#D3D1C7]"></div>
              </div>

              {#each group.posts as post}
                <div class="bg-white border border-[#D3D1C7] hover:border-[#AFA9EC] rounded-xl p-4 transition-colors">
                  <!-- Post header -->
                  <div class="flex items-center gap-2.5 mb-3">
                    <div class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
                      {getInitials((post.profiles as any)?.full_name ?? '')}
                    </div>
                    <div>
                      <div class="text-[13px] font-semibold text-[#2C2C2A]">{(post.profiles as any)?.full_name}</div>
                      <div class="text-[11px] text-[#888780]">{timeAgo(post.created_at)}</div>
                    </div>
                    <span class="ml-auto bg-[#EEEDFE] text-[#534AB7] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      announcement
                    </span>
                  </div>

                  <!-- Post body -->
                  <div class="text-[13.5px] font-semibold text-[#2C2C2A] mb-1.5">{post.title}</div>
                  <div class="text-[12.5px] text-[#5F5E5A] leading-relaxed">{post.content}</div>

                  <!-- Reactions row -->
                  <div class="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#F1EFE8]">
                    <button class="flex items-center gap-1.5 bg-[#F1EFE8] hover:bg-[#EEEDFE] border border-[#D3D1C7] rounded-full px-2.5 py-1 text-[11px] text-[#5F5E5A] cursor-pointer transition-colors">
                      👍
                    </button>
                    <button class="flex items-center gap-1.5 bg-[#F1EFE8] hover:bg-[#EEEDFE] border border-[#D3D1C7] rounded-full px-2.5 py-1 text-[11px] text-[#5F5E5A] cursor-pointer transition-colors">
                      👀
                    </button>
                    <button class="ml-auto flex items-center gap-1.5 text-[11px] text-[#888780] hover:text-[#2C2C2A] hover:bg-[#F1EFE8] px-2 py-1 rounded-md transition-colors cursor-pointer">
                      <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                      </svg>
                      Reply
                    </button>
                  </div>
                </div>
              {/each}
            {/each}
          {/if}
        </div>

        <!-- Compose bar (teacher only) -->
        {#if data.isTeacher}
          <div class="bg-white border-t border-[#D3D1C7] px-5 py-2.5 shrink-0">
            <button
              onclick={() => showPostModal = true}
              class="w-full flex items-center gap-2.5 bg-[#F1EFE8] hover:border-[#AFA9EC] border border-[#D3D1C7] rounded-lg px-3 py-2.5 cursor-pointer transition-colors text-left"
            >
              <div class="w-6 h-6 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[9px] font-semibold text-[#534AB7] shrink-0">
                {getInitials(data.profile?.full_name ?? '')}
              </div>
              <span class="text-[12px] text-[#B4B2A9] flex-1">Share something with your class…</span>
              <div class="w-6 h-6 rounded-md bg-[#7F77DD] flex items-center justify-center">
                <svg class="w-3 h-3 fill-[#EEEDFE]" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </div>
            </button>
          </div>
        {/if}

      <!-- Quizzes placeholder -->
      {:else if activeTab === 'quizzes'}
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
          <div class="w-11 h-11 bg-[#FAEEDA] rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 fill-[#EF9F27]" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">quizzes coming soon</p>
            <p class="text-[12px] text-[#888780]">this feature is being built</p>
          </div>
        </div>

      <!-- Attendance placeholder -->
      {:else if activeTab === 'attendance'}
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
          <div class="w-11 h-11 bg-[#E1F5EE] rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 fill-[#1D9E75]" viewBox="0 0 24 24">
              <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
            </svg>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">attendance coming soon</p>
            <p class="text-[12px] text-[#888780]">this feature is being built</p>
          </div>
        </div>

      <!-- Students placeholder -->
      {:else if activeTab === 'students'}
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
          <div class="w-11 h-11 bg-[#EEEDFE] rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 fill-[#7F77DD]" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-[#2C2C2A] mb-0.5">students coming soon</p>
            <p class="text-[12px] text-[#888780]">this feature is being built</p>
          </div>
        </div>
      {/if}

    </main>
  </div>
</div>

<!-- Post announcement modal -->
{#if showPostModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onclick={() => showPostModal = false}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && (showPostModal = false)}
  >
    <div
      class="bg-white rounded-2xl border border-[#AFA9EC] p-6 w-full max-w-lg"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Modal header -->
      <div class="flex items-start justify-between mb-5">
        <div>
          <h2 class="text-[15px] font-semibold text-[#2C2C2A]">New announcement</h2>
          <p class="text-[12px] text-[#888780] mt-0.5">Post to {data.cls.name}</p>
        </div>
        <button
          onclick={() => showPostModal = false}
          class="w-7 h-7 rounded-full bg-[#F1EFE8] hover:bg-[#D3D1C7] flex items-center justify-center transition-colors cursor-pointer text-[#5F5E5A] ml-4 shrink-0"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
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
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">Title</label>
            <input
              name="title"
              type="text"
              placeholder="e.g. Quiz tomorrow — chapter 3"
              class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
            />
          </div>
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">Message</label>
            <textarea
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
          >
            Cancel
          </button>
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