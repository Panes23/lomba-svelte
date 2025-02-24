<script lang="ts">
  import MarketCard from '$lib/components/MarketCard.svelte';
  import { MetaTags } from 'svelte-meta-tags';

  export let data;
</script>

<MetaTags
  title="Daftar Pasaran - TEBAK ANGKA"
  description="Lihat semua pasaran yang tersedia di TEBAK ANGKA. Pilih pasaran favorit Anda dan menangkan hadiah menarik setiap harinya."
  openGraph={{
    title: 'Daftar Pasaran - TEBAK ANGKA',
    description: 'Lihat semua pasaran yang tersedia di TEBAK ANGKA. Pilih pasaran favorit Anda dan menangkan hadiah menarik setiap harinya.',
    url: 'https://tebakangka.com/lomba'
  }}
/>

<div class="container py-8">
  <div class="max-w-7xl mx-auto pt-24">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">
        Daftar Pasaran
      </h1>
      <p class="text-gray-400 max-w-2xl mx-auto">
        Pilih pasaran favorit Anda dari berbagai pilihan yang tersedia. Setiap pasaran menawarkan hadiah menarik untuk para pemenang.
      </p>
    </div>

    <!-- Market Cards -->
    <div>
      <MarketCard />
    </div>
  </div>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 