<script lang="ts">

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 8;
  let selectedDate = '';

  export let data;
  $: lomba = data.lomba;

  // Format tanggal
  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Format prize pool
  function formatPrizePool(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Pagination logic
  $: totalPages = Math.ceil(filteredLomba.length / itemsPerPage);
  $: paginatedLomba = filteredLomba.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Filter lomba
  $: filteredLomba = lomba.filter(item => {
    const matchesSearch = (
      item.guess_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result?.toString().includes(searchQuery) ||
      item.markets?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesDate = !selectedDate || item.tanggal.startsWith(selectedDate);
    
    return matchesSearch && matchesDate;
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">List Lomba</h1>
    <div class="flex items-center gap-4">
      <!-- Date Filter -->
      <div class="w-48">
        <input
          type="date"
          bind:value={selectedDate}
          class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        />
      </div>
      <!-- Search -->
      <div class="w-64">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari lomba..."
          class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        />
      </div>
    </div>
  </div>

  <!-- Reset Filters Button -->
  {#if searchQuery || selectedDate}
    <div class="flex justify-end">
      <button
        on:click={() => {
          searchQuery = '';
          selectedDate = '';
          currentPage = 1;
        }}
        class="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Reset Filter
      </button>
    </div>
  {/if}

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">Pasaran</th>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3">Prize Pool</th>
            <th class="px-4 py-3">Result</th>
            <th class="px-4 py-3">Guess Type</th>
            <th class="px-4 py-3">Max Winner</th>
            <th class="px-4 py-3">Jumlah Peserta</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          {#if loading}
            {#each Array(5) as _}
              <tr class="animate-pulse">
                {#each Array(7) as _}
                  <td class="px-4 py-3">
                    <div class="h-4 bg-gray-800 rounded w-24"></div>
                  </td>
                {/each}
              </tr>
            {/each}
          {:else}
            {#each paginatedLomba as item}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">{item.markets?.name || '-'}</td>
                <td class="px-4 py-3">{formatDate(item.tanggal)}</td>
                <td class="px-4 py-3">{formatPrizePool(item.prize_pool)}</td>
                <td class="px-4 py-3">{item.result || '-'}</td>
                <td class="px-4 py-3">{item.guess_type || '-'}</td>
                <td class="px-4 py-3">{item.max_winner || '-'}</td>
                <td class="px-4 py-3">{item.jumlah_peserta}</td>
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
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLomba.length)} of {filteredLomba.length} entries
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