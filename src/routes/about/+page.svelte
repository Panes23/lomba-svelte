<script>
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { browser } from '$app/environment';

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const stats = [
    { number: 10000, label: "Pengguna Aktif", suffix: "+" },
    { number: 54, label: "Pasaran Tersedia", suffix: "+" },
    { number: 24, label: "Layanan Support", suffix: "/7" },
    { number: 100, label: "Pembayaran Aman", suffix: "%" }
  ];

  // Deklarasi store di level atas dengan konfigurasi yang lebih detail
  const count1 = tweened(0, {
    duration: 2000,
    easing: cubicOut,
    interpolate: (a, b) => (t) => Math.round(a + (b - a) * t) // Memastikan nilai selalu bulat
  });
  const count2 = tweened(0, {
    duration: 2000,
    easing: cubicOut,
    interpolate: (a, b) => (t) => Math.round(a + (b - a) * t)
  });
  const count3 = tweened(0, {
    duration: 2000,
    easing: cubicOut,
    interpolate: (a, b) => (t) => Math.round(a + (b - a) * t)
  });
  const count4 = tweened(0, {
    duration: 2000,
    easing: cubicOut,
    interpolate: (a, b) => (t) => Math.round(a + (b - a) * t)
  });

  let visible = false;
  let hasAnimated = false;

  // Reset counters to 0 when component is created
  if (browser) {
    count1.set(0, { duration: 0 });
    count2.set(0, { duration: 0 });
    count3.set(0, { duration: 0 });
    count4.set(0, { duration: 0 });
  }
  
  function startAnimation() {
    if (!hasAnimated && browser) {
      visible = true;
      hasAnimated = true;
      
      // Mulai animasi dengan sedikit delay dan durasi yang berbeda berdasarkan nilai target
      setTimeout(() => {
        count1.set(stats[0].number, { duration: 2000 });
        count2.set(stats[1].number, { duration: 1500 });
        count3.set(stats[2].number, { duration: 1200 });
        count4.set(stats[3].number, { duration: 1800 });
      }, 100);
    }
  }

  onMount(() => {
    // Trigger animation when component is mounted
    startAnimation();
    
    // Reset state when component is destroyed
    return () => {
      hasAnimated = false;
      visible = false;
    };
  });

  // Format number dengan pemisah ribuan
  function formatNumber(num) {
    return num.toLocaleString('id-ID');
  }

  const teams = [
    {
      name: "Tim Support",
      description: "Tim support kami siap membantu Anda 24/7 dengan pelayanan yang ramah dan profesional.",
      icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    },
    {
      name: "Sistem Keamanan",
      description: "Keamanan data dan transaksi Anda adalah prioritas utama kami dengan sistem enkripsi terkini.",
      icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    },
    {
      name: "Sistem Pembayaran",
      description: "Proses deposit dan withdraw yang cepat dengan berbagai metode pembayaran yang aman.",
      icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 13.5h13.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25z"
    }
  ];
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA | Tentang Kami</title>
  <meta name="title" content="TEBAK ANGKA | Tentang Kami">
  <meta name="description" content="Pelajari lebih lanjut tentang TEBAK ANGKA, platform tebak angka terpercaya dengan sistem yang fair dan transparan. Nikmati pengalaman bermain yang aman dengan dukungan customer service 24/7.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{baseUrl}/about">
  <meta property="og:title" content="TEBAK ANGKA | Tentang Kami">
  <meta property="og:description" content="Pelajari lebih lanjut tentang TEBAK ANGKA, platform tebak angka terpercaya dengan sistem yang fair dan transparan. Nikmati pengalaman bermain yang aman dengan dukungan customer service 24/7.">
  <meta property="og:image" content="{baseUrl}/og-image.png">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="{baseUrl}/about">
  <meta property="twitter:title" content="TEBAK ANGKA | Tentang Kami">
  <meta property="twitter:description" content="Pelajari lebih lanjut tentang TEBAK ANGKA, platform tebak angka terpercaya dengan sistem yang fair dan transparan. Nikmati pengalaman bermain yang aman dengan dukungan customer service 24/7.">
  <meta property="twitter:image" content="{baseUrl}/twitter-card.png">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="tentang tebak angka, visi misi tebak angka, keamanan tebak angka, sistem tebak angka, customer service 24/7, platform terpercaya">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="{baseUrl}/about">
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#e62020">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</svelte:head>

