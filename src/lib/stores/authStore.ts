import { writable } from 'svelte/store';
import { supabaseClient } from '$lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

function createUserStore() {
  const { subscribe, set } = writable<User | null>(null);

  return {
    subscribe,
    set,
    initialize: async () => {
      try {
        // Cek cookie yang ada
        const cookies = document.cookie.split(';');
        
        // Cek cookie admin dan supabase auth token
        const hasAdminCookie = cookies.some(c => {
          const [name, value] = c.trim().split('=');
          return name === 'admin_data' && value?.includes('auth-token');
        });

        const hasSupabaseAuthCookie = cookies.some(c => {
          const [name] = c.trim().split('=');
          return name.includes('-auth-token');
        });
        
        // Jika ada cookie admin atau supabase auth token, skip inisialisasi
        if (hasAdminCookie || hasSupabaseAuthCookie) {
          set(null);
          return;
        }

        const authCookie = cookies.find(c => c.trim().startsWith('sb-access-token='));
        if (authCookie) {
          // Parse cookie data
          const cookieValue = authCookie.split('=')[1].trim();
          const base64Data = cookieValue.replace('base64-', '');
          const data = JSON.parse(atob(base64Data));
          
          if (data.user) {
            set(data.user);
            return;
          }
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          set(session.user);
        } else {
          set(null);
        }
      } catch (err) {
        console.error('Error initializing auth store:', err);
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
      // Hapus cookie saat logout
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
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