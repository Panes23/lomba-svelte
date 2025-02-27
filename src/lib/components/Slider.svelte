<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import SliderSkeleton from './SliderSkeleton.svelte';
  import { slidesStore } from '$lib/stores/slidesStore';
  import { invalidate } from '$app/navigation';

  // Page options
  export const prerender = false;
  export const ssr = false;
  export const csr = true;

  // Props
  export let interval = 3000;
  export let data = { slides: [] };

  // Local state
  let currentIndex = 0;
  let timer: NodeJS.Timeout;
  let loading = true;
  let error = null;
  let isPaused = false;
  let touchStart = 0;
  let touchEnd = 0;
  let isMobile = false;
  $: slides = data?.slides || [];

  // Reset slider ketika data berubah
  $: if (slides) {
    currentIndex = 0;
    if (timer) {
      clearInterval(timer);
      startSlider();
    }
  }

  function startSlider() {
    timer = setInterval(() => {
      if (!isPaused && slides.length > 0) {
        currentIndex = (currentIndex + 1) % slides.length;
      }
    }, interval);
  }

  function checkMobile() {
    isMobile = window.innerWidth <= 768;
  }

  function handleTouchStart(e: TouchEvent) {
    touchStart = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent) {
    touchEnd = e.changedTouches[0].clientX;
    const swipeDistance = touchEnd - touchStart;
    
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      } else {
        currentIndex = (currentIndex + 1) % slides.length;
      }
    }
  }

  onMount(() => {
    checkMobile();
    startSlider();
    window.addEventListener('resize', checkMobile);

    // Pindahkan fetch data ke IIFE terpisah
    (async () => {
      try {
        loading = true;
        await Promise.all([
          invalidate('app:markets'),
          invalidate('app:slides')
        ]);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        loading = false;
      }
    })();

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  });
</script>

{#if loading}
  <SliderSkeleton />
{:else if error}
  <div class="text-center text-red-500 py-8">
    {error}
  </div>
{:else if slides.length > 0}
  <div 
    class="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden group"
    on:mouseenter={() => isPaused = true}
    on:mouseleave={() => isPaused = false}
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
    role="region"
    aria-label="Image Slider"
  >
    {#each slides as slide, i}
      {#if i === currentIndex}
        <div
          class="absolute inset-0 bg-black"
          transition:fade={{ duration: 800 }}
        >
          <img
            src={isMobile ? slide.image_mobile : slide.image}
            alt={slide.title || ''}
            class="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          
          <!-- Content -->
          <div class="absolute inset-0 flex items-center justify-center z-[5]">
            <div class="max-w-lg mx-auto px-4 text-center">
              {#if slide.title}
                <h2 
                  class="text-3xl md:text-4xl font-bold text-white mb-4" 
                  transition:fly={{ y: 20, duration: 800, easing: quintOut }}
                >
                  {slide.title}
                </h2>
              {/if}

              {#if slide.description}
                <p 
                  class="text-lg text-gray-200 mb-8" 
                  transition:fly={{ y: 20, duration: 800, delay: 200, easing: quintOut }}
                >
                  {slide.description}
                </p>
              {/if}

              {#if slide.button_link}
                <a
                  href={slide.button_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-block bg-[#e62020] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#ff0000] transition-all duration-300 transform hover:-translate-y-0.5 z-20"
                  transition:fly={{ y: 20, duration: 800, delay: 400, easing: quintOut }}
                >
                  {slide.button_text || 'Selengkapnya'}
                </a>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/each}

    <!-- Navigation arrows dengan pointer-events-none pada container -->
    <div class="absolute inset-0 flex items-center justify-between px-4 z-[40] pointer-events-none">
      <button
        class="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center border border-white/10 transition-all duration-300 hover:bg-[#e62020]/80 hover:border-[#e62020]/50 hover:scale-110 opacity-0 group-hover:opacity-100 pointer-events-auto"
        on:click={() => currentIndex = (currentIndex - 1 + slides.length) % slides.length}
        aria-label="Previous slide"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        class="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center border border-white/10 transition-all duration-300 hover:bg-[#e62020]/80 hover:border-[#e62020]/50 hover:scale-110 opacity-0 group-hover:opacity-100 pointer-events-auto"
        on:click={() => currentIndex = (currentIndex + 1) % slides.length}
        aria-label="Next slide"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Navigation dots dengan z-index di tengah -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center flex-wrap justify-center gap-1.5 z-[20] max-w-[90%] px-2">
      {#each slides as _, i}
        <button
          class="{isMobile ? 'w-2 h-2' : 'w-3 h-3'} rounded-full overflow-hidden bg-white/20 transition-all"
          aria-label="Go to slide {i + 1}"
          on:click={() => currentIndex = i}
        >
          <div 
            class="h-full w-full bg-[#e62020] rounded-full transition-all duration-300 {
              i === currentIndex ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }"
          />
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }
  
  .scale-100 {
    animation: pulse 2s ease-in-out infinite;
  }
</style> 