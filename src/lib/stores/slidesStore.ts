import { writable } from 'svelte/store';
import { supabaseClient } from '$lib/supabaseClient';
import { invalidate } from '$app/navigation';

function createSlidesStore() {
  const { subscribe, set } = writable([]);
  let subscription;

  async function setupRealtimeSubscription() {
    subscription = supabaseClient
      .channel('public:slides')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slides'
        },
        async (payload) => {
          console.log('Realtime update:', payload);
          await invalidate('app:slides');
          
          const { data } = await supabaseClient
            .from('slides')
            .select('*')
            .order('position', { ascending: true });
          
          if (data) {
            const sortedData = data.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            set(sortedData);
          }
        }
      )
      .subscribe();
  }

  async function fetchSlides() {
    try {
      const { data } = await supabaseClient
        .from('slides')
        .select('*')
        .order('position', { ascending: true });

      if (data) {
        const sortedData = data.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        set(sortedData);
      }
    } catch (err) {
      console.error('Error fetching slides:', err);
      throw err;
    }
  }

  // Setup subscription saat store dibuat
  setupRealtimeSubscription();

  return {
    subscribe,
    updateSlides(slides) {
      const sortedSlides = slides.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      set(sortedSlides);
    },
    fetch: fetchSlides,
    destroy() {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  };
}

export const slidesStore = createSlidesStore(); 