<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Loading from '$lib/components/Loading.svelte';
  import type { Market } from '$lib/types/market';
  import type { Lomba } from '$lib/types/lomba';
  import { MetaTags } from 'svelte-meta-tags';

  export let data;

  let loading = true;
  let lomba: Lomba[] = [];
  let market: Market | null = null;
  $: marketName = $page.params.market;
  let selectedDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  let error = null;
  let guessNumber = '';
  let submitting = false;

  function getMarketStatus(market: Market) {
    const openTime = parseInt(market.buka.replace(':', ''));
    const closeTime = parseInt(market.tutup.replace(':', ''));
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    if (currentTime < openTime) return { text: 'BELUM DIMULAI', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
    if (currentTime >= openTime && currentTime < closeTime) return { text: 'BUKA', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
    return { text: 'TUTUP', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
  }

  // Fungsi untuk memuat ulang data
  async function reloadData() {
    try {
      loading = true;
      error = null;
      
      const marketRes = await fetch(`/api/market/${marketName}`);
      const marketData = await marketRes.json();
      
      if (!marketRes.ok) throw new Error(marketData.error);
      
      market = marketData;
      
      await fetchLomba();
    } catch (err) {
      error = err.message;
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  }

  async function fetchLomba() {
    try {
      if (!market) return;
      
      const response = await fetch(`/api/lomba/${market.id}?date=${selectedDate}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
  
      lomba = data;
    } catch (err) {
      error = err.message;
      console.error('Error:', err);
    }
  }

  onMount(async () => {
    await reloadData();
  });

  // Reaktif terhadap perubahan marketName
  $: if (marketName) {
    reloadData();
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
      await fetchLomba();
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
{#if loading}
  <div class="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
    <div class="container mx-auto px-4">
      <!-- Header Skeleton -->
      <div class="mb-12 text-center animate-pulse">
        <div class="relative mx-auto mb-8 h-40 w-40 overflow-hidden rounded-full bg-gray-800" />
        <div class="h-8 w-64 mx-auto bg-gray-800 rounded-lg mb-4" />
        <div class="mx-auto flex max-w-sm justify-center gap-8 text-center">
          <div class="flex-1">
            <div class="h-4 w-20 bg-gray-800 rounded mb-2 mx-auto" />
            <div class="h-6 w-16 bg-gray-800 rounded mx-auto" />
          </div>
          <div class="flex-1">
            <div class="h-4 w-20 bg-gray-800 rounded mb-2 mx-auto" />
            <div class="h-6 w-16 bg-gray-800 rounded mx-auto" />
          </div>
        </div>
      </div>

      <!-- Filter Skeleton -->
      <div class="mb-8">
        <div class="mx-auto max-w-sm">
          <div class="h-14 bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>

      <!-- Lomba Cards Skeleton -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each Array(6) as _}
          <div class="relative overflow-hidden rounded-xl border border-gray-800 bg-[#222] p-6 animate-pulse">
            <!-- Badge Skeleton -->
            <div class="absolute right-0 top-0 w-16 h-6 rounded-bl-lg bg-gray-800" />

            <div class="mb-6 space-y-4">
              <div>
                <div class="h-4 w-16 bg-gray-800 rounded mb-2" />
                <div class="h-6 w-48 bg-gray-800 rounded" />
              </div>

              <div>
                <div class="h-4 w-16 bg-gray-800 rounded mb-2" />
                <div class="h-8 w-32 bg-gray-800 rounded" />
              </div>

              <div>
                <div class="h-4 w-32 bg-gray-800 rounded mb-2" />
                <div class="h-6 w-24 bg-gray-800 rounded" />
              </div>
            </div>

            <!-- Button Skeleton -->
            <div class="h-12 w-full bg-gray-800 rounded-lg" />
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if error}
  <div class="text-center text-gray-400">
    {error}
  </div>
{:else if market}
  <div class="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
    <div class="container mx-auto px-4">
      <!-- Header Section -->
      <div class="mb-12 text-center">
        <div class="relative mx-auto mb-8 h-40 w-40 overflow-hidden rounded-full border-4 border-[#e62020]/20">
          <img
            src={market.image}
            alt={market.name}
            class="h-full w-full object-cover"
          />
        </div>
        <h1 class="mb-4 text-4xl font-bold text-white md:text-5xl">
          Lomba {market.name}
        </h1>
        
        <!-- Market Status -->
        {#if market}
          {@const status = getMarketStatus(market)}
          <div class="mb-6 flex justify-center">
            <div class="flex items-center gap-2 rounded-lg {status.bg} {status.border} border px-4 py-2">
              <span class="h-2 w-2 rounded-full animate-pulse" class:bg-yellow-400={status.text === 'BELUM DIMULAI'} class:bg-green-400={status.text === 'BUKA'} class:bg-red-400={status.text === 'TUTUP'}></span>
              <span class="{status.color} font-medium">{status.text}</span>
            </div>
          </div>
        {/if}
        
        <div class="mx-auto flex max-w-sm justify-center gap-8 text-center">
          <div>
            <p class="text-sm font-medium uppercase tracking-wider text-gray-400">Jam Buka</p>
            <p class="text-xl font-bold text-white">{market.buka}</p>
          </div>
          <div>
            <p class="text-sm font-medium uppercase tracking-wider text-gray-400">Jam Tutup</p>
            <p class="text-xl font-bold text-white">{market.tutup}</p>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="mb-8">
        <div class="mx-auto max-w-sm">
          <div class="flex items-center gap-4 rounded-lg bg-[#222] p-4">
            <label class="text-sm font-medium text-gray-400">Pilih Tanggal:</label>
            <input
              type="date"
              bind:value={selectedDate}
              on:change={fetchLomba}
              class="flex-1 rounded-lg bg-[#1a1a1a] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#e62020]"
            />
          </div>
        </div>
      </div>

      <!-- Lomba Cards -->
      {#if lomba.length > 0}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each lomba as item}
            <div class="relative overflow-hidden rounded-xl border border-gray-800 bg-[#222] p-6">
              <!-- Badge -->
              <div class="absolute right-0 top-0 rounded-bl-lg bg-[#e62020] px-4 py-1 text-sm font-semibold text-white">
                {item.guess_type}
              </div>

              <div class="mb-6 space-y-4">
                <div>
                  <p class="text-sm text-gray-400">Tanggal</p>
                  <p class="text-lg font-semibold text-white">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-400">Hadiah</p>
                  <p class="text-2xl font-bold text-[#e62020]">
                    {formatCurrency(item.prize_pool)}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-400">Maksimal Pemenang</p>
                  <p class="text-white">{item.max_winner} orang</p>
                </div>
              </div>

              {#if item.result !== null}
                <div class="mb-4 rounded-lg bg-green-500/10 p-4 text-center">
                  <p class="text-sm font-medium text-gray-400">Hasil</p>
                  <p class="text-2xl font-bold text-green-500">{item.result}</p>
                </div>
              {:else}
                <button class="w-full transform rounded-lg bg-[#e62020] py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#ff0000] hover:shadow-lg">
                  Ikuti Lomba
                </button>
              {/if}
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