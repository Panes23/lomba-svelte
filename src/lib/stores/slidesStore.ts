import { writable } from 'svelte/store';
import { invalidate } from '$app/navigation';

function createSlidesStore() {
  const { subscribe, set } = writable([]);

  return {
    subscribe,
    updateSlides(slides) {
      const sortedSlides = slides.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      set(sortedSlides);
    },
    async fetch() {
      try {
        // Trigger revalidasi data melalui load function
        await invalidate('app:slides');
      } catch (err) {
        console.error('Error fetching slides:', err);
        throw err;
      }
    }
  };
}

export const slidesStore = createSlidesStore(); 