<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';
  import { onMount } from 'svelte';

  export let data;

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  let showModal = false;
  let showEditModal = false;
  let oldFakeUsers: any[] = [];
  let fakeUsers: any[] = [];
  let websites: any[] = [];
  let selectedWebsite = '';

  const itemsPerPage = 10;

  let newFakeUser = {
    userid_website: '',
    website_id: ''
  };

  let editingFakeUser = {
    id: '',
    userid_website: '',
    website_id: ''
  };

  // Tambahkan state untuk selected items
  let selectedUsers: string[] = [];
  let isAllSelected = false;

  // Hapus reactive statements yang bermasalah dan ganti dengan satu saja
  $: isAllSelected = selectedUsers.length === filteredFakeUsers.length && filteredFakeUsers.length > 0;

  // Fetch websites saat komponen dimount
  onMount(async () => {
    try {
      const response = await fetch('/api/websites');
      if (!response.ok) throw new Error('Failed to fetch websites');
      websites = await response.json();
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal memuat data websites',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    }
  });

  $: {
    fakeUsers = data.fakeUsers || [];
  }

  // Pagination logic
  $: totalPages = Math.ceil(filteredFakeUsers.length / itemsPerPage);
  $: paginatedFakeUsers = filteredFakeUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Tambahkan fungsi untuk generate array halaman
  $: pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  $: visiblePages = pageNumbers.filter(num => {
    if (totalPages <= 7) return true;
    if (num === 1 || num === totalPages) return true;
    if (num >= currentPage - 2 && num <= currentPage + 2) return true;
    return false;
  });

  // Filter fake users
  $: filteredFakeUsers = fakeUsers.filter(item => {
    const matchSearch = item.userid_website?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.websites?.nama?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchWebsite = !selectedWebsite || item.website_id === selectedWebsite;
    
    return matchSearch && matchWebsite;
  });

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

  async function handleAddFakeUser() {
    try {
      loading = true;

      // Split dan bersihkan input
      const userids = newFakeUser.userid_website
        .split('\n')
        .map(id => id.trim())
        .filter(id => id);

      // Cek duplikasi di database untuk website yang sama
      const { data: existingUsers, error: checkError } = await supabaseClient
        .from('fake_users')
        .select('userid_website')
        .eq('website_id', newFakeUser.website_id)
        .in('userid_website', userids);

      if (checkError) throw checkError;

      // Cek duplikasi
      if (existingUsers?.length > 0) {
        const duplicates = existingUsers.map(u => u.userid_website).join('\n');
        throw new Error(`User ID berikut sudah terdaftar di website yang sama:\n${duplicates}`);
      }

      // Lanjutkan dengan insert jika tidak ada duplikasi
      const fakeUsersToInsert = userids.map(userid => ({
        userid_website: userid,
        website_id: newFakeUser.website_id
      }));

      const { data, error } = await supabaseClient
        .from('fake_users')
        .insert(fakeUsersToInsert)
        .select(`
          *,
          websites (
            id,
            nama,
            color,
            link_website
          )
        `);

      if (error) throw error;

      // Update local data dengan data lengkap
      fakeUsers = [...(data || []), ...fakeUsers];
      showModal = false;
      newFakeUser = {
        userid_website: '',
        website_id: ''
      };

      await Swal.fire({
        title: 'Berhasil!',
        text: `${userids.length} fake user berhasil ditambahkan`,
        icon: 'success',
        confirmButtonColor: '#e62020'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan fake user',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Handle bulk delete
  async function handleBulkDelete() {
    try {
      if (!selectedUsers.length) return;

      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: `${selectedUsers.length} fake user akan dihapus`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e62020',
        cancelButtonColor: '#3f3f3f',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        loading = true;
        const { error } = await supabaseClient
          .from('fake_users')
          .delete()
          .in('id', selectedUsers);

        if (error) throw error;

        // Update local data
        fakeUsers = fakeUsers.filter(user => !selectedUsers.includes(user.id));
        selectedUsers = [];

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Fake users berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menghapus fake users',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Handle single delete
  async function handleDelete(id: string) {
    try {
      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Fake user akan dihapus',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e62020',
        cancelButtonColor: '#3f3f3f',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        loading = true;
        const { error } = await supabaseClient
          .from('fake_users')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update local data
        fakeUsers = fakeUsers.filter(user => user.id !== id);
        selectedUsers = selectedUsers.filter(userId => userId !== id);

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Fake user berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menghapus fake user',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Hapus reactive statements yang bermasalah
  function handleSelectAll(checked: boolean) {
    selectedUsers = checked ? filteredFakeUsers.map(user => user.id) : [];
  }

  // Tambahkan fungsi handleEdit
  async function handleEdit() {
    try {
      loading = true;

      // Cek apakah userid sudah ada di website yang sama (kecuali id yang sedang diedit)
      const { data: existingUser, error: checkError } = await supabaseClient
        .from('fake_users')
        .select('id')
        .eq('website_id', editingFakeUser.website_id)
        .eq('userid_website', editingFakeUser.userid_website)
        .neq('id', editingFakeUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingUser) {
        throw new Error('User ID sudah terdaftar di website yang sama, silahkan gunakan ID lain');
      }

      // Update data dengan select join ke websites
      const { data, error } = await supabaseClient
        .from('fake_users')
        .update({
          userid_website: editingFakeUser.userid_website,
          website_id: editingFakeUser.website_id
        })
        .eq('id', editingFakeUser.id)
        .select(`
          *,
          websites (
            id,
            nama,
            color,
            link_website
          )
        `)
        .single();

      if (error) throw error;

      // Update local data dengan data lengkap termasuk relasi websites
      fakeUsers = fakeUsers.map(user => 
        user.id === editingFakeUser.id ? data : user
      );

      showEditModal = false;
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Fake user berhasil diupdate',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate fake user',
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
    <h1 class="text-2xl font-bold text-white">Fake Users</h1>
    <div class="flex items-center gap-4">
      <button
        on:click={() => showModal = true}
        class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Add Fake User
      </button>
      
      <!-- Filter Section -->
      <div class="flex items-center gap-4">
        <!-- Website Filter -->
        <select
          bind:value={selectedWebsite}
          class="bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        >
          <option value="">
            Semua Website ({fakeUsers.length})
          </option>
          {#each websites as website}
            {@const websiteCount = fakeUsers.filter(user => user.website_id === website.id).length}
            <option 
              value={website.id}
              style="color: {website.color}"
            >
              {website.nama} ({websiteCount})
            </option>
          {/each}
        </select>

        <!-- Search Input -->
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari fake user..."
          class="w-64 bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        />
      </div>
    </div>
  </div>

  <!-- Tambahkan setelah filter aktif dan sebelum tabel -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-4 text-sm">
      <div class="px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-800">
        <span class="text-gray-400">Total Fake Users:</span>
        <span class="ml-2 text-white font-medium">{fakeUsers.length}</span>
      </div>
      <div class="px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-800">
        <span class="text-gray-400">Filtered:</span>
        <span class="ml-2 text-white font-medium">{filteredFakeUsers.length}</span>
      </div>
    </div>
    <!-- Tambahkan info filter aktif -->
    {#if selectedWebsite || searchQuery}
    <div class="flex items-center gap-4 text-sm text-gray-400">
      <span>Filter aktif:</span>
      {#if selectedWebsite}
        {#each websites as website}
          {#if website.id === selectedWebsite}
            <div class="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#2a2a2a]">
              <span class="w-2 h-2 rounded-full" style="background-color: {website.color}"></span>
              <span style="color: {website.color}">{website.nama}</span>
              <button
                class="ml-2 text-gray-500 hover:text-white"
                on:click={() => selectedWebsite = ''}
              >
                ×
              </button>
            </div>
          {/if}
        {/each}
      {/if}
      {#if searchQuery}
        <div class="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#2a2a2a]">
          <span>Search: {searchQuery}</span>
          <button
            class="ml-2 text-gray-500 hover:text-white"
            on:click={() => searchQuery = ''}
          >
            ×
          </button>
        </div>
      {/if}
      <button
        class="text-[#e62020] hover:text-red-400"
        on:click={() => {
          selectedWebsite = '';
          searchQuery = '';
        }}
      >
        Reset Filter
      </button>
    </div>
  {/if}
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3 w-10">
              <input
                type="checkbox"
                class="rounded border-gray-600 text-[#e62020] focus:ring-[#e62020] bg-transparent"
                checked={selectedUsers.length === filteredFakeUsers.length}
                on:change={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
              />
            </th>
            <th class="px-4 py-3">User ID Website</th>
            <th class="px-4 py-3">Website</th>
            <th class="px-4 py-3">Created At</th>
            <th class="px-4 py-3">Updated At</th>
            <th class="px-4 py-3 text-right">Actions</th>
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
            {#each paginatedFakeUsers as fakeUser}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    class="rounded border-gray-600 text-[#e62020] focus:ring-[#e62020] bg-transparent"
                    checked={selectedUsers.includes(fakeUser.id)}
                    on:change={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.checked) {
                        selectedUsers = [...selectedUsers, fakeUser.id];
                      } else {
                        selectedUsers = selectedUsers.filter(id => id !== fakeUser.id);
                      }
                    }}
                  />
                </td>
                <td class="px-4 py-3">{fakeUser.userid_website}</td>
                <td class="px-4 py-3">
                  {#if fakeUser.websites}
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full" style="background-color: {fakeUser.websites.color}"></span>
                      <span style="color: {fakeUser.websites.color}">{fakeUser.websites.nama}</span>
                    </div>
                  {:else}
                    -
                  {/if}
                </td>
                <td class="px-4 py-3">{formatDate(fakeUser.created_at)}</td>
                <td class="px-4 py-3">{formatDate(fakeUser.updated_at)}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                      on:click={() => {
                        editingFakeUser = { ...fakeUser };
                        showEditModal = true;
                      }}
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-[#2a2a2a] transition-colors"
                      on:click={() => handleDelete(fakeUser.id)}
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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

  <!-- Tambahkan bulk action di atas tabel -->
  {#if selectedUsers.length > 0}
    <div class="flex items-center gap-4 mb-4 p-4 bg-[#2a2a2a] rounded-lg border border-gray-800">
      <span class="text-sm text-gray-400">
        {selectedUsers.length} item{selectedUsers.length > 1 ? 's' : ''} selected
      </span>
      <button
        class="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        on:click={handleBulkDelete}
      >
        Delete Selected
      </button>
    </div>
  {/if}

  <!-- Add Modal -->
  {#if showModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#222] rounded-xl w-full max-w-md">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">Add Fake User</h2>
          <form on:submit|preventDefault={handleAddFakeUser} class="space-y-4">
            <div>
              <label for="userid_website" class="block text-sm font-medium text-gray-400 mb-1">
                User ID Website (1 ID per baris)
              </label>
              <textarea
                id="userid_website"
                bind:value={newFakeUser.userid_website}
                placeholder="Contoh:
andi987
budi2345
cahyo678
dian5432"
                rows="7"
                class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] font-mono"
                required
              ></textarea>
            </div>
            <div>
              <label for="website_id" class="block text-sm font-medium text-gray-400 mb-1">
                Website
              </label>
              <select
                id="website_id"
                bind:value={newFakeUser.website_id}
                class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                required
              >
                <option value="">Pilih Website</option>
                {#each websites as website}
                  <option 
                    value={website.id} 
                    style="color: {website.color}"
                  >
                    {website.nama}
                  </option>
                {/each}
              </select>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                on:click={() => showModal = false}
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- Tambahkan Edit Modal setelah Add Modal -->
  {#if showEditModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#222] rounded-xl w-full max-w-md">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">Edit Fake User</h2>
          <form on:submit|preventDefault={handleEdit} class="space-y-4">
            <div>
              <label for="edit_userid_website" class="block text-sm font-medium text-gray-400 mb-1">
                User ID Website
              </label>
              <input
                type="text"
                id="edit_userid_website"
                bind:value={editingFakeUser.userid_website}
                class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                required
              />
            </div>
            <div>
              <label for="edit_website_id" class="block text-sm font-medium text-gray-400 mb-1">
                Website
              </label>
              <select
                id="edit_website_id"
                bind:value={editingFakeUser.website_id}
                class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                required
              >
                <option value="">Pilih Website</option>
                {#each websites as website}
                  <option 
                    value={website.id}
                    style="color: {website.color}"
                  >
                    {website.nama}
                  </option>
                {/each}
              </select>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                on:click={() => showEditModal = false}
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- Tambahkan info jika tidak ada data -->
  {#if !loading && fakeUsers.length === 0}
    <div class="text-center py-8 text-gray-400">
      Tidak ada data fake users
    </div>
  {/if}

  <!-- Update pagination UI -->
  {#if totalPages > 1}
    <div class="flex justify-between items-center px-4 py-3 border-t border-gray-800">
      <div class="text-sm text-gray-400">
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFakeUsers.length)} of {filteredFakeUsers.length} entries
      </div>
      <div class="flex items-center gap-1">
        <!-- Previous button -->
        <button
          class="px-3 py-1 rounded-lg bg-[#2a2a2a] text-gray-400 hover:text-white disabled:opacity-50"
          disabled={currentPage === 1}
          on:click={() => currentPage = Math.max(1, currentPage - 1)}
        >
          Previous
        </button>

        <!-- Page numbers -->
        {#each visiblePages as pageNum, i}
          {#if i > 0 && pageNum > visiblePages[i - 1] + 1}
            <span class="px-2 text-gray-600">...</span>
          {/if}
          <button
            class="min-w-[32px] px-2 py-1 rounded-lg text-sm {currentPage === pageNum ? 'bg-[#e62020] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:text-white'}"
            on:click={() => currentPage = pageNum}
          >
            {pageNum}
          </button>
        {/each}

        <!-- Next button -->
        <button
          class="px-3 py-1 rounded-lg bg-[#2a2a2a] text-gray-400 hover:text-white disabled:opacity-50"
          disabled={currentPage === totalPages}
          on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div> 