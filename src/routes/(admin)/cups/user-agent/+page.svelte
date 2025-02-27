<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';
  import { onMount } from 'svelte';

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  let oldUsers: any[] = [];
  let users: any[] = [];
  let privilages: any[] = [];
  
  const itemsPerPage = 8;
  let showModal = false;
  let showEditModal = false;
  let newUser = {
    username: '',
    email: '',
    password: '',
    level: ''
  };
  let editingUser = {
    id: '',
    username: '',
    email: '',
    level: ''
  };

  export let data;
  $: {
    users = data.coretax || [];
    privilages = data.privilages || [];
  }

  // Refresh data function
  async function refreshData() {
    try {
      loading = true;
      const response = await fetch('/api/xcoretax');
      const refreshedData = await response.json();
      users = refreshedData;
    } catch (error) {
      console.error('Error refreshing data:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal memperbarui data',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Pagination logic
  $: totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  $: paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Filter users
  $: filteredUsers = users.filter(item => 
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
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

  async function handleAddUser() {
    try {
      loading = true;
      
      // Pastikan ada session yang aktif
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('Tidak ada session yang aktif');

      // Dapatkan level_id dari tabel privilage
      const { data: levelData, error: levelError } = await supabaseClient
        .from('privilage')
        .select('id')
        .eq('level', newUser.level)
        .single();

      if (levelError) throw levelError;
      if (!levelData) throw new Error('Level tidak ditemukan');

      // Register user di Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: newUser.email,
        password: newUser.password
      });

      if (authError) throw authError;

      // Tambah data ke tabel coretax
      const { error: coretaxError } = await supabaseClient
        .from('coretax')
        .insert({
          id: authData.user?.id,
          username: newUser.username,
          email: newUser.email,
          level: newUser.level,
          level_id: levelData.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (coretaxError) throw coretaxError;

      // Tambahkan user baru ke state lokal
      const newUserData = {
        id: authData.user?.id,
        username: newUser.username,
        email: newUser.email,
        level: newUser.level,
        level_id: levelData.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      users = [newUserData, ...users];

      await Swal.fire({
        title: 'Berhasil!',
        text: 'User berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Reset form dan tutup modal
      newUser = { username: '', email: '', password: '', level: '' };
      showModal = false;

    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan user',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  async function handleEdit(user) {
    editingUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level
    };
    showEditModal = true;
  }
  
  async function handleUpdate() {
    try {
      loading = true;
      oldUsers = [...users];

      // Dapatkan level_id dari tabel privilage
      const { data: levelData, error: levelError } = await supabaseClient
        .from('privilage')
        .select('id')
        .eq('level', editingUser.level)
        .single();

      if (levelError) throw levelError;
      if (!levelData) throw new Error('Level tidak ditemukan');

      const { error: updateError } = await supabaseClient
        .from('coretax')
        .update({
          username: editingUser.username,
          level: editingUser.level,
          level_id: levelData.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (updateError) throw updateError;

      // Update data di state lokal dulu
      users = users.map(user => 
        user.id === editingUser.id 
          ? {
              ...user,
              username: editingUser.username,
              level: editingUser.level,
              level_id: levelData.id,
              updated_at: new Date().toISOString()
            }
          : user
      );

      await Swal.fire({
        title: 'Berhasil!',
        text: 'User berhasil diupdate',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      showEditModal = false;
    } catch (error) {
      console.error('Error:', error);
      // Rollback ke data lama jika gagal
      users = oldUsers;
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate user',
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
    <h1 class="text-2xl font-bold text-white">User Agent</h1>
    <div class="flex items-center gap-4">
      <button
        on:click={() => showModal = true}
        class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Add User
      </button>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari user..."
        class="w-64 bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
      />
    </div>
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">Username</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Level</th>
            <th class="px-4 py-3">Created At</th>
            <th class="px-4 py-3">Updated At</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          {#if loading}
            {#each Array(5) as _}
              <tr class="animate-pulse">
                {#each Array(5) as _}
                  <td class="px-4 py-3">
                    <div class="h-4 bg-gray-800 rounded w-24"></div>
                  </td>
                {/each}
              </tr>
            {/each}
          {:else}
            {#each paginatedUsers as user}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">{user?.username || '-'}</td>
                <td class="px-4 py-3">{user?.email || '-'}</td>
                <td class="px-4 py-3">{user?.level || '-'}</td>
                <td class="px-4 py-3">{formatDate(user?.created_at)}</td>
                <td class="px-4 py-3">{formatDate(user?.updated_at)}</td>
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
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
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
</div>

<!-- Modal Add User -->
{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-white">Add New User</h3>
        <button 
          on:click={() => showModal = false}
          class="text-gray-400 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form on:submit|preventDefault={handleAddUser} class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Username</label>
          <input
            type="text"
            bind:value={newUser.username}
            required
            class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <input
            type="email"
            bind:value={newUser.email}
            required
            class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Password</label>
          <input
            type="password"
            bind:value={newUser.password}
            required
            class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Level</label>
          <select
            bind:value={newUser.level}
            required
            class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          >
            <option value="">Pilih Level</option>
            {#each privilages as privilage}
              <option value={privilage.level}>{privilage.level}</option>
            {/each}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Add User'}
        </button>
      </form>
    </div>
  </div>
{/if}

<!-- Modal Edit User -->
{#if showEditModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-white">Edit User</h3>
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
          <label class="block text-sm font-medium text-gray-400 mb-2">Username</label>
          <input
            type="text"
            bind:value={editingUser.username}
            required
            class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <input
            type="email"
            value={editingUser.email}
            disabled
            class="w-full bg-[#2a2a2a] text-gray-500 px-4 py-2 rounded-lg border border-gray-800 cursor-not-allowed"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Level</label>
          <select
            bind:value={editingUser.level}
            required
            class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          >
            <option value="">Pilih Level</option>
            {#each privilages as privilage}
              <option value={privilage.level}>{privilage.level}</option>
            {/each}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Update User'}
        </button>
      </form>
    </div>
  </div>
{/if} 