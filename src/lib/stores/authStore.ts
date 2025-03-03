import { writable, get } from 'svelte/store';
import { supabaseClient } from '$lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Swal from '$lib/utils/swal';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { page } from '$app/stores';

function createUserStore() {
  const { subscribe, set, update } = writable<User | null>(null);
  let checkStatusInterval: any = null;

  const startStatusCheck = (userId: string) => {
    // Clear existing interval if any
    if (checkStatusInterval) {
      clearInterval(checkStatusInterval);
    }

    // Check status immediately
    const currentUser = get({ subscribe });
    if (currentUser) {
      checkUserStatus(currentUser);
    }

    // Setup interval untuk mengecek status setiap 5 detik
    checkStatusInterval = setInterval(async () => {
      const currentUser = get({ subscribe });
      if (currentUser) {
        await checkUserStatus(currentUser);
      }
    }, 5000);
  };

  const handleBannedUser = async () => {
    try {
      await Swal.fire({
        title: 'Akun Dibanned',
        text: 'Akun Anda telah dibanned sementara waktu. Silakan hubungi admin untuk informasi lebih lanjut.',
        icon: 'error',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      
      await signOut();
    } catch (error) {
      console.error('Error handling banned user:', error);
      // Force logout jika terjadi error
      await signOut();
    }
  };

  const checkUserStatus = async (user: User | null) => {
    if (!user) return;

    try {
      const response = await fetch('/api/users/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Error checking user status');
      }

      const { status } = await response.json();

      if (status === 'banned') {
        await handleBannedUser();
      }
    } catch (err) {
      console.error('Error checking user status:', err);
    }
  };

  const cleanup = () => {
    if (checkStatusInterval) {
      clearInterval(checkStatusInterval);
      checkStatusInterval = null;
    }
  };

  const signOut = async () => {
    try {
      cleanup();
      await supabaseClient.auth.signOut();
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      set(null);
      await goto('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload jika terjadi error
      window.location.href = '/login';
    }
  };

  // Subscribe ke perubahan halaman untuk mengecek status
  if (browser) {
    page.subscribe(async () => {
      const currentUser = get({ subscribe });
      if (currentUser) {
        await checkUserStatus(currentUser);
      }
    });
  }

  return {
    subscribe,
    set,
    checkUserStatus,
    cleanup,
    initialize: async () => {
      try {
        const cookies = document.cookie.split(';');
        
        const hasAdminCookie = cookies.some(c => {
          const [name, value] = c.trim().split('=');
          return name === 'admin_data' && value?.includes('auth-token');
        });

        const hasSupabaseAuthCookie = cookies.some(c => {
          const [name] = c.trim().split('=');
          return name.includes('-auth-token');
        });
        
        if (hasAdminCookie || hasSupabaseAuthCookie) {
          set(null);
          return;
        }

        const authCookie = cookies.find(c => c.trim().startsWith('sb-access-token='));
        if (authCookie) {
          const cookieValue = authCookie.split('=')[1].trim();
          const base64Data = cookieValue.replace('base64-', '');
          const data = JSON.parse(atob(base64Data));
          
          if (data.user) {
            set(data.user);
            startStatusCheck(data.user.id);
            await checkUserStatus(data.user);
            return;
          }
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          set(session.user);
          startStatusCheck(session.user.id);
          await checkUserStatus(session.user);
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
        startStatusCheck(session.user.id);
        await checkUserStatus(session.user);
      }
      
      return { session, error };
    },
    signOut
  };
}

export const user = createUserStore();

// Listen untuk perubahan auth state
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    user.set(session.user);
    await user.checkUserStatus(session.user);
  } else if (event === 'SIGNED_OUT') {
    user.cleanup();
    user.set(null);
  }
}); 