<script lang="ts">
  import { onMount } from 'svelte';

  let contacts = [];
  let socialMedia = [];
  let loading = true;
  let error = null;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  onMount(async () => {
    try {
      // Fetch contacts dan social media secara parallel
      const [contactsRes, socialMediaRes] = await Promise.all([
        fetch('/api/contact/contacts'),
        fetch('/api/contact/social-media')
      ]);
      
      const [contactsData, socialMediaData] = await Promise.all([
        contactsRes.json(),
        socialMediaRes.json()
      ]);
      
      if (!contactsRes.ok) throw new Error(contactsData.error);
      if (!socialMediaRes.ok) throw new Error(socialMediaData.error);
      
      contacts = contactsData;
      socialMedia = socialMediaData;
    } catch (err) {
      error = err.message;
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA | Hubungi Kami</title>
  <meta name="title" content="TEBAK ANGKA | Hubungi Kami">
  <meta name="description" content="Hubungi tim support TEBAK ANGKA yang siap membantu Anda 24/7. Tersedia layanan WhatsApp, Telegram, dan Email untuk memberikan bantuan terbaik.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{baseUrl}/contact">
  <meta property="og:title" content="TEBAK ANGKA | Hubungi Kami">
  <meta property="og:description" content="Hubungi tim support TEBAK ANGKA yang siap membantu Anda 24/7. Tersedia layanan WhatsApp, Telegram, dan Email untuk memberikan bantuan terbaik.">
  <meta property="og:image" content="{baseUrl}/og-image.png">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="{baseUrl}/contact">
  <meta property="twitter:title" content="TEBAK ANGKA | Hubungi Kami">
  <meta property="twitter:description" content="Hubungi tim support TEBAK ANGKA yang siap membantu Anda 24/7. Tersedia layanan WhatsApp, Telegram, dan Email untuk memberikan bantuan terbaik.">
  <meta property="twitter:image" content="{baseUrl}/twitter-card.png">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="kontak tebak angka, customer service tebak angka, bantuan tebak angka, whatsapp tebak angka, telegram tebak angka, email tebak angka">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="{baseUrl}/contact">
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#e62020">
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
</svelte:head>

<div class="pt-24 pb-16 bg-[#1a1a1a] min-h-screen">
  <div class="container mx-auto px-4">
    <!-- Header -->
    <div class="max-w-3xl mx-auto text-center mb-16">
      <h1 
        class="text-4xl md:text-5xl font-bold text-white mb-6 {loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700"
      >
        Hubungi Kami
      </h1>
      <p 
        class="text-gray-400 text-lg leading-relaxed {loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700 delay-300"
      >
        Tim support kami siap membantu Anda 24/7. Pilih metode kontak yang paling nyaman untuk Anda.
      </p>
    </div>

    <!-- Loading State -->
    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Contact Info Skeleton -->
        <div class="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
          <div class="h-7 w-48 bg-gray-800 rounded-lg mb-6 animate-pulse" />
          <div class="space-y-4">
            {#each Array(4) as _}
              <div class="flex items-center gap-3 p-4 rounded-xl bg-[#222] border border-gray-800/50 animate-pulse">
                <div class="w-6 h-6 bg-gray-800 rounded-full" />
                <div class="h-5 w-48 bg-gray-800 rounded-lg" />
              </div>
            {/each}
          </div>
        </div>

        <!-- Social Media Skeleton -->
        <div class="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
          <div class="h-7 w-48 bg-gray-800 rounded-lg mb-6 animate-pulse" />
          <div class="grid grid-cols-2 gap-4">
            {#each Array(4) as _}
              <div class="flex items-center gap-3 p-4 rounded-xl bg-[#222] border border-gray-800/50 animate-pulse">
                <div class="w-10 h-10 rounded-full bg-gray-800" />
                <div class="h-5 w-20 bg-gray-800 rounded-lg" />
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Operating Hours Skeleton -->
      <div class="max-w-3xl mx-auto mt-16 text-center animate-pulse">
        <div class="h-8 w-48 bg-gray-800 rounded-lg mx-auto mb-4" />
        <div class="h-6 w-96 bg-gray-800 rounded-lg mx-auto" />
      </div>

      <!-- Response Time Skeleton -->
      <div class="max-w-3xl mx-auto mt-12 p-6 bg-[#222] rounded-xl text-center animate-pulse">
        <div class="h-5 w-3/4 bg-gray-800 rounded-lg mx-auto" />
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Contact Info -->
        <div class="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
          <h2 class="text-xl font-semibold text-white mb-6">Informasi Kontak</h2>
          <div class="space-y-4">
            {#each contacts as contact}
              <a 
                href={contact.contact_href}
                class="flex items-center gap-3 text-gray-400 hover:text-white transition-colors p-4 rounded-xl bg-[#222] border border-gray-800/50"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg 
                  class="w-6 h-6 flex-shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    d={contact.contact_icon}
                  />
                </svg>
                <span>{contact.contact_text}</span>
              </a>
            {/each}
          </div>
        </div>

        <!-- Social Media -->
        <div class="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
          <h2 class="text-xl font-semibold text-white mb-6">Media Sosial</h2>
          <div class="grid grid-cols-2 gap-4">
            {#each socialMedia as social}
              <a 
                href={social.url}
                class="flex items-center gap-3 text-gray-400 hover:text-white transition-colors p-4 rounded-xl bg-[#222] border border-gray-800/50"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg 
                    class="w-5 h-5" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d={social.icon}/>
                  </svg>
                </div>
                <span class="font-medium">{social.name}</span>
              </a>
            {/each}
          </div>
        </div>
      </div>

      <!-- Operating Hours -->
      <div 
        class="max-w-3xl mx-auto mt-16 text-center"
      >
        <h2 class="text-2xl font-bold text-white mb-4">Jam Operasional</h2>
        <p class="text-gray-400 text-lg">
          Customer service kami beroperasi 24 jam setiap hari, termasuk hari libur nasional.
        </p>
      </div>

      <!-- Response Time -->
      <div 
        class="max-w-3xl mx-auto mt-12 p-6 bg-[#222] rounded-xl text-center"
      >
        <p class="text-gray-400">
          <span class="text-white font-semibold">Waktu Respon:</span> Kami akan merespon pesan Anda dalam waktu maksimal 5 menit.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 