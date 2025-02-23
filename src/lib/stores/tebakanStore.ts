import { writable } from 'svelte/store';
import { supabaseClient } from '$lib/supabaseClient';

function createTebakanStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    set,
    async fetchTebakan(lombaId: string) {
      const { data } = await supabaseClient
        .from('tebakan')
        .select(`
          *,
          websites (
            nama,
            link_website
          )
        `)
        .eq('lomba_id', lombaId)
        .order('created_at', { ascending: false });
      
      if (data) {
        // Pastikan data diurutkan berdasarkan created_at terbaru
        const sortedData = data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        set(sortedData);
      }
    }
  };
}

export const tebakanStore = createTebakanStore(); 