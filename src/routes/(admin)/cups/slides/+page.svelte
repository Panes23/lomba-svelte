<script lang="ts">
  import Swal from '$lib/utils/swal';
  import { dndzone } from 'svelte-dnd-action';
  import { slidesStore } from '$lib/stores/slidesStore';

  let loading = false;
  let desktopImageLoading = false;
  let mobileImageLoading = false;
  let searchQuery = '';
  let showModal = false;
  let showEditModal = false;
  let newSlide = {
    title: '',
    description: '',
    image: '',
    image_mobile: '',
    button_text: '',
    button_link: ''
  };
  let editingSlide = {
    id: '',
    title: '',
    description: '',
    image: '',
    image_mobile: '',
    button_text: '',
    button_link: ''
  };
  let desktopImagePreview = '';
  let mobileImagePreview = '';
  let editDesktopImagePreview = '';
  let editMobileImagePreview = '';

  export let data;
  $: slides = data.slides;
  let oldSlides: typeof slides = [];

  // Filter slides
  $: filteredSlides = slides.filter(item => 
    searchQuery === '' || (
      (item.title?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    )
  );

  // Handle drag & drop
  async function handleDndConsider(e) {
    filteredSlides = e.detail.items;
  }

  async function handleDndFinalize(e) {
    filteredSlides = e.detail.items;
    
    try {
      loading = true;
      const updates = filteredSlides.map((slide, index) => ({
        ...slide,
        position: index,
        updated_at: new Date().toISOString()
      }));

      // Update melalui API endpoint
      const response = await fetch('/api/slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: updates })
      });

      if (!response.ok) throw new Error('Failed to update positions');

      // Refresh data
      await slidesStore.fetch();
    } catch (err) {
      console.error('Error updating positions:', err);
      // Revert changes on error
      slides = [...oldSlides];
    } finally {
      loading = false;
    }
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', 'slides');
    
    const response = await fetch('/api/bunny/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload image');
    const data = await response.json();
    return data.url;
  }

  async function handleAddSlide() {
    try {
      loading = true;
      
      // Get max position
      const maxPosition = Math.max(...slides.map(s => s.position ?? 0), -1) + 1;

      // Get file inputs
      const fileInput = document.querySelector<HTMLInputElement>('#slideImage');
      const fileMobileInput = document.querySelector<HTMLInputElement>('#slideMobileImage');
      const file = fileInput?.files?.[0];
      const fileMobile = fileMobileInput?.files?.[0];
      
      if (!file || !fileMobile) {
        throw new Error('Please select both desktop and mobile images');
      }

      // Upload ke Bunny.net dengan path 'slides'
      const imageUrl = await uploadFile(file);
      const imageMobileUrl = await uploadFile(fileMobile);

      const response = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSlide.title,
          description: newSlide.description,
          image: imageUrl,
          image_mobile: imageMobileUrl,
          button_text: newSlide.button_text,
          button_link: newSlide.button_link,
          position: maxPosition,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add slide');
      }

      const { data } = await response.json();
      
      // Update local state
      slides = [...slides, {
        id: data.id,
        title: newSlide.title,
        description: newSlide.description,
        image: imageUrl,
        image_mobile: imageMobileUrl,
        button_text: newSlide.button_text,
        button_link: newSlide.button_link,
        position: maxPosition,
        created_at: new Date().toISOString()
      }];
      // Trigger reactive update
      slides = slides;
      filteredSlides = filteredSlides;

      // Refresh slides data
      await slidesStore.fetch();

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Slide berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Reset form dan tutup modal
      newSlide = { title: '', description: '', image: '', image_mobile: '', button_text: '', button_link: '' };
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

      let imageUrl = editingSlide.image;
      let imageMobileUrl = editingSlide.image_mobile;

      // Check if new image is selected
      const fileInput = document.querySelector<HTMLInputElement>('#editSlideImage');
      const fileMobileInput = document.querySelector<HTMLInputElement>('#editSlideMobileImage');
      const file = fileInput?.files?.[0];
      const fileMobile = fileMobileInput?.files?.[0];
      
      if (file) {
        // Gunakan fungsi uploadFile alih-alih implementasi langsung
        imageUrl = await uploadFile(file);
        
        // Delete old file
        if (editingSlide.image) {
          await fetch('/api/bunny/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: editingSlide.image })
          });
        }
      }
      
      if (fileMobile) {
        // Gunakan fungsi uploadFile untuk mobile image juga
        imageMobileUrl = await uploadFile(fileMobile);
        
        // Delete old file
        if (editingSlide.image_mobile) {
          await fetch('/api/bunny/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: editingSlide.image_mobile })
          });
        }
      }

      const response = await fetch(`/api/slides/${editingSlide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingSlide,
          image: imageUrl,
          image_mobile: imageMobileUrl,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to update slide');
      const { data } = await response.json();

      // Update local state dan urutkan berdasarkan updated_at terbaru
      slides = slides
        .map(slide => slide.id === editingSlide.id ? data : slide)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      // Refresh slides data
      await slidesStore.fetch();

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Slide berhasil diupdate',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
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
        title: 'Hapus Slide?',
        text: 'Slide yang dihapus tidak dapat dikembalikan',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e62020',
        cancelButtonColor: '#3f3f3f',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        loading = true;
        oldSlides = [...slides];

        const response = await fetch('/api/slides', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: slide.id,
            imageUrl: slide.image,
            imageMobileUrl: slide.image_mobile
          })
        });

        if (!response.ok) {
          throw new Error('Failed to delete slide');
        }

        // Update local state
        slides = slides.filter(s => s.id !== slide.id);
        // Trigger reactive update
        slides = slides;
        filteredSlides = filteredSlides;

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Slide berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      slides = [...oldSlides];
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

  async function handleDesktopImagePreview(e) {
    const file = e.target.files?.[0];
    if (file) {
      desktopImageLoading = true;
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          desktopImagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } finally {
        desktopImageLoading = false;
      }
    }
  }

  async function handleMobileImagePreview(e) {
    const file = e.target.files?.[0];
    if (file) {
      mobileImageLoading = true;
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          mobileImagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } finally {
        mobileImageLoading = false;
      }
    }
  }

  async function handleEditDesktopImagePreview(e) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          editDesktopImagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Preview error:', err);
      }
    }
  }

  async function handleEditMobileImagePreview(e) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          editMobileImagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Preview error:', err);
      }
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
            <th class="px-4 py-3 text-gray-400 font-medium">#</th>
            <th class="px-4 py-3">Desktop Image</th>
            <th class="px-4 py-3">Mobile Image</th>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3">Button</th>
            <th class="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody 
          class="divide-y divide-gray-800"
          use:dndzone={{items: filteredSlides, dragDisabled: loading}}
          on:consider={handleDndConsider}
          on:finalize={handleDndFinalize}
        >
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
            {#each filteredSlides as item (item.id)}
              <tr 
                class="text-gray-300 hover:bg-[#2a2a2a] transition-colors cursor-move"
                data-id={item.id}
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                    <span class="text-sm text-gray-400">{item.position ?? 0}</span>
                  </div>
                </td>
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
                <td class="px-4 py-3">
                  {#if item.image_mobile}
                    <img 
                      src={item.image_mobile} 
                      alt={`${item.title} (Mobile)`}
                      class="w-10 h-16 rounded object-cover"
                    />
                  {:else}
                    -
                  {/if}
                </td>
                <td class="px-4 py-3">{item.title || '-'}</td>
                <td class="px-4 py-3">
                  <p class="line-clamp-2 text-sm text-gray-400">
                    {item.description || '-'}
                  </p>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-medium">{item.button_text || '-'}</span>
                    {#if item.button_link}
                      <a 
                        href={item.button_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-xs text-[#e62020] hover:underline truncate max-w-[200px]"
                      >
                        {item.button_link}
                      </a>
                    {:else}
                      <span class="text-xs text-gray-400">-</span>
                    {/if}
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

  <!-- Modal Add/Edit Slide -->
  {#if showModal || showEditModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-8 w-full max-w-5xl mx-4">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-2xl font-bold text-white">
            {showModal ? 'Add New Slide' : 'Edit Slide'}
          </h3>
          <button 
            on:click={() => showModal ? (showModal = false) : (showEditModal = false)}
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form on:submit|preventDefault={showModal ? handleAddSlide : handleUpdate}>
          <div class="flex gap-8">
            <!-- Form Fields -->
            <div class="flex-1 space-y-6">
              <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 h-full">
                <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">Informasi Slide</h4>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Title</label>
                    {#if showModal}
                      <input
                        type="text"
                        bind:value={newSlide.title}
                        placeholder="Masukkan judul slide"
                        class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                      />
                    {:else}
                      <input
                        type="text"
                        bind:value={editingSlide.title}
                        placeholder="Masukkan judul slide"
                        class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                      />
                    {/if}
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Description</label>
                    {#if showModal}
                      <textarea
                        bind:value={newSlide.description}
                        rows="5"
                        placeholder="Masukkan deskripsi slide"
                        class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all resize-none"
                      ></textarea>
                    {:else}
                      <textarea
                        bind:value={editingSlide.description}
                        rows="4"
                        placeholder="Masukkan deskripsi slide"
                        class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all resize-none"
                      ></textarea>
                    {/if}
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-2">Button Text</label>
                      {#if showModal}
                        <input
                          type="text"
                          bind:value={newSlide.button_text}
                          placeholder="Masukkan teks tombol"
                          class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                        />
                      {:else}
                        <input
                          type="text"
                          bind:value={editingSlide.button_text}
                          placeholder="Masukkan teks tombol"
                          class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                        />
                      {/if}
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-2">Button Link</label>
                      {#if showModal}
                        <input
                          type="text"
                          bind:value={newSlide.button_link}
                          placeholder="Masukkan link tombol"
                          class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                        />
                      {:else}
                        <input
                          type="text"
                          bind:value={editingSlide.button_link}
                          placeholder="Masukkan link tombol"
                          class="w-full bg-[#222] text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020] focus:ring-2 focus:ring-[#e62020]/20 transition-all"
                        />
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image Upload -->
            <div class="w-96 space-y-6 h-full">
              <div class="p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 h-full">
                <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">Upload Gambar</h4>
                <div class="space-y-8">
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">
                      Desktop Image 
                      <span class="text-xs text-gray-500 ml-1">(1250x505 pixel)</span>
                    </label>
                    <div class="relative border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-[#e62020] hover:bg-[#e62020]/5 transition-all group cursor-pointer">
                      <input
                        type="file"
                        id={showModal ? "slideImage" : "editSlideImage"}
                        accept="image/*"
                        required={showModal}
                        on:change={showModal ? handleDesktopImagePreview : handleEditDesktopImagePreview}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {#if (showModal ? desktopImagePreview : editDesktopImagePreview) || (!showModal && editingSlide.image)}
                        <img 
                          src={showModal ? desktopImagePreview : (editDesktopImagePreview || editingSlide.image)}
                          alt="Preview"
                          class="w-full h-40 object-cover rounded-lg shadow-lg"
                        />
                      {:else}
                        <div class="text-gray-400 group-hover:text-[#e62020] transition-colors">
                          <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span class="text-sm font-medium">Klik untuk upload gambar desktop</span>
                          <p class="text-xs text-gray-500 mt-1">atau drag & drop file di sini</p>
                        </div>
                      {/if}
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">
                      Mobile Image
                      <span class="text-xs text-gray-500 ml-1">(360x400 pixel)</span>
                    </label>
                    <div class="relative border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-[#e62020] hover:bg-[#e62020]/5 transition-all group cursor-pointer">
                      <input
                        type="file"
                        id={showModal ? "slideMobileImage" : "editSlideMobileImage"}
                        accept="image/*"
                        required={showModal}
                        on:change={showModal ? handleMobileImagePreview : handleEditMobileImagePreview}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {#if (showModal ? mobileImagePreview : editMobileImagePreview) || (!showModal && editingSlide.image_mobile)}
                        <img 
                          src={showModal ? mobileImagePreview : (editMobileImagePreview || editingSlide.image_mobile)}
                          alt="Preview"
                          class="w-full h-40 object-cover rounded-lg shadow-lg"
                        />
                      {:else}
                        <div class="text-gray-400 group-hover:text-[#e62020] transition-colors">
                          <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span class="text-sm font-medium">Klik untuk upload gambar mobile</span>
                          <p class="text-xs text-gray-500 mt-1">atau drag & drop file di sini</p>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            disabled={loading}
            class="w-full bg-gradient-to-r from-[#e62020] to-[#ff0000] text-white py-3 rounded-xl font-medium hover:from-[#ff0000] hover:to-[#e62020] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-[#e62020]/20"
          >
            {loading ? 'Loading...' : showModal ? 'Add Slide' : 'Update Slide'}
          </button>
        </form>
      </div>
    </div>
  {/if}
</div> 