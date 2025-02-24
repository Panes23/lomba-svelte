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

  return resolve(event);
}; 