<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import Logo from './Logo.svelte';
  import { supabaseClient } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { invalidate } from '$app/navigation';
  import { user } from '$lib/stores/authStore';
  import { page } from '$app/stores';
  import type { Market } from '$lib/types/market';

  let isScrolled = false;
  let isMobileMenuOpen = false;
  let isMarketDropdownOpen = false;
  let loading = true;
  let markets: Market[] = [];

  const navLinks = [
    { href: '/', text: 'Beranda' },
    { type: 'dropdown', text: 'Pasaran Lomba' },
    { href: '/about', text: 'Tentang Kami' },
    { href: '/faq', text: 'FAQ' },
    { href: '/contact', text: 'Kontak' }
  ];

  // Fungsi untuk mendapatkan status market dengan nilai prioritas
  function getMarketStatusPriority(market: Market): number {
    const openTime = parseInt(market.buka.replace(':', ''));
    const closeTime = parseInt(market.tutup.replace(':', ''));
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    if (currentTime >= openTime && currentTime < closeTime) return 2;
    if (currentTime < openTime) return 1;
    return 0;
  }
  
  // Fungsi untuk mendapatkan menit tersisa sampai tutup
  function getMinutesUntilClose(market: Market): number {
    const closeTime = market.tutup.split(':');
    const closeHour = parseInt(closeTime[0]);
    const closeMinute = parseInt(closeTime[1]);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    return (closeHour * 60 + closeMinute) - (currentHour * 60 + currentMinute);
  }
  
  // Fungsi untuk mendapatkan status market
  function getMarketStatus(market: Market) {
    const openTime = parseInt(market.buka.replace(':', ''));
    const closeTime = parseInt(market.tutup.replace(':', ''));
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    if (currentTime < openTime) return { text: 'BELUM DIMULAI', color: 'text-yellow-400' };
    if (currentTime >= openTime && currentTime < closeTime) return { text: 'BUKA', color: 'text-green-400' };
    return { text: 'TUTUP', color: 'text-red-400' };
  }
  
  // Sort markets berdasarkan status dan waktu tutup
  $: sortedMarkets = [...markets].sort((a, b) => {
    const statusA = getMarketStatusPriority(a);
    const statusB = getMarketStatusPriority(b);
    
    if (statusA !== statusB) return statusB - statusA;
    
    if (statusA === 2) {
      const timeA = getMinutesUntilClose(a);
      const timeB = getMinutesUntilClose(b);
      return timeA - timeB;
    }
    
    return 0;
  });

  async function fetchMarkets() {
    try {
      const response = await fetch('/api/markets');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      markets = data;
    } catch (err) {
      console.error('Error fetching markets:', err);
    }
  }

  async function handleLogout() {
    try {
      await user.signOut();
      goto('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  onMount(() => {
    user.initialize();
    const handleScroll = () => {
      isScrolled = window.scrollY > 20;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    fetchMarkets();
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function closeMenu() {
    isMobileMenuOpen = false;
    isMarketDropdownOpen = false;
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
          {#if link.type === 'dropdown'}
            <div class="relative">
              <button
                class="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                on:click={() => isMarketDropdownOpen = !isMarketDropdownOpen}
                on:mouseenter={() => isMarketDropdownOpen = true}
              >
                <span>{link.text}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {#if isMarketDropdownOpen}
                <div
                  class="absolute top-full left-0 mt-2 w-64 bg-[#222] rounded-xl shadow-xl border border-gray-800"
                  on:mouseleave={() => isMarketDropdownOpen = false}
                  transition:slide={{ duration: 200 }}
                >
                  <div class="max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                    {#if sortedMarkets.length > 0}
                      {#each sortedMarkets as market}
                        {@const status = getMarketStatus(market)}
                        <a
                          href="/lomba/{market.name}"
                          class="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800/50 last:border-0"
                          on:click={closeMenu}
                        >
                          <img
                            src={market.image}
                            alt={market.name}
                            class="w-6 h-6 rounded-full object-cover"
                          />
                          <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-300 truncate">{market.name}</p>
                            <div class="flex items-center gap-2 mt-1">
                              <span class="text-[10px] font-medium px-1.5 py-0.5 rounded
                                {status.text === 'BUKA' ? 'bg-green-500/10 text-green-500' : 
                                 status.text === 'BELUM DIMULAI' ? 'bg-yellow-500/10 text-yellow-500' : 
                                 'bg-red-500/10 text-red-500'}">
                                {status.text}
                              </span>
                              <span class="text-[10px] text-gray-500">
                                {market.buka} - {market.tutup}
                              </span>
                            </div>
                          </div>
                        </a>
                      {/each}
                    {:else}
                      <div class="px-4 py-3 text-sm text-gray-400">
                        Tidak ada pasaran tersedia
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <a 
              href={link.href} 
              class="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
            >
              {link.text}
            </a>
          {/if}
        {/each}
        
        <!-- CTA Buttons -->
        <div class="flex items-center space-x-4">
          {#if $user}
            <button
              on:click={handleLogout}
              disabled={loading}
              class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-[#e62020]/10 hover:bg-[#e62020]/20 rounded-lg transition-all duration-300 disabled:opacity-50 border border-[#e62020]/20"
            >
              {#if loading}
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              {:else}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              {/if}
              <span>{loading ? 'Loading...' : 'Keluar'}</span>
            </button>
          {:else}
            <a 
              href="/login" 
              class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 rounded-lg transition-all duration-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              <span>Masuk</span>
            </a>
            <a 
              href="/register" 
              class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-[#e62020] hover:bg-[#ff0000] rounded-lg transition-all duration-300 shadow-lg shadow-[#e62020]/20"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              <span>Daftar</span>
            </a>
          {/if}
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
            {#if link.type === 'dropdown'}
              <button
                class="flex items-center justify-between text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-300 px-4 py-3 text-sm font-medium w-full"
                on:click={() => isMarketDropdownOpen = !isMarketDropdownOpen}
              >
                <span>{link.text}</span>
                <svg
                  class="w-4 h-4 transition-transform duration-200 {isMarketDropdownOpen ? 'rotate-180' : ''}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {#if isMarketDropdownOpen}
                <div class="bg-[#1a1a1a]/50 pl-8 overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)]" transition:slide={{ duration: 200 }}>
                  {#if sortedMarkets.length > 0}
                    {#each sortedMarkets as market}
                      {@const status = getMarketStatus(market)}
                      <a
                        href="/lomba/{market.name}"
                        class="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 transition-colors text-sm text-gray-300 hover:text-white"
                        on:click={closeMenu}
                      >
                        <img
                          src={market.image}
                          alt={market.name}
                          class="w-6 h-6 rounded-full object-cover"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="text-sm text-gray-300 truncate">{market.name}</p>
                          <p class="text-[10px] {status.color} font-medium">{status.text} ({market.buka} - {market.tutup})</p>
                        </div>
                      </a>
                    {/each}
                  {:else}
                    <div class="px-4 py-3 text-sm text-gray-400">
                      Tidak ada pasaran tersedia
                    </div>
                  {/if}
                </div>
              {/if}
            {:else}
              <a 
                href={link.href} 
                class="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-300 px-4 py-3 text-sm font-medium"
                on:click={closeMenu}
              >
                {link.text}
              </a>
            {/if}
          {/each}
          
          <div class="border-t border-gray-800 mt-4 pt-4 px-4 space-y-3">
            {#if $user}
              <button
                on:click={handleLogout}
                disabled={loading}
                class="flex items-center w-full space-x-2 px-5 py-3 text-sm font-medium text-white bg-[#e62020]/10 hover:bg-[#e62020]/20 rounded-lg transition-all duration-300 disabled:opacity-50 border border-[#e62020]/20"
                on:click={closeMenu}
              >
                {#if loading}
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                {:else}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                {/if}
                <span>{loading ? 'Loading...' : 'Keluar'}</span>
              </button>
            {:else}
              <a 
                href="/login" 
                class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                on:click={closeMenu}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                <span>Masuk</span>
              </a>
              <a 
                href="/register" 
                class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-[#e62020] hover:bg-[#ff0000] rounded-lg transition-all duration-300 shadow-lg shadow-[#e62020]/20"
                on:click={closeMenu}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
                <span>Daftar</span>
              </a>
            {/if}
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

  :global(.custom-scrollbar) {
    scrollbar-width: thin;
    scrollbar-color: #333 transparent;
  }

  :global(.custom-scrollbar::-webkit-scrollbar) {
    width: 6px;
  }

  :global(.custom-scrollbar::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
    background-color: #333;
    border-radius: 20px;
    border: transparent;
  }
</style> 