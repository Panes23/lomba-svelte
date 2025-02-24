<script lang="ts">
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';
  let showTerms = null;
  let currentPage = 1;
  const itemsPerPage = 8;

  export let data;
  $: markets = data.markets;

  // Pagination logic
  $: totalPages = Math.ceil(filteredMarkets.length / itemsPerPage);
  $: paginatedMarkets = filteredMarkets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Format waktu
  function formatTime(timeString) {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
    console.log('Terms:', terms); // Untuk debugging
    showTerms = showTerms ? null : terms;
  }

  // Filter markets
  $: filteredMarkets = markets.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
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

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">Pasaran Lomba</h1>
    <div class="w-64">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari pasaran..."
        class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
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
                      src={item.image} 
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
</div> 