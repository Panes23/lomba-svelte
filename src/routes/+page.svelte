<script lang="ts">
  import { onMount } from 'svelte';
  import MarketCard from '$lib/components/MarketCard.svelte';
  import Article from '$lib/components/Article.svelte';
  import Slider from '$lib/components/Slider.svelte';

  let SliderComponent: typeof Slider | null = null;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  onMount(async () => {
    // Dynamically import Slider component
    const module = await import('$lib/components/Slider.svelte');
    SliderComponent = module.default;
  });

  export let data;
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA | Platform Tebak Angka Terpercaya dengan Berbagai Pasaran</title>
  <meta name="title" content="TEBAK ANGKA | Platform Tebak Angka Terpercaya dengan Berbagai Pasaran">
  <meta name="description" content="Platform tebak angka terpercaya dengan berbagai pasaran internasional seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Nikmati pengalaman bermain yang aman dan nyaman dengan hadiah menarik setiap hari.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content={baseUrl}>
  <meta property="og:title" content="TEBAK ANGKA | Platform Tebak Angka Terpercaya dengan Berbagai Pasaran">
  <meta property="og:description" content="Platform tebak angka terpercaya dengan berbagai pasaran internasional seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Nikmati pengalaman bermain yang aman dan nyaman dengan hadiah menarik setiap hari.">
  <meta property="og:image" content={`${baseUrl}/og-image.png`}>

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content={baseUrl}>
  <meta property="twitter:title" content="TEBAK ANGKA | Platform Tebak Angka Terpercaya dengan Berbagai Pasaran">
  <meta property="twitter:description" content="Platform tebak angka terpercaya dengan berbagai pasaran internasional seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Nikmati pengalaman bermain yang aman dan nyaman dengan hadiah menarik setiap hari.">
  <meta property="twitter:image" content={`${baseUrl}/twitter-card.png`}>

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="tebak angka, togel online, pasaran japan, pasaran hongkong, pasaran macau, pasaran singapore, pasaran sydney, pasaran taiwan">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="revisit-after" content="7 days">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href={baseUrl}>

  <link rel="apple-touch-icon" sizes="180x180" href="{baseUrl}/apple-touch-icon-180x180.png">
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#e62020">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="utf-8">
</svelte:head>

<div class="container mx-auto">
  <!-- Slider -->
  <div class="pt-24">
    <Slider {data} />
  </div>

  <!-- Market Section -->
  <section class="py-12">
    <div class="mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Pasaran Tersedia
        </h2>
        <p class="text-gray-400 max-w-2xl mx-auto">
          Pilih pasaran favorit Anda dari berbagai pilihan yang tersedia.
        </p>
      </div>

      <MarketCard 
        {data} 
        limit={8} 
        showSearch={false} 
        showViewAll={true} 
      />
    </div>
  </section>
</div>

<!-- Article Section -->
<Article />