<div class="pt-24 pb-16 bg-[#1a1a1a]">
  <!-- Hero Section -->
  <div class="container mx-auto px-4">
    <div class="max-w-3xl mx-auto text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700">
        Tentang TEBAK ANGKA
      </h1>
      <p class="text-gray-400 text-lg leading-relaxed {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 delay-300">
        Platform tebak angka terpercaya yang menyediakan berbagai pasaran dengan sistem yang fair dan transparan. 
        Kami berkomitmen untuk memberikan pengalaman bermain yang aman dan nyaman bagi seluruh member.
      </p>
    </div>

    <!-- Stats dengan animasi counting -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
      <div class="text-center p-6 bg-[#222] rounded-lg {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700" style="transition-delay: 0ms">
        <div class="text-3xl font-bold text-[#e62020] mb-2">
          {#if visible}
            {formatNumber($count1)}{stats[0].suffix}
          {:else}
            0{stats[0].suffix}
          {/if}
        </div>
        <div class="text-gray-400">{stats[0].label}</div>
      </div>

      <div class="text-center p-6 bg-[#222] rounded-lg {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700" style="transition-delay: 100ms">
        <div class="text-3xl font-bold text-[#e62020] mb-2">
          {#if visible}
            {formatNumber($count2)}{stats[1].suffix}
          {:else}
            0{stats[1].suffix}
          {/if}
        </div>
        <div class="text-gray-400">{stats[1].label}</div>
      </div>

      <div class="text-center p-6 bg-[#222] rounded-lg {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700" style="transition-delay: 200ms">
        <div class="text-3xl font-bold text-[#e62020] mb-2">
          {#if visible}
            {formatNumber($count3)}{stats[2].suffix}
          {:else}
            0{stats[2].suffix}
          {/if}
        </div>
        <div class="text-gray-400">{stats[2].label}</div>
      </div>

      <div class="text-center p-6 bg-[#222] rounded-lg {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700" style="transition-delay: 300ms">
        <div class="text-3xl font-bold text-[#e62020] mb-2">
          {#if visible}
            {formatNumber($count4)}{stats[3].suffix}
          {:else}
            0{stats[3].suffix}
          {/if}
        </div>
        <div class="text-gray-400">{stats[3].label}</div>
      </div>
    </div>

    <!-- Features -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      {#each teams as team, i}
        <div 
          class="bg-[#222] p-6 rounded-lg {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700"
          style="transition-delay: {i * 200}ms"
        >
          <div class="w-12 h-12 bg-[#e62020] rounded-lg flex items-center justify-center mb-6">
            <svg 
              class="w-6 h-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d={team.icon}
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-4">{team.name}</h3>
          <p class="text-gray-400 leading-relaxed">{team.description}</p>
        </div>
      {/each}
    </div>

    <!-- Vision & Mission -->
    <div class="max-w-3xl mx-auto text-center">
      <div class="mb-12 {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-700">
        <h2 class="text-2xl font-bold text-white mb-4">Visi Kami</h2>
        <p class="text-gray-400 leading-relaxed">
          Menjadi platform tebak angka terdepan yang dikenal dengan keamanan, transparansi, dan pelayanan terbaik untuk seluruh member.
        </p>
      </div>

      <div class="{visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-800">
        <h2 class="text-2xl font-bold text-white mb-4">Misi Kami</h2>
        <p class="text-gray-400 leading-relaxed">
          Memberikan pengalaman bermain yang aman dan nyaman dengan sistem yang fair, 
          dukungan customer service 24/7, dan proses transaksi yang cepat serta terpercaya.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  /* Optional: Add smooth scroll behavior */
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 