<script lang="ts">
  import { writable } from 'svelte/store';
  import MarketButton from './MarketButton.svelte';
  import { fade, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Skeleton from './Skeleton.svelte';
  import { goto } from '$app/navigation';
  import type { Market } from '$lib/types/market';
  
  let markets: Market[] = [];
  let searchQuery = '';
  export let limit: number | null = null;
  
  $: filteredMarkets = markets.filter(market => 
    searchQuery 
      ? market.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Sort filtered markets berdasarkan status dan waktu tutup
  $: sortedAndFilteredMarkets = [...filteredMarkets].sort((a, b) => {
    const statusA = getMarketStatusPriority(a);
    const statusB = getMarketStatusPriority(b);
    
    // Jika status berbeda, urutkan berdasarkan status
    if (statusA !== statusB) return statusB - statusA;
    
    // Jika status sama dan BUKA, urutkan berdasarkan waktu tutup terdekat
    if (statusA === 2) {
      const timeA = getMinutesUntilClose(a);
      const timeB = getMinutesUntilClose(b);
      return timeA - timeB;
    }
    
    return 0;
  });

  // Sort filtered markets dan terapkan limit jika ada
  $: displayedMarkets = limit 
    ? sortedAndFilteredMarkets.slice(0, limit)
    : sortedAndFilteredMarkets;

  let showTerms = false;
  let selectedMarket = null;
  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch('/api/markets');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      markets = data;
    } catch (err) {
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  });

  function getMarketStatus(market) {
    const openTime = parseInt(market.buka.replace(':', ''));
    const closeTime = parseInt(market.tutup.replace(':', ''));
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    if (currentTime < openTime) return { text: 'BELUM DIMULAI', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
    if (currentTime >= openTime && currentTime < closeTime) return { text: 'BUKA', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
    return { text: 'TUTUP', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
  }

  function handleShowTerms(market) {
    selectedMarket = market;
    showTerms = true;
  }

  function handleCloseTerms() {
    showTerms = false;
    selectedMarket = null;
  }

  function handleMarketClick(market) {
    selectedMarket = market;
    showTerms = true;
  }

  function handleAcceptTerms() {
    if (selectedMarket) {
      goto(`/lomba/${selectedMarket.id}`);
    }
    showTerms = false;
  }

  // Fungsi untuk mendapatkan status market dengan nilai prioritas
  function getMarketStatusPriority(market: Market): number {
    const openTime = parseInt(market.buka.replace(':', ''));
    const closeTime = parseInt(market.tutup.replace(':', ''));
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    // Status BUKA mendapat prioritas tertinggi (2)
    if (currentTime >= openTime && currentTime < closeTime) return 2;
    // Status BELUM DIMULAI mendapat prioritas menengah (1)
    if (currentTime < openTime) return 1;
    // Status TUTUP mendapat prioritas terendah (0)
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
</script>

<div class="space-y-6">
  <!-- Search bar jika tidak ada limit -->
  {#if !limit}
    <div class="max-w-xl mx-auto px-4">
      <div class="relative">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari pasaran..."
          class="w-full bg-[#1a1a1a] text-white px-4 py-3 pr-10 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        />
        <svg class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4">
      {#each Array(6) as _, i}
        <div class="bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-2xl border border-gray-800/50 overflow-hidden shadow-xl shadow-black/20 backdrop-blur-sm">
          <!-- Skeleton Image -->
          <Skeleton className="aspect-video bg-gray-800" />
          
          <!-- Skeleton Content -->
          <div class="p-5">
            <!-- Market Name & Status -->
            <div class="flex items-center justify-between px-4 py-3 bg-[#222] border-b border-gray-800 mb-5">
              <Skeleton className="h-7 w-32 bg-gray-800 rounded" />
              <Skeleton className="h-6 w-24 bg-gray-800 rounded" />
            </div>
            
            <!-- Schedule -->
            <div class="bg-[#222] rounded-xl p-5 mb-5 border border-gray-800/50">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                  <Skeleton className="h-4 w-20 mx-auto bg-gray-800 rounded mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto bg-gray-800 rounded" />
                </div>
                <div class="text-center border-l border-gray-700">
                  <Skeleton className="h-4 w-20 mx-auto bg-gray-800 rounded mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto bg-gray-800 rounded" />
                </div>
              </div>
            </div>
            
            <!-- Button -->
            <Skeleton className="h-12 w-full bg-gray-800 rounded-lg" />
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4">
      {#each displayedMarkets as market}
        {@const status = getMarketStatus(market)}
        <div 
          class="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gradient-to-br from-[#1a1a1a] to-[#222] p-5 hover:border-[#e62020]/30 transition-all duration-300 shadow-xl shadow-black/20 backdrop-blur-sm hover:shadow-2xl hover:shadow-[#e62020]/5 min-h-[350px] flex flex-col"
          in:scale={{ duration: 300, delay: 200 }}
        >
          <!-- Decorative Elements -->
          <div class="absolute inset-0 bg-gradient-to-br from-[#e62020]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div class="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#e62020]/5 blur-3xl group-hover:bg-[#e62020]/10 transition-all duration-500" />
          <div class="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-[#e62020]/5 blur-3xl group-hover:bg-[#e62020]/10 transition-all duration-500" />
          
          <!-- Market Image -->
          <div class="relative mb-4 flex items-center justify-center h-24 w-24 mx-auto transform group-hover:scale-105 transition-all duration-500">
            <div class="absolute inset-0 bg-gradient-to-br from-[#e62020]/20 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div class="absolute inset-0 border-2 border-[#e62020]/20 rounded-full group-hover:border-[#e62020]/40 transition-all duration-500" />
            <img
              src={market.image}
              alt={market.name}
              class="relative h-20 w-20 rounded-full object-cover shadow-2xl transition-all duration-300"
            />
          </div>

          <!-- Market Name -->
          <h3 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-center mb-3 whitespace-nowrap overflow-hidden text-ellipsis px-2">
            {market.name}
          </h3>

          <!-- Market Status -->
          <div class="flex justify-center mb-4">
            <div class="flex items-center gap-2 rounded-xl {status.bg} {status.border} border px-4 py-2 backdrop-blur-sm">
              <span class="h-2 w-2 rounded-full animate-pulse" class:bg-yellow-400={status.text === 'BELUM DIMULAI'} class:bg-green-400={status.text === 'BUKA'} class:bg-red-400={status.text === 'TUTUP'} />
              <span class="{status.color} font-semibold tracking-wide text-sm whitespace-nowrap">{status.text}</span>
            </div>
          </div>

          <!-- Market Schedule -->
          <div class="grid grid-cols-2 gap-3 text-center mb-4 relative">
            <div class="absolute top-1/2 left-1/2 w-px h-12 bg-gradient-to-b from-transparent via-gray-700/50 to-transparent transform -translate-x-1/2 -translate-y-1/2" />
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Jam Buka</p>
              <p class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">{market.buka}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Jam Tutup</p>
              <p class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">{market.tutup}</p>
            </div>
          </div>

          <!-- Official Link -->
          <div class="mb-4 text-center">
            <a
              href={market.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              class="w-full group/link inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#e62020]/10 to-[#e62020]/5 border border-[#e62020]/20 hover:border-[#e62020]/40 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-[#e62020]/10 whitespace-nowrap text-xs"
            >
              <svg 
                class="w-4 h-4 text-[#e62020] group-hover/link:animate-bounce" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                />
              </svg>
              <span class="text-sm font-medium text-[#e62020] group-hover/link:text-[#ff0000] transition-colors">
                Link Resmi
              </span>
            </a>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mt-auto">
            <button
              on:click={() => goto(`/lomba/${market.name}`)}
              class="flex-1 transform rounded-lg bg-gradient-to-r from-[#e62020] to-[#ff0000] py-2.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#e62020]/20 hover:from-[#ff0000] hover:to-[#e62020] whitespace-nowrap"
            >
              Ikuti Lomba
            </button>
            <button
              on:click={() => handleShowTerms(market)}
              class="p-2.5 rounded-lg border border-[#e62020]/30 text-gray-400 hover:text-white hover:border-[#e62020]/30 hover:bg-[#e62020]/10 backdrop-blur-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Tombol Seluruh Pasaran jika ada limit -->
    {#if limit && sortedAndFilteredMarkets.length > limit}
      <div class="text-center mt-8">
        <a 
          href="/lomba"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-lg transition-colors duration-300 group"
        >
          <span>Lihat Seluruh Pasaran</span>
          <svg 
            class="w-4 h-4 transform transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>
    {/if}
  {/if}
</div>

<style>
  img {
    transform-origin: center;
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
  }
</style>

<!-- Terms Modal -->
{#if showTerms}
  <div 
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 overflow-y-auto"
    transition:fade={{ duration: 200 }}
    on:click={handleCloseTerms}
    on:keydown={(e) => e.key === 'Escape' && handleCloseTerms()}
  >
    <div 
      class="min-h-screen p-0 flex items-center justify-center"
    >
      <div 
        class="relative w-full max-w-lg bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-2xl border border-gray-800 shadow-xl p-6 transform transition-all"
        on:click|stopPropagation
      >
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
          <h3 class="text-xl font-bold text-white">Syarat & Ketentuan {selectedMarket.name}</h3>
          <button 
            class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            on:click={handleCloseTerms}
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <ul class="space-y-3">
            {#each selectedMarket.terms as term}
              <li 
                class="flex items-start text-gray-400 p-4 rounded-xl bg-[#222] border border-gray-800/50 text-sm"
                transition:scale={{ duration: 200, delay: 100 }}
              >
                <span class="text-[#e62020] mr-3 mt-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                </span>
                {term}
              </li>
            {/each}
          </ul>
        </div>

        <div class="mt-8 pt-4 border-t border-gray-800 text-center">
          <button
            class="w-full md:w-auto px-6 py-2.5 bg-[#222] text-gray-400 rounded-xl hover:bg-gray-800 transition-colors text-sm"
            on:click={handleCloseTerms}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
{/if} 