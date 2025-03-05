<script lang="ts">
  import { onMount } from 'svelte';
  import { supabaseClient } from '$lib/supabaseClient';
  import { MetaTags } from 'svelte-meta-tags';

  // Daftar domain alternatif
  const domains = [
    'https://tebakangka.com',
    'https://tebakangka.net',
    'https://tebakangka.org'
  ];

  // Deteksi domain saat ini
  const currentDomain = typeof window !== 'undefined' 
    ? window.location.origin 
    : domains[0];

  let markets = [];
  let lomba = [];
  let loading = true;
  let error = null;
  let selectedDomain = currentDomain;

  // Daftar halaman statis
  const staticPages = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/about' },
    { name: 'Kontak', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
    { name: 'Lupa Password', path: '/lupa-password' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' }
  ];

  // Function untuk mengubah domain
  function changeDomain(domain: string) {
    selectedDomain = domain;
  }

  // Function untuk mendapatkan full URL
  function getFullUrl(path: string) {
    return `${selectedDomain}${path}`;
  }

  onMount(async () => {
    try {
      // Fetch data dari Supabase dengan modifikasi query
      const marketsRes = await supabaseClient
        .from('markets')
        .select('id, name')
        .order('name');

      const lombaRes = await supabaseClient
        .from('lomba')
        .select(`
          id,
          markets:market_id (
            name
          ),
          guess_type
        `)
        .order('created_at', { ascending: false });

      // Periksa error
      if (marketsRes.error) {
        console.error('Error fetching markets:', marketsRes.error);
        throw new Error('Gagal memuat data market');
      }
      if (lombaRes.error) {
        console.error('Error fetching lomba:', lombaRes.error);
        throw new Error('Gagal memuat data lomba');
      }

      // Pastikan data tidak kosong
      markets = marketsRes.data || [];
      lomba = lombaRes.data || [];
    } catch (err) {
      error = err.message;
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  });
</script>

<MetaTags
  title="Sitemap - TEBAK ANGKA"
  description="Peta situs lengkap dari TEBAK ANGKA. Temukan semua halaman dan konten yang tersedia di website kami."
  canonical={`${selectedDomain}/sitemap`}
/>

<div class="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#111] pt-24 pb-12">
  <div class="container mx-auto px-4 max-w-5xl">
    <!-- Header Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">Sitemap</h1>
      <p class="text-gray-400 max-w-2xl mx-auto">Temukan semua halaman yang tersedia di website kami. Gunakan peta situs ini untuk navigasi yang lebih mudah.</p>
      
      <!-- Domain Selector -->
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        {#each domains as domain}
          <a 
            href={`${domain}/sitemap`}
            class="px-4 py-2 rounded-lg text-sm transition-all duration-300 {selectedDomain === domain ? 'bg-[#e62020] text-white' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}"
            on:click|preventDefault={(e) => {
              changeDomain(domain);
              // Tambahkan history state untuk SEO
              window.history.pushState({}, '', `${domain}/sitemap`);
            }}
            rel="alternate"
            hreflang={domain.includes('.com') ? 'x-default' : domain.split('.').pop()}
          >
            {domain.replace('https://', '')}
          </a>
        {/each}
      </div>
    </div>

    <div class="grid gap-8 md:grid-cols-2">
      {#if loading}
        <div class="md:col-span-2 flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e62020]"></div>
          <p class="text-gray-400 mt-4">Memuat sitemap...</p>
        </div>
      {:else if error}
        <div class="md:col-span-2 bg-red-900/20 text-red-500 p-6 rounded-xl text-center">{error}</div>
      {:else}
        <!-- Halaman Utama -->
        <div class="bg-[#222]/80 backdrop-blur rounded-xl p-6 sm:p-8 shadow-xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-lg bg-[#e62020]/10">
              <svg class="w-6 h-6 text-[#e62020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-white">Halaman Utama</h2>
          </div>
          <div class="space-y-3">
            {#each staticPages as page}
              <a 
                href={getFullUrl(page.path)}
                class="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                <svg class="w-4 h-4 text-gray-500 group-hover:text-[#e62020] transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <span class="text-gray-400 group-hover:text-white transition-colors duration-300">{page.name}</span>
              </a>
            {/each}
          </div>
        </div>

        <!-- Daftar Market -->
        <div class="bg-[#222]/80 backdrop-blur rounded-xl p-6 sm:p-8 shadow-xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-lg bg-[#e62020]/10">
              <svg class="w-6 h-6 text-[#e62020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-white">Daftar Market</h2>
          </div>
          <div class="space-y-3">
            {#each markets as market}
              <a 
                href={getFullUrl(`/lomba/${encodeURIComponent(market.name)}`)}
                class="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                <svg class="w-4 h-4 text-gray-500 group-hover:text-[#e62020] transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <span class="text-gray-400 group-hover:text-white transition-colors duration-300">{market.name}</span>
              </a>
            {/each}
          </div>
        </div>

        <!-- Daftar Lomba -->
        <div class="md:col-span-2 bg-[#222]/80 backdrop-blur rounded-xl p-6 sm:p-8 shadow-xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-lg bg-[#e62020]/10">
              <svg class="w-6 h-6 text-[#e62020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-white">Daftar Lomba</h2>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            {#each lomba as item}
              <a 
                href={getFullUrl(`/tebakan/${item.id}`)}
                class="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                <svg class="w-4 h-4 text-gray-500 group-hover:text-[#e62020] transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <span class="text-gray-400 group-hover:text-white transition-colors duration-300">
                  Lomba {item.markets?.name} {item.guess_type}
                </span>
              </a>
            {/each}
          </div>
        </div>

        <!-- Link ke XML Sitemap -->
        <div class="md:col-span-2 mt-8 text-center">
          <a 
            href={getFullUrl('/sitemap.xml')}
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#e62020]/10 hover:bg-[#e62020]/20 text-[#e62020] transition-all duration-300"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download XML Sitemap
          </a>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 