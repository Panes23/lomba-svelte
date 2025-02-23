import { error } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  // Set headers untuk mencegah caching
  setHeaders({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    // Gunakan Vary header yang spesifik
    'Vary': 'Accept, Accept-Encoding'
  });

  try {
    // Tambahkan timestamp untuk memaksa query baru
    const timestamp = new Date().getTime();
    
    // Validasi lombaid
    if (!params.lombaId) {
      throw error(400, 'ID Lomba tidak valid');
    }
    
    // Ambil data lomba terlebih dahulu
    const { data: lombaData, error: lombaError } = await supabaseClient
      .from('lomba')
      .select(`
        *,
        markets (
          id,
          name,
          buka,
          tutup,
          image
        )
      `)
      .eq('id', params.lombaId)
      .single();

    if (lombaError) {
      console.error('Error fetching lomba:', lombaError);
      throw error(500, 'Gagal memuat data lomba');
    }
    
    if (!lombaData) {
      throw error(404, 'Lomba tidak ditemukan');
    }
    
    if (!lombaData.markets) {
      console.error('Market data missing for lomba:', lombaData);
      throw error(500, 'Data market tidak ditemukan');
    }

    // Ambil daftar website
    const { data: websites, error: websitesError } = await supabaseClient
      .from('websites')
      .select('*')
      .order('nama');

    if (websitesError) {
      console.error('Error fetching websites:', websitesError);
      throw websitesError;
    }

    // Ambil daftar tebakan untuk lomba ini
    const { data: tebakan, error: tebakanError } = await supabaseClient
      .from('tebakan')
      .select(`
        *,
        websites (
          id,
          nama,
          link_website,
          color
        )
      `)
      .eq('lomba_id', params.lombaId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (tebakanError) {
      console.error('Error fetching tebakan:', tebakanError);
      throw tebakanError;
    }

    return {
      lomba: lombaData,
      websites: websites || [],
      tebakan: tebakan || [],
      timestamp
    };
  } catch (err) {
    console.error('Error loading tebakan data:', err);
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'Gagal memuat data');
  }
}; 