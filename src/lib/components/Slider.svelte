<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { supabaseClient } from '$lib/supabaseClient';
  import Skeleton from './Skeleton.svelte';

  let slides = [];
  let loading = true;
  let currentIndex = 0;
  let isAutoPlaying = true;
  let autoPlayInterval;
  let touchStartX = 0;
  let touchEndX = 0;

  onMount(async () => {
    try {
      const { data, error } = await supabaseClient
        .from('slides')
        .select('*');
      
      if (error) throw error;
      slides = data;
    } catch (error) {
      console.error('Error fetching slides:', error.message);
    } finally {
      loading = false;
      startSlideshow();
    }
  });

  onDestroy(() => {
    stopAutoPlay();
  });

  function startSlideshow() {
    if (!autoPlayInterval) {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    stopAutoPlay();
    startSlideshow();
  }

  function previousSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    stopAutoPlay();
    startSlideshow();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
  }

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
  }

  function handleTouchMove(e) {
    touchEndX = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const touchDiff = touchStartX - touchEndX;
    if (Math.abs(touchDiff) > 50) { // Minimum swipe distance
      if (touchDiff > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }
  }

  function handleMouseEnter() {
    stopAutoPlay();
  }

  function handleMouseLeave() {
    startSlideshow();
  }
</script>

<div 
  class="relative w-full h-[600px] overflow-hidden rounded-2xl shadow-2xl"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}
>
  {#if loading}
    <div class="w-full h-full">
      <Skeleton className="w-full h-full bg-gray-800">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="space-y-8 w-full max-w-3xl px-4">
            <!-- Title Skeleton -->
            <Skeleton className="h-12 w-3/4 mx-auto bg-gray-700 rounded-lg" />
            
            <!-- Description Skeleton -->
            <Skeleton className="h-20 w-full mx-auto bg-gray-700 rounded-lg" />
            
            <!-- Button Skeleton -->
            <Skeleton className="h-12 w-48 mx-auto bg-gray-700 rounded-lg mt-8" />
          </div>
        </div>
      </Skeleton>
    </div>
  {:else}
    <!-- Slides -->
    {#each slides as slide, i}
      {#if i === currentIndex}
        <div
          class="absolute inset-0 transition-opacity duration-1000"
          transition:fade
        >
          <div class="relative w-full h-full">
            <!-- Background Image with Gradient Overlay -->
            <div 
              class="absolute inset-0 bg-cover bg-center"
              style="background-image: url({slide.image})"
            >
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            <!-- Content -->
            <div class="absolute bottom-5 left-0 right-0 p-8 text-white text-center">
              <h2 
                class="text-4xl md:text-5xl font-bold mb-4 transform transition-all duration-700 delay-100"
                style="opacity: {i === currentIndex ? 1 : 0}; transform: translateY({i === currentIndex ? 0 : '20px'})"
              >
                {slide.title}
              </h2>
              <p 
                class="text-lg md:text-xl text-gray-200 transform transition-all duration-700 delay-200"
                style="opacity: {i === currentIndex ? 1 : 0}; transform: translateY({i === currentIndex ? 0 : '20px'})"
              >
                {slide.description}
              </p>
            </div>
          </div>
        </div>
      {/if}
    {/each}

    <!-- Navigation Arrows -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      on:click={previousSlide}
    >
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
      on:click={nextSlide}
    >
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Dots Navigation -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
      {#each slides as _, i}
        <button
          class="w-8 h-1.5 rounded-full transition-all duration-500 {i === currentIndex ? 'bg-white w-12' : 'bg-white/30 hover:bg-white/50'}"
          on:click={() => goToSlide(i)}
          aria-label="Go to slide {i + 1}"
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Optional: Add smooth scroll behavior */
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 