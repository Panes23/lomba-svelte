<script lang="ts">
  import MarketCard from '$lib/components/MarketCard.svelte';
  
  const baseUrl = import.meta.env.VITE_BASE_URL;
  export let data;
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA | Daftar Pasaran</title>
  <meta name="title" content="TEBAK ANGKA | Daftar Pasaran">
  <meta name="description" content="Lihat daftar lengkap pasaran internasional di TEBAK ANGKA seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Pilih pasaran favorit Anda dan menangkan hadiah menarik setiap hari.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content={`${baseUrl}/lomba`}>
  <meta property="og:title" content="TEBAK ANGKA | Daftar Pasaran">
  <meta property="og:description" content="Lihat daftar lengkap pasaran internasional di TEBAK ANGKA seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Pilih pasaran favorit Anda dan menangkan hadiah menarik setiap hari.">
  <meta property="og:image" content={`${baseUrl}/og-image.png`}>

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content={`${baseUrl}/lomba`}>
  <meta property="twitter:title" content="TEBAK ANGKA | Daftar Pasaran">
  <meta property="twitter:description" content="Lihat daftar lengkap pasaran internasional di TEBAK ANGKA seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Pilih pasaran favorit Anda dan menangkan hadiah menarik setiap hari.">
  <meta property="twitter:image" content={`${baseUrl}/twitter-card.png`}>

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="daftar pasaran, tebak angka, togel online, pasaran japan, pasaran hongkong, pasaran macau, pasaran singapore, pasaran sydney, pasaran taiwan">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="revisit-after" content="7 days">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href={`${baseUrl}/lomba`}>
</svelte:head>

<div class="container mx-auto px-4 py-24">
  <div class="text-center mb-12">
    <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">
      Daftar Pasaran
    </h1>
    <p class="text-gray-400 max-w-2xl mx-auto">
      Pilih pasaran favorit Anda dari berbagai pilihan yang tersedia. Setiap pasaran menawarkan hadiah menarik untuk para pemenang.
    </p>
  </div>

  <!-- MarketCard dengan search dan tanpa limit -->
  <MarketCard 
    {data} 
    showSearch={true}
    showViewAll={false}
  />
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 