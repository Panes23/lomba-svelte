<script>
  import { writable } from 'svelte/store';
  import MarketButton from './MarketButton.svelte';
  import { fade, scale } from 'svelte/transition';
  import { supabaseClient } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import Skeleton from './Skeleton.svelte';
  
  let markets = [];
  let searchQuery = '';
  let filteredMarkets = markets;
  let showTerms = false;
  let selectedMarket = null;
  let loading = true;

  onMount(async () => {
    try {
      const { data, error } = await supabaseClient
        .from('markets')
        .select('*');
      
      if (error) throw error;
      
      markets = data;
      filteredMarkets = data;
    } catch (error) {
      console.error('Error fetching markets:', error.message);
    } finally {
      loading = false;
    }
  });

  function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase();
    filteredMarkets = markets.filter(market => 
      market.name.toLowerCase().includes(searchQuery) ||
      market.buka.toLowerCase().includes(searchQuery) ||
      market.tutup.toLowerCase().includes(searchQuery)
    );
  }

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
</script>

<!-- Search Bar -->
<div class="relative mb-8">
  <input
    type="text"
    placeholder="Cari pasaran..."
    class="w-full px-5 py-4 bg-[#222] rounded-xl text-white placeholder-gray-400 border border-gray-800 focus:outline-none focus:border-[#e62020] transition-colors"
    bind:value={searchQuery}
    on:input={handleSearch}
  />
  <svg 
    class="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
</div>

<!-- Market Cards Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {#if loading}
    {#each Array(6) as _, i}
      <div class="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
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
  {:else}
    {#if filteredMarkets.length > 0}
      {#each filteredMarkets as market}
        <div class="relative bg-[#1a1a1a] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-800 group">
          <!-- Market Name & Status -->
          {#each [getMarketStatus(market)] as status}
            <div class="flex items-center justify-between px-4 py-3 bg-[#222] border-b border-gray-800">
              <h3 class="text-xl font-bold text-white tracking-wide">{market.name}</h3>
              <span class={`px-3 py-1 rounded-md text-xs font-bold tracking-wider ${status.color} ${status.bg} ${status.border} border`}>
                {status.text}
              </span>
            </div>
          {/each}

          <!-- Image Container -->
          <div class="relative w-full h-52 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
            <img 
              src={market.image} 
              alt="Pasaran {market.name}"
              class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Schedule -->
            <div class="bg-[#222] rounded-xl p-5 mb-5 border border-gray-800/50">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                  <p class="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Jam Buka</p>
                  <p class="text-white text-xl font-bold">{market.buka}</p>
                </div>
                <div class="text-center border-l border-gray-700">
                  <p class="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Jam Tutup</p>
                  <p class="text-white text-xl font-bold">{market.tutup}</p>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="space-y-3">
              <MarketButton 
                text="SYARAT & KETENTUAN" 
                variant="default" 
                className="hover:bg-gray-700 text-sm font-medium tracking-wide py-3"
                on:click={() => handleShowTerms(market)}
              />
              <MarketButton 
                text="LINK RESMI" 
                variant="success" 
                className="hover:-translate-y-0.5 transform transition-transform text-sm font-medium tracking-wide py-3 shadow-lg"
                on:click={() => window.open(market.officialLink, '_blank')}
              />
              <MarketButton 
                text="IKUTI LOMBA" 
                variant="primary" 
                className="hover:-translate-y-0.5 transform transition-transform text-sm font-medium tracking-wide py-3 shadow-lg"
              />
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="col-span-full text-center py-8">
        <p class="text-gray-400 text-lg">Tidak ada pasaran yang sesuai dengan pencarian "{searchQuery}"</p>
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
{#if showTerms && selectedMarket}
  <div 
    class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm"
    on:click={handleCloseTerms}
    on:keydown={(e) => e.key === 'Escape' && handleCloseTerms()}
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal Container -->
    <div 
      class="min-h-screen p-4 flex items-center justify-center"
      on:click={handleCloseTerms}
      on:keydown={(e) => e.key === 'Escape' && handleCloseTerms()}
      role="dialog"
      aria-modal="true"
    >
      <div 
        class="relative w-full max-w-lg p-5 md:p-6 bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-xl transform transition-all"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="document"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
          <h3 class="text-lg md:text-xl font-bold text-white">Syarat & Ketentuan {selectedMarket.name}</h3>
          <button 
            class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            on:click={handleCloseTerms}
            aria-label="Tutup dialog"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <ul class="space-y-3">
            {#each selectedMarket.terms as term}
              <li 
                class="flex items-start text-gray-400 p-3 rounded-lg bg-[#222] border border-gray-800/50 text-sm md:text-base"
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
          
          <!-- Footer -->
          <div class="mt-8 pt-4 border-t border-gray-800 text-center">
            <button
              class="w-full md:w-auto px-6 py-2.5 bg-[#222] text-gray-400 rounded-lg hover:bg-gray-800 transition-colors text-sm md:text-base"
              on:click={handleCloseTerms}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if} 