<script lang="ts">
  import { enhance } from '$app/forms'
  import { createSupabaseLoadClient } from '$lib/supabase'
  import Navbar from '$lib/components/Navbar.svelte'
  
  let { data } = $props()
  const supabase = createSupabaseLoadClient(fetch)

  let showModal = $state(false)
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

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-[#F1EFE8] flex flex-col">

  <!-- Top command bar -->
  <Navbar fullName={data.profile?.full_name ?? ''} role="student" />

  <div class="max-w-5xl mx-auto w-full px-6 py-8">

    <!-- Greeting banner -->
    <div class="bg-[#7F77DD] rounded-2xl px-6 py-5 mb-7 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-[18px] font-semibold text-white leading-snug">{getGreeting()}, {firstName}!</h1>
        <p class="text-[13px] text-[#C4C0F5] mt-0.5">
          {data.classes.length === 0
            ? 'Join your first class using a class code'
            : `You are enrolled in ${data.classes.length} ${data.classes.length === 1 ? 'class' : 'classes'}`}
        </p>
      </div>
      <button
        onclick={() => showModal = true}
        class="bg-white hover:bg-[#EEEDFE] text-[#534AB7] rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
      >
        <svg class="w-3.5 h-3.5 fill-[#534AB7]" viewBox="0 0 24 24">
          <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
        </svg>
        Join a class
      </button>
    </div>

    <!-- Section label -->
    <div class="flex items-center gap-2 mb-3.5">
      <span class="text-[10.5px] font-semibold text-[#888780] uppercase tracking-widest">Your classes</span>
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
          class="rounded-2xl p-5 cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform relative overflow-hidden"
          style="background:{c.bg}; border: 1.5px solid {c.border};"
        >
          <!-- Code badge -->
          <div
            class="absolute top-3.5 right-3.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wider"
            style="background:{c.badge}33; color:{c.text}; border: 1px solid {c.border};"
          >
            {cls.code}
          </div>

          <!-- Icon -->
          <div class="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style="background:{c.border}40;">
            <svg class="w-4.5 h-4.5" style="fill:{c.sub};" viewBox="0 0 24 24">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 12H7v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"/>
            </svg>
          </div>

          <div class="font-semibold text-[13.5px] mb-0.5 pr-14 leading-snug" style="color:{c.text};">{cls.name}</div>
          {#if cls.description}
            <div class="text-[12px] mb-1 line-clamp-1" style="color:{c.sub};">{cls.description}</div>
          {/if}
          <div class="text-[11.5px] mt-2 font-medium" style="color:{c.sub};">
            by {cls.profiles?.full_name}
          </div>
        </a>
      {/each}

      <!-- Join class card -->
      <button
        onclick={() => showModal = true}
        class="rounded-2xl p-5 border-[1.5px] border-dashed border-[#B4B2A9] hover:border-[#7F77DD] hover:bg-[#EEEDFE] transition-all flex flex-col items-center justify-center gap-3 min-h-36 cursor-pointer bg-transparent group"
      >
        <div class="w-9 h-9 rounded-full bg-[#D3D1C7] group-hover:bg-[#AFA9EC] flex items-center justify-center transition-colors">
          <svg class="w-4.5 h-4.5 fill-[#5F5E5A] group-hover:fill-[#3C3489] transition-colors" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </div>
        <span class="text-[13px] font-medium text-[#888780] group-hover:text-[#534AB7] transition-colors">Join a class</span>
      </button>

    </div>
  </div>
</div>

<!-- Join class modal -->
{#if showModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onclick={() => showModal = false}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && (showModal = false)}
  >
    <div
      class="bg-white rounded-2xl border border-[#AFA9EC] p-6 w-full max-w-sm"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Modal header -->
      <div class="flex items-start justify-between mb-5">
        <div>
          <h2 class="text-[15px] font-semibold text-[#2C2C2A]">Join a class</h2>
          <p class="text-[12px] text-[#888780] mt-0.5">Enter the 6-character code from your teacher</p>
        </div>
        <button
          onclick={() => showModal = false}
          aria-label="Close join class modal"
          title="Close"
          class="w-7 h-7 rounded-full bg-[#F1EFE8] hover:bg-[#D3D1C7] flex items-center justify-center transition-colors cursor-pointer text-[#5F5E5A] ml-4 shrink-0"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {#if error}
        <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-[12px] rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
          <span class="mt-0.5 w-4 h-4 min-w-4 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-[10px] font-bold">!</span>
          {error}
        </div>
      {/if}

      <form
        method="POST"
        action="?/joinClass"
        use:enhance={() => {
          joining = true
          error = ''
          return async ({ result, update }) => {
            joining = false
            if (result.type === 'failure') {
              error = (result.data as any)?.error ?? 'Something went wrong'
            } else {
              showModal = false
              error = ''
              await update()
            }
          }
        }}
      >
        <div class="mb-5">
          <label class="block text-[11px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">Class code</label>
          <input
            name="code"
            type="text"
            maxlength={6}
            placeholder="AB12CD"
            class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-3 text-lg text-[#2C2C2A] uppercase placeholder:normal-case placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all tracking-[0.3em] font-semibold text-center"
          />
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            onclick={() => showModal = false}
            class="flex-1 border-[1.5px] border-[#D3D1C7] rounded-lg py-2.5 text-[13px] font-medium text-[#5F5E5A] hover:bg-[#F1EFE8] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={joining}
            class="flex-1 bg-[#7F77DD] hover:bg-[#534AB7] active:scale-[0.98] text-[#EEEDFE] rounded-lg py-2.5 text-[13px] font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {#if joining}
              Joining…
            {:else}
              <svg class="w-3.5 h-3.5 fill-[#EEEDFE]" viewBox="0 0 24 24">
                <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
              </svg>
              Join class
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}