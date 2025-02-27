import { writable } from 'svelte/store';
import type { Market } from '$lib/types/market';
import { supabaseClient } from '$lib/supabaseClient';

function createMarketsStore() {
  const { subscribe, set, update } = writable<Market[]>([]);

  return {
    subscribe,
    set,
    update,
    async fetch() {
      try {
        const { data, error } = await supabaseClient
          .from('markets')
          .select('*')
          .order('name');

        if (error) throw error;
        set(data || []);
        return data;
      } catch (error) {
        console.error('Error fetching markets:', error);
        throw error;
      }
    }
  };
}

export const marketsStore = createMarketsStore(); 