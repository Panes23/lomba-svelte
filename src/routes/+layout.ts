import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, fetch }) => {
  const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
      cookies: {
        get(key) {
          if (!isBrowser()) {
            return JSON.stringify(data.session);
          }
          
          const cookie = parse(document.cookie);
          return cookie[key];
        },
        set(key, value) {
          if (isBrowser()) {
            document.cookie = `${key}=${value}; path=/`;
          }
        },
        remove(key) {
          if (isBrowser()) {
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          }
        }
      }
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  return { supabase, session };
}; 