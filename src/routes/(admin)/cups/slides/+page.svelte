<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
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

  // Bunny.net config
  const REGION = 'sg';
  const BASE_HOSTNAME = 'storage.bunnycdn.com';
  const HOSTNAME = `${REGION}.${BASE_HOSTNAME}`;
  const STORAGE_ZONE_NAME = 'tebakangka';
  const ACCESS_KEY = '54156f62-6023-4352-a499b292e0b8-d9b2-49c5';

  // Fungsi untuk mendapatkan path file dari URL
  function getPathFromUrl(url: string) {
    const cdnUrl = `https://${STORAGE_ZONE_NAME}.b-cdn.net/`;
    try {
      // Contoh URL: https://tebakangka.b-cdn.net/slides/1234567890-image.jpg
      const urlObj = new URL(url);
      // Ambil path setelah hostname: /slides/1234567890-image.jpg
      const path = urlObj.pathname;
      // Hapus forward slash di awal
      return path.substring(1);
    } catch (err) {
      console.error('Error parsing URL:', err);
      return '';
    }
  }

  // Fungsi untuk menghapus file dari Bunny.net
  async function deleteFromBunny(url: string) {
    try {
      const filePath = getPathFromUrl(url);
      if (!filePath) {
        throw new Error('Invalid file path');
      }

      const deleteUrl = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${filePath}`;
      console.log('Deleting file:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'AccessKey': ACCESS_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status: ${response.status}`);
      }

      console.log('File deleted successfully:', filePath);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  async function uploadToBunny(file: File) {
    try {
      const fileName = `slides/${Date.now()}-${file.name}`;
      const url = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${fileName}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'AccessKey': ACCESS_KEY,
          'Content-Type': 'application/octet-stream'
        },
        body: file
      });

      if (!response.ok) throw new Error('Upload failed');
      
      // Return CDN URL
      return `https://${STORAGE_ZONE_NAME}.b-cdn.net/${fileName}`;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  export let data;
  $: slides = data.slides.sort((a, b) => {
    // Handle null/undefined positions
    const posA = a.position ?? Number.MAX_SAFE_INTEGER;
    const posB = b.position ?? Number.MAX_SAFE_INTEGER;
    return posA - posB;
  });
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

      // Update database
      const { error } = await supabaseClient.from('slides').upsert(updates);
      
      // Update local state & store langsung
      slides = [...updates];
      slidesStore.updateSlides(updates);
    } catch (err) {
      console.error('Error updating positions:', err);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal mengupdate posisi slides',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
      // Revert changes on error
      slides = [...oldSlides];
    } finally {
      loading = false;
    }
  }

  async function handleAddSlide() {
    try {
      loading = true;
      
      // Get max position
      const maxPosition = Math.max(...slides.map(s => s.position), -1) + 1;

      // Get file inputs
      const fileInput = document.querySelector<HTMLInputElement>('#slideImage');
      const fileMobileInput = document.querySelector<HTMLInputElement>('#slideMobileImage');
      const file = fileInput?.files?.[0];
      const fileMobile = fileMobileInput?.files?.[0];
      
      if (!file || !fileMobile) {
        throw new Error('Please select both desktop and mobile images');
      }

      // Upload to Bunny.net
      const imageUrl = await uploadToBunny(file);
      const imageMobileUrl = await uploadToBunny(fileMobile);

      const { data, error } = await supabaseClient
        .from('slides')
        .insert({
          title: newSlide.title,
          description: newSlide.description,
          image: imageUrl,
          image_mobile: imageMobileUrl,
          button_text: newSlide.button_text,
          button_link: newSlide.button_link,
          position: maxPosition,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update state lokal
      slides = [data, ...slides];
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
        // Upload new image
        const newImageUrl = await uploadToBunny(file);
        // Hapus file lama setelah upload berhasil
        if (imageUrl) {
          await deleteFromBunny(imageUrl);
        }
        imageUrl = newImageUrl;
      }
      
      if (fileMobile) {
        // Upload new mobile image
        const newMobileImageUrl = await uploadToBunny(fileMobile);
        // Hapus file mobile lama setelah upload berhasil
        if (imageMobileUrl) {
          await deleteFromBunny(imageMobileUrl);
        }
        imageMobileUrl = newMobileImageUrl;
      }

      const { error } = await supabaseClient
        .from('slides')
        .update({
          title: editingSlide.title === '' ? null : editingSlide.title,
          description: editingSlide.description === '' ? null : editingSlide.description,
          image: imageUrl,
          image_mobile: imageMobileUrl,
          button_text: editingSlide.button_text === '' ? null : editingSlide.button_text,
          button_link: editingSlide.button_link === '' ? null : editingSlide.button_link,
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

      // Refresh slides data
      await slidesStore.fetch();

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

        // Hapus file dari Bunny.net
        try {
          if (slide.image) {
            await deleteFromBunny(slide.image);
          }
          if (slide.image_mobile) {
            await deleteFromBunny(slide.image_mobile);
          }
        } catch (err) {
          console.error('Failed to delete files from Bunny.net:', err);
          // Lanjutkan proses meski file gagal dihapus
        }

        const { error } = await supabaseClient
          .from('slides')
          .delete()
          .eq('id', slide.id);

        if (error) throw error;

        // Update state lokal
        slides = slides.filter(s => s.id !== slide.id);
        // Refresh slides store
        await slidesStore.fetch();

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
        text: error.message || 'Gagal menghapus slide. File mungkin sudah terhapus.',
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
          use:dndzone={{items: filteredSlides}}
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
                  <div class="flex items-center justify-center w-6 h-6 bg-gray-800 rounded">
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

  <!-- Modal Add Slide -->
  {#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-3xl mx-4">
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

        <form on:submit|preventDefault={handleAddSlide} class="flex gap-6">
          <!-- Form Fields -->
          <div class="flex-1 space-y-4">
            <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Informasi Slide</h4>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Title</label>
              <input
                type="text"
                bind:value={newSlide.title}
                placeholder="Masukkan judul slide"
                class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea
                bind:value={newSlide.description}
                rows="3"
                placeholder="Masukkan deskripsi slide"
                class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Button Text</label>
                <input
                  type="text"
                  bind:value={newSlide.button_text}
                  placeholder="Masukkan teks tombol"
                  class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Button Link</label>
                <input
                  type="text"
                  bind:value={newSlide.button_link}
                  placeholder="Masukkan link tombol"
                  class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                />
              </div>
            </div>
          </div>

          <!-- Image Upload -->
          <div class="w-72 space-y-6">
            <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Upload Gambar</h4>
            
            <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-400">
                Desktop Image 
                <span class="text-xs text-gray-500 block mt-1">(Rekomendasi: 1250x505 pixel)</span>
              </label>
              <div class="relative border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-[#e62020] transition-colors">
                <input
                  type="file"
                  id="slideImage"
                  accept="image/*"
                  required
                  on:change={handleDesktopImagePreview}
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {#if desktopImagePreview}
                  <img 
                    src={desktopImagePreview} 
                    alt="Preview"
                    class="w-full h-32 object-cover rounded-lg"
                  />
                {:else}
                  <div class="text-gray-400">
                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm">Klik untuk upload</span>
                  </div>
                {/if}
              </div>
            </div>

            <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-400">
                Mobile Image
                <span class="text-xs text-gray-500 block mt-1">(Rekomendasi: 360x400 pixel)</span>
              </label>
              <div class="relative border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-[#e62020] transition-colors">
                <input
                  type="file"
                  id="slideMobileImage"
                  accept="image/*"
                  required
                  on:change={handleMobileImagePreview}
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {#if mobileImagePreview}
                  <img 
                    src={mobileImagePreview} 
                    alt="Preview"
                    class="w-24 h-32 object-cover rounded-lg mx-auto"
                  />
                {:else}
                  <div class="text-gray-400">
                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm">Klik untuk upload</span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              disabled={loading}
              class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Loading...' : 'Add Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Modal Edit Slide -->
  {#if showEditModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#222] rounded-xl border border-gray-800 p-6 w-full max-w-3xl mx-4">
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

        <form on:submit|preventDefault={handleUpdate} class="flex gap-6">
          <!-- Form Fields -->
          <div class="flex-1 space-y-4">
            <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Informasi Slide</h4>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Title</label>
              <input
                type="text"
                bind:value={editingSlide.title}
                placeholder="Masukkan judul slide"
                class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea
                bind:value={editingSlide.description}
                rows="3"
                placeholder="Masukkan deskripsi slide"
                class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Button Text</label>
                <input
                  type="text"
                  bind:value={editingSlide.button_text}
                  placeholder="Masukkan teks tombol"
                  class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Button Link</label>
                <input
                  type="text"
                  bind:value={editingSlide.button_link}
                  placeholder="Masukkan link tombol"
                  class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                />
              </div>
            </div>
          </div>

          <!-- Image Upload -->
          <div class="w-72 space-y-6">
            <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider">Upload Gambar</h4>
            
            <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-400">
                Desktop Image 
                <span class="text-xs text-gray-500 block mt-1">(Rekomendasi: 1250x505 pixel)</span>
              </label>
              <div class="relative border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-[#e62020] transition-colors">
                <input
                  type="file"
                  id="editSlideImage"
                  accept="image/*"
                  on:change={handleEditDesktopImagePreview}
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {#if editDesktopImagePreview || editingSlide.image}
                  <img 
                    src={editDesktopImagePreview || editingSlide.image} 
                    alt="Preview"
                    class="w-full h-32 object-cover rounded-lg"
                  />
                {:else}
                  <div class="text-gray-400">
                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm">Klik untuk upload</span>
                  </div>
                {/if}
              </div>
            </div>

            <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-400">
                Mobile Image
                <span class="text-xs text-gray-500 block mt-1">(Rekomendasi: 360x400 pixel)</span>
              </label>
              <div class="relative border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-[#e62020] transition-colors">
                <input
                  type="file"
                  id="editSlideMobileImage"
                  accept="image/*"
                  on:change={handleEditMobileImagePreview}
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {#if editMobileImagePreview || editingSlide.image_mobile}
                  <img 
                    src={editMobileImagePreview || editingSlide.image_mobile} 
                    alt="Preview"
                    class="w-24 h-32 object-cover rounded-lg mx-auto"
                  />
                {:else}
                  <div class="text-gray-400">
                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm">Klik untuk upload</span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              disabled={loading}
              class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Loading...' : 'Update Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div> 