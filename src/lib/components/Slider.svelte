<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  let slides = [];
  let currentSlide = 0;
  let loading = true;
  let error = null;
  let autoplayInterval: NodeJS.Timeout;
  let isPaused = false;
  let touchStart = 0;
  let touchEnd = 0;

  // Fungsi untuk mengambil data slider
  async function fetchSlides() {
    try {
      const response = await fetch('/api/slider');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      slides = data;
    } catch (err) {
      error = err.message;
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  }

  // Fungsi untuk navigasi slide
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }

  function goToSlide(index: number) {
    currentSlide = index;
  }

  // Fungsi untuk autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
  }

  // Touch event handlers
  function handleTouchStart(e: TouchEvent) {
    touchStart = e.touches[0].clientX;
    isPaused = true;
    stopAutoplay();
  }

  function handleTouchMove(e: TouchEvent) {
    touchEnd = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const swipeDistance = touchStart - touchEnd;
    if (Math.abs(swipeDistance) > 50) { // Minimal swipe distance
      if (swipeDistance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    isPaused = false;
    startAutoplay();
  }

  // Mouse event handlers
  function handleMouseEnter() {
    isPaused = true;
    stopAutoplay();
  }

  function handleMouseLeave() {
    isPaused = false;
    startAutoplay();
  }

  onMount(() => {
    fetchSlides();
    startAutoplay();
  });

  onDestroy(() => {
    stopAutoplay();
  });
</script>

<div 
  class="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl group"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}
>
  {#if loading}
    <div class="absolute inset-0 bg-gray-900 animate-pulse" />
  {:else if error}
    <div class="absolute inset-0 bg-red-900/20 flex items-center justify-center">
      <p class="text-red-500">{error}</p>
    </div>
  {:else}
    <!-- Slides -->
    {#each slides as slide, index}
      {#if index === currentSlide}
        <div
          in:fly={{ x: 300, duration: 800, easing: quintOut }}
          out:fly={{ x: -300, duration: 800, easing: quintOut }}
          class="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            class="w-full h-full object-cover transform transition-transform duration-[400ms] group-hover:scale-105"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div 
              class="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500"
              in:fly={{ y: 50, duration: 800, delay: 300 }}
            >
              <h2 class="text-3xl md:text-4xl font-bold text-white mb-3">{slide.title}</h2>
              <p class="text-lg text-gray-200 max-w-2xl">{slide.description}</p>
            </div>
          </div>
        </div>
      {/if}
    {/each}

    <!-- Navigation Arrows -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
      on:click={prevSlide}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
    
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
      on:click={nextSlide}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </button>

    <!-- Progress Bar -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
      <div 
        class="h-full bg-white/80 transition-all duration-[5000ms] ease-linear"
        style="width: {isPaused ? '0%' : '100%'}"
      />
    </div>

    <!-- Dots navigation -->
    <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
      {#each slides as _, index}
        <div class="relative">
          <!-- Background track -->
          <div class="w-8 h-1 rounded-full bg-white/20" />
          
          <!-- Active indicator -->
          <div
            class="absolute top-0 left-0 w-8 h-1 rounded-full transition-all duration-500 ease-out"
            class:scale-x-0={currentSlide !== index}
            class:opacity-0={currentSlide !== index}
            style="background: linear-gradient(90deg, rgba(255,255,255,0.5) 0%, #ffffff 100%); transform-origin: {currentSlide > index ? 'right' : 'left'}"
          />
          
          <!-- Clickable button -->
          <button
            class="absolute inset-0 w-8 h-4 -top-1.5 rounded-full hover:bg-white/10 transition-colors"
            on:click={() => goToSlide(index)}
            aria-label="Go to slide {index + 1}"
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Animasi untuk dots */
  .scale-x-0 {
    transform: scaleX(0);
  }
  
  /* Tambahkan animasi tambahan */
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .active-dot {
    animation: pulse 2s ease-in-out infinite;
  }
</style> 