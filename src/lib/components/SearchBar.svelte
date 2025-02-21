<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let searchQuery = '';

  function handleSearch(event) {
    const query = event.target.value;
    searchQuery = query;
    dispatch('search', { query });
  }
</script>

<div class="relative">
  <input 
    type="text" 
    bind:value={searchQuery}
    on:input={handleSearch}
    placeholder="Cari pasaran..." 
    class="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
  >
  <svg class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</div> 