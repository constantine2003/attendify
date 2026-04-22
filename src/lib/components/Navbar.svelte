<script lang="ts">
  import { createSupabaseLoadClient } from '$lib/supabase'

  let {
    fullName = '',
    role = '',
    backHref = '',
    backLabel = '',
    currentPage = ''
  }: {
    fullName?: string
    role?: string
    backHref?: string
    backLabel?: string
    currentPage?: string
  } = $props()

  const supabase = createSupabaseLoadClient(fetch)

  let showMenu = $state(false)
  let showEditModal = $state(false)
  let newName = $state('')
  $effect(() => { newName = fullName })
  let saving = $state(false)
  let saveError = $state('')

  function getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '??'
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function saveName() {
    if (!newName.trim()) return
    saving = true
    saveError = ''

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { saveError = 'Not logged in'; saving = false; return }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: newName.trim() })
      .eq('id', user.id)

    if (error) {
      saveError = error.message
      saving = false
      return
    }

    saving = false
    showEditModal = false
    window.location.reload()
  }
</script>

<!-- Command bar -->
<nav class="bg-[#534AB7] h-11 flex items-center px-4 gap-3 shrink-0 min-w-0 relative z-30">

  <!-- Left: logo + breadcrumb -->
  <div class="flex items-center gap-2 shrink-0">
    {#if backHref}
      <a
        href={backHref}
        aria-label="Go back"
        class="w-7 h-7 bg-[#3C3489] rounded-lg flex items-center justify-center hover:bg-[#2A2570] transition-colors shrink-0"
      >
        <svg class="w-3.5 h-3.5 fill-[#EEEDFE]" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </a>
    {:else}
      <div class="w-7 h-7 bg-[#3C3489] rounded-lg flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 fill-[#EEEDFE]" viewBox="0 0 24 24">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      </div>
    {/if}
    <span class="text-[#EEEDFE] font-semibold text-[13px] tracking-tight hidden sm:block">
      attend<span class="text-[#AFA9EC]">ify</span>
    </span>
  </div>

  {#if backLabel || currentPage}
    <div class="w-px h-5 bg-[#AFA9EC] opacity-40 shrink-0"></div>
    <div class="flex items-center gap-1.5 text-[12px] min-w-0 overflow-hidden">
      {#if backLabel && backHref}
        <a href={backHref} class="text-[#C4C0F5] hover:text-white transition-colors shrink-0">{backLabel}</a>
        <span class="text-[#AFA9EC] opacity-60 shrink-0">/</span>
      {/if}
      {#if currentPage}
        <span class="text-[#EEEDFE] font-medium truncate">{currentPage}</span>
      {/if}
    </div>
  {/if}

  <!-- Right: name + avatar dropdown -->
  <div class="ml-auto flex items-center gap-2.5 shrink-0 relative">
    <span class="text-[11px] text-[#C4C0F5] hidden sm:block">{fullName}</span>

    <button
      onclick={() => showMenu = !showMenu}
      class="w-7 h-7 rounded-full bg-[#7F77DD] border-[1.5px] border-[#AFA9EC] flex items-center justify-center text-[10px] font-semibold text-[#EEEDFE] cursor-pointer hover:bg-[#534AB7] transition-colors"
    >
      {getInitials(fullName)}
    </button>

    <!-- Dropdown -->
    {#if showMenu}
      <!-- Click-outside backdrop -->
      <div class="fixed inset-0 z-40" onclick={() => showMenu = false} role="presentation"></div>

      <div class="absolute top-9 right-0 w-52 bg-white rounded-xl border border-[#D3D1C7] overflow-hidden z-50">
        <!-- Profile header -->
        <div class="px-4 py-3 border-b border-[#F1EFE8]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-semibold text-[#534AB7] shrink-0">
              {getInitials(fullName)}
            </div>
            <div class="min-w-0">
              <div class="text-[13px] font-semibold text-[#2C2C2A] truncate">{fullName}</div>
              <div class="text-[11px] text-[#888780] capitalize">{role}</div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="py-1">
          <button
            onclick={() => { showMenu = false; newName = fullName; showEditModal = true }}
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-[#2C2C2A] hover:bg-[#F1EFE8] transition-colors cursor-pointer text-left"
          >
            <svg class="w-3.5 h-3.5 fill-[#888780] shrink-0" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Edit name
          </button>
          <div class="h-px bg-[#F1EFE8] mx-3"></div>
          <button
            onclick={handleLogout}
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-[#E24B4A] hover:bg-[#FCEBEB] transition-colors cursor-pointer text-left"
          >
            <svg class="w-3.5 h-3.5 fill-[#E24B4A] shrink-0" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Log out
          </button>
        </div>
      </div>
    {/if}
  </div>
</nav>

<!-- Edit name modal -->
{#if showEditModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onclick={() => showEditModal = false}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => e.key === 'Escape' && (showEditModal = false)}
  >
    <div
      class="bg-white rounded-2xl border border-[#AFA9EC] p-6 w-full max-w-sm"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div class="flex items-start justify-between mb-5">
        <div>
          <h2 class="text-[15px] font-semibold text-[#2C2C2A]">Edit your name</h2>
          <p class="text-[12px] text-[#888780] mt-0.5">This will update across all your classes</p>
        </div>
        <button
          onclick={() => showEditModal = false}
          aria-label="Close"
          class="w-7 h-7 rounded-full bg-[#F1EFE8] hover:bg-[#D3D1C7] flex items-center justify-center transition-colors cursor-pointer text-[#5F5E5A] ml-4 shrink-0"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {#if saveError}
        <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-[12px] rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
          <span class="mt-0.5 w-4 h-4 min-w-4 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-[10px] font-bold">!</span>
          {saveError}
        </div>
      {/if}

      <div class="mb-5">
        <label for="edit-name" class="block text-[11px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">Full name</label>
        <input
          id="edit-name"
          type="text"
          bind:value={newName}
          placeholder="Your full name"
          class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-lg px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
        />
      </div>

      <div class="flex gap-3">
        <button
          onclick={() => showEditModal = false}
          class="flex-1 border-[1.5px] border-[#D3D1C7] rounded-lg py-2.5 text-[13px] font-medium text-[#5F5E5A] hover:bg-[#F1EFE8] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onclick={saveName}
          disabled={saving || !newName.trim()}
          class="flex-1 bg-[#7F77DD] hover:bg-[#534AB7] text-white rounded-lg py-2.5 text-[13px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving…' : 'Save name'}
        </button>
      </div>
    </div>
  </div>
{/if}