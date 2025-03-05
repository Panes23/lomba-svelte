import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  try {
    // Set header untuk mencegah caching
    setHeaders({
      'cache-control': 'no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0'
    });

    const level = url.searchParams.get('level');
    if (!level) {
      return json({ error: 'Level is required' }, { status: 400 });
    }

    // Ambil data akses dari database
    const { data, error } = await supabaseClient
      .from('privilage')
      .select('akses')
      .eq('level', level.toLowerCase())
      .maybeSingle();

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    // Jika tidak ada data, kembalikan array kosong
    if (!data) {
      return json({ akses: [] });
    }

    return json({ akses: data.akses });
  } catch (error) {
    console.error('Error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 