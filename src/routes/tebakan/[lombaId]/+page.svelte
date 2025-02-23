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
    if (lomba?.result !== null) return {
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

  export let data;
  $: ({ lomba, websites, tebakan: initialTebakan, timestamp } = data);
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
  let number = '';
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
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  let subscription;
  
  onMount(() => {
    if (browser) {
      // Set initial data dari server
      tebakanStore.set(initialTebakan);
      isLoading = false;
    }
    
    // Pastikan lomba.id valid sebelum subscribe
    if (!lomba?.id) return;
    
    // Subscribe ke perubahan tebakan
    subscription = supabaseClient
      .channel('tebakan-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tebakan',
          filter: `lomba_id=eq.${lomba.id}`
        },
        async (payload) => {
          // Fetch ulang data untuk mendapatkan relasi yang lengkap
          await tebakanStore.fetchTebakan(lomba.id);
          // Force reload page data jika di browser
          if (browser) {
            window.location.reload();
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

  async function handleSubmit() {
    if (!selectedWebsite || !userIdWebsite || !number) {
      error = 'Semua field harus diisi';
      return;
    }

    // Cek apakah kombinasi website dan userid sudah ada
    const existingTebakan = tebakan.find(item => 
      item.website_id === selectedWebsite && 
      item.userid_website.toLowerCase() === userIdWebsite.toLowerCase()
    );
    
    if (existingTebakan) {
      await Swal.fire({
        title: 'Gagal!',
        text: 'Anda sudah memasang tebakan dengan User ID ini pada website yang sama',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff'
      });
      return;
    }

    try {
      submitting = true;
      error = null;

      const result = await fetchData('tebakan', 'POST', {
        lomba_id: lomba.id,
        website_id: selectedWebsite,
        userid_website: userIdWebsite,
        number: parseInt(number)
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Reset form
      selectedWebsite = '';
      userIdWebsite = '';
      number = '';
      showForm = false;
      
      // Fetch data terbaru dan tunggu sampai selesai
      await Promise.all([
        tebakanStore.fetchTebakan(lomba.id),
        // Tunggu sebentar untuk memastikan data tersimpan
        new Promise(resolve => setTimeout(resolve, 100))
      ]);
      
      // Force update tebakan dari store
      tebakan = [...$tebakanStore];

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Tebakan Anda telah berhasil dipasang',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff',
        allowOutsideClick: false,
        didClose: () => {
          // Refresh sekali lagi setelah modal ditutup
          tebakanStore.fetchTebakan(lomba.id).then(() => {
            tebakan = [...$tebakanStore];
          });
        }
      });

    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err.message || 'Gagal mengirim tebakan',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff'
      });
      console.error('Submit error:', err);
    } finally {
      submitting = false;
    }
  }
</script>

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
            {#if lomba.result !== null}
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
          {#if lomba.result !== null}
            {@const winners = tebakan
              .filter(t => parseInt(t.number) === parseInt(lomba.result))
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .slice(0, lomba.max_winner)
            }
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
                    <div class="flex items-center justify-between bg-[#1a1a1a] p-2 sm:p-3 rounded-lg border border-gray-800">
                      <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full 
                          {index === 0 ? 'bg-[#FFD700]/10 text-[#FFD700]' : 
                           index === 1 ? 'bg-[#C0C0C0]/10 text-[#C0C0C0]' :
                           index === 2 ? 'bg-[#CD7F32]/10 text-[#CD7F32]' :
                           'bg-gray-500/10 text-gray-500'}">
                          {index + 1}
                        </div>
                        <div>
                          {#if isDataReady}
                          <a 
                            href={winner.websites.link_website} 
                            style="color: {winner.websites?.color || '#fff'}" 
                            class="hover:opacity-80 transition-colors duration-200"
                            target="_blank"
                          >
                            <span class="text-xs sm:text-sm font-medium">{winner.websites.nama}</span>
                          </a>
                          {:else}
                            <div class="h-5 w-24 bg-gray-800 animate-pulse rounded"></div>
                          {/if}
                          <p class="text-[10px] sm:text-xs text-gray-500">User ID: {winner.userid_website}</p>
                        </div>
                      </div>
                      <div class="text-[10px] sm:text-sm text-gray-400">
                        {formatDate(winner.created_at)}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-center text-gray-400 py-4">Tidak ada pemenang</p>
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
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {#each paginatedTebakan as item}
                <div class="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 hover:border-[#e62020]/30 transition-all duration-300">
                  <div class="flex justify-between items-start">
                    <div>
                      {#if isDataReady}
                        {@const websiteData = item.websites}
                        <a 
                          href={item.websites.link_website} 
                          style="color: {item.websites?.color || '#fff'}" 
                          class="hover:opacity-80 transition-colors duration-200"
                          target="_blank"
                        >
                          <span class="text-sm sm:text-base font-medium">{item.websites.nama}</span>
                        </a>
                      {:else}
                        <div class="h-5 w-24 bg-gray-800 animate-pulse rounded"></div>
                      {/if}
                      <p class="text-xs sm:text-sm text-gray-500">{formatDate(item.created_at)}</p>
                    </div>
                    <div class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#e62020] to-[#ff0000] text-transparent bg-clip-text">{item.number}</div>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-400 mt-2">
                    User ID: <span class="text-white">{item.userid_website}</span>
                  </p>
                </div>
              {/each}
            </div>
            
            <!-- Pagination Controls -->
            {#if totalPages > 1}
              <div class="flex justify-center items-center gap-2 mt-6">
                <button
                  on:click={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  class="px-3 py-1 rounded-lg bg-[#1a1a1a] text-white border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#e62020]/30"
                  aria-label="Previous page"
                >
                  &lt;
                </button>
                
                {#each Array(totalPages) as _, i}
                  <button
                    on:click={() => changePage(i + 1)}
                    class="px-3 py-1 rounded-lg {currentPage === i + 1 ? 'bg-[#e62020] text-white' : 'bg-[#1a1a1a] text-white border border-gray-800 hover:border-[#e62020]/30'}"
                    aria-label="Page {i + 1}"
                    aria-current={currentPage === i + 1 ? 'page' : undefined}
                  >
                    {i + 1}
                  </button>
                {/each}
                
                <button
                  on:click={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  class="px-3 py-1 rounded-lg bg-[#1a1a1a] text-white border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#e62020]/30"
                  aria-label="Next page"
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
                      for="number"
                      class="block text-sm font-medium text-gray-400 mb-2"
                    >
                      Nomor Tebakan
                    </label>
                    <input
                      id="number"
                      type="number"
                      bind:value={number}
                      placeholder="Masukkan nomor tebakan"
                      class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020] focus:border-transparent"
                    />
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