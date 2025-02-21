<script>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import Logo from './Logo.svelte';

  let isScrolled = false;
  let isMobileMenuOpen = false;

  const navLinks = [
    { href: '/', text: 'Beranda' },
    { href: '/about', text: 'Tentang Kami' },
    { href: '/faq', text: 'FAQ' },
    { href: '/contact', text: 'Kontak' }
  ];

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 20;
    };

    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function closeMenu() {
    isMobileMenuOpen = false;
  }
</script>

<nav 
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {isScrolled ? 'bg-[#1a1a1a] shadow-lg' : 'bg-[#1a1a1a]/80 backdrop-blur-sm'}"
>
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-20">
      <!-- Logo -->
      <a 
        href="/" 
        class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        on:click={closeMenu}
      >
        <Logo className="w-8 h-8" />
        <span class="text-xl font-bold text-white">TEBAK ANGKA</span>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        {#each navLinks as link}
          <a 
            href={link.href} 
            class="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
          >
            {link.text}
          </a>
        {/each}
        
        <!-- CTA Buttons -->
        <div class="flex items-center space-x-4">
          <a 
            href="/login" 
            class="px-4 py-2 text-sm font-medium text-white hover:text-[#e62020] transition-colors duration-300"
          >
            Masuk
          </a>
          <a 
            href="/register" 
            class="px-4 py-2 text-sm font-medium text-white bg-[#e62020] rounded-lg hover:bg-red-700 transition-colors duration-300"
          >
            Daftar
          </a>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button 
        class="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
        on:click={() => isMobileMenuOpen = !isMobileMenuOpen}
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        <svg 
          class="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {#if !isMobileMenuOpen}
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
          {:else}
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M6 18L18 6M6 6l12 12"
            />
          {/if}
        </svg>
      </button>
    </div>

    <!-- Mobile Navigation -->
    {#if isMobileMenuOpen}
      <div 
        class="md:hidden bg-[#1a1a1a] border-t border-gray-800"
        transition:slide={{ duration: 300 }}
      >
        <div class="flex flex-col py-4">
          {#each navLinks as link}
            <a 
              href={link.href} 
              class="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-300 px-4 py-3 text-sm font-medium"
              on:click={closeMenu}
            >
              {link.text}
            </a>
          {/each}
          
          <div class="border-t border-gray-800 mt-4 pt-4 px-4 space-y-3">
            <a 
              href="/login" 
              class="block text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-300 px-4 py-3 text-sm font-medium rounded-lg"
              on:click={closeMenu}
            >
              Masuk
            </a>
            <a 
              href="/register" 
              class="block w-full text-center text-white bg-[#e62020] rounded-lg px-4 py-3 text-sm font-medium hover:bg-red-700 transition-colors duration-300"
              on:click={closeMenu}
            >
              Daftar
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>

<style>
  /* Add transition for mobile menu */
  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.3s ease;
  }

  .slide-enter,
  .slide-leave-to {
    transform: translateY(-100%);
  }
</style> 