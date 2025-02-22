<script lang="ts">
  import { onMount } from 'svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import Loading from '$lib/components/Loading.svelte';

  let contacts = [];
  let socialMedia = [];
  let loading = true;
  let error = null;

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
  <title>Hubungi Kami - TEBAK ANGKA | Customer Service 24/7</title>
  <meta name="title" content="Hubungi Kami - TEBAK ANGKA | Customer Service 24/7">
  <meta name="description" content="Hubungi tim support TEBAK ANGKA yang siap membantu Anda 24/7. Tersedia layanan WhatsApp, Telegram, dan Email untuk memberikan bantuan terbaik.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tebakangka.com/contact">
  <meta property="og:title" content="Hubungi Kami - TEBAK ANGKA | Customer Service 24/7">
  <meta property="og:description" content="Hubungi tim support TEBAK ANGKA yang siap membantu Anda 24/7. Tersedia layanan WhatsApp, Telegram, dan Email untuk memberikan bantuan terbaik.">
  <meta property="og:image" content="https://tebakangka.com/images/contact-og-image.jpg">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://tebakangka.com/contact">
  <meta property="twitter:title" content="Hubungi Kami - TEBAK ANGKA | Customer Service 24/7">
  <meta property="twitter:description" content="Hubungi tim support TEBAK ANGKA yang siap membantu Anda 24/7. Tersedia layanan WhatsApp, Telegram, dan Email untuk memberikan bantuan terbaik.">
  <meta property="twitter:image" content="https://tebakangka.com/images/contact-twitter-card.jpg">

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="kontak tebak angka, customer service tebak angka, bantuan tebak angka, whatsapp tebak angka, telegram tebak angka, email tebak angka">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="author" content="TEBAK ANGKA">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://tebakangka.com/contact">
  
  <!-- Additional Meta -->
  <meta name="theme-color" content="#e62020">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
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
      <Loading size={8} color="#e62020" />
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
    {/if}

    <!-- Operating Hours -->
    <div 
      class="max-w-3xl mx-auto mt-16 text-center {loading ? 'opacity-0' : 'opacity-100'} transition-all duration-700 delay-700"
    >
      <h2 class="text-2xl font-bold text-white mb-4">Jam Operasional</h2>
      <p class="text-gray-400 text-lg">
        Customer service kami beroperasi 24 jam setiap hari, termasuk hari libur nasional.
      </p>
    </div>

    <!-- Response Time -->
    <div 
      class="max-w-3xl mx-auto mt-12 p-6 bg-[#222] rounded-xl text-center {loading ? 'opacity-0' : 'opacity-100'} transition-all duration-700 delay-800"
    >
      <p class="text-gray-400">
        <span class="text-white font-semibold">Waktu Respon:</span> Kami akan merespon pesan Anda dalam waktu maksimal 5 menit.
      </p>
    </div>
  </div>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 