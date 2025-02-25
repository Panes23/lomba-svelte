<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let searchQuery = '';
  let showModal = false;
  let showEditModal = false;
  let newSlide = {
    title: '',
    description: '',
    image: '',
    button_text: '',
    button_link: ''
  };
  let editingSlide = {
    id: '',
    title: '',
    description: '',
    image: '',
    button_text: '',
    button_link: ''
  };

  export let data;
  $: slides = data.slides;
  let oldSlides: typeof slides = [];

  // Filter slides
  $: filteredSlides = slides.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleAddSlide() {
    try {
      loading = true;

      const { error } = await supabaseClient
        .from('slides')
        .insert({
          title: newSlide.title,
          description: newSlide.description,
          image: newSlide.image,
          button_text: newSlide.button_text,
          button_link: newSlide.button_link,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update state lokal
      slides = [{
        id: crypto.randomUUID(),
        ...newSlide,
        created_at: new Date().toISOString()
      }, ...slides];

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Slide berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Reset form dan tutup modal
      newSlide = { title: '', description: '', image: '', button_text: '', button_link: '' };
      showModal = false;
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan slide',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  function handleEdit(slide) {
    editingSlide = { ...slide };
    showEditModal = true;
  }

  async function handleUpdate() {
    try {
      loading = true;
      oldSlides = [...slides];

      const { error } = await supabaseClient
        .from('slides')
        .update({
          title: editingSlide.title,
          description: editingSlide.description,
          image: editingSlide.image,
          button_text: editingSlide.button_text,
          button_link: editingSlide.button_link,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSlide.id);

      if (error) throw error;

      // Update state lokal
      slides = slides.map(slide => 
        slide.id === editingSlide.id 
          ? { ...editingSlide }
          : slide
      );

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Slide berhasil diupdate',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      showEditModal = false;
    } catch (error) {
      console.error('Error:', error);
      slides = oldSlides;
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate slide',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  async function handleDelete(slide) {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin ingin menghapus slide ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e62020',
        cancelButtonColor: '#3f3f46',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        loading = true;

        const { error } = await supabaseClient
          .from('slides')
          .delete()
          .eq('id', slide.id);

        if (error) throw error;

        // Update state lokal
        slides = slides.filter(s => s.id !== slide.id);

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Slide berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menghapus slide',
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
    <h1 class="text-2xl font-bold text-white">Slides</h1>
    <div class="flex items-center gap-4">
      <button
        on:click={() => showModal = true}
        class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Add Slide
      </button>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari slide..."
        class="w-64 bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
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
            <th class="px-4 py-3">Action</th>
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
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => handleEdit(item)}
                      class="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => handleDelete(item)}
                      class="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      Delete
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

  <!-- Modal Add Slide -->
  {#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Add New Slide</h3>
          <button 
            on:click={() => showModal = false}
            class="text-gray-400 hover:text-white"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form on:submit|preventDefault={handleAddSlide} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Image URL</label>
            <input
              type="url"
              bind:value={newSlide.image}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <input
              type="text"
              bind:value={newSlide.title}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              bind:value={newSlide.description}
              required
              rows="3"
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Button Text</label>
            <input
              type="text"
              bind:value={newSlide.button_text}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Button Link</label>
            <input
              type="text"
              bind:value={newSlide.button_link}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Add Slide'}
          </button>
        </form>
      </div>
    </div>
  {/if}

  <!-- Modal Edit Slide -->
  {#if showEditModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Edit Slide</h3>
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
            <label class="block text-sm font-medium text-gray-400 mb-2">Image URL</label>
            <input
              type="url"
              bind:value={editingSlide.image}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <input
              type="text"
              bind:value={editingSlide.title}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              bind:value={editingSlide.description}
              required
              rows="3"
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Button Text</label>
            <input
              type="text"
              bind:value={editingSlide.button_text}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Button Link</label>
            <input
              type="text"
              bind:value={editingSlide.button_link}
              required
              class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Update Slide'}
          </button>
        </form>
      </div>
    </div>
  {/if}
</div> 