<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 8;
  let showModal = false;
  let showEditModal = false;
  let newPrivilage = {
    level: '',
    akses: []
  };
  let editingPrivilage = {
    id: '',
    level: '',
    akses: []
  };

  // Daftar semua akses yang tersedia
  const availableAccess = [
    'list users',
    'list lomba',
    'pasaran lomba',
    'websites',
    'slides',
    'contacts',
    'media social',
    'white list ip',
    'user agent',
    'privilage'
  ];

  // Handle checkbox change
  function handleAccessChange(access: string) {
    if (newPrivilage.akses.includes(access)) {
      newPrivilage.akses = newPrivilage.akses.filter(a => a !== access);
    } else {
      newPrivilage.akses = [...newPrivilage.akses, access];
    }
  }

  async function handleAddPrivilage() {
    try {
      if (!newPrivilage.level) {
        throw new Error('Level harus diisi');
      }
      if (newPrivilage.akses.length === 0) {
        throw new Error('Minimal pilih satu akses');
      }

      loading = true;

      const { error } = await supabaseClient
        .from('privilage')
        .insert({
          level: newPrivilage.level.toLowerCase(),
          akses: newPrivilage.akses
        });

      if (error) throw error;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Privilage berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Reset form dan tutup modal
      newPrivilage = { level: '', akses: [] };
      showModal = false;

      // Refresh data
      const { data: refreshedData } = await supabaseClient
        .from('privilage')
        .select('*')
        .order('created_at', { ascending: false });

      if (refreshedData) privilages = refreshedData;

    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan privilage',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  function handleEdit(privilage) {
    editingPrivilage = {
      id: privilage.id,
      level: privilage.level,
      akses: [...privilage.akses]
    };
    showEditModal = true;
  }

  async function handleUpdatePrivilage() {
    try {
      if (!editingPrivilage.level) {
        throw new Error('Level harus diisi');
      }
      if (editingPrivilage.akses.length === 0) {
        throw new Error('Minimal pilih satu akses');
      }

      loading = true;

      const { error } = await supabaseClient
        .from('privilage')
        .update({
          level: editingPrivilage.level.toLowerCase(),
          akses: editingPrivilage.akses,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPrivilage.id);

      if (error) throw error;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Privilage berhasil diupdate',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Reset form dan tutup modal
      editingPrivilage = { id: '', level: '', akses: [] };
      showEditModal = false;

      // Refresh data
      const { data: refreshedData } = await supabaseClient
        .from('privilage')
        .select('*')
        .order('created_at', { ascending: false });

      if (refreshedData) privilages = refreshedData;

    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate privilage',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  export let data;
  $: privilages = data.privilages;

  // Pagination logic
  $: totalPages = Math.ceil(filteredPrivilages.length / itemsPerPage);
  $: paginatedPrivilages = filteredPrivilages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Filter privilages
  $: filteredPrivilages = privilages.filter(item => 
    item.level?.toLowerCase().includes(searchQuery.toLowerCase())
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
</script>

<div class="space-y-6 px-6 py-10">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">Privilage</h1>
    <div class="flex items-center gap-4">
      <button
        on:click={() => showModal = true}
        class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Add Privilage
      </button>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari level..."
        class="w-64 bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
      />
    </div>
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">Level</th>
            <th class="px-4 py-3">Akses</th>
            <th class="px-4 py-3">Created At</th>
            <th class="px-4 py-3">Updated At</th>
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
            {#each paginatedPrivilages as privilage}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs font-medium uppercase
                    {privilage.level === 'superadmin' ? 'bg-red-500/10 text-red-500' : 
                    privilage.level === 'admin' ? 'bg-blue-500/10 text-blue-500' : 
                    'bg-gray-500/10 text-gray-500'}">
                    {privilage.level}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    {#each privilage.akses as akses}
                      <span class="px-2 py-0.5 bg-gray-800 rounded-full text-xs">
                        {akses}
                      </span>
                    {/each}
                  </div>
                </td>
                <td class="px-4 py-3">{formatDate(privilage.created_at)}</td>
                <td class="px-4 py-3">{formatDate(privilage.updated_at)}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => handleEdit(privilage)}
                      class="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      Edit
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
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPrivilages.length)} of {filteredPrivilages.length} entries
        </div>
        <div class="flex gap-2">
          <button
            on:click={() => currentPage = Math.max(1, currentPage - 1)}
            disabled={currentPage === 1}
            class="px-3 py-1 rounded-md text-sm {currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
          >
            Previous
          </button>
          
          {#each Array(totalPages) as _, i}
            <button
              on:click={() => currentPage = i + 1}
              class="px-3 py-1 rounded-md text-sm {currentPage === i + 1 ? 'bg-[#e62020] text-white' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
            >
              {i + 1}
            </button>
          {/each}
          
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
</div>

<!-- Modal Add Privilage -->
{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-white">Add New Privilage</h3>
        <button 
          on:click={() => showModal = false}
          class="text-gray-400 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form on:submit|preventDefault={handleAddPrivilage} class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Level Name</label>
          <input
            type="text"
            bind:value={newPrivilage.level}
            required
            class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            placeholder="Enter level name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-4">Access Rights</label>
          <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
            {#each availableAccess as access}
              <label class="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPrivilage.akses.includes(access)}
                  on:change={() => handleAccessChange(access)}
                  class="form-checkbox h-5 w-5 text-[#e62020] rounded border-gray-800 bg-[#2a2a2a] focus:ring-[#e62020] focus:ring-offset-0"
                />
                <span>{access}</span>
              </label>
            {/each}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Add Privilage'}
        </button>
      </form>
    </div>
  </div>
{/if}

<!-- Modal Edit Privilage -->
{#if showEditModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-white">Edit Privilage</h3>
        <button 
          on:click={() => showEditModal = false}
          class="text-gray-400 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form on:submit|preventDefault={handleUpdatePrivilage} class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Level Name</label>
          <input
            type="text"
            bind:value={editingPrivilage.level}
            required
            class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            placeholder="Enter level name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-4">Access Rights</label>
          <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
            {#each availableAccess as access}
              <label class="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPrivilage.akses.includes(access)}
                  on:change={() => {
                    if (editingPrivilage.akses.includes(access)) {
                      editingPrivilage.akses = editingPrivilage.akses.filter(a => a !== access);
                    } else {
                      editingPrivilage.akses = [...editingPrivilage.akses, access];
                    }
                  }}
                  class="form-checkbox h-5 w-5 text-[#e62020] rounded border-gray-800 bg-[#2a2a2a] focus:ring-[#e62020] focus:ring-offset-0"
                />
                <span>{access}</span>
              </label>
            {/each}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Update Privilage'}
        </button>
      </form>
    </div>
  </div>
{/if} 