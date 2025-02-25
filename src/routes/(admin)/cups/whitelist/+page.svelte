<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 8;
  let showModal = false;
  let showEditModal = false;
  let newIP = {
    alamat_ip: ''
  };
  let editingIP = {
    id: '',
    alamat_ip: ''
  };

  export let data;
  $: whitelist = data.whitelist;
  let oldWhitelist: typeof whitelist = [];

  // Pagination logic
  $: totalPages = Math.ceil(filteredWhitelist.length / itemsPerPage);
  $: paginatedWhitelist = filteredWhitelist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Filter whitelist
  $: filteredWhitelist = whitelist.filter(item => 
    item.alamat_ip?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format tanggal
  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Validasi format IP
  function validateIP(ip: string) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
      const num = parseInt(part);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  }

  async function handleAddIP() {
    try {
      loading = true;
      
      // Validasi IP sebelum submit
      if (!validateIP(newIP.alamat_ip)) {
        throw new Error('Format IP tidak valid');
      }

      const { error } = await supabaseClient
        .from('whitelist')
        .insert({
          alamat_ip: newIP.alamat_ip,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update state lokal
      whitelist = [{
        id: crypto.randomUUID(),
        alamat_ip: newIP.alamat_ip,
        created_at: new Date().toISOString()
      }, ...whitelist];

      await Swal.fire({
        title: 'Berhasil!',
        text: 'IP berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Reset form dan tutup modal
      newIP = { alamat_ip: '' };
      showModal = false;
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan IP',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  function handleEdit(ip) {
    editingIP = {
      id: ip.id,
      alamat_ip: ip.alamat_ip
    };
    showEditModal = true;
  }

  async function handleUpdate() {
    try {
      loading = true;
      oldWhitelist = [...whitelist];

      const { error } = await supabaseClient
        .from('whitelist')
        .update({
          alamat_ip: editingIP.alamat_ip
        })
        .eq('id', editingIP.id);

      if (error) throw error;

      // Update state lokal
      whitelist = whitelist.map(ip => 
        ip.id === editingIP.id 
          ? { ...ip, alamat_ip: editingIP.alamat_ip }
          : ip
      );

      await Swal.fire({
        title: 'Berhasil!',
        text: 'IP berhasil diupdate',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      showEditModal = false;
    } catch (error) {
      console.error('Error:', error);
      whitelist = oldWhitelist;
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate IP',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  async function handleDelete(ip) {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin ingin menghapus IP ini?',
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
          .from('whitelist')
          .delete()
          .eq('id', ip.id);

        if (error) throw error;

        // Update state lokal
        whitelist = whitelist.filter(w => w.id !== ip.id);

        await Swal.fire({
          title: 'Berhasil!',
          text: 'IP berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menghapus IP',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6 px-6 py-10">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">White List IP</h1>
    <div class="flex items-center gap-4">
      <button
        on:click={() => showModal = true}
        class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Add IP
      </button>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari IP address..."
        class="w-64 bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
      />
    </div>
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">IP Address</th>
            <th class="px-4 py-3">Added Date</th>
            <th class="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          {#if loading}
            {#each Array(5) as _}
              <tr class="animate-pulse">
                {#each Array(3) as _}
                  <td class="px-4 py-3">
                    <div class="h-4 bg-gray-800 rounded w-24"></div>
                  </td>
                {/each}
              </tr>
            {/each}
          {:else}
            {#each paginatedWhitelist as ip}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3 font-mono">{ip.alamat_ip}</td>
                <td class="px-4 py-3">{formatDate(ip.created_at)}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => handleEdit(ip)}
                      class="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => handleDelete(ip)}
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
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredWhitelist.length)} of {filteredWhitelist.length} entries
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

  <!-- Modal Add IP -->
  {#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Add New IP</h3>
          <button 
            on:click={() => showModal = false}
            class="text-gray-400 hover:text-white"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form on:submit|preventDefault={handleAddIP} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">IP Address</label>
            <input
              type="text"
              bind:value={newIP.alamat_ip}
              required
              placeholder="xxx.xxx.xxx.xxx"
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Add IP'}
          </button>
        </form>
      </div>
    </div>
  {/if}

  <!-- Modal Edit IP -->
  {#if showEditModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Edit IP</h3>
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
            <label class="block text-sm font-medium text-gray-400 mb-2">IP Address</label>
            <input
              type="text"
              bind:value={editingIP.alamat_ip}
              required
              placeholder="xxx.xxx.xxx.xxx"
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Update IP'}
          </button>
        </form>
      </div>
    </div>
  {/if}
</div> 