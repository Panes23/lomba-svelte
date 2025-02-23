<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/stores/authStore';
  import { onMount } from 'svelte';
  import { fetchData } from '$lib/api';
  import type { Lomba } from '$lib/types/lomba';
  import type { Website } from '$lib/types/website';
  import Swal from '$lib/utils/swal';
  import { goto } from '$app/navigation';
  
  export let data;
  $: ({ lomba, websites, tebakan } = data);
  let error = null;
  
  // State untuk list tebakan dan form visibility
  let showForm = false;
  let searchQuery = '';
  
  // Form data
  let selectedWebsite = '';
  let userIdWebsite = '';
  let number = '';
  let submitting = false;

  // Filtered tebakan berdasarkan search
  $: filteredTebakan = tebakan.filter(item => 
    item.userid_website.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  async function handleSubmit() {
    if (!selectedWebsite || !userIdWebsite || !number) {
      error = 'Semua field harus diisi';
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

      // Tampilkan SweetAlert
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Tebakan Anda telah berhasil dipasang',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff'
      });
      
      // Redirect setelah user klik OK
      try {
        const marketName = lomba?.markets?.name;
        if (!marketName) throw new Error('Market name not found');
        
        // Gunakan goto untuk navigasi
        await goto(`/lomba/${marketName}`);
      } catch (redirectErr) {
        console.error('Redirect error:', redirectErr);
        // Fallback ke halaman lomba
        await goto('/lomba');
      }
    } catch (err) {
      // Tampilkan error dengan SweetAlert
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

<div class="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
  <div class="container mx-auto px-2 sm:px-4 max-w-6xl">
    {#if error}
      <div class="text-center text-red-500">{error}</div>
    {:else if lomba}
      <div class="w-full">
        <!-- Header Section dengan Info Detail -->
        <div class="bg-[#222] rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-4 sm:mb-8 shadow-xl">
          <h1 class="text-3xl font-bold text-white mb-6 text-center">
            {lomba?.markets?.name || 'Loading...'}
          </h1>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div class="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <p class="text-sm text-gray-400 mb-1">Tipe Lomba</p>
              <p class="text-lg sm:text-xl font-bold text-white">{lomba.guess_type}</p>
            </div>
            
            <div class="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <p class="text-sm text-gray-400 mb-1">Total Hadiah</p>
              <p class="text-xl font-bold text-[#e62020]">
                Rp {lomba.prize_pool.toLocaleString('id-ID')}
              </p>
            </div>
            
            <div class="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <p class="text-sm text-gray-400 mb-1">Maksimal Pemenang</p>
              <p class="text-xl font-bold text-white">{lomba.max_winner} orang</p>
            </div>
            
            <div class="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <p class="text-sm text-gray-400 mb-1">Tanggal</p>
              <p class="text-xl font-bold text-white">
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
              <p class="text-xl sm:text-2xl text-gray-600 font-medium">Belum Diumumkan</p>
            {/if}
          </div>
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
            </div>
          </div>
          
          {#if filteredTebakan.length > 0}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {#each filteredTebakan as item}
                <div class="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 hover:border-[#e62020]/30 transition-all duration-300">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-gray-400">
                        <span class="text-sm sm:text-base font-medium text-white">{item.websites.nama}</span>
                      </p>
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
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

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
                  >
                    <option value="">Pilih Website</option>
                    {#each websites as website}
                      <option value={website.id}>{website.nama}</option>
                    {/each}
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