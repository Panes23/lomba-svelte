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
  let marketName = $page.params.market;
  let selectedDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  let error = null;
  let guessNumber = '';
  let submitting = false;

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
    try {
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
  });

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

<div class="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
  <div class="container mx-auto px-4">
    {#if loading}
      <div class="flex justify-center">
        <Loading size={8} color="#e62020" />
      </div>
    {:else if market}
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
    {:else}
      <div class="text-center text-gray-400">
        Pasaran {marketName} tidak ditemukan
      </div>
    {/if}
  </div>
</div> 