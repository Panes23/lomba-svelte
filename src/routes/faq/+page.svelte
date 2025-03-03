<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  const baseUrl = import.meta.env.VITE_BASE_URL;
  
  const faqData = [
    {
      question: "Apa itu TEBAK ANGKA?",
      answer: "TEBAK ANGKA adalah platform terpercaya untuk permainan tebak angka dengan berbagai pasaran internasional. Kami menyediakan sistem yang fair dan transparan dengan jaminan keamanan data dan transaksi.",
      isOpen: false
    },
    {
      question: "Bagaimana cara mendaftar?",
      answer: "Pendaftaran sangat mudah! Cukup klik tombol 'Daftar' di menu atas, isi formulir dengan data yang valid, dan akun Anda akan langsung aktif. Pastikan menggunakan data yang benar untuk kemudahan proses transaksi.",
      isOpen: false
    },
    {
      question: "Berapa minimal deposit dan withdraw?",
      answer: "Minimal deposit di platform kami adalah Rp 50.000 dan minimal withdraw adalah Rp 100.000. Proses deposit dan withdraw dijamin cepat dan aman dengan dukungan berbagai metode pembayaran.",
      isOpen: false
    },
    {
      question: "Bagaimana sistem keamanan platform?",
      answer: "Kami menggunakan sistem keamanan enkripsi terkini untuk melindungi data dan transaksi member. Setiap aktivitas di akun Anda dilindungi dengan sistem verifikasi berlapis.",
      isOpen: false
    },
    {
      question: "Apakah ada batasan waktu bermain?",
      answer: "Setiap pasaran memiliki jadwal buka dan tutup yang berbeda. Anda dapat melihat jadwal lengkap di halaman utama untuk setiap pasaran yang tersedia.",
      isOpen: false
    },
    {
      question: "Bagaimana cara menghubungi customer service?",
      answer: "Customer service kami tersedia 24/7 melalui berbagai channel: Live Chat, WhatsApp, dan Telegram. Anda dapat memilih channel yang paling nyaman untuk mendapatkan bantuan.",
      isOpen: false
    }
  ];

  let faqs = writable(faqData);
  let visible = false;
  
  onMount(() => {
    visible = true;
  });

  function toggleFaq(index) {
    $faqs = $faqs.map((faq, i) => 
      i === index ? { ...faq, isOpen: !faq.isOpen } : faq
    );
  }
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA | FAQ</title>
  <meta name="title" content="TEBAK ANGKA | FAQ">
  <meta name="description" content="Temukan jawaban untuk pertanyaan seputar cara bermain, deposit, withdraw, keamanan, dan informasi penting lainnya di platform tebak angka terpercaya TEBAK ANGKA.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{baseUrl}/faq">
  <meta property="og:title" content="TEBAK ANGKA | FAQ">
  <meta property="og:description" content="Temukan jawaban untuk pertanyaan seputar cara bermain, deposit, withdraw, keamanan, dan informasi penting lainnya di platform tebak angka terpercaya TEBAK ANGKA.">
  <meta property="og:image" content="{baseUrl}/og-image.png">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="{baseUrl}/faq">
  <meta property="twitter:title" content="TEBAK ANGKA | FAQ">
  <meta property="twitter:description" content="Temukan jawaban untuk pertanyaan seputar cara bermain, deposit, withdraw, keamanan, dan informasi penting lainnya di platform tebak angka terpercaya TEBAK ANGKA.">
  <meta property="twitter:image" content="{baseUrl}/twitter-card.png">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="faq tebak angka, cara bermain tebak angka, deposit withdraw tebak angka, keamanan tebak angka, bantuan tebak angka, customer service tebak angka">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="{baseUrl}/faq">
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#e62020">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">

  <!-- Structured Data / Schema.org -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Apa itu TEBAK ANGKA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TEBAK ANGKA adalah platform terpercaya untuk permainan tebak angka dengan berbagai pasaran internasional. Kami menyediakan sistem yang fair dan transparan dengan jaminan keamanan data dan transaksi."
          }
        },
        {
          "@type": "Question",
          "name": "Bagaimana cara mendaftar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pendaftaran sangat mudah! Cukup klik tombol 'Daftar' di menu atas, isi formulir dengan data yang valid, dan akun Anda akan langsung aktif. Pastikan menggunakan data yang benar untuk kemudahan proses transaksi."
          }
        }
      ]
    }
  </script>
</svelte:head>

<div class="pt-24 pb-16 bg-[#1a1a1a] min-h-screen">
  <div class="container mx-auto px-4">
    <!-- Header -->
    <div class="max-w-3xl mx-auto text-center mb-12">
      <h1 
        class="text-4xl md:text-5xl font-bold text-white mb-6 {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700"
      >
        Pertanyaan Umum
      </h1>
      <p 
        class="text-gray-400 text-lg {visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 delay-300"
      >
        Temukan jawaban untuk pertanyaan yang sering ditanyakan seputar platform TEBAK ANGKA
      </p>
    </div>

    <!-- FAQ List -->
    <div class="max-w-3xl mx-auto">
      {#each $faqs as faq, index}
        <div 
          class="mb-4 {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500"
          style="transition-delay: {(index + 2) * 100}ms"
        >
          <button
            class="w-full text-left bg-[#222] hover:bg-[#2a2a2a] p-6 rounded-lg transition-colors duration-300"
            on:click={() => toggleFaq(index)}
            aria-expanded={faq.isOpen}
          >
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold text-white">{faq.question}</h2>
              <svg
                class="w-6 h-6 text-gray-400 transform transition-transform duration-300 {faq.isOpen ? 'rotate-180' : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {#if faq.isOpen}
              <p class="mt-4 text-gray-400 leading-relaxed">
                {faq.answer}
              </p>
            {/if}
          </button>
        </div>
      {/each}
    </div>

    <!-- Contact Section -->
    <div 
      class="max-w-3xl mx-auto mt-12 text-center {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-1000"
    >
      <p class="text-gray-400 mb-6">
        Masih punya pertanyaan? Jangan ragu untuk menghubungi tim support kami.
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
  /* Optional: Add smooth scroll behavior */
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 