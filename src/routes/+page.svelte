<script lang="ts">
</script>

<svelte:head>
  <title>Attendify — Your classroom, online</title>
</svelte:head>

<div class="min-h-screen bg-[#F1EFE8] flex flex-col">

  <!-- Command bar (matches app navbar exactly) -->
  <nav class="bg-[#534AB7] h-11 flex items-center px-4 gap-3 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 bg-[#3C3489] rounded-lg flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 fill-[#EEEDFE]" viewBox="0 0 24 24">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      </div>
      <span class="text-[#EEEDFE] font-semibold text-[13px] tracking-tight">
        attend<span class="text-[#AFA9EC]">ify</span>
      </span>
    </div>
    <div class="w-px h-5 bg-[#AFA9EC] opacity-40"></div>
    <span class="text-[12px] text-[#C4C0F5] font-medium hidden sm:block">Classroom management for everyone</span>
    <div class="ml-auto flex items-center gap-2">
      <a
        href="/login"
        class="text-[11px] text-[#C4C0F5] hover:text-white hover:bg-white/10 transition-colors px-3 py-1.5 rounded font-medium"
      >
        Log in
      </a>
      <a
        href="/signup"
        class="text-[11px] bg-white hover:bg-[#EEEDFE] text-[#534AB7] font-semibold px-3 py-1.5 rounded transition-colors"
      >
        Sign up free
      </a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="max-w-5xl mx-auto w-full px-6 pt-14 pb-10">

    <!-- Banner pill -->
    <div class="inline-flex items-center gap-2 bg-[#EEEDFE] border border-[#AFA9EC] text-[#534AB7] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
      <span class="w-1.5 h-1.5 bg-[#1D9E75] rounded-full"></span>
      Built for classrooms
    </div>

    <div class="flex items-end justify-between gap-8 mb-10">
      <div class="max-w-xl">
        <h1 class="text-[clamp(32px,5vw,52px)] font-semibold text-[#2C2C2A] leading-[1.1] tracking-tight mb-4">
          Your classroom,<br/>
          <span class="text-[#7F77DD]">reimagined</span> online
        </h1>
        <p class="text-[15px] text-[#5F5E5A] leading-relaxed mb-8 max-w-md">
          Attendance, quizzes, and announcements — all in one space. For teachers who care and students who show up.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <a
            href="/signup?role=teacher"
            class="flex items-center gap-2 bg-[#7F77DD] hover:bg-[#534AB7] text-[#EEEDFE] text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg class="w-3.5 h-3.5 fill-[#EEEDFE]" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 12H7v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"/></svg>
            I'm a teacher
          </a>
          <a
            href="/signup?role=student"
            class="flex items-center gap-2 bg-white hover:bg-[#F1EFE8] text-[#2C2C2A] text-[13px] font-semibold px-5 py-2.5 rounded-lg border border-[#D3D1C7] transition-colors"
          >
            <svg class="w-3.5 h-3.5 fill-[#888780]" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
            I'm a student
          </a>
          <span class="text-[12px] text-[#888780]">
            Already have an account?
            <a href="/login" class="text-[#7F77DD] font-semibold hover:underline">Log in</a>
          </span>
        </div>
      </div>

      <!-- Mini app preview -->
      <div class="hidden lg:block w-72 shrink-0">
        <div class="bg-white border border-[#D3D1C7] rounded-xl overflow-hidden">
          <!-- Mini command bar -->
          <div class="bg-[#534AB7] h-7 flex items-center px-3 gap-2">
            <div class="w-4 h-4 bg-[#3C3489] rounded flex items-center justify-center">
              <svg class="w-2.5 h-2.5 fill-[#EEEDFE]" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
            </div>
            <span class="text-[9px] text-[#EEEDFE] font-semibold">attend<span class="text-[#AFA9EC]">ify</span></span>
            <div class="ml-auto w-4 h-4 rounded-full bg-[#7F77DD] flex items-center justify-center text-[7px] font-semibold text-white">MS</div>
          </div>
          <!-- Mini body -->
          <div class="flex h-44">
            <!-- Mini rail -->
            <div class="w-9 bg-[#3C3489] flex flex-col items-center py-2 gap-1">
              {#each ['M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z', 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z', 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z'] as path, i}
                <div class="w-6 h-6 rounded flex items-center justify-center {i === 0 ? 'bg-white/15' : ''}">
                  <svg class="w-3 h-3 {i === 0 ? 'fill-[#EEEDFE]' : 'fill-[#AFA9EC]'}" viewBox="0 0 24 24"><path d={path}/></svg>
                </div>
              {/each}
            </div>
            <!-- Mini sidebar -->
            <div class="w-20 bg-white border-r border-[#F1EFE8] px-2 py-2">
              <div class="text-[7px] text-[#B4B2A9] uppercase tracking-wide mb-1.5 px-1">Channels</div>
              {#each [['Announcements', true], ['Quizzes', false], ['Attendance', false]] as [name, active]}
                <div class="flex items-center gap-1 px-1 py-1 rounded text-[7px] {active ? 'bg-[#EEEDFE] text-[#534AB7] font-semibold' : 'text-[#888780]'} mb-0.5">
                  <div class="w-1 h-1 rounded-full {active ? 'bg-[#7F77DD]' : 'bg-transparent'}"></div>
                  {name}
                </div>
              {/each}
            </div>
            <!-- Mini feed -->
            <div class="flex-1 bg-[#F1EFE8] p-2 flex flex-col gap-1.5">
              {#each ['Quiz tomorrow — Ch.3', 'Lab 4 extended to Friday', 'Welcome everyone!'] as title, i}
                <div class="bg-white rounded-md px-2 py-1.5 border border-[#D3D1C7]">
                  <div class="flex items-center gap-1 mb-0.5">
                    <div class="w-3 h-3 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[5px] font-semibold text-[#534AB7]">MS</div>
                    <div class="text-[6px] text-[#888780]">{i === 0 ? '2h ago' : i === 1 ? '1d ago' : 'Apr 17'}</div>
                  </div>
                  <div class="text-[7px] font-semibold text-[#2C2C2A] leading-snug">{title}</div>
                </div>
              {/each}
            </div>
          </div>
        </div>
        <p class="text-[11px] text-[#888780] text-center mt-2">what your dashboard looks like</p>
      </div>
    </div>
  </section>

  <!-- Feature cards -->
  <section class="max-w-5xl mx-auto w-full px-6 pb-12">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-[10.5px] font-semibold uppercase tracking-widest text-[#888780]">Everything you need</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <div class="bg-white border border-[#D3D1C7] rounded-xl p-5 border-l-[3px] border-l-[#7F77DD]">
        <div class="w-9 h-9 rounded-lg bg-[#EEEDFE] flex items-center justify-center mb-3">
          <svg class="w-4.5 h-4.5 fill-[#7F77DD]" viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
        </div>
        <div class="text-[13.5px] font-semibold text-[#2C2C2A] mb-1">Smart attendance</div>
        <div class="text-[12px] text-[#888780] leading-relaxed">Generate a QR code, set a time window, and watch students check in live. Works printed or on screen.</div>
      </div>

      <div class="bg-white border border-[#D3D1C7] rounded-xl p-5 border-l-[3px] border-l-[#EF9F27]">
        <div class="w-9 h-9 rounded-lg bg-[#FAEEDA] flex items-center justify-center mb-3">
          <svg class="w-4.5 h-4.5 fill-[#EF9F27]" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        </div>
        <div class="text-[13.5px] font-semibold text-[#2C2C2A] mb-1">Quizzes with deadlines</div>
        <div class="text-[12px] text-[#888780] leading-relaxed">Multiple choice is auto-graded instantly. Short answers wait for your review. Deadlines enforce themselves.</div>
      </div>

      <div class="bg-white border border-[#D3D1C7] rounded-xl p-5 border-l-[3px] border-l-[#1D9E75]">
        <div class="w-9 h-9 rounded-lg bg-[#E1F5EE] flex items-center justify-center mb-3">
          <svg class="w-4.5 h-4.5 fill-[#1D9E75]" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <div class="text-[13.5px] font-semibold text-[#2C2C2A] mb-1">Announcements feed</div>
        <div class="text-[12px] text-[#888780] leading-relaxed">Post updates and reminders. New quizzes and attendance sessions notify students automatically.</div>
      </div>

    </div>
  </section>

  <!-- CTA banner -->
  <section class="max-w-5xl mx-auto w-full px-6 pb-14">
    <div class="bg-[#7F77DD] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
      <div>
        <div class="text-[15px] font-semibold text-white mb-0.5">Ready to get started?</div>
        <div class="text-[12.5px] text-[#C4C0F5]">It's free. No credit card needed. Takes 30 seconds.</div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <a
          href="/signup?role=teacher"
          class="bg-white hover:bg-[#EEEDFE] text-[#534AB7] text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Create a class
        </a>
        <a
          href="/signup?role=student"
          class="bg-white/15 hover:bg-white/25 text-[#EEEDFE] text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-colors border border-white/20"
        >
          Join a class
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-white border-t border-[#D3D1C7] px-6 py-5 mt-auto">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 bg-[#EEEDFE] rounded flex items-center justify-center">
          <svg class="w-3 h-3 fill-[#7F77DD]" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
        </div>
        <span class="text-[12px] font-semibold text-[#5F5E5A]">attend<span class="text-[#7F77DD]">ify</span></span>
      </div>
      <div class="text-[11px] text-[#B4B2A9]">made with love for classrooms everywhere</div>
    </div>
  </footer>

</div>