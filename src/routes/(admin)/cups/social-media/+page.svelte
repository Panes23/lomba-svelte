<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';
  let showEditModal = false;
  let editingSocial = {
    id: '',
    name: '',
    url: '',
    icon: ''
  };

  export let data;
  $: socialMedia = data.socialMedia;
  let oldSocialMedia: typeof socialMedia = [];

  function handleEdit(social) {
    editingSocial = {
      id: social.id,
      name: social.name,
      url: social.url,
      icon: social.icon
    };
    showEditModal = true;
  }

  async function handleUpdate() {
    try {
      loading = true;
      oldSocialMedia = [...socialMedia];

      const { error } = await supabaseClient
        .from('social_media')
        .update({
          url: editingSocial.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSocial.id);

      if (error) throw error;

      // Update state lokal
      socialMedia = socialMedia.map(social => 
        social.id === editingSocial.id 
          ? { ...social, url: editingSocial.url }
          : social
      );

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Social media berhasil diupdate',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      showEditModal = false;
    } catch (error) {
      console.error('Error:', error);
      socialMedia = oldSocialMedia;
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate social media',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Filter social media
  $: filteredSocialMedia = socialMedia.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="space-y-6 px-6 py-10">
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
            {#each filteredSocialMedia as social}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">
                  <div class="w-8 h-8 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
                      <path fill="currentColor" d={social.icon} />
                    </svg>
                  </div>
                </td>
                <td class="px-4 py-3">{social.name}</td>
                <td class="px-4 py-3">
                  <a 
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#e62020] hover:underline"
                  >
                    {social.url}
                  </a>
                </td>
                <td class="px-4 py-3">
                  <a 
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-3 py-1.5 rounded bg-[#2a2a2a] text-gray-300 hover:text-white transition-colors w-fit"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d={social.icon} />
                    </svg>
                    <span class="text-sm">{social.name}</span>
                  </a>
                </td>
                <td class="px-4 py-3">
                  <button
                    on:click={() => handleEdit(social)}
                    class="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal Edit Social Media -->
  {#if showEditModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Edit {editingSocial.name}</h3>
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
            <label class="block text-sm font-medium text-gray-400 mb-2">URL</label>
            <input
              type="url"
              bind:value={editingSocial.url}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Update URL'}
          </button>
        </form>
      </div>
    </div>
  {/if}
</div> 