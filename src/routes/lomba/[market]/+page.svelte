<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';
  import Loading from '$lib/components/Loading.svelte';
  import type { Market } from '$lib/types/market';
  import type { Lomba } from '$lib/types/lomba';
  import { MetaTags } from 'svelte-meta-tags';
  import { formatDateForInput } from '$lib/utils/date';

  export let data;
  // State untuk filter tanggal
  let selectedDate = formatDateForInput(new Date());
  
  $: ({ market, lomba } = data);

  // Gunakan $page.params.market untuk URL
  $: marketName = $page.params.market;

  let error = null;
  let guessNumber = '';
  let submitting = false;

  // Filter lomba berdasarkan tanggal
  $: filteredLomba = lomba.filter(item => {
    if (!selectedDate) return true;
    return item.tanggal === selectedDate;
  });

  // Reactive statement untuk status
  $: status = market ? getMarketStatus(market) : null;

  function getMarketStatus(market: Market) {
    const openTime = parseInt(market.buka.replace(':', ''));
    const closeTime = parseInt(market.tutup.replace(':', ''));
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    if (currentTime < openTime) return { text: 'BELUM DIMULAI', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
    if (currentTime >= openTime && currentTime < closeTime) return { text: 'BUKA', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
    return { text: 'TUTUP', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
  }

  // Fungsi untuk memperbarui data lomba
  async function refreshLomba() {
    try {
      const response = await fetch(`/api/lomba/${market.id}?date=${selectedDate}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      lomba = data;
    } catch (err) {
      console.error('Error refreshing lomba:', err);
      error = err.message;
    }
  }

  async function handleSubmit(lombaId: string) {
    if (!$user) {
      goto('/login');
      return;
    }

    try {
      submitting = true;
      
      const response = await fetch(`/api/lomba/${lombaId}/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: $user.id,
          guessNumber
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Refresh lomba list after successful submission
      await refreshLomba();
      guessNumber = '';
    } catch (err) {
      error = err.message;
      console.error('Error:', err);
    } finally {
      submitting = false;
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Fungsi untuk membuat deskripsi
  function generateDescription(marketName: string) {
    return `Ikuti lomba tebak angka ${marketName} dan menangkan hadiah jutaan rupiah. Tersedia lomba 2D, 3D, dan 4D dengan total hadiah hingga Rp 3.000.000. Daftar sekarang dan raih kesempatan menjadi pemenang!`;
  }
</script>

<style>
  @keyframes pulse-border {
    0% { border-color: rgba(255, 255, 255, 0.1); }
    50% { border-color: rgba(255, 255, 255, 0.3); }
    100% { border-color: rgba(255, 255, 255, 0.1); }
  }

  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes bounce-right {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(3px); }
  }

  :global(.animate-pulse-border) {
    animation: pulse-border 2s infinite;
  }

  :global(.animate-shine) {
    animation: shine 3s infinite;
  }

  :global(.animate-bounce-right) {
    animation: bounce-right 1s infinite;
  }
</style>

<MetaTags
  title={market ? `Lomba ${market.name} - Tebak Angka Berhadiah` : 'Lomba Tebak Angka'}
  titleTemplate="%s | TEBAK ANGKA"
  description={market ? generateDescription(market.name) : 'Lomba tebak angka dengan hadiah menarik'}
  canonical={`https://tebakangka.com/lomba/${marketName}`}
  openGraph={{
    title: market ? `Lomba ${market.name} - Tebak Angka Berhadiah` : 'Lomba Tebak Angka',
    description: market ? generateDescription(market.name) : 'Lomba tebak angka dengan hadiah menarik',
    url: `https://tebakangka.com/lomba/${marketName}`,
    type: 'website',
    images: [
      {
        url: market?.image || 'https://tebakangka.com/default-og.jpg',
        width: 1200,
        height: 630,
        alt: market ? `Lomba ${market.name}` : 'Lomba Tebak Angka'
      }
    ],
    siteName: 'TEBAK ANGKA'
  }}
  twitter={{
    cardType: 'summary_large_image',
    creator: '@tebakangka',
    site: '@tebakangka'
  }}
/>

<!-- Skeleton Loading -->
{#if error}
  <div class="text-center text-gray-400">
    {error}
  </div>
{:else if market}
  <div class="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <div class="relative mb-16">
        <!-- Decorative Background -->
        <div class="absolute inset-0 bg-gradient-to-b from-[#e62020]/5 to-transparent" />
        <div class="absolute -top-20 left-1/2 w-full max-w-[500px] aspect-square bg-[#e62020]/5 rounded-full blur-3xl transform -translate-x-1/2" />
      
        <div class="relative container mx-auto px-4 pt-8 pb-12 overflow-hidden">
          <div class="relative mx-auto mb-8 h-40 w-40 overflow-hidden rounded-full border-4 border-[#e62020]/20">
            <div class="absolute inset-0 bg-gradient-to-br from-[#e62020]/20 to-transparent blur-xl" />
            <img
              src={market.image}
              alt={market.name}
              class="relative h-full w-full object-cover transform hover:scale-110 transition-transform duration-500"
            />
          </div>
          
          <h1 class="mb-6 text-center text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
            {market.name}
          </h1>

          <!-- Market Status -->
          {#if market}
            <div class="mb-6 md:mb-8 flex justify-center">
              <div class="flex items-center gap-2 rounded-lg {status.bg} {status.border} border px-4 py-2">
                <span class="h-2 w-2 rounded-full animate-pulse" class:bg-yellow-400={status.text === 'BELUM DIMULAI'} class:bg-green-400={status.text === 'BUKA'} class:bg-red-400={status.text === 'TUTUP'}></span>
                <span class="{status.color} font-medium">{status.text}</span>
              </div>
            </div>
          {/if}

          <!-- Market Schedule -->
          <div class="mx-auto flex max-w-sm justify-center gap-6 md:gap-12 text-center">
            <div>
              <p class="text-sm font-medium uppercase tracking-wider text-gray-400 mb-2">Jam Buka</p>
              <p class="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">{market.buka}</p>
            </div>
            <div>
              <p class="text-sm font-medium uppercase tracking-wider text-gray-400 mb-2">Jam Tutup</p>
              <p class="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">{market.tutup}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="mb-12">
        <div class="mx-auto max-w-md px-4">
          <div class="flex items-center gap-4 rounded-lg bg-[#222] p-4">
            <label class="text-xs md:text-sm font-medium uppercase tracking-wider text-gray-400">Pilih Tanggal:</label>
            <input
              type="date"
              bind:value={selectedDate}
              on:change={refreshLomba}
              class="flex-1 rounded-lg bg-[#1a1a1a] px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-white border border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <!-- Lomba Cards -->
      {#if filteredLomba.length > 0}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 container mx-auto px-4">
          {#each filteredLomba as item}
            {@const lombaId = item.id}
            <div class="group relative overflow-hidden rounded-xl border border-gray-800/50 bg-gradient-to-br from-[#1a1a1a] to-[#222] p-6 hover:border-[#e62020]/30 transition-all duration-300 shadow-xl shadow-black/20 backdrop-blur-sm">
              <!-- Decorative Elements -->
              <div class="absolute inset-0 bg-gradient-to-br from-[#e62020]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div class="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#e62020]/5 blur-3xl group-hover:bg-[#e62020]/10 transition-all duration-500" />
              
              <!-- Badge -->
              <div class="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-[#e62020] to-[#ff0000] px-4 py-2 text-sm font-semibold text-white shadow-lg">
                {item.guess_type}
              </div>

              <!-- Content -->
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Tanggal</p>
                  <p class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div>
                  <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Hadiah</p>
                  <p class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e62020] to-[#ff0000]">
                    Rp {item.prize_pool.toLocaleString('id-ID')}
                  </p>
                </div>

                <div>
                  <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Total Pemenang</p>
                  <p class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">
                    {item.max_winner} orang
                  </p>
                </div>

                {#if item.result !== ""}
                  <div>
                    <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Hasil</p>
                    <p class="text-3xl font-bold text-green-400">{item.result}</p>
                  </div>
                {:else}
                  <div>
                    <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1 mt-6">Hasil</p>
                    <p class="text-lg font-medium text-yellow-500">Belum Result</p>
                  </div>
                {/if}
              </div>

              <!-- Tombol Ikuti Lomba -->
              <a
                href="/tebakan/{lombaId}"
                class={`
                  mt-6 block w-full transform rounded-lg px-4 py-3 text-center font-semibold 
                  text-white transition-all duration-300 relative overflow-hidden
                  ${item.result === "" && getMarketStatus(market).text === 'BUKA' 
                    ? 'bg-gradient-to-r from-[#e62020] to-[#ff0000] hover:from-[#ff0000] hover:to-[#e62020] before:absolute before:inset-0 before:border-2 before:border-white/20 before:rounded-lg before:animate-pulse-border after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/10 after:to-transparent after:animate-shine after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-1000'
                    : 'bg-gradient-to-r from-[#e62020] to-[#ff0000] hover:from-[#ff0000] hover:to-[#e62020]'
                  }
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#e62020]/20 
                  group
                `}
              >
                <span class="relative z-10 inline-flex items-center gap-2">
                  {item.result !== "" || getMarketStatus(market).text !== 'BUKA' 
                    ? 'Detail Lomba' 
                    : 'Ikuti Lomba'
                  }
                  {#if item.result === "" && getMarketStatus(market).text === 'BUKA'}
                    <svg 
                      class="w-4 h-4 animate-bounce-right" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  {/if}
                </span>
              </a>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center text-gray-400">
          Belum ada lomba tersedia untuk tanggal {new Date(selectedDate).toLocaleDateString('id-ID')}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="text-center text-gray-400">
    Pasaran {marketName} tidak ditemukan
  </div>
{/if} 