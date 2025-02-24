<script lang="ts">
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';

  export let data;
  $: slides = data.slides;

  // Filter slides
  $: filteredSlides = slides.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">Slides</h1>
    <div class="w-64">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari slide..."
        class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
      />
    </div>
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">Image</th>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3">Button</th>
            <th class="px-4 py-3">Preview</th>
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
            {#each filteredSlides as item}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">
                  {#if item.image}
                    <img 
                      src={item.image} 
                      alt={item.title}
                      class="w-16 h-10 rounded object-cover"
                    />
                  {:else}
                    -
                  {/if}
                </td>
                <td class="px-4 py-3">{item.title}</td>
                <td class="px-4 py-3">
                  <p class="line-clamp-2 text-sm text-gray-400">
                    {item.description}
                  </p>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-medium">{item.button_text}</span>
                    <a 
                      href={item.button_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-[#e62020] hover:underline truncate max-w-[200px]"
                    >
                      {item.button_link}
                    </a>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <button
                    class="px-4 py-1.5 rounded bg-[#e62020] text-white text-sm font-medium hover:bg-opacity-90 transition-colors"
                  >
                    {item.button_text}
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div> 