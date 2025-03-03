import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Handle semua request favicon
  if (event.url.pathname.includes('favicon')) {
    // Kembalikan response kosong dengan status 200 untuk semua request favicon
    return new Response(null, {
      status: 200,
      headers: {
        'content-type': 'image/x-icon'
      }
    });
  }

  // Handle supabase
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
    // Kecualikan path login
    if (!event.url.pathname.includes('/cups/login')) {
      const adminData = event.cookies.get('admin_data');
      if (!adminData) {
        throw redirect(303, '/cups/login');
      }
    }
  }

  try {
    return await resolve(event);
  } catch (error) {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}; 