<script lang="ts">
  let { data } = $props()

  const states = {
    success: {
      bg: '#E1F5EE',
      iconFill: '#1D9E75',
      bannerBg: '#E1F5EE',
      bannerBorder: '#5DCAA5',
      bannerText: '#085041',
      heading: "You're marked present!",
      sub: 'Attendance recorded successfully',
      icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    },
    already_marked: {
      bg: '#EEEDFE',
      iconFill: '#7F77DD',
      bannerBg: '#EEEDFE',
      bannerBorder: '#AFA9EC',
      bannerText: '#3C3489',
      heading: 'Already marked present',
      sub: 'You were already recorded for this session',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    },
    expired: {
      bg: '#FAEEDA',
      iconFill: '#BA7517',
      bannerBg: '#FAEEDA',
      bannerBorder: '#EF9F27',
      bannerText: '#633806',
      heading: 'QR code expired',
      sub: 'This attendance session has ended',
      icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
    },
    not_member: {
      bg: '#FCEBEB',
      iconFill: '#E24B4A',
      bannerBg: '#FCEBEB',
      bannerBorder: '#F09595',
      bannerText: '#791F1F',
      heading: 'Not enrolled',
      sub: 'You are not a member of this class',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    },
    invalid: {
      bg: '#FCEBEB',
      iconFill: '#E24B4A',
      bannerBg: '#FCEBEB',
      bannerBorder: '#F09595',
      bannerText: '#791F1F',
      heading: 'Invalid QR code',
      sub: 'This link is not valid',
      icon: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    },
  }

  const hints: Record<string, string> = {
    success: '',
    already_marked: '',
    expired: 'Ask your teacher to start a new session',
    not_member: 'Join the class first using the class code',
    invalid: 'Ask your teacher for a new QR code',
  }

  const s = states[data.status as keyof typeof states] ?? states.invalid
  const hint = hints[data.status as string] ?? ''
  const className = (data.session?.classes as any)?.name
  const label = data.session?.label
</script>

<div class="min-h-screen bg-[#F1EFE8] flex flex-col items-center justify-center p-5">

  <!-- Card -->
  <div class="bg-white border border-[#D3D1C7] rounded-2xl w-full max-w-sm overflow-hidden">

    <!-- Colored top strip -->
    <div class="h-1.5 w-full" style="background:{s.iconFill};"></div>

    <div class="p-7 text-center">

      <!-- Brand -->
      <div class="text-[11px] font-semibold tracking-widest uppercase text-[#B4B2A9] mb-5 flex items-center justify-center gap-1">
        <svg class="w-3.5 h-3.5 fill-[#AFA9EC]" viewBox="0 0 24 24">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
        attend<span style="color:#7F77DD;">ify</span>
      </div>

      <!-- Status icon -->
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style="background:{s.bg};"
      >
        <svg class="w-8 h-8" style="fill:{s.iconFill};" viewBox="0 0 24 24">
          <path d={s.icon}/>
        </svg>
      </div>

      <!-- Heading -->
      <h1 class="text-[17px] font-semibold text-[#2C2C2A] mb-1 leading-snug">{s.heading}</h1>

      <!-- Class context (if available) -->
      {#if className || label}
        <div class="flex items-center justify-center gap-1.5 mb-4">
          {#if className}
            <span class="bg-[#F1EFE8] border border-[#D3D1C7] text-[#5F5E5A] text-[11px] font-medium px-2.5 py-0.5 rounded-full">{className}</span>
          {/if}
          {#if label}
            <span class="text-[#B4B2A9] text-[11px]">·</span>
            <span class="text-[#888780] text-[11px]">{label}</span>
          {/if}
        </div>
      {:else}
        <div class="mb-4"></div>
      {/if}

      <!-- Banner -->
      <div
        class="rounded-xl px-4 py-3 text-[12.5px] font-medium mb-1"
        style="background:{s.bannerBg}; border: 1px solid {s.bannerBorder}; color:{s.bannerText};"
      >
        {s.sub}
      </div>

      <!-- Hint (for error states) -->
      {#if hint}
        <p class="text-[11.5px] text-[#B4B2A9] mt-2.5 px-2">{hint}</p>
      {/if}

    </div>

    <!-- Footer link -->
    <div class="border-t border-[#F1EFE8] px-7 py-4">
      <a
        href="/dashboard/student"
        class="flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-[#7F77DD] hover:text-[#534AB7] transition-colors"
      >
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        Go to dashboard
      </a>
    </div>

  </div>

  <!-- Timestamp -->
  <p class="text-[11px] text-[#B4B2A9] mt-4">
    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
    · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
  </p>

</div>