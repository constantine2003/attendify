<script lang="ts">
  import { createSupabaseLoadClient } from '$lib/supabase'

  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)
  let showPassword = $state(false)

  const supabase = createSupabaseLoadClient(fetch)

  async function handleLogin() {
    loading = true
    error = ''

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      error = err.message
      loading = false
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single()

    if (profile?.role === 'teacher') window.location.href = '/dashboard/teacher'
    else if (profile?.role === 'student') window.location.href = '/dashboard/student'
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

    <!-- Heading -->
    <h1 class="text-[17px] font-semibold text-[#2C2C2A] mt-4 mb-1">Welcome back!</h1>
    <p class="text-sm text-[#888780] mb-6">Log in to continue to your classes</p>

    <!-- Error -->
    {#if error}
      <div class="bg-[#FCEBEB] border border-[#F09595] text-[#791F1F] text-sm rounded-[10px] px-4 py-3 mb-4 flex items-start gap-2">
        <span class="mt-0.5 w-4 h-4 min-w-4 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-[10px] font-bold">!</span>
        {error}
      </div>
    {/if}

    <!-- Fields -->
    <div class="space-y-4 mb-5">

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
        <div class="flex items-center justify-between mb-1.5">
          <label for="password" class="block text-[11.5px] font-semibold uppercase tracking-wide text-[#5F5E5A]">
            Password
          </label>
          <a href="/forgot-password" class="text-[11px] text-[#7F77DD] hover:underline font-medium">
            Forgot password?
          </a>
        </div>
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
              <!-- Eye-off icon -->
              <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            {:else}
              <!-- Eye icon -->
              <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>

    <!-- Login button -->
    <button
      onclick={handleLogin}
      disabled={loading}
      class="w-full bg-[#7F77DD] hover:bg-[#534AB7] active:scale-[0.98] text-[#EEEDFE] rounded-[10px] py-3 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
    >
      {#if loading}
        Logging in...
      {:else}
        <svg class="w-4 h-4 fill-[#EEEDFE]" viewBox="0 0 24 24">
          <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
        </svg>
        Log in
      {/if}
    </button>

    <!-- Divider -->
    <div class="flex items-center gap-3 my-5">
      <div class="flex-1 h-px bg-[#D3D1C7]"></div>
      <span class="text-[11px] text-[#B4B2A9] font-medium whitespace-nowrap">New here? Join as</span>
      <div class="flex-1 h-px bg-[#D3D1C7]"></div>
    </div>

    <!-- Role signup cards -->
    <div class="grid grid-cols-2 gap-3">
      <a
        href="/signup?role=teacher"
        class="border-[1.5px] border-[#D3D1C7] hover:border-[#7F77DD] hover:bg-[#EEEDFE] rounded-xl p-3.5 text-center transition-all cursor-pointer"
      >
        <div class="w-9 h-9 rounded-[10px] bg-[#EEEDFE] flex items-center justify-center mx-auto mb-2">
          <svg class="w-4.5 h-4.5 fill-[#534AB7]" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 12H7v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"/>
          </svg>
        </div>
        <div class="text-xs font-semibold text-[#3C3489]">Teacher</div>
        <div class="text-[11px] text-[#888780] mt-0.5">Manage classes</div>
      </a>
      <a
        href="/signup?role=student"
        class="border-[1.5px] border-[#D3D1C7] hover:border-[#7F77DD] hover:bg-[#EEEDFE] rounded-xl p-3.5 text-center transition-all cursor-pointer"
      >
        <div class="w-9 h-9 rounded-[10px] bg-[#E1F5EE] flex items-center justify-center mx-auto mb-2">
          <svg class="w-4.5 h-4.5 fill-[#0F6E56]" viewBox="0 0 24 24">
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
          </svg>
        </div>
        <div class="text-xs font-semibold text-[#3C3489]">Student</div>
        <div class="text-[11px] text-[#888780] mt-0.5">Join your class</div>
      </a>
    </div>

  </div>
</div>