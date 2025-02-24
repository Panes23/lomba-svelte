<script lang="ts">
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';

  export let data;
  $: socialMedia = data.socialMedia;

  // Filter social media
  $: filteredSocialMedia = socialMedia.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">Media Social</h1>
    <div class="w-64">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari media social..."
        class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
      />
    </div>
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">Icon</th>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">URL</th>
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
            {#each filteredSocialMedia as item}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">
                  <div class="w-8 h-8 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
                      <path fill="currentColor" d={item.icon} />
                    </svg>
                  </div>
                </td>
                <td class="px-4 py-3">{item.name}</td>
                <td class="px-4 py-3">
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#e62020] hover:underline"
                  >
                    {item.url}
                  </a>
                </td>
                <td class="px-4 py-3">
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-3 py-1.5 rounded bg-[#2a2a2a] text-gray-300 hover:text-white transition-colors w-fit"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d={item.icon} />
                    </svg>
                    <span class="text-sm">{item.name}</span>
                  </a>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div> 