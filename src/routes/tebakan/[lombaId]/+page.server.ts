import { error } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad, Actions } from './$types';
import { isUUID } from '$lib/utils/validation';

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
    if (!params.lombaId || !isUUID(params.lombaId)) {
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
      .maybeSingle();

    if (lombaError) {
      console.error('Error fetching lomba:', lombaError);
      throw error(500, `Gagal memuat data lomba: ${lombaError.message}`);
    }
    
    if (!lombaData) {
      console.error('Lomba not found:', params.lombaId);
      throw error(404, 'Lomba tidak ditemukan');
    }
    
    if (!lombaData.markets) {
      console.error('Market data missing for lomba:', lombaData);
      throw error(404, `Data market untuk lomba ${params.lombaId} tidak ditemukan`);
    }

    // Ambil daftar website
    const { data: websites, error: websitesError } = await supabaseClient
      .from('websites')
      .select('*')
      .order('nama');

    if (websitesError) {
      console.error('Error fetching websites:', websitesError);
      throw error(500, 'Gagal memuat data website');
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
      throw error(500, 'Gagal memuat data tebakan');
    }

    return {
      lomba: lombaData,
      websites: websites || [],
      tebakan: tebakan || [],
      timestamp
    };
  } catch (err) {
    console.error('Error loading tebakan data:', err);
    if (err instanceof error) {
      throw err;
    }
    throw error(500, err instanceof Error ? err.message : 'Gagal memuat data');
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const website_id = formData.get('website_id');
    const userid_website = formData.get('userid_website');
    const number = formData.get('number');
    const lomba_id = params.lombaId;

    try {
      // Cek apakah kombinasi website_id dan userid_website sudah ada untuk lomba ini
      const { data: existingTebakan, error: checkError } = await supabaseClient
        .from('tebakan')
        .select('id')
        .eq('lomba_id', lomba_id)
        .eq('website_id', website_id)
        .eq('userid_website', userid_website)
        .single();
      
      if (existingTebakan) {
        throw new Error('User ID ini sudah melakukan tebakan di website yang sama untuk lomba ini');
      }

      // Lanjutkan dengan insert data jika validasi berhasil
      const { data, error: insertError } = await supabaseClient
        .from('tebakan')
        .insert([
          {
            lomba_id,
            website_id,
            userid_website,
            number
          }
        ])
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      return { success: true, data };
    } catch (err) {
      throw error(400, err.message);
    }
  }
}; 