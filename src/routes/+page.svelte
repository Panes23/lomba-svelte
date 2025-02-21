<script>
  import MarketCard from '$lib/components/MarketCard.svelte';
  import Slider from '$lib/components/Slider.svelte';
  import Article from '$lib/components/Article.svelte';
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA - Platform Tebak Angka Terpercaya dengan Berbagai Pasaran</title>
  <meta name="title" content="TEBAK ANGKA - Platform Tebak Angka Terpercaya dengan Berbagai Pasaran">
  <meta name="description" content="Platform tebak angka terpercaya dengan berbagai pasaran internasional seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Nikmati pengalaman bermain yang aman dan nyaman dengan hadiah menarik setiap hari.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tebakangka.com/">
  <meta property="og:title" content="TEBAK ANGKA - Platform Tebak Angka Terpercaya dengan Berbagai Pasaran">
  <meta property="og:description" content="Platform tebak angka terpercaya dengan berbagai pasaran internasional seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Nikmati pengalaman bermain yang aman dan nyaman dengan hadiah menarik setiap hari.">
  <meta property="og:image" content="https://tebakangka.com/images/og-image.jpg">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://tebakangka.com/">
  <meta property="twitter:title" content="TEBAK ANGKA - Platform Tebak Angka Terpercaya dengan Berbagai Pasaran">
  <meta property="twitter:description" content="Platform tebak angka terpercaya dengan berbagai pasaran internasional seperti Japan, Hongkong, Macau, Singapore, Sydney dan Taiwan. Nikmati pengalaman bermain yang aman dan nyaman dengan hadiah menarik setiap hari.">
  <meta property="twitter:image" content="https://tebakangka.com/images/twitter-card.jpg">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="tebak angka, togel online, pasaran japan, pasaran hongkong, pasaran macau, pasaran singapore, pasaran sydney, pasaran taiwan">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="revisit-after" content="7 days">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://tebakangka.com/">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#e62020">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</svelte:head>

<div class="container mx-auto px-4">
  <!-- Slider -->
  <div class="pt-24">
    <Slider />
  </div>

  <!-- Market Cards -->
  <div class="py-8">
    <MarketCard />
  </div>
</div>

<!-- Article Section -->
<Article />
