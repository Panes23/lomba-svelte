import { error } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    // Fetch lomba detail dengan relasi markets
    const { data: lomba, error: lombaError } = await supabaseClient
      .from('lomba')
      .select(`
        *,
        markets (
          name,
          buka,
          tutup,
          image
        )
      `)
      .eq('id', params.lombaId)  // Pastikan menggunakan ID dari params
      .single();  // Karena kita hanya butuh satu lomba

    if (lombaError) throw lombaError;
    if (!lomba) throw error(404, 'Lomba tidak ditemukan');
    // Fetch websites
    const { data: websites, error: websitesError } = await supabaseClient
      .from('websites')
      .select('*');

    if (websitesError) throw websitesError;

    // Fetch tebakan untuk lomba ini
    const { data: tebakan, error: tebakanError } = await supabaseClient
      .from('tebakan')
      .select(`
        *,
        websites (
          nama
        )
      `)
      .eq('lomba_id', params.lombaId)  // Filter berdasarkan lomba_id
      .order('created_at', { ascending: false });

    if (tebakanError) throw tebakanError;

    return {
      lomba,
      websites: websites || [],
      tebakan: tebakan || []
    };
  } catch (err) {
    console.error('Error loading tebakan data:', err);
    throw error(500, 'Gagal memuat data');
  }
}; 