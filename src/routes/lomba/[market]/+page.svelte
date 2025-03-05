<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';
  import type { Market } from '$lib/types/market';
  import { MetaTags } from 'svelte-meta-tags';
  import { formatDateForInput } from '$lib/utils/date';

  const baseUrl = import.meta.env.VITE_BASE_URL;

  export let data;
  // State untuk filter tanggal
  let selectedDate = '';  // Default kosong untuk menampilkan semua lomba
  
  $: ({ market, lomba } = data);

  // Gunakan $page.params.market untuk URL
  $: marketName = $page.params.market;

  let error = null;
  let guessNumber = '';
  let submitting = false;

  // Filter dan urutkan lomba berdasarkan tanggal
  $: filteredLomba = Array.isArray(lomba) ? lomba
    .filter(item => {
      if (!selectedDate) return true; // Tampilkan semua jika tidak ada filter
      return item.tanggal === selectedDate;
    })
    .sort((a, b) => {
      // Urutkan berdasarkan tanggal terbaru
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      return dateB.getTime() - dateA.getTime();
    }) : [];

  // Pagination
  let currentPage = 1;
  const itemsPerPage = 12;

  // Hitung total halaman
  $: totalPages = Math.ceil(filteredLomba.length / itemsPerPage);

  // Get items untuk halaman saat ini
  $: paginatedLomba = filteredLomba.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fungsi untuk navigasi halaman
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Reset halaman saat filter berubah
  $: if (selectedDate) {
    currentPage = 1;
  }

  // Generate array angka halaman yang akan ditampilkan
  $: pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Format tanggal untuk ditampilkan
  function formatDisplayDate(dateString: string) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  }

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
      if (!market?.id) {
        console.error('Market ID tidak tersedia');
        return;
      }

      // Hanya kirim parameter date jika ada filter tanggal
      const url = selectedDate 
        ? `/api/lomba/${market.id}?date=${selectedDate}`
        : `/api/lomba/${market.id}`;
        
      console.log('Fetching lomba from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      console.log('Received lomba data:', data);
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
  titleTemplate="TEBAK ANGKA | %s"
  description={market ? generateDescription(market.name) : 'Lomba tebak angka dengan hadiah menarik'}
  canonical={`${baseUrl}/lomba/${marketName}`}
  openGraph={{
    title: market ? `Lomba ${market.name} - Tebak Angka Berhadiah` : 'Lomba Tebak Angka',
    description: market ? generateDescription(market.name) : 'Lomba tebak angka dengan hadiah menarik',
    url: `${baseUrl}/lomba/${marketName}`,
    type: 'website',
    images: [
      {
        url: market?.image || `${baseUrl}/default-og.jpg`,
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
  <div class="min-h-screen bg-[#1a1a1a] pt-16 pb-16">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-gradient-to-b from-[#e62020]/5 to-transparent" />
        
        <div class="relative flex flex-col md:flex-row items-center justify-between gap-8 p-4 pt-10 md:p-8">
          <!-- Market Info -->
          <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-1">
            <div class="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-full border-4 border-[#e62020]/20">
              <div class="absolute inset-0 bg-gradient-to-br from-[#e62020]/20 to-transparent blur-xl" />
              <img
                src={market.image}
                alt={market.name}
                class="relative h-full w-full object-cover transform hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            <div class="text-center sm:text-left">
              <h1 class="text-xl sm:text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                {market.name}
              </h1>
              
              <!-- Market Status -->
              <div class="mt-3">
                <div class="inline-flex items-center gap-2 rounded-lg {status.bg} {status.border} border px-3 py-1.5 sm:px-4 sm:py-2">
                  <span class="h-2 w-2 rounded-full animate-pulse" class:bg-yellow-400={status.text === 'BELUM DIMULAI'} class:bg-green-400={status.text === 'BUKA'} class:bg-red-400={status.text === 'TUTUP'}></span>
                  <span class="{status.color} font-medium text-sm sm:text-base">{status.text}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule & Filter -->
          <div class="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
            <!-- Market Schedule -->
            <div class="flex gap-6 md:gap-8 items-center w-full md:w-auto justify-center md:justify-start">
              <div class="text-center">
                <p class="text-xs font-medium uppercase tracking-wider text-gray-400">Jam Buka</p>
                <p class="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">{market.buka}</p>
              </div>
              <div class="text-center">
                <p class="text-xs font-medium uppercase tracking-wider text-gray-400">Jam Tutup</p>
                <p class="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">{market.tutup}</p>
              </div>
            </div>

            <!-- Filter -->
            <div class="w-full md:w-auto">
              <div class="flex flex-col sm:flex-row items-center gap-3 rounded-lg bg-[#222] p-4 w-full">
                <label class="text-xs font-medium uppercase tracking-wider text-gray-400 whitespace-nowrap w-full sm:w-auto text-center sm:text-left">Pilih Tanggal:</label>
                <input
                  type="date"
                  bind:value={selectedDate}
                  on:change={refreshLomba}
                  class="w-full rounded-lg bg-[#1a1a1a] px-3 py-2 text-sm text-white border border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lomba Cards -->
      {#if filteredLomba.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 container mx-auto">
          {#each paginatedLomba as item}
            {@const lombaId = item.id}
            <div class="group relative overflow-hidden rounded-xl border border-gray-800/50 bg-gradient-to-br from-[#1a1a1a] to-[#222] hover:border-[#e62020]/30 transition-all duration-300 shadow-xl shadow-black/20 backdrop-blur-sm">
              <!-- Badge -->
              <div class="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-[#e62020] to-[#ff0000] px-4 py-2 text-sm font-semibold text-white shadow-lg">
                {item.guess_type}
              </div>

              <!-- Content -->
              <div class="p-4 space-y-3">
                <div>
                  <p class="text-xs font-medium uppercase tracking-wider text-gray-400">Tanggal</p>
                  <p class="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">
                    {formatDisplayDate(item.tanggal)}
                  </p>
                </div>

                <div>
                  <p class="text-xs font-medium uppercase tracking-wider text-gray-400">Hadiah</p>
                  <p class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e62020] to-[#ff0000]">
                    Rp {item.prize_pool.toLocaleString('id-ID')}
                  </p>
                </div>

                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-xs font-medium uppercase tracking-wider text-gray-400">Pemenang</p>
                    <p class="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">
                      {item.max_winner} orang
                    </p>
                  </div>

                  {#if item.result !== ""}
                    <div class="text-right">
                      <p class="text-xs font-medium uppercase tracking-wider text-gray-400">Hasil</p>
                      <p class="text-xl font-bold text-green-400">{item.result}</p>
                    </div>
                  {:else}
                    <div class="text-right">
                      <p class="text-xs font-medium uppercase tracking-wider text-gray-400">Status</p>
                      <p class="text-sm font-medium text-yellow-500">Belum Result</p>
                    </div>
                  {/if}
                </div>

                <!-- Tombol -->
                <a
                  href="/tebakan/{lombaId}"
                  class={`
                    mt-3 block w-full transform rounded-lg px-4 py-2.5 text-center font-semibold 
                    text-white transition-all duration-300 relative overflow-hidden
                    ${item.result === "" && getMarketStatus(market).text === 'BUKA' 
                      ? 'bg-gradient-to-r from-[#e62020] to-[#ff0000] hover:from-[#ff0000] hover:to-[#e62020] before:absolute before:inset-0 before:border-2 before:border-white/20 before:rounded-lg before:animate-pulse-border'
                      : 'bg-gradient-to-r from-[#e62020] to-[#ff0000] hover:from-[#ff0000] hover:to-[#e62020]'
                    }
                    hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#e62020]/20 
                    group
                  `}
                >
                  <span class="relative z-10 inline-flex items-center gap-2 text-sm">
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
            </div>
          {/each}
        </div>

        <!-- Pagination Navigation -->
        {#if totalPages > 1}
          <div class="flex justify-center items-center mt-8 gap-2">
            <!-- Previous Button -->
            <button
              class="px-3 py-2 rounded-lg bg-[#222] text-gray-400 hover:text-white hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              disabled={currentPage === 1}
              on:click={() => goToPage(currentPage - 1)}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Page Numbers -->
            {#each pageNumbers as pageNum}
              <button
                class="px-4 py-2 rounded-lg transition-all duration-300 {currentPage === pageNum 
                  ? 'bg-gradient-to-r from-[#e62020] to-[#ff0000] text-white' 
                  : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'}"
                on:click={() => goToPage(pageNum)}
              >
                {pageNum}
              </button>
            {/each}

            <!-- Next Button -->
            <button
              class="px-3 py-2 rounded-lg bg-[#222] text-gray-400 hover:text-white hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              disabled={currentPage === totalPages}
              on:click={() => goToPage(currentPage + 1)}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Page Info -->
          <div class="text-center mt-4 text-sm text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </div>
        {/if}
      {:else}
        <div class="text-center space-y-4">
          <div class="text-gray-400">
            {selectedDate 
              ? `Belum ada lomba tersedia untuk tanggal ${formatDisplayDate(selectedDate)}`
              : 'Belum ada lomba tersedia'}
          </div>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="text-center text-gray-400">
    Pasaran {marketName} tidak ditemukan
  </div>
{/if} 