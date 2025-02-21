<script>
  import { onMount } from 'svelte';

  const policies = [
    {
      title: "1. Informasi yang Kami Kumpulkan",
      content: [
        "Data pribadi seperti nama, alamat email, dan nomor telepon saat pendaftaran",
        "Data transaksi termasuk riwayat deposit dan withdraw",
        "Informasi perangkat dan log aktivitas untuk keamanan",
        "Cookie dan data pelacakan untuk meningkatkan pengalaman pengguna"
      ]
    },
    {
      title: "2. Penggunaan Informasi",
      content: [
        "Memproses transaksi dan memberikan layanan platform",
        "Mengirim notifikasi penting terkait akun dan transaksi",
        "Meningkatkan keamanan dan mencegah kecurangan",
        "Menganalisis dan meningkatkan layanan platform"
      ]
    },
    {
      title: "3. Perlindungan Data",
      content: [
        "Menggunakan enkripsi SSL/TLS untuk melindungi transmisi data",
        "Menyimpan data di server yang aman dengan akses terbatas",
        "Melakukan backup data secara berkala dengan enkripsi",
        "Menerapkan sistem keamanan berlapis untuk melindungi data pengguna"
      ]
    },
    {
      title: "4. Pembagian Informasi",
      content: [
        "Tidak menjual atau menyewakan data pengguna kepada pihak ketiga",
        "Hanya membagikan data jika diwajibkan oleh hukum",
        "Menggunakan layanan pihak ketiga terpercaya untuk pemrosesan pembayaran",
        "Memastikan pihak ketiga mematuhi standar keamanan data"
      ]
    },
    {
      title: "5. Hak Pengguna",
      content: [
        "Mengakses dan memperbarui data pribadi melalui pengaturan akun",
        "Meminta penghapusan data sesuai dengan ketentuan yang berlaku",
        "Menolak penggunaan data untuk tujuan pemasaran",
        "Mengajukan pertanyaan tentang privasi data kepada tim support"
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
  <title>Kebijakan Privasi - TEBAK ANGKA | Perlindungan Data Pengguna</title>
  <meta name="title" content="Kebijakan Privasi - TEBAK ANGKA | Perlindungan Data Pengguna">
  <meta name="description" content="Pelajari bagaimana TEBAK ANGKA melindungi dan mengelola data pengguna. Informasi lengkap tentang pengumpulan, penggunaan, dan perlindungan data pribadi Anda.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tebakangka.com/privacy">
  <meta property="og:title" content="Kebijakan Privasi - TEBAK ANGKA | Perlindungan Data Pengguna">
  <meta property="og:description" content="Pelajari bagaimana TEBAK ANGKA melindungi dan mengelola data pengguna. Informasi lengkap tentang pengumpulan, penggunaan, dan perlindungan data pribadi Anda.">
  <meta property="og:image" content="https://tebakangka.com/images/privacy-og-image.jpg">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://tebakangka.com/privacy">
  <meta property="twitter:title" content="Kebijakan Privasi - TEBAK ANGKA | Perlindungan Data Pengguna">
  <meta property="twitter:description" content="Pelajari bagaimana TEBAK ANGKA melindungi dan mengelola data pengguna. Informasi lengkap tentang pengumpulan, penggunaan, dan perlindungan data pribadi Anda.">
  <meta property="twitter:image" content="https://tebakangka.com/images/privacy-twitter-card.jpg">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="privasi tebak angka, keamanan data, perlindungan data, kebijakan privasi, data pengguna, enkripsi data">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://tebakangka.com/privacy">
  
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
        Kebijakan Privasi
      </h1>
      <p 
        class="text-gray-400 text-lg leading-relaxed {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 delay-300"
      >
        Kami berkomitmen untuk melindungi privasi dan keamanan data pengguna TEBAK ANGKA.
      </p>
    </div>

    <!-- Privacy Content -->
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
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
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
        Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi tim support kami.
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