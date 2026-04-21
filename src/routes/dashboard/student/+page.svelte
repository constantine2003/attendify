<script lang="ts">
  import type { PageData } from './$types'
  import { createSupabaseLoadClient } from '$lib/supabase'
  import { invalidateAll } from '$app/navigation'

  let { data } = $props()
  const supabase = createSupabaseLoadClient(fetch)

  let showModal = $state(false)
  let classCode = $state('')
  let joining = $state(false)
  let error = $state('')

  const classColors = [
    { bg: '#EEEDFE', border: '#AFA9EC', text: '#3C3489', sub: '#534AB7', badge: '#AFA9EC' },
    { bg: '#E1F5EE', border: '#5DCAA5', text: '#085041', sub: '#0F6E56', badge: '#5DCAA5' },
    { bg: '#FAECE7', border: '#F0997B', text: '#712B13', sub: '#993C1D', badge: '#F0997B' },
    { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', sub: '#854F0B', badge: '#EF9F27' },
    { bg: '#FBEAF0', border: '#ED93B1', text: '#72243E', sub: '#993556', badge: '#ED93B1' },
    { bg: '#E6F1FB', border: '#85B7EB', text: '#0C447C', sub: '#185FA5', badge: '#85B7EB' },
  ]

  function getColor(index: number) {
    return classColors[index % classColors.length]
  }

  function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function joinClass() {
    if (!classCode.trim()) return
    joining = true
    error = ''

    const { data: cls, error: fetchErr } = await supabase
      .from('classes')
      .select('id')
      .eq('code', classCode.trim().toUpperCase())
      .single()

    if (fetchErr || !cls) {
      error = 'Class not found — check the code and try again'
      joining = false
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error: joinErr } = await supabase.from('class_members').insert({
      class_id: cls.id,
      student_id: user!.id
    })

    if (joinErr) {
      error = joinErr.code === '23505' ? 'You already joined this class' : joinErr.message
      joining = false
      return
    }

    classCode = ''
    showModal = false
    joining = false
    await invalidateAll()
  }

  let initials = $derived(
    data.profile?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '??'
  )

  let firstName = $derived(data.profile?.full_name?.split(' ')[0] ?? '')
</script>

<div class="min-h-screen bg-[#F1EFE8]">

  <!-- Navbar -->
  <nav class="bg-[#7F77DD] px-6 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 bg-[#534AB7] rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 fill-[#EEEDFE]" viewBox="0 0 24 24">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      </div>
      <span class="text-[#EEEDFE] font-semibold tracking-tight text-[15px]">attend<span class="text-[#C4C0F5]">ify</span></span>
    </div>
    <div class="flex items-center gap-3">
      <span class="text-sm text-[#C4C0F5] hidden sm:block">{data.profile?.full_name}</span>
      <div class="w-8 h-8 rounded-full bg-[#534AB7] border-2 border-[#AFA9EC] flex items-center justify-center text-[11px] font-semibold text-[#EEEDFE]">
        {initials}
      </div>
      <button
        onclick={handleLogout}
        class="text-xs text-[#C4C0F5] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
      >
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
        Log out
      </button>
    </div>
  </nav>

  <div class="max-w-5xl mx-auto px-6 py-10">

    <!-- Greeting banner -->
    <div class="bg-[#7F77DD] rounded-2xl px-7 py-6 mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-white">
          {getGreeting()}, {firstName}!
        </h1>
        <p class="text-sm text-[#C4C0F5] mt-0.5">
          {data.classes.length === 0
            ? 'Join your first class using a class code'
            : `You are enrolled in ${data.classes.length} ${data.classes.length === 1 ? 'class' : 'classes'}`}
        </p>
      </div>
      <button
        onclick={() => showModal = true}
        class="bg-white hover:bg-[#EEEDFE] text-[#534AB7] rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 shrink-0"
      >
        <svg class="w-4 h-4 fill-[#534AB7]" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S14.93 14 13 14s-3.5-1.57-3.5-3.5S11.07 7 13 7zM7 17c0-2 4-3.1 6-3.1s6 1.1 6 3.1H7z"/>
        </svg>
        Join a class
      </button>
    </div>

    <!-- Section label -->
    <div class="flex items-center gap-2 mb-4">
      <span class="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Your classes</span>
      {#if data.classes.length > 0}
        <span class="bg-[#D3D1C7] text-[#5F5E5A] text-[10px] font-semibold rounded-full px-2 py-0.5">{data.classes.length}</span>
      {/if}
    </div>

    <!-- Classes grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

      {#each data.classes as member, i}
        {@const cls = member.classes as any}
        {@const c = getColor(i)}
        <a
          href="/class/{cls.id}"
          class="rounded-2xl p-5 cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform relative overflow-hidden group"
          style="background:{c.bg}; border: 1.5px solid {c.border};"
        >
          <!-- Code badge -->
          <div class="absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wider" style="background:{c.badge}33; color:{c.text}; border: 1px solid {c.border};">
            {cls.code}
          </div>

          <!-- Icon block -->
          <div class="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style="background:{c.border}40;">
            <svg class="w-5 h-5" style="fill:{c.sub};" viewBox="0 0 24 24">
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            </svg>
          </div>

          <div class="font-semibold text-sm mb-1 pr-14" style="color:{c.text};">{cls.name}</div>
          <div class="text-xs mb-2" style="color:{c.sub};">
            {#if cls.profiles?.full_name}
              By {cls.profiles.full_name}
            {:else}
              &nbsp;
            {/if}
          </div>
          <div class="flex items-center gap-1 text-xs mt-1" style="color:{c.sub};">
            <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Open class
          </div>
        </a>
      {/each}

      <!-- Join class card -->
      <button
        onclick={() => showModal = true}
        class="rounded-2xl p-5 border-[1.5px] border-dashed border-[#B4B2A9] hover:border-[#7F77DD] hover:bg-[#EEEDFE] transition-all flex flex-col items-center justify-center gap-3 min-h-37 cursor-pointer bg-transparent group"
      >
        <div class="w-10 h-10 rounded-full bg-[#D3D1C7] group-hover:bg-[#AFA9EC] flex items-center justify-center transition-colors">
          <svg class="w-5 h-5 fill-[#5F5E5A] group-hover:fill-[#3C3489] transition-colors" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </div>
        <span class="text-sm font-medium text-[#888780] group-hover:text-[#534AB7] transition-colors">Join a class</span>
      </button>

    </div>
  </div>
</div>

<!-- Join class modal -->
{#if showModal}
  <div
    class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    onclick={() => showModal = false}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && (showModal = false)}
  >
    <div
      class="bg-white rounded-3xl border border-[#AFA9EC] p-7 w-full max-w-sm"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Modal header -->
      <div class="flex items-start justify-between mb-5">
        <div>
          <h2 class="text-base font-semibold text-[#2C2C2A]">Join a class</h2>
          <p class="text-sm text-[#888780] mt-0.5">Enter the 6-character code from your teacher</p>
        </div>
        <button
          onclick={() => showModal = false}
          class="w-7 h-7 rounded-full bg-[#F1EFE8] hover:bg-[#D3D1C7] flex items-center justify-center transition-colors cursor-pointer text-[#5F5E5A] ml-4 shrink-0"
          aria-label="Close modal"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {#if error}
        <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-sm rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
          <span class="mt-0.5 w-4 h-4 min-w-4 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-[10px] font-bold">!</span>
          {error}
        </div>
      {/if}

      <div class="mb-6">
        <label for="class-code" class="block text-[11.5px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">
          Class code
        </label>
        <input
          id="class-code"
          type="text"
          bind:value={classCode}
          placeholder="AB12CD"
          maxlength={6}
          class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-[10px] px-3 py-3 text-lg text-[#2C2C2A] uppercase placeholder:normal-case placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all tracking-[0.3em] font-semibold text-center"
        />
        <p class="text-[11px] text-[#B4B2A9] text-center mt-2">{classCode.length}/6 characters</p>
      </div>

      <div class="flex gap-3">
        <button
          onclick={() => showModal = false}
          class="flex-1 border-[1.5px] border-[#D3D1C7] rounded-[10px] py-2.5 text-sm font-medium text-[#5F5E5A] hover:bg-[#F1EFE8] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onclick={joinClass}
          disabled={joining || classCode.trim().length !== 6}
          class="flex-1 bg-[#7F77DD] hover:bg-[#534AB7] active:scale-[0.98] text-[#EEEDFE] rounded-[10px] py-2.5 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {#if joining}
            Joining...
          {:else}
            <svg class="w-4 h-4 fill-[#EEEDFE]" viewBox="0 0 24 24">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
            </svg>
            Join class
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}