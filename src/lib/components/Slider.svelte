<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import SliderSkeleton from './SliderSkeleton.svelte';

  export let images: string[] = [];
  export let interval = 3000;
  
  let currentIndex = 0;
  let timer: NodeJS.Timeout;
  let loading = true;
  let error = null;
  let isPaused = false;
  let touchStart = 0;
  let touchEnd = 0;

  // Fungsi untuk mengambil data slider
  async function fetchSlides() {
    try {
      const response = await fetch('/api/slider');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      images = data.map(slide => slide.image);
    } catch (err) {
      error = err.message;
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchSlides();
    startSlider();
    return () => clearInterval(timer);
  });

  function startSlider() {
    timer = setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
    }, interval);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
    }
  }
</script>

{#if loading}
  <SliderSkeleton />
{:else}
  <div class="relative w-full h-[400px] overflow-hidden rounded-2xl border border-gray-800/50 bg-gradient-to-br from-[#1a1a1a] to-[#222] shadow-xl shadow-black/20 backdrop-blur-sm group">
    <!-- Decorative Elements -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#e62020]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div class="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#e62020]/5 blur-3xl group-hover:bg-[#e62020]/10 transition-all duration-500" />
    <div class="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-[#e62020]/5 blur-3xl group-hover:bg-[#e62020]/10 transition-all duration-500" />

    {#if error}
      <div class="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
        <div class="text-[#e62020] text-center">
          <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-lg font-medium">{error}</p>
        </div>
      </div>
    {/if}

    {#each images as image, index}
      {#if index === currentIndex}
        <div
          in:fade={{ duration: 1000 }}
          class="absolute inset-0 transform transition-transform duration-500 group-hover:scale-105"
        >
          <img
            src={image}
            alt="Slide {index + 1}"
            loading={index === 0 ? 'eager' : 'lazy'}
            class="w-full h-full object-cover transition-all duration-500"
            on:error={(e) => {
              console.error(`Failed to load image: ${image}`);
              (e.target as HTMLImageElement).src = '/images/fallback.jpg';
            }}
          />
          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-50" />
        </div>
      {/if}
    {/each}

    <!-- Navigation Dots -->
    <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
      {#each images as _, index}
        <button
          on:click={() => currentIndex = index}
          class="relative h-1 w-8 rounded-full overflow-hidden transition-all duration-300 {
            index === currentIndex 
              ? 'bg-[#e62020]/20' 
              : 'bg-white/10 hover:bg-white/20'
          }"
        >
          <div 
            class="absolute inset-0 bg-[#e62020] rounded-full transition-all duration-500 origin-left {
              index === currentIndex 
                ? 'scale-x-100' 
                : 'scale-x-0'
            }"
          />
        </button>
      {/each}
    </div>

    <!-- Navigation Arrows -->
    <div class="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        on:click={() => currentIndex = (currentIndex - 1 + images.length) % images.length}
        class="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center border border-white/10 transition-all duration-300 hover:bg-[#e62020]/80 hover:border-[#e62020]/50 hover:scale-110"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        on:click={() => currentIndex = (currentIndex + 1) % images.length}
        class="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center border border-white/10 transition-all duration-300 hover:bg-[#e62020]/80 hover:border-[#e62020]/50 hover:scale-110"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  /* Animasi untuk progress bar */
  @keyframes progress {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  
  .scale-x-100 {
    animation: progress 3s linear;
  }
  
  /* Hover effect untuk bar */
  button:hover .scale-x-0 {
    transform: scaleX(0.3);
  }
</style> 