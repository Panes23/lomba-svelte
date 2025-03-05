<script lang="ts">
  import Swal from '$lib/utils/swal';
  import { supabaseClient } from '$lib/supabaseClient';

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  let dateFilter = '';
  let filterColumn = 'created_at';
  const itemsPerPage = 8;

  export let data;
  $: users = data.users;
  $: userAccess = data.userAccess || [];
  $: hidePhoneEmail = userAccess.includes('phoneemail');

  // Pagination logic
  $: totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  $: paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset page when search or date filter changes
  $: if (searchQuery || dateFilter) currentPage = 1;

  // Format tanggal untuk input date
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Format tanggal untuk display
  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Filter users
  $: filteredUsers = users.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.username?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.phone?.toLowerCase().includes(searchLower));
    
    if (dateFilter) {
      const itemDate = formatDateForInput(item[filterColumn]);
      return matchesSearch && itemDate === dateFilter;
    }
    
    return matchesSearch;
  });

  // Reset filter
  function resetFilter() {
    dateFilter = '';
    searchQuery = '';
    currentPage = 1;
  }

  // Fungsi untuk mengubah status user
  async function toggleUserStatus(userId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      const actionText = newStatus === 'banned' ? 'banned' : 'mengaktifkan kembali';
      
      const result = await Swal.fire({
        title: `Apakah anda yakin ingin ${actionText} user ini?`,
        text: `User akan di${actionText}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e62020',
        cancelButtonColor: '#3f3f3f',
        confirmButtonText: 'Ya',
        cancelButtonText: 'Batal',
        background: '#222',
        color: '#fff'
      });

      if (result.isConfirmed) {
        loading = true;

        // Update status user menggunakan fetch API
        const response = await fetch('/api/users/toggle-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            newStatus
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Gagal mengubah status user');
        }

        // Update local state
        users = users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        );

        await Swal.fire({
          title: 'Berhasil!',
          text: `User berhasil di${actionText}`,
          icon: 'success',
          confirmButtonColor: '#e62020',
          background: '#222',
          color: '#fff'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengubah status user',
        icon: 'error',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff'
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6 px-6 py-10">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">List Users</h1>
    <div class="flex items-center gap-4">
      <!-- Filter Date -->
      <div class="flex items-center gap-2">
        <select
          bind:value={filterColumn}
          class="bg-[#222] text-white px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        >
          <option value="created_at">Created At</option>
          <option value="last_login">Last Login</option>
        </select>
        <input
          type="date"
          bind:value={dateFilter}
          class="bg-[#222] text-white px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        />
        {#if dateFilter || searchQuery}
          <button
            on:click={resetFilter}
            class="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Reset
          </button>
        {/if}
      </div>
      <!-- Search -->
      <div class="w-64">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari user..."
          class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        />
      </div>
    </div>
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Username</th>
            {#if hidePhoneEmail}
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Phone</th>
            {/if}
            <th class="px-4 py-3">Birth Date</th>
            <th class="px-4 py-3">Created At</th>
            <th class="px-4 py-3">Last Login</th>
            <th class="px-4 py-3">IP Address</th>
            <th class="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          {#if loading}
            {#each Array(5) as _}
              <tr class="animate-pulse">
                {#each Array(hidePhoneEmail ? 9 : 7) as _}
                  <td class="px-4 py-3">
                    <div class="h-4 bg-gray-800 rounded w-24"></div>
                  </td>
                {/each}
              </tr>
            {/each}
          {:else}
            {#each paginatedUsers as user}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs font-medium rounded-full
                    {user.status === 'active' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'}">
                    {user.status || 'active'}
                  </span>
                </td>
                <td class="px-4 py-3">{user.username || '-'}</td>
                {#if hidePhoneEmail}
                  <td class="px-4 py-3">{user.email || '-'}</td>
                  <td class="px-4 py-3">{user.phone || '-'}</td>
                {/if}
                <td class="px-4 py-3">{formatDate(user.birth_date)}</td>
                <td class="px-4 py-3">{formatDate(user.created_at)}</td>
                <td class="px-4 py-3">{formatDate(user.last_login)}</td>
                <td class="px-4 py-3">{user.alamat_ip || '-'}</td>
                <td class="px-4 py-3">
                  <button
                    on:click={() => toggleUserStatus(user.id, user.status || 'active')}
                    class="px-3 py-1 text-xs font-medium rounded-lg
                      {user.status === 'active'
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}
                      transition-colors"
                  >
                    {user.status === 'active' ? 'Ban User' : 'Unban User'}
                  </button>
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