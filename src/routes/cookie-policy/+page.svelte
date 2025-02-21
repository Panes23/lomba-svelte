<script>
  import { onMount } from 'svelte';

  const policies = [
    {
      title: "1. Kebijakan Cookie",
      content: [
        "Kebijakan ini menjelaskan bagaimana TEBAK ANGKA menggunakan cookie dan teknologi serupa",
        "Dengan menggunakan platform kami, Anda menyetujui penggunaan cookie sesuai kebijakan ini",
        "Kami dapat mengubah kebijakan ini sewaktu-waktu untuk mencerminkan perubahan dalam praktik kami"
      ]
    },
    {
      title: "2. Apa itu Cookie?",
      content: [
        "Cookie adalah file teks kecil yang disimpan di perangkat Anda saat mengunjungi website",
        "Cookie memungkinkan website untuk mengingat preferensi dan aktivitas Anda",
        "Cookie dapat bersifat sementara (session) atau permanen (persistent)",
        "Cookie dapat berasal dari kami (first-party) atau pihak ketiga (third-party)"
      ]
    },
    {
      title: "3. Bagaimana Kami Menggunakan Cookie",
      content: [
        "Mengamankan akun dan transaksi Anda",
        "Mengingat preferensi bahasa dan tampilan",
        "Menganalisis bagaimana platform kami digunakan",
        "Meningkatkan kinerja dan keamanan platform"
      ]
    },
    {
      title: "4. Kontrol Cookie Anda",
      content: [
        "Anda dapat mengatur browser untuk menolak semua cookie",
        "Anda dapat menghapus cookie yang sudah tersimpan",
        "Menolak cookie dapat mempengaruhi fungsi platform",
        "Setiap browser memiliki pengaturan cookie yang berbeda"
      ]
    },
    {
      title: "5. Cookie yang Kami Gunakan",
      content: [
        "Cookie Keamanan: untuk melindungi akun dan data Anda",
        "Cookie Preferensi: untuk menyimpan pengaturan Anda",
        "Cookie Analitik: untuk memahami penggunaan platform",
        "Cookie Sesi: untuk mengelola sesi login Anda"
      ]
    }
  ];

  let visible = false;
  
  onMount(() => {
    visible = true;
  });
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>Cookie Policy - TEBAK ANGKA | Kebijakan Penggunaan Cookie</title>
  <meta name="title" content="Cookie Policy - TEBAK ANGKA | Kebijakan Penggunaan Cookie">
  <meta name="description" content="Kebijakan lengkap tentang penggunaan cookie di platform TEBAK ANGKA. Pelajari bagaimana kami menggunakan cookie untuk meningkatkan keamanan dan pengalaman pengguna.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tebakangka.com/cookie-policy">
  <meta property="og:title" content="Cookie Policy - TEBAK ANGKA | Kebijakan Penggunaan Cookie">
  <meta property="og:description" content="Kebijakan lengkap tentang penggunaan cookie di platform TEBAK ANGKA. Pelajari bagaimana kami menggunakan cookie untuk meningkatkan keamanan dan pengalaman pengguna.">
  <meta property="og:image" content="https://tebakangka.com/images/cookie-policy-og-image.jpg">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://tebakangka.com/cookie-policy">
  <meta property="twitter:title" content="Cookie Policy - TEBAK ANGKA | Kebijakan Penggunaan Cookie">
  <meta property="twitter:description" content="Kebijakan lengkap tentang penggunaan cookie di platform TEBAK ANGKA. Pelajari bagaimana kami menggunakan cookie untuk meningkatkan keamanan dan pengalaman pengguna.">
  <meta property="twitter:image" content="https://tebakangka.com/images/cookie-policy-twitter-card.jpg">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="cookie policy tebak angka, kebijakan cookie, penggunaan cookie, privasi cookie, keamanan data">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://tebakangka.com/cookie-policy">
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#e62020">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</svelte:head>

<div class="pt-24 pb-16 bg-[#1a1a1a] min-h-screen">
  <div class="container mx-auto px-4">
    <!-- Header -->
    <div class="max-w-3xl mx-auto text-center mb-16">
      <h1 
        class="text-4xl md:text-5xl font-bold text-white mb-6 {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700"
      >
        Cookie Policy
      </h1>
      <p 
        class="text-gray-400 text-lg leading-relaxed {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 delay-300"
      >
        Kebijakan ini menjelaskan bagaimana dan mengapa kami menggunakan cookie di platform TEBAK ANGKA.
      </p>
    </div>

    <!-- Policy Content -->
    <div class="max-w-3xl mx-auto">
      {#each policies as policy, i}
        <div 
          class="mb-10 {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500"
          style="transition-delay: {(i + 2) * 100}ms"
        >
          <h2 class="text-2xl font-bold text-white mb-4">{policy.title}</h2>
          <div class="bg-[#222] rounded-xl p-6">
            <ul class="space-y-3">
              {#each policy.content as point}
                <li class="text-gray-400 leading-relaxed flex items-start">
                  <span class="text-[#e62020] mr-3 mt-1.5">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                  </span>
                  {point}
                </li>
              {/each}
            </ul>
          </div>
        </div>
      {/each}
    </div>

    <!-- Last Update -->
    <div 
      class="max-w-3xl mx-auto mt-12 text-center {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-1000"
    >
      <p class="text-gray-400">
        Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </div>

    <!-- Contact Section -->
    <div 
      class="max-w-3xl mx-auto mt-12 p-6 bg-[#222] rounded-xl text-center {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-1100"
    >
      <p class="text-gray-400 mb-4">
        Jika Anda memiliki pertanyaan tentang kebijakan cookie kami, silakan hubungi tim support.
      </p>
      <a 
        href="/contact" 
        class="inline-block bg-[#e62020] text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
      >
        Hubungi Kami
      </a>
    </div>
  </div>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 