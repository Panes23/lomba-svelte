<script>
  import { onMount } from 'svelte';

  const terms = [
    {
      title: "1. Ketentuan Umum",
      content: [
        "Dengan mengakses dan menggunakan platform TEBAK ANGKA, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.",
        "Platform ini hanya dapat digunakan oleh pengguna yang berusia minimal 18 tahun.",
        "Anda bertanggung jawab penuh atas kerahasiaan akun dan aktivitas yang terjadi dalam akun Anda."
      ]
    },
    {
      title: "2. Pendaftaran dan Akun",
      content: [
        "Pendaftaran mengharuskan data yang valid dan dapat dipertanggungjawabkan.",
        "Satu pengguna hanya diperbolehkan memiliki satu akun.",
        "Platform berhak menonaktifkan akun yang melanggar ketentuan tanpa pemberitahuan."
      ]
    },
    {
      title: "3. Transaksi dan Pembayaran",
      content: [
        "Minimal deposit adalah Rp 50.000 dan minimal withdraw adalah Rp 100.000.",
        "Proses withdraw hanya dapat dilakukan ke rekening yang terdaftar.",
        "Waktu proses transaksi mengikuti jadwal bank yang bersangkutan."
      ]
    },
    {
      title: "4. Keamanan dan Privasi",
      content: [
        "Data pribadi pengguna dilindungi dengan sistem enkripsi terkini.",
        "Platform tidak akan membagikan data pengguna kepada pihak ketiga tanpa persetujuan.",
        "Pengguna wajib menjaga kerahasiaan data login dan tidak membagikannya kepada siapapun."
      ]
    },
    {
      title: "5. Batasan Tanggung Jawab",
      content: [
        "Platform tidak bertanggung jawab atas kerugian yang disebabkan oleh kesalahan pengguna.",
        "Platform berhak melakukan pemeliharaan sistem yang dapat menghentikan layanan sementara.",
        "Keputusan platform dalam segala hal adalah final dan mengikat."
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
  <title>Syarat & Ketentuan - TEBAK ANGKA | Ketentuan Penggunaan Platform</title>
  <meta name="title" content="Syarat & Ketentuan - TEBAK ANGKA | Ketentuan Penggunaan Platform">
  <meta name="description" content="Pelajari syarat dan ketentuan penggunaan platform TEBAK ANGKA. Informasi lengkap tentang pendaftaran, transaksi, keamanan, dan tanggung jawab pengguna.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tebakangka.com/terms">
  <meta property="og:title" content="Syarat & Ketentuan - TEBAK ANGKA | Ketentuan Penggunaan Platform">
  <meta property="og:description" content="Pelajari syarat dan ketentuan penggunaan platform TEBAK ANGKA. Informasi lengkap tentang pendaftaran, transaksi, keamanan, dan tanggung jawab pengguna.">
  <meta property="og:image" content="https://tebakangka.com/images/terms-og-image.jpg">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://tebakangka.com/terms">
  <meta property="twitter:title" content="Syarat & Ketentuan - TEBAK ANGKA | Ketentuan Penggunaan Platform">
  <meta property="twitter:description" content="Pelajari syarat dan ketentuan penggunaan platform TEBAK ANGKA. Informasi lengkap tentang pendaftaran, transaksi, keamanan, dan tanggung jawab pengguna.">
  <meta property="twitter:image" content="https://tebakangka.com/images/terms-twitter-card.jpg">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="syarat dan ketentuan tebak angka, ketentuan layanan, kebijakan platform, aturan main, keamanan data">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://tebakangka.com/terms">
  
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
        Syarat & Ketentuan
      </h1>
      <p 
        class="text-gray-400 text-lg leading-relaxed {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 delay-300"
      >
        Bacalah dengan seksama syarat dan ketentuan penggunaan platform TEBAK ANGKA berikut ini.
      </p>
    </div>

    <!-- Terms Content -->
    <div class="max-w-3xl mx-auto">
      {#each terms as term, i}
        <div 
          class="mb-10 {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500"
          style="transition-delay: {(i + 2) * 100}ms"
        >
          <h2 class="text-2xl font-bold text-white mb-4">{term.title}</h2>
          <div class="bg-[#222] rounded-xl p-6">
            <ul class="space-y-3">
              {#each term.content as point}
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
        Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi tim support kami.
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