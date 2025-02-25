import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, { ...options, path: '/' });
        },
        remove: (key, options) => {
          event.cookies.delete(key, { ...options, path: '/' });
        },
      },
    }
  );

  // Get session from server-side cookie
  const {
    data: { session },
  } = await event.locals.supabase.auth.getSession();

  // Refresh session if exists
  if (session) {
    const { data: { user } } = await event.locals.supabase.auth.getUser();
    event.locals.user = user;
  }

  // Cek jika path dimulai dengan /cups/
  if (event.url.pathname.startsWith('/cups/')) {
    // Dapatkan IP pengunjung
    const clientIP = event.getClientAddress();

    try {
      // Cek IP di whitelist
      const { data: whitelist, error } = await event.locals.supabase
        .from('whitelist')
        .select('alamat_ip')
        .eq('alamat_ip', clientIP)
        .single();

      // Jika IP tidak ada di whitelist, redirect ke homepage
      if (error || !whitelist) {
        throw redirect(303, '/');
      }
    } catch (error) {
      // Redirect semua error ke homepage
      throw redirect(303, '/');
    }
  }

  return resolve(event);
}; 