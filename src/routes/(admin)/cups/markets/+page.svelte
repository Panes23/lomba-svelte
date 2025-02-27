<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';
  import { invalidate } from '$app/navigation';
  import { marketsStore } from '$lib/stores/marketsStore';

  // Page options
  export const prerender = false;
  export const ssr = false;
  export const csr = true;

  let loading = false;
  let searchQuery = '';
  let showTerms = null;
  let currentPage = 1;
  const itemsPerPage = 8;
  let showModal = false;
  let showEditModal = false;
  let newMarket = {
    name: '',
    buka: '',
    tutup: '',
    image: '',
    terms: [''],
    officiallink: ''
  };
  let editingMarket = {
    id: '',
    name: '',
    buka: '',
    tutup: '',
    image: '',
    terms: [''],
    officiallink: ''
  };

  export let data;
  $: markets = data.markets;
  let oldMarkets: typeof markets = [];

  // Pagination logic
  $: totalPages = Math.ceil(filteredMarkets.length / itemsPerPage);
  $: paginatedMarkets = filteredMarkets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Format waktu
  function formatTime(time: string) {
    // Jika format waktu HH:MM:SS, ambil hanya HH:MM
    if (time.includes(':')) {
      return time.substring(0, 5);
    }
    // Jika format waktu sudah HH.MM, kembalikan apa adanya
    return time;
  }

  // Format terms
  function parseTerms(terms) {
    try {
      if (typeof terms === 'string') {
        return JSON.parse(terms);
      }
      return terms || [];
    } catch {
      return [];
    }
  }

  // Toggle terms modal
  function toggleTerms(terms) {
    showTerms = showTerms ? null : terms;
  }

  // Filter markets
  $: filteredMarkets = markets.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add new term field
  function addTerm(isEditing = false) {
    if (isEditing) {
      editingMarket.terms = [...editingMarket.terms, ''];
    } else {
      newMarket.terms = [...newMarket.terms, ''];
    }
  }

  // Handle remove term field
  function removeTerm(index: number, isEditing = false) {
    if (isEditing) {
      editingMarket.terms = editingMarket.terms.filter((_, i) => i !== index);
    } else {
      newMarket.terms = newMarket.terms.filter((_, i) => i !== index);
    }
  }

  let imageLoading = false;
  let imagePreview = '';
  let editImagePreview = '';

  // Tambahkan fungsi handle image preview
  async function handleImagePreview(e) {
    const file = e.target.files?.[0];
    if (file) {
      imageLoading = true;
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } finally {
        imageLoading = false;
      }
    }
  }

  async function handleEditImagePreview(e) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        imageLoading = true;
        const reader = new FileReader();
        reader.onload = (e) => {
          editImagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        imageLoading = false;
      }
    }
  }

  // Modifikasi fungsi handleAddMarket
  async function handleAddMarket() {
    try {
      loading = true;
      
      // Get file input
      const fileInput = document.querySelector<HTMLInputElement>('#marketImage');
      const file = fileInput?.files?.[0];
      let imageUrl = newMarket.image;
      
      if (file) {
        // Upload to Bunny.net
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', 'pasaran');
        
        const response = await fetch('/api/bunny/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        imageUrl = data.url;
      }

      // Filter out empty terms
      const filteredTerms = newMarket.terms.filter(term => term.trim() !== '');

      const { data, error } = await supabaseClient
        .from('markets')
        .insert({
          name: newMarket.name,
          buka: newMarket.buka,
          tutup: newMarket.tutup,
          image: imageUrl,
          terms: filteredTerms,
          officiallink: newMarket.officiallink,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update state lokal
      markets = [data, ...markets];

      // Update store dan invalidate
      await marketsStore.fetch();
      await invalidate('app:markets');

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Pasaran berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Reset form dan tutup modal
      newMarket = { name: '', buka: '', tutup: '', image: '', terms: [''], officiallink: '' };
      imagePreview = '';
      showModal = false;
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan pasaran',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  function handleEdit(market) {
    editingMarket = { ...market };
    showEditModal = true;
  }

  // Modifikasi fungsi handleUpdate
  async function handleUpdate() {
    try {
      loading = true;
      oldMarkets = [...markets];

      // Get file input
      const fileInput = document.querySelector<HTMLInputElement>('#editMarketImage');
      const file = fileInput?.files?.[0];
      let imageUrl = editingMarket.image;

      if (file) {
        // Upload new image
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', 'pasaran');
        
        const response = await fetch('/api/bunny/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        
        // Delete old image if exists
        if (imageUrl) {
          await fetch('/api/bunny/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl })
          });
        }
        
        imageUrl = data.url;
      }

      // Filter out empty terms
      const filteredTerms = editingMarket.terms.filter(term => term.trim() !== '');

      const { data, error } = await supabaseClient
        .from('markets')
        .update({
          name: editingMarket.name,
          buka: editingMarket.buka,
          tutup: editingMarket.tutup,
          image: imageUrl,
          terms: filteredTerms,
          officiallink: editingMarket.officiallink,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMarket.id)
        .select()
        .single();

      if (error) throw error;

      // Update state lokal
      markets = markets.map(market => 
        market.id === editingMarket.id ? data : market
      );

      // Update store dan invalidate
      await marketsStore.fetch();
      await invalidate('app:markets');

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pasaran berhasil diupdate',
        timer: 1500,
        showConfirmButton: false
      });

      editImagePreview = '';
      showEditModal = false;
    } catch (error) {
      console.error('Error:', error);
      markets = oldMarkets;
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate pasaran',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  async function handleDelete(market) {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin ingin menghapus pasaran ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e62020',
        cancelButtonColor: '#3f3f46',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        loading = true;

        const { error } = await supabaseClient
          .from('markets')
          .delete()
          .eq('id', market.id);

        if (error) throw error;

        // Update state lokal
        markets = markets.filter(m => m.id !== market.id);

        // Update store dan invalidate
        await marketsStore.fetch();
        await invalidate('app:markets');

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Pasaran berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menghapus pasaran',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Ganti fungsi helper dengan reactive statement
  $: currentMarket = showModal ? newMarket : editingMarket;

  // Modifikasi fungsi getImageUrl
  function getImageUrl(url: string) {
    if (!url) return '';
    // Jika URL adalah data URL (base64/preview), kembalikan langsung
    if (url.startsWith('data:')) return url;
    // Jika URL adalah URL gambar, tambahkan timestamp
    return `${url}?t=${Date.now()}`;
  }
</script>

<!-- Terms Modal -->
{#if showTerms}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" on:click|self={() => showTerms = null}>
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-white">Terms & Conditions</h3>
        <button 
          on:click={() => showTerms = null}
          class="text-gray-400 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="max-h-[60vh] overflow-y-auto">
        <ul class="space-y-2 text-gray-300">
          {#each parseTerms(showTerms) as term}
            <li class="flex items-start">
              <span class="text-[#e62020] mr-2">•</span>
              <span>{term}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}

<div class="space-y-6 px-6 py-10">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">Pasaran Lomba</h1>
    <div class="flex items-center gap-4">
      <button
        on:click={() => showModal = true}
        class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Add Pasaran
      </button>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari pasaran..."
        class="w-64 bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
      />
    </div>
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">Nama Pasaran</th>
            <th class="px-4 py-3">Jam Buka</th>
            <th class="px-4 py-3">Jam Tutup</th>
            <th class="px-4 py-3">Image</th>
            <th class="px-4 py-3">Terms</th>
            <th class="px-4 py-3">Official Link</th>
            <th class="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          {#if loading}
            {#each Array(5) as _}
              <tr class="animate-pulse">
                {#each Array(6) as _}
                  <td class="px-4 py-3">
                    <div class="h-4 bg-gray-800 rounded w-24"></div>
                  </td>
                {/each}
              </tr>
            {/each}
          {:else}
            {#each paginatedMarkets as item}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">{item.name}</td>
                <td class="px-4 py-3">{formatTime(item.buka)}</td>
                <td class="px-4 py-3">{formatTime(item.tutup)}</td>
                <td class="px-4 py-3">
                  {#if item.image}
                    <img 
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      class="w-8 h-8 rounded object-cover"
                    />
                  {:else}
                    -
                  {/if}
                </td>
                <td class="px-4 py-3">
                  {#if item.terms}
                    <button
                      on:click={() => toggleTerms(item.terms)}
                      class="px-3 py-1 rounded text-[#e62020] hover:bg-[#e62020] hover:bg-opacity-10 transition-colors"
                    >
                      View Terms
                    </button>
                  {:else}
                    -
                  {/if}
                </td>
                <td class="px-4 py-3">
                  {#if item.officiallink}
                    <a 
                      href={item.officiallink}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-[#e62020] hover:underline"
                    >
                      Visit Site
                    </a>
                  {:else}
                    -
                  {/if}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => handleEdit(item)}
                      class="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => handleDelete(item)}
                      class="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="px-4 py-3 border-t border-gray-800">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMarkets.length)} of {filteredMarkets.length} entries
        </div>
        <div class="flex gap-2">
          <!-- Previous Page -->
          <button
            on:click={() => currentPage = Math.max(1, currentPage - 1)}
            disabled={currentPage === 1}
            class="px-3 py-1 rounded-md text-sm {currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
          >
            Previous
          </button>
          
          <!-- Page Numbers -->
          {#each Array(totalPages) as _, i}
            <button
              on:click={() => currentPage = i + 1}
              class="px-3 py-1 rounded-md text-sm {currentPage === i + 1 ? 'bg-[#e62020] text-white' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
            >
              {i + 1}
            </button>
          {/each}
          
          <!-- Next Page -->
          <button
            on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
            disabled={currentPage === totalPages}
            class="px-3 py-1 rounded-md text-sm {currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Modal Add/Edit Market -->
  {#if showModal || showEditModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-8 w-full max-w-5xl mx-4">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-2xl font-bold text-white">
            {showModal ? 'Add New Pasaran' : 'Edit Pasaran'}
          </h3>
          <button 
            on:click={() => showModal ? (showModal = false) : (showEditModal = false)}
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form on:submit|preventDefault={showModal ? handleAddMarket : handleUpdate} class="max-h-[70vh] overflow-y-auto">
          <div class="flex gap-8">
            <!-- Form Fields -->
            <div class="flex-1 space-y-6">
              <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 h-full">
                <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">Informasi Pasaran</h4>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Nama Pasaran</label>
                    <input
                      type="text"
                      bind:value={currentMarket.name}
                      required
                      class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-2">Jam Buka</label>
                      <input
                        type="time"
                        bind:value={currentMarket.buka}
                        required
                        class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-2">Jam Tutup</label>
                      <input
                        type="time"
                        bind:value={currentMarket.tutup}
                        required
                        class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Official Link</label>
                    <input
                      type="url"
                      bind:value={currentMarket.officiallink}
                      class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Terms</label>
                    <div class="space-y-2">
                      {#each currentMarket.terms as term, i}
                        <div class="flex gap-2">
                          <input
                            type="text"
                            bind:value={currentMarket.terms[i]}
                            placeholder="Masukkan term"
                            class="flex-1 bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                          />
                          <button
                            type="button"
                            on:click={() => removeTerm(i)}
                            class="px-2 py-2 text-gray-400 hover:text-red-500 transition-colors"
                            disabled={(currentMarket.terms || []).length === 1}
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      {/each}
                      <button
                        type="button"
                        on:click={() => addTerm(!showModal)}
                        class="w-full px-4 py-2 text-sm text-[#e62020] hover:bg-[#e62020] hover:bg-opacity-10 rounded-lg transition-colors"
                      >
                        + Tambah Term
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image Upload -->
            <div class="w-96 space-y-6">
              <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 h-full">
                <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
                  Upload Gambar 
                  <span class="text-xs text-gray-500 lowercase ml-1">(155x155 pixel)</span>
                </h4>
                <div class="relative border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-[#e62020] hover:bg-[#e62020]/5 transition-all group cursor-pointer">
                  <input
                    type="file"
                    id={showModal ? "marketImage" : "editMarketImage"}
                    accept="image/*"
                    on:change={showModal ? handleImagePreview : handleEditImagePreview}
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />
                  {#if imageLoading}
                    <div class="flex items-center justify-center h-40">
                      <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#e62020]"></div>
                    </div>
                  {:else if (showModal ? imagePreview : (editImagePreview || currentMarket.image))}
                    <img 
                      src={getImageUrl(showModal ? imagePreview : (editImagePreview || currentMarket.image))}
                      alt="Preview"
                      class="w-full h-40 object-cover rounded-lg shadow-lg"
                    />
                  {:else}
                    <div class="text-gray-400 group-hover:text-[#e62020] transition-colors">
                      <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm font-medium">Klik untuk upload gambar</span>
                      <p class="text-xs text-gray-500 mt-1">atau drag & drop file di sini</p>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            disabled={loading}
            class="w-full bg-gradient-to-r from-[#e62020] to-[#ff0000] text-white py-3 rounded-xl font-medium hover:from-[#ff0000] hover:to-[#e62020] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-[#e62020]/20"
          >
            {loading ? 'Loading...' : showModal ? 'Add Pasaran' : 'Update Pasaran'}
          </button>
        </form>
      </div>
    </div>
  {/if}
</div> 