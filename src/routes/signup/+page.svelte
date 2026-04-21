<script lang="ts">
  import { createSupabaseLoadClient } from '$lib/supabase'
  import { page } from '$app/stores'

  let fullName = $state('')
  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)
  let showPassword = $state(false)

  const supabase = createSupabaseLoadClient(fetch)

  let role = $derived($page.url.searchParams.get('role') === 'student' ? 'student' : 'teacher')

  async function handleSignup() {
    loading = true
    error = ''

    const { data, error: err } = await supabase.auth.signUp({ email, password })

    if (err) {
      error = err.message
      loading = false
      return
    }

    const { error: profileErr } = await supabase.from('profiles').insert({
      id: data.user!.id,
      full_name: fullName,
      role
    })

    if (profileErr) {
      error = profileErr.message
      loading = false
      return
    }

    if (role === 'teacher') window.location.href = '/dashboard/teacher'
    else window.location.href = '/dashboard/student'
  }
</script>

<div class="min-h-screen bg-[#EEEDFE] flex items-center justify-center p-6">
  <div class="bg-white rounded-3xl border border-[#AFA9EC] p-9 w-full max-w-sm">

    <!-- Logo -->
    <div class="flex flex-col items-center mb-2">
      <div class="w-13 h-13 bg-[#7F77DD] rounded-2xl flex items-center justify-center mb-2.5">
        <svg class="w-6 h-6 fill-[#EEEDFE]" viewBox="0 0 24 24">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      </div>
      <div class="text-xl font-semibold text-[#2C2C2A] tracking-tight">
        attend<span class="text-[#7F77DD]">ify</span>
      </div>
      <div class="text-xs text-[#888780] mt-0.5">Your classroom, online</div>

      <!-- Dot divider -->
      <div class="flex items-center gap-1.5 my-3.5">
        <span class="w-1 h-1 rounded-full bg-[#AFA9EC]"></span>
        <span class="w-4 h-1 rounded-sm bg-[#7F77DD]"></span>
        <span class="w-1 h-1 rounded-full bg-[#AFA9EC]"></span>
      </div>
    </div>

    <!-- Role toggle -->
    <div class="grid grid-cols-2 gap-2 mb-6 bg-[#F1EFE8] p-1 rounded-xl">
      <a
        href="/signup?role=teacher"
        class="rounded-xl py-2.5 text-center text-sm font-semibold transition-all flex items-center justify-center gap-2 {role === 'teacher' ? 'bg-white text-[#534AB7] border border-[#AFA9EC]' : 'text-[#888780]'}"
      >
        <svg class="w-4 h-4 {role === 'teacher' ? 'fill-[#534AB7]' : 'fill-[#888780]'}" viewBox="0 0 24 24">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 12H7v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"/>
        </svg>
        Teacher
      </a>
      <a
        href="/signup?role=student"
        class="rounded-xl py-2.5 text-center text-sm font-semibold transition-all flex items-center justify-center gap-2 {role === 'student' ? 'bg-white text-[#534AB7] border border-[#AFA9EC]' : 'text-[#888780]'}"
      >
        <svg class="w-4 h-4 {role === 'student' ? 'fill-[#534AB7]' : 'fill-[#888780]'}" viewBox="0 0 24 24">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
        Student
      </a>
    </div>

    <!-- Heading -->
    <h1 class="text-[17px] font-semibold text-[#2C2C2A] mb-1">
      {role === 'teacher' ? 'Create your teacher account' : 'Join as a student'}
    </h1>
    <p class="text-sm text-[#888780] mb-6">
      {role === 'teacher' ? 'Set up your classes and start teaching' : 'Enter a class code after signing up'}
    </p>

    <!-- Error -->
    {#if error}
      <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-sm rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
        <span class="mt-0.5 w-4 h-4 min-w-4 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-[10px] font-bold">!</span>
        {error}
      </div>
    {/if}

    <!-- Fields -->
    <div class="space-y-4 mb-5">

      <!-- Full name -->
      <div>
        <label for="full-name" class="block text-[11.5px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">
          Full name
        </label>
        <input
          id="full-name"
          type="text"
          bind:value={fullName}
          placeholder={role === 'teacher' ? 'Ms. Santos' : 'Juan dela Cruz'}
          class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-[10px] px-3 py-2.5 text-sm text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
        />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-[11.5px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@school.edu"
          class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-[10px] px-3 py-2.5 text-sm text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
        />
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-[11.5px] font-semibold uppercase tracking-wide text-[#5F5E5A] mb-1.5">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            placeholder="••••••••"
            class="w-full bg-[#F1EFE8] border-[1.5px] border-[#D3D1C7] rounded-[10px] px-3 py-2.5 pr-10 text-sm text-[#2C2C2A] placeholder:text-[#B4B2A9] focus:outline-none focus:border-[#7F77DD] focus:bg-white transition-all"
          />
          <button
            type="button"
            onclick={() => showPassword = !showPassword}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#888780] hover:text-[#7F77DD] transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            {:else}
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>

    <!-- Signup button -->
    <button
      onclick={handleSignup}
      disabled={loading}
      class="w-full bg-[#7F77DD] hover:bg-[#534AB7] active:scale-[0.98] text-[#EEEDFE] rounded-[10px] py-3 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
    >
      {#if loading}
        Creating account...
      {:else}
        <svg class="w-4 h-4 fill-[#EEEDFE]" viewBox="0 0 24 24">
          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        Create account
      {/if}
    </button>

    <!-- Login link -->
    <p class="text-center text-xs text-[#888780] mt-5">
      Already have an account?
      <a href="/login" class="text-[#534AB7] font-semibold hover:underline">Log in</a>
    </p>

  </div>
</div>