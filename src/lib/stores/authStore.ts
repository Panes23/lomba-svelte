import { writable } from 'svelte/store';
import { supabaseClient } from '$lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

function createUserStore() {
  const { subscribe, set } = writable<User | null>(null);

  return {
    subscribe,
    set,
    initialize: async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        set(session.user);
      } else {
        set(null);
      }
    },
    signIn: async (identifier: string, password: string) => {
      const isEmail = identifier.includes('@');
      
      let signInData;
      if (isEmail) {
        signInData = {
          email: identifier,
          password
        };
      } else {
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('email')
          .eq('username', identifier)
          .single();

        if (userError) throw new Error('Username tidak ditemukan');
        if (!userData) throw new Error('Username tidak ditemukan');

        signInData = {
          email: userData.email,
          password
        };
      }

      const { data: { session }, error } = await supabaseClient.auth.signInWithPassword(signInData);
      
      if (error) throw error;
      
      if (session) {
        set(session.user);
      }
      
      return { session, error };
    },
    signOut: async () => {
      await supabaseClient.auth.signOut();
      set(null);
    }
  };
}

export const user = createUserStore();

// Listen untuk perubahan auth state
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    user.set(session.user);
  } else if (event === 'SIGNED_OUT') {
    user.set(null);
  }
}); 