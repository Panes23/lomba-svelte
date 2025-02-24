<script lang="ts">
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 8;

  export let data;
  $: websites = data.websites;

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

  // Get text color based on background
  function getTextColor(bgColor: string) {
    // Warna terang menggunakan teks hitam
    const lightColors = ['#ffffff', '#d7e2ef', '#b8d560', '#e4c658', '#dcc672', '#c5c5c5', '#58d4ee'];
    return lightColors.includes(bgColor.toLowerCase()) ? '#222222' : '#ffffff';
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">Websites</h1>
    <div class="w-64">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari website..."
        class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
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
</div> 