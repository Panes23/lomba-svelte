import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL } from '$env/static/private';
import fs from 'fs';
import path from 'path';

const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Baca template error
const errorTemplate = fs.readFileSync(path.join(process.cwd(), 'src', 'error.html'), 'utf-8');

// Fungsi untuk membuat halaman error
function createErrorPage(status: number, message: string) {
  return errorTemplate
    .replace(/%sveltekit\.status%/g, status.toString())
    .replace(/%sveltekit\.error\.message%/g, message);
}

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

  // Cek apakah request menuju rute cups/*
  if (event.url.pathname.startsWith('/cups')) {
    try {
      // Dapatkan IP dari request
      const clientIP = event.getClientAddress();

      // Cek apakah IP ada di whitelist
      const { data: whitelistData, error: whitelistError } = await supabase
        .from('whitelist')
        .select('*')
        .eq('alamat_ip', clientIP)
        .single();

      if (whitelistError || !whitelistData) {
        // Gunakan template error kustom
        return new Response(
          createErrorPage(403, 'Akses ditolak. Silahkan hubungi administrator.'),
          {
            status: 403,
            headers: {
              'content-type': 'text/html',
            }
          }
        );
      }

      // Jika sudah login, cek cookie admin_data
      const adminData = event.cookies.get('admin_data');
      if (!adminData && event.url.pathname !== '/cups/login') {
        throw redirect(303, '/cups/login');
      }
    } catch (err) {
      if (err.status === 303) throw err;
      
      console.error('Error checking whitelist:', err);
      // Gunakan template error kustom
      return new Response(
        createErrorPage(403, 'Akses ditolak. Silakan hubungi administrator.'),
        {
          status: 403,
          headers: {
            'content-type': 'text/html',
          }
        }
      );
    }
  }

  // Handle response
  try {
    const response = await resolve(event);
    return response;
  } catch (err) {
    console.error('Server error:', err);
    // Gunakan template error kustom untuk error lainnya
    return new Response(
      createErrorPage(err.status || 500, err.message || 'Terjadi kesalahan pada sistem'),
      {
        status: err.status || 500,
        headers: {
          'content-type': 'text/html',
        }
      }
    );
  }
}; 