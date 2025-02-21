<script>
  import { onMount } from 'svelte';

  const cookiePolicies = [
    {
      title: "1. Penggunaan Cookie",
      content: [
        "Cookie adalah file kecil yang disimpan di perangkat Anda saat mengunjungi website",
        "Kami menggunakan cookie untuk meningkatkan pengalaman pengguna dan keamanan",
        "Cookie membantu kami mengingat preferensi dan data login Anda",
        "Beberapa cookie penting untuk fungsi dasar website"
      ]
    },
    {
      title: "2. Jenis Cookie yang Kami Gunakan",
      content: [
        "Cookie Esensial - diperlukan untuk fungsi dasar website",
        "Cookie Preferensi - menyimpan pengaturan tampilan dan bahasa",
        "Cookie Analitik - membantu kami memahami bagaimana website digunakan",
        "Cookie Keamanan - melindungi akun dan transaksi Anda"
      ]
    },
    {
      title: "3. Pengelolaan Cookie",
      content: [
        "Anda dapat mengatur preferensi cookie melalui pengaturan browser",
        "Menonaktifkan cookie dapat mempengaruhi fungsi website",
        "Anda dapat menghapus cookie yang tersimpan kapan saja",
        "Setiap browser memiliki cara berbeda untuk mengelola cookie"
      ]
    },
    {
      title: "4. Cookie Pihak Ketiga",
      content: [
        "Beberapa layanan pihak ketiga mungkin menggunakan cookie",
        "Kami tidak bertanggung jawab atas cookie pihak ketiga",
        "Kebijakan privasi pihak ketiga mengatur cookie mereka",
        "Anda dapat menolak cookie pihak ketiga secara terpisah"
      ]
    },
    {
      title: "5. Perubahan Kebijakan",
      content: [
        "Kami dapat memperbarui kebijakan cookie sewaktu-waktu",
        "Perubahan akan diumumkan di halaman ini",
        "Penggunaan berkelanjutan berarti Anda setuju dengan perubahan",
        "Periksa halaman ini secara berkala untuk pembaruan"
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
  <title>Kebijakan Cookie - TEBAK ANGKA | Penggunaan Cookie</title>
  <meta name="title" content="Kebijakan Cookie - TEBAK ANGKA | Penggunaan Cookie">
  <meta name="description" content="Pelajari bagaimana TEBAK ANGKA menggunakan cookie untuk meningkatkan pengalaman pengguna. Informasi lengkap tentang jenis cookie, pengelolaan, dan privasi data.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tebakangka.com/cookies">
  <meta property="og:title" content="Kebijakan Cookie - TEBAK ANGKA | Penggunaan Cookie">
  <meta property="og:description" content="Pelajari bagaimana TEBAK ANGKA menggunakan cookie untuk meningkatkan pengalaman pengguna. Informasi lengkap tentang jenis cookie, pengelolaan, dan privasi data.">
  <meta property="og:image" content="https://tebakangka.com/images/cookies-og-image.jpg">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://tebakangka.com/cookies">
  <meta property="twitter:title" content="Kebijakan Cookie - TEBAK ANGKA | Penggunaan Cookie">
  <meta property="twitter:description" content="Pelajari bagaimana TEBAK ANGKA menggunakan cookie untuk meningkatkan pengalaman pengguna. Informasi lengkap tentang jenis cookie, pengelolaan, dan privasi data.">
  <meta property="twitter:image" content="https://tebakangka.com/images/cookies-twitter-card.jpg">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="cookie tebak angka, kebijakan cookie, penggunaan cookie, privasi cookie, keamanan data">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://tebakangka.com/cookies">
  
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
        Kebijakan Cookie
      </h1>
      <p 
        class="text-gray-400 text-lg leading-relaxed {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 delay-300"
      >
        Pelajari bagaimana kami menggunakan cookie untuk meningkatkan pengalaman Anda di TEBAK ANGKA.
      </p>
    </div>

    <!-- Cookie Content -->
    <div class="max-w-3xl mx-auto">
      {#each cookiePolicies as policy, i}
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
        Jika Anda memiliki pertanyaan tentang kebijakan cookie ini, silakan hubungi tim support kami.
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