<script lang="ts">
  import { user } from '$lib/stores/authStore';
  import { fetchData } from '$lib/api';
  import Swal from '$lib/utils/swal';
  import { goto } from '$app/navigation';
  import { supabaseClient } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import { tebakanStore } from '$lib/stores/tebakanStore';
  import { browser } from '$app/environment';
  import type { Market } from '$lib/types/market';
  import type { PageData } from './$types';
  import { writable } from 'svelte/store';

  const baseUrl = import.meta.env.VITE_BASE_URL;
  
  // Definisikan tipe untuk website
  interface Website {
    id: string;
    nama: string;
    link_website: string;
    color: string;
  }

  // Fungsi untuk mendapatkan warna website
  function getWebsiteColor(website: Website): string {
    // Hapus prefix '#' jika ada
    const color = website.color?.replace('#', '');
    return color ? `text-[#${color}]` : 'text-gray-400';
  }

  // Fungsi untuk mendapatkan warna hover
  function getHoverColor(website: Website): string {
    const color = website.color?.replace('#', '');
    return color ? `hover:text-[#${color}]/80` : 'hover:text-gray-400/80';
  }

  // Fungsi untuk mendapatkan status market
  function getMarketStatus(market: Market) {
    if (!market?.buka || !market?.tutup) return { 
      text: 'LOADING', 
      color: 'text-gray-400', 
      bg: 'bg-gray-400/10', 
      border: 'border-gray-400/20' 
    };
    
    // Jika result sudah ada, return status SELESAI
    if (lomba?.result !== "") return {
      text: 'SELESAI',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20'
    };
    
    const openTime = parseInt(market.buka.replace(':', ''));
    const closeTime = parseInt(market.tutup.replace(':', ''));
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    if (currentTime < openTime) return { text: 'BELUM DIMULAI', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
    if (currentTime >= openTime && currentTime < closeTime) return { text: 'BUKA', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
    return { text: 'TUTUP', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
  }

  // Fungsi untuk mengecek apakah tebakan menang
  function isWinningGuess(guess: string, result: string, guessType: string): boolean {
    // Hapus tanda - dari tebakan
    const cleanGuess = guess.replace(/-/g, '');
    
    switch(guessType.toLowerCase()) {
      case '4d':
        return cleanGuess === result;
      case '3d':
        // Ambil 3 digit terakhir
        return cleanGuess === result.slice(-3);
      case '2d':
        // Ambil 2 digit terakhir
        return cleanGuess === result.slice(-2);
      default:
        return false;
    }
  }

  // Buat store untuk lomba dan websites
  const lombaStore = writable(null);
  const websitesStore = writable([]);
  const tebakanInitialStore = writable([]);
  
  export let data: PageData;
  $: {
    // Update store saat data berubah
    const { lomba: initialLomba, websites: initialWebsites, tebakan: initialTebakan } = data;
    if (initialLomba) {
      lombaStore.set(initialLomba);
    }
    if (initialWebsites) {
      websitesStore.set(initialWebsites);
    }
    if (initialTebakan) {
      tebakanInitialStore.set(initialTebakan);
    }
  }
  
  // Subscribe ke store
  $: lomba = $lombaStore;
  $: websites = $websitesStore;
  $: tebakan = $tebakanStore;
  let error = null;
  
  // State untuk list tebakan dan form visibility
  let showForm = false;
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 10;
  let isLoading = true;
  
  // Form data
  let selectedWebsite = '';
  let userIdWebsite = '';
  let number1 = '';
  let number2 = '';
  let number3 = '';
  let submitting = false;

  // Filtered tebakan berdasarkan search
  $: filteredTebakan = tebakan.filter(item => 
    item.userid_website.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  $: totalPages = Math.ceil(filteredTebakan.length / itemsPerPage);
  $: paginatedTebakan = filteredTebakan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;
  
  function changePage(page: number) {
    currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Format tanggal
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    };
    
    return date.toLocaleString('id-ID', options).replace('.', ':').replace('.', ':');
  }

  let subscription;
  
  onMount(() => {
    if (browser) {
      tebakanStore.set($tebakanInitialStore);
      isLoading = false;
    }
    
    if (!lomba?.id) return;
    
    subscription = supabaseClient
      .channel('realtime-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tebakan',
          filter: `lomba_id=eq.${lomba.id}`
        },
        async (payload) => {
          const { data: newTebakan } = await supabaseClient
            .from('tebakan')
            .select(`
              *,
              websites (
                id,
                nama,
                link_website,
                color
              )
            `)
            .eq('lomba_id', lomba.id)
            .order('created_at', { ascending: false });

          if (newTebakan) {
            tebakanStore.set(newTebakan);
            tebakan = newTebakan;
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lomba',
          filter: `id=eq.${lomba.id}`
        },
        async (payload) => {
          const { data: updatedLomba } = await supabaseClient
            .from('lomba')
            .select(`
              *,
              markets (
                id,
                name,
                buka,
                tutup,
                image
              )
            `)
            .eq('id', lomba.id)
            .single();
          
          if (updatedLomba) {
            lombaStore.set(updatedLomba);
          }
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabaseClient.removeChannel(subscription);
      }
    };
  });

  // Reactive statement untuk status
  $: status = getMarketStatus(lomba.markets);

  // Reactive statement untuk memastikan data tersedia
  $: isDataReady = !isLoading && websites && websites.length > 0;

  // Fungsi untuk mendapatkan max length berdasarkan guess_type
  function getMaxLength(guessType: string): number {
    switch(guessType.toLowerCase()) {
      case '4d': return 4;
      case '3d': return 3;
      case '2d': return 2;
      default: return 4;
    }
  }

  // Fungsi untuk memvalidasi input hanya angka dan sesuai max length
  function validateNumberInput(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Hanya izinkan angka
    if (!/^\d*$/.test(value)) {
      input.value = value.replace(/[^\d]/g, '');
    }
    
    // Batasi panjang input
    if (value.length > maxLength) {
      input.value = value.slice(0, maxLength);
    }
  }

  async function handleSubmit() {
    if (!selectedWebsite || !userIdWebsite || !number1 || !number2 || !number3) {
      error = 'Semua field harus diisi';
      return;
    }

    // Cek apakah user sudah pernah memasang tebakan dengan website dan userid yang sama
    const existingTebakan = tebakan.find(t => 
      t.website_id === selectedWebsite && 
      t.userid_website.toLowerCase() === userIdWebsite.toLowerCase()
    );
    
    if (existingTebakan) {
      await Swal.fire({
        title: 'Gagal!',
        text: 'Anda sudah melakukan tebakan di website ini dengan User ID yang sama',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff',
        allowOutsideClick: false,
        didClose: () => {
          // Reset form fields
          selectedWebsite = '';
          userIdWebsite = '';
        }
      });
      return;
    }

    // Gabungkan nomor dengan format yang diinginkan
    const combinedNumber = `${number1}-${number2}-${number3}`;

    try {
      submitting = true;
      error = null;

      const result = await fetchData('tebakan', 'POST', {
        lomba_id: lomba.id,
        website_id: selectedWebsite,
        userid_website: userIdWebsite,
        number: combinedNumber
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Reset form
      selectedWebsite = '';
      userIdWebsite = '';
      number1 = '';
      number2 = '';
      number3 = '';
      showForm = false;
      
      // Fetch data terbaru langsung dari Supabase
      const { data: newTebakan, error: fetchError } = await supabaseClient
        .from('tebakan')
        .select(`
          *,
          websites (
            id,
            nama,
            link_website,
            color
          )
        `)
        .eq('lomba_id', lomba.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Update store dan local state
      tebakanStore.set(newTebakan);
      tebakan = newTebakan;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Tebakan Anda telah berhasil dipasang',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff',
        allowOutsideClick: false,
        willClose: () => {
          if (browser) {
            window.location.reload();
          }
        }
      });

    } catch (err) {
      console.error('Error submitting tebakan:', err);
      error = err.message;
      
      await Swal.fire({
        title: 'Gagal!',
        text: error,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff'
      });
    } finally {
      submitting = false;
    }
  }

  // Reactive statement untuk mendapatkan pemenang
  $: winners = lomba?.result ? tebakan
    .filter(t => {
      // Split nomor tebakan menjadi array
      const guesses = t.number.split('-');
      // Cek setiap line tebakan
      return guesses.some(guess => isWinningGuess(guess, lomba.result, lomba.guess_type));
    })
    // Urutkan berdasarkan waktu posting (ascending)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    // Batasi jumlah pemenang sesuai max_winner
    .slice(0, lomba.max_winner)
    : [];
</script>

<svelte:head>
  {#if lomba}
    <!-- Primary Meta Tags -->
    <title>Lomba {lomba.markets?.name || 'Loading...'} {lomba.guess_type} | TEBAK ANGKA</title>
    <meta name="title" content="Lomba {lomba.markets?.name || 'Loading...'} {lomba.guess_type} | TEBAK ANGKA">
    <meta name="description" content="Ikuti lomba tebak angka {lomba.markets?.name} {lomba.guess_type} dengan total hadiah Rp {lomba.prize_pool?.toLocaleString('id-ID')}. Pasang tebakan Anda dan menangkan hadiah menarik!">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content={`${baseUrl}/tebakan/${lomba.id}`}>
    <meta property="og:title" content="Lomba {lomba.markets?.name} {lomba.guess_type} | TEBAK ANGKA">
    <meta property="og:description" content="Ikuti lomba tebak angka {lomba.markets?.name} {lomba.guess_type} dengan total hadiah Rp {lomba.prize_pool?.toLocaleString('id-ID')}. Pasang tebakan Anda dan menangkan hadiah menarik!">
    <meta property="og:image" content={`${baseUrl}/og-image.png`}>

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content={`${baseUrl}/tebakan/${lomba.id}`}>
    <meta property="twitter:title" content="Lomba {lomba.markets?.name} {lomba.guess_type} | TEBAK ANGKA">
    <meta property="twitter:description" content="Ikuti lomba tebak angka {lomba.markets?.name} {lomba.guess_type} dengan total hadiah Rp {lomba.prize_pool?.toLocaleString('id-ID')}. Pasang tebakan Anda dan menangkan hadiah menarik!">
    <meta property="twitter:image" content={`${baseUrl}/twitter-card.png`}>

    <!-- Additional SEO Meta Tags -->
    <meta name="keywords" content="tebak angka, {lomba.markets?.name?.toLowerCase()}, {lomba.guess_type}, lomba tebak angka, togel online">
    <meta name="robots" content="index, follow">
    <meta name="language" content="Indonesian">
    <meta name="revisit-after" content="7 days">
    <meta name="author" content="TEBAK ANGKA">
    
    <!-- Canonical URL -->
    <link rel="canonical" href={`${baseUrl}/tebakan/${lomba.id}`}>
  {/if}
</svelte:head>

<div class="min-h-screen bg-[#1a1a1a] pt-24 pb-12">
  <div class="container mx-auto px-2 sm:px-4 max-w-6xl">
    {#if error}
      <div class="text-center text-red-500">{error}</div>
    {:else if lomba}
      <div class="w-full">
        <!-- Header Section dengan Info Detail -->
        <div class="bg-[#222] rounded-lg sm:rounded-2xl p-3 sm:p-8 mb-3 sm:mb-8 shadow-xl">
          <h1 class="text-3xl font-bold text-white mb-6 text-center">
            {lomba?.markets?.name || 'Loading...'}
          </h1>
          
          <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-4 sm:mb-8">
            <div class="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <p class="text-sm text-gray-400 mb-1">Tipe Lomba</p>
              <p class="text-base sm:text-xl font-bold text-white">{lomba.guess_type}</p>
            </div>
            
            <div class="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <p class="text-sm text-gray-400 mb-1">Total Hadiah</p>
              <p class="text-base sm:text-xl font-bold text-[#e62020]">
                Rp {lomba.prize_pool.toLocaleString('id-ID')}
              </p>
            </div>
            
            <div class="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <p class="text-sm text-gray-400 mb-1">Total Pemenang</p>
              <p class="text-base sm:text-xl font-bold text-white">{lomba.max_winner} orang</p>
            </div>
            
            <div class="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <p class="text-sm text-gray-400 mb-1">Tanggal</p>
              <p class="text-base sm:text-xl font-bold text-white">
                {new Date(lomba.tanggal).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
          
          <!-- Result Section -->
          <div class="bg-gradient-to-br from-[#1a1a1a] to-[#222] p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-800 text-center shadow-lg">
            <p class="text-sm text-gray-400 mb-2">Hasil</p>
            {#if lomba.result !== ""}
              <p class="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e62020] to-[#ff0000] text-transparent bg-clip-text">{lomba.result}</p>
            {:else}
              <p class="text-xl sm:text-2xl text-gray-600 font-medium">Belum Result</p>
            {/if}
          </div>

          <!-- Market Schedule & Status -->
          <div class="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            <!-- Jam Buka -->
            <div class="bg-gradient-to-br from-[#1a1a1a] to-[#222] p-4 rounded-lg border border-gray-800 text-center">
              <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Jam Buka</p>
              <p class="text-sm sm:text-lg font-bold text-white">{lomba.markets.buka}</p>
            </div>
            
            <!-- Status -->
            <div class="bg-gradient-to-br from-[#1a1a1a] to-[#222] p-4 rounded-lg border border-gray-800 text-center">
              <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Status</p>
              <div class="flex items-center justify-center gap-2">
                <span class="h-2 w-2 rounded-full animate-pulse" 
                  class:bg-yellow-400={status.text === 'BELUM DIMULAI'} 
                  class:bg-green-400={status.text === 'BUKA'} 
                  class:bg-red-400={status.text === 'TUTUP'}
                  class:bg-blue-400={status.text === 'SELESAI'}
                />
                <span class="{status.color} text-sm sm:text-base font-medium">{status.text}</span>
              </div>
            </div>
            
            <!-- Jam Tutup -->
            <div class="bg-gradient-to-br from-[#1a1a1a] to-[#222] p-4 rounded-lg border border-gray-800 text-center">
              <p class="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Jam Tutup</p>
              <p class="text-sm sm:text-lg font-bold text-white">{lomba.markets.tutup}</p>
            </div>
          </div>

          <!-- Winners Section -->
          {#if lomba.result !== ""}
            <div class="mt-4 sm:mt-6 bg-gradient-to-br from-[#1a1a1a] to-[#222] p-3 sm:p-6 rounded-lg sm:rounded-xl border border-gray-800 shadow-lg">
              <div class="flex justify-between items-center mb-4">
                <p class="text-xs sm:text-sm text-gray-400">Pemenang</p>
                <p class="text-xs sm:text-sm text-gray-400">
                  {winners.length} dari {lomba.max_winner} pemenang
                </p>
              </div>
              
              {#if winners.length > 0}
                <div class="space-y-2 sm:space-y-3">
                  {#each winners as winner, index}
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-gray-800/50 hover:bg-[#1a1a1a]/80 transition-colors gap-3 sm:gap-0">
                      <!-- Kiri: Ranking & User Info -->
                      <div class="flex items-center gap-3">
                        <div class="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#222] border border-gray-800 flex items-center justify-center">
                          <span class="text-[#FFD700] text-xs sm:text-sm font-bold">#{index + 1}</span>
                        </div>
                        <div>
                          <p class="text-white text-sm sm:text-base font-medium">{winner.userid_website}</p>
                          <div class="flex items-center gap-2">
                            <a 
                              href={winner.websites.link_website} 
                              target="_blank" 
                              style="color: {winner.websites.color}"
                              class="text-xs sm:text-sm hover:opacity-80 transition-colors inline-flex items-center gap-2"
                            >
                              {winner.websites.nama}
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <span class="text-xs text-gray-500">•</span>
                            <span class="text-[10px] sm:text-xs text-gray-500">{formatDate(winner.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Kanan: Nomor Tebakan -->
                      <div class="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2 sm:mt-0">
                        {#each winner.number.split('-') as num}
                          <div class="bg-[#222] rounded px-2 sm:px-3 py-1 sm:py-1.5 text-center border border-gray-800/50
                            {num === lomba.result.slice(-lomba.guess_type.slice(0,1)) ? 'border-green-500/30 bg-green-500/5' : ''}">
                            <span class="text-xs sm:text-sm font-medium 
                              {num === lomba.result.slice(-lomba.guess_type.slice(0,1)) ? 'text-green-500' : 'text-gray-400'}">
                              {num}
                            </span>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="text-center py-8">
                  <p class="text-gray-400">Belum ada pemenang</p>
                  <p class="text-sm text-gray-500 mt-1">Tetap semangat untuk mencoba lagi!</p>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Daftar Tebakan -->
        <div class="bg-[#222] rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h2 class="text-lg sm:text-xl font-bold text-white">Daftar Tebakan</h2>
            <div class="flex items-center gap-4 w-full md:w-auto">
              <!-- Search Bar -->
              <div class="relative flex-1 md:w-64">
                <input
                  type="text"
                  bind:value={searchQuery}
                  placeholder="Cari User ID..."
                  class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent"
                />
                <svg 
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {#if status.text === 'BUKA' && !lomba.result}
              <button
                on:click={async () => {
                  if (!$user) {
                    const result = await Swal.fire({
                      title: 'Silahkan Login atau Daftar',
                      text: 'Untuk memasang tebakan, Anda harus login terlebih dahulu',
                      icon: 'info',
                      showCancelButton: true,
                      confirmButtonText: 'Login',
                      cancelButtonText: 'Daftar',
                      confirmButtonColor: '#e62020',
                      cancelButtonColor: '#333',
                      background: '#222',
                      color: '#fff'
                    });
                    
                    if (result.isConfirmed) {
                      goto('/login');
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                      goto('/register');
                    }
                    return;
                  }
                  showForm = true;
                }}
                class="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#e62020] to-[#ff0000] text-white rounded-lg hover:from-[#ff0000] hover:to-[#e62020] transition-all duration-300 font-medium whitespace-nowrap flex items-center gap-2 text-sm sm:text-base"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Pasang Tebakan
              </button>
              {/if}
            </div>
          </div>
          
          {#if filteredTebakan.length > 0}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
              {#each paginatedTebakan as item}
                <div class="bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-lg p-3 sm:p-4 border border-gray-800 hover:border-[#e62020]/30 transition-all duration-300 shadow-lg">
                  <!-- Website Info -->
                  <div class="flex items-start justify-between mb-2 sm:mb-3">
                    <div>
                      {#if isDataReady}
                        <a 
                          href={item.websites.link_website} 
                          style="color: {item.websites?.color || '#fff'}" 
                          class="hover:opacity-80 transition-colors duration-200 inline-flex items-center gap-2"
                          target="_blank"
                        >
                          <span class="text-sm sm:text-base font-semibold">{item.websites.nama}</span>
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <p class="text-[11px] text-gray-500 mt-0.5">ID: <span class="text-white font-medium">{item.userid_website}</span></p>
                      {:else}
                        <div class="h-5 w-24 bg-gray-800 animate-pulse rounded"></div>
                      {/if}
                    </div>
                    <p class="text-[10px] sm:text-xs text-gray-500">{formatDate(item.created_at)}</p>
                  </div>

                  <!-- Number Display -->
                  <div class="bg-[#1a1a1a]/50 rounded-lg p-2 sm:p-3 text-center border border-gray-800/50">
                    <div class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#e62020] to-[#ff0000] text-transparent bg-clip-text tracking-wider">
                      {item.number.split('-').join(' - ')}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
            
            <!-- Pagination Controls -->
            {#if totalPages > 1}
              <div class="flex justify-center items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
                <button
                  on:click={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  class="px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-lg bg-[#1a1a1a] text-white border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#e62020]/30 transition-all duration-300"
                >
                  &lt;
                </button>
                
                {#each Array(totalPages) as _, i}
                  <button
                    on:click={() => changePage(i + 1)}
                    class="px-2 sm:px-3 py-1 text-sm sm:text-base rounded-lg {currentPage === i + 1 ? 'bg-[#e62020] text-white' : 'bg-[#1a1a1a] text-white border border-gray-800 hover:border-[#e62020]/30'}"
                  >
                    {i + 1}
                  </button>
                {/each}
                
                <button
                  on:click={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  class="px-2 sm:px-3 py-1 text-sm sm:text-base rounded-lg bg-[#1a1a1a] text-white border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#e62020]/30"
                >
                  &gt;
                </button>
              </div>
            {/if}
          {:else}
            <p class="text-center text-gray-400 py-8">
              {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada tebakan'}
            </p>
          {/if}
        </div>

        <!-- Form Modal -->
        {#if showForm}
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-[#222] rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-bold text-white">Pasang Tebakan</h3>
                <button 
                  on:click={() => showForm = false}
                  class="text-gray-400 hover:text-white"
                  aria-label="Close form"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Hanya tampilkan form jika status BUKA -->
              {#if status.text === 'BUKA'}
                <!-- Form fields -->
                <div class="space-y-6">
                  <!-- Website Selection -->
                  <div>
                    <label 
                      for="website-select"
                      class="block text-sm font-medium text-gray-400 mb-2"
                    >
                      Pilih Website
                    </label>
                    <select
                      id="website-select"
                      bind:value={selectedWebsite}
                      class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent"
                      disabled={!isDataReady}
                    >
                      <option value="">Pilih Website</option>
                      {#if isDataReady}
                      {#each websites as website}
                        <option 
                          value={website.id} 
                          style="color: {website.color}"
                        >
                          {website.nama}
                        </option>
                      {/each}
                      {/if}
                    </select>
                  </div>

                  <!-- User ID -->
                  <div>
                    <label 
                      for="userid"
                      class="block text-sm font-medium text-gray-400 mb-2"
                    >
                      User ID Website
                    </label>
                    <input
                      id="userid"
                      type="text"
                      bind:value={userIdWebsite}
                      placeholder="Masukkan User ID"
                      class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent"
                    />
                  </div>

                  <!-- Number Input -->
                  <div>
                    <label 
                      class="block text-sm font-medium text-gray-400 mb-2"
                    >
                      Nomor Tebakan
                    </label>
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="text"
                          bind:value={number1}
                          maxlength={getMaxLength(lomba.guess_type)}
                          on:input={(e) => validateNumberInput(e, getMaxLength(lomba.guess_type))}
                          placeholder={lomba.guess_type}
                          class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent text-center"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          bind:value={number2}
                          maxlength={getMaxLength(lomba.guess_type)}
                          on:input={(e) => validateNumberInput(e, getMaxLength(lomba.guess_type))}
                          placeholder={lomba.guess_type}
                          class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent text-center"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          bind:value={number3}
                          maxlength={getMaxLength(lomba.guess_type)}
                          on:input={(e) => validateNumberInput(e, getMaxLength(lomba.guess_type))}
                          placeholder={lomba.guess_type}
                          class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent text-center"
                        />
                      </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">
                      Format: {lomba.guess_type} (Contoh: {lomba.guess_type === '4D' ? '1234' : lomba.guess_type === '3D' ? '123' : '12'})
                    </p>
                  </div>

                  <!-- Submit Button -->
                  <div class="flex gap-4">
                    <button
                      on:click={() => showForm = false}
                      class="w-1/2 py-3 font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300"
                    >
                      Batal
                    </button>
                    <button
                      on:click={handleSubmit}
                      disabled={submitting}
                      class="w-1/2 transform rounded-lg bg-gradient-to-r from-[#e62020] to-[#ff0000] py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#e62020]/20 hover:from-[#ff0000] hover:to-[#e62020] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Memproses...' : 'Kirim Tebakan'}
                    </button>
                  </div>
                </div>
              {:else}
                <div class="text-center text-gray-400 py-4">
                  Market sedang {status.text.toLowerCase()}, tidak bisa memasang tebakan.
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="text-center text-gray-400">
        Lomba tidak ditemukan
      </div>
    {/if}
  </div>
</div>

<!-- Tambahkan custom style untuk SweetAlert -->
<style>
  :global(.swal2-popup) {
    border: 1px solid #333;
  }
  
  :global(.swal2-title),
  :global(.swal2-html-container) {
    color: #fff !important;
  }
  
  :global(.swal2-confirm) {
    background: linear-gradient(to right, #e62020, #ff0000) !important;
  }
  
  :global(.swal2-confirm:hover) {
    background: linear-gradient(to right, #ff0000, #e62020) !important;
  }
</style> 