<script lang="ts">
  import MarketCard from '$lib/components/MarketCard.svelte';
  
  export let data;
</script>

<svelte:head>
  <title>Daftar Pasaran - TEBAK ANGKA</title>
  <meta name="description" content="Lihat daftar lengkap pasaran yang tersedia di TEBAK ANGKA">
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