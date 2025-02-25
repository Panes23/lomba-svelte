<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 8;
  let showModal = false;
  let showEditModal = false;
  let newWebsite = {
    nama: '',
    link_website: '',
    color: '#e62020'
  };
  let editingWebsite = {
    id: '',
    nama: '',
    link_website: '',
    color: ''
  };

  export let data;
  $: websites = data.websites;
  let oldWebsites: typeof websites = [];

  // Pagination logic
  $: totalPages = Math.ceil(filteredWebsites.length / itemsPerPage);
  $: paginatedWebsites = filteredWebsites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Filter websites
  $: filteredWebsites = websites.filter(item => 
    item.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleAddWebsite() {
    try {
      loading = true;

      const { error } = await supabaseClient
        .from('websites')
        .insert({
          nama: newWebsite.nama,
          link_website: newWebsite.link_website,
          color: newWebsite.color,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update state lokal
      websites = [{
        id: crypto.randomUUID(),
        ...newWebsite,
        created_at: new Date().toISOString()
      }, ...websites];

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Website berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Reset form dan tutup modal
      newWebsite = { nama: '', link_website: '', color: '#e62020' };
      showModal = false;
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan website',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  function handleEdit(website) {
    editingWebsite = { ...website };
    showEditModal = true;
  }

  async function handleUpdate() {
    try {
      loading = true;
      oldWebsites = [...websites];

      const { error } = await supabaseClient
        .from('websites')
        .update({
          nama: editingWebsite.nama,
          link_website: editingWebsite.link_website,
          color: editingWebsite.color,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingWebsite.id);

      if (error) throw error;

      // Update state lokal
      websites = websites.map(website => 
        website.id === editingWebsite.id 
          ? { ...editingWebsite }
          : website
      );

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Website berhasil diupdate',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      showEditModal = false;
    } catch (error) {
      console.error('Error:', error);
      websites = oldWebsites;
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate website',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  async function handleDelete(website) {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin ingin menghapus website ini?',
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
          .from('websites')
          .delete()
          .eq('id', website.id);

        if (error) throw error;

        // Update state lokal
        websites = websites.filter(w => w.id !== website.id);

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Website berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menghapus website',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Get text color based on background
  function getTextColor(bgColor: string) {
    // Warna terang menggunakan teks hitam
    const lightColors = ['#ffffff', '#d7e2ef', '#b8d560', '#e4c658', '#dcc672', '#c5c5c5', '#58d4ee'];
    return lightColors.includes(bgColor.toLowerCase()) ? '#222222' : '#ffffff';
  }
</script>

<div class="space-y-6 px-6 py-10">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">Websites</h1>
    <div class="flex items-center gap-4">
      <button
        on:click={() => showModal = true}
        class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Add Website
      </button>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari website..."
        class="w-64 bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
      />
    </div>
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">Nama Website</th>
            <th class="px-4 py-3">Link Website</th>
            <th class="px-4 py-3">Color</th>
            <th class="px-4 py-3">Preview</th>
            <th class="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          {#if loading}
            {#each Array(5) as _}
              <tr class="animate-pulse">
                {#each Array(4) as _}
                  <td class="px-4 py-3">
                    <div class="h-4 bg-gray-800 rounded w-24"></div>
                  </td>
                {/each}
              </tr>
            {/each}
          {:else}
            {#each paginatedWebsites as item}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">{item.nama}</td>
                <td class="px-4 py-3">
                  <a 
                    href={item.link_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#e62020] hover:underline"
                  >
                    {item.link_website}
                  </a>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-4 h-4 rounded-full" 
                      style="background-color: {item.color}"
                    ></div>
                    <span>{item.color}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <button
                    class="px-4 py-1.5 rounded font-medium text-sm"
                    style="
                      background-color: {item.color};
                      color: {getTextColor(item.color)};
                      min-width: 120px;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      font-weight: 500;
                      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    "
                  >
                    {item.nama}
                  </button>
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
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredWebsites.length)} of {filteredWebsites.length} entries
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

  <!-- Modal Add Website -->
  {#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Add New Website</h3>
          <button 
            on:click={() => showModal = false}
            class="text-gray-400 hover:text-white"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form on:submit|preventDefault={handleAddWebsite} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Nama Website</label>
            <input
              type="text"
              bind:value={newWebsite.nama}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Link Website</label>
            <input
              type="url"
              bind:value={newWebsite.link_website}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Color</label>
            <input
              type="color"
              bind:value={newWebsite.color}
              required
              class="w-full h-10 bg-[#2a2a2a] rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Add Website'}
          </button>
        </form>
      </div>
    </div>
  {/if}

  <!-- Modal Edit Website -->
  {#if showEditModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Edit Website</h3>
          <button 
            on:click={() => showEditModal = false}
            class="text-gray-400 hover:text-white"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form on:submit|preventDefault={handleUpdate} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Nama Website</label>
            <input
              type="text"
              bind:value={editingWebsite.nama}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Link Website</label>
            <input
              type="url"
              bind:value={editingWebsite.link_website}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Color</label>
            <input
              type="color"
              bind:value={editingWebsite.color}
              required
              class="w-full h-10 bg-[#2a2a2a] rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Update Website'}
          </button>
        </form>
      </div>
    </div>
  {/if}
</div> 