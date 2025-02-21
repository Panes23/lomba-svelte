<script>
  const articles = [
    {
      title: "Apa itu TEBAK ANGKA?",
      content: "TEBAK ANGKA adalah platform terpercaya yang menyediakan berbagai pasaran untuk permainan tebak angka. Dengan sistem yang fair dan transparan, kami memberikan pengalaman bermain yang aman dan nyaman.",
      icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
    },
    {
      title: "Mengapa Memilih Kami?",
      content: "Kami menawarkan berbagai keunggulan seperti sistem keamanan terbaik, proses transaksi cepat, customer service 24/7, dan hadiah-hadiah menarik yang bisa Anda menangkan setiap harinya.",
      icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    },
    {
      title: "Cara Bermain",
      content: "Bermain di TEBAK ANGKA sangat mudah. Pilih pasaran yang tersedia, lihat jadwal buka dan tutup, ikuti panduan betting yang ada, dan tunggu hasil. Menangkan hadiah jutaan rupiah setiap harinya!",
      icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
    }
  ];
</script>

<section class="py-12 bg-[#1a1a1a]">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-12">
      Tentang TEBAK ANGKA
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each articles as article}
        <div class="bg-[#222] p-6 rounded-xl hover:bg-[#2a2a2a] transition-colors duration-300">
          <div class="w-12 h-12 bg-[#e62020] rounded-lg flex items-center justify-center mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke-width="1.5" 
              stroke="currentColor" 
              class="w-6 h-6 text-white"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d={article.icon} 
              />
            </svg>
          </div>
          
          <h3 class="text-xl font-bold text-white mb-4">
            {article.title}
          </h3>
          
          <p class="text-gray-400 leading-relaxed">
            {article.content}
          </p>
        </div>
      {/each}
    </div>

    <!-- Call to Action -->
    <div class="mt-12 text-center">
      <p class="text-gray-400 mb-6 text-lg">
        Bergabung sekarang dan rasakan sensasi bermain di platform terpercaya!
      </p>
      <a 
        href="/register" 
        class="inline-block bg-[#e62020] text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
      >
        Daftar Sekarang
      </a>
    </div>
  </div>
</section> 