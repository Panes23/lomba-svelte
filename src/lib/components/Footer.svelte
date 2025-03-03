<script lang="ts">
  import Logo from './Logo.svelte';
  import { onMount } from 'svelte';

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { text: 'Beranda', href: '/' },
    { text: 'Tentang Kami', href: '/about' },
    { text: 'Kontak', href: '/contact' },
    { text: 'FAQ', href: '/faq' }
  ];

  let contacts = [];
  let socialMedia = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      // Fetch contacts dan social media secara parallel
      const [contactsRes, socialMediaRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/social-media')
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

<footer class="bg-[#1a1a1a] text-white border-t border-gray-800">
  <!-- Main Footer -->
  <div class="container mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
      <!-- Brand Section -->
      <div class="md:col-span-5">
        <div class="flex items-center space-x-3 mb-6">
          <Logo className="w-10 h-10" />
          <span class="text-2xl font-bold">TEBAK ANGKA</span>
        </div>
        <p class="text-gray-400 leading-relaxed mb-6">
          Platform tebak angka terpercaya dengan berbagai pasaran dan hadiah menarik. Nikmati pengalaman bermain yang aman dan nyaman bersama kami.
        </p>
        <div class="flex space-x-4">
          {#each socialMedia as social}
            <a 
              href={social.url}
              class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#e62020] transition-colors duration-300"
              aria-label={`Follow us on ${social.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg 
                class="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d={social.icon}/>
              </svg>
            </a>
          {/each}
        </div>
      </div>

      <!-- Quick Links -->
      <div class="md:col-span-3">
        <h3 class="text-lg font-semibold mb-6">Link Cepat</h3>
        <ul class="space-y-3">
          {#each quickLinks as link}
            <li>
              <a 
                href={link.href} 
                class="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"
              >
                <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                {link.text}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Contact Info -->
      <div class="md:col-span-4">
        <h3 class="text-lg font-semibold mb-6">Hubungi Kami</h3>
        <ul class="space-y-4">
          {#each contacts as contact}
            <li>
              <a 
                href={contact.contact_href} 
                class="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-3"
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
                <span class="text-sm">{contact.contact_text}</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>

  <!-- Bottom Footer -->
  <div class="border-t border-gray-800">
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          &copy; {currentYear} TEBAK ANGKA. All rights reserved.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="/privacy" class="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
          <a href="/terms" class="text-gray-400 hover:text-white text-sm">Terms of Service</a>
          <a href="/cookies" class="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  /* Optional: Add smooth scroll behavior */
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 