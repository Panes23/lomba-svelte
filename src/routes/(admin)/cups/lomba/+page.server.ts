import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('lomba')
      .select(`
        *,
        markets (
          id,
          name
        ),
        tebakan (
          count
        )
      `)
      .order('tanggal', { ascending: false });

    if (error) throw error;

    // Transform data untuk mendapatkan jumlah peserta
    const lomba = data?.map(item => ({
      ...item,
      jumlah_peserta: item.tebakan[0]?.count || 0
    })) || [];

    return {
      lomba
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      lomba: []
    };
  }
}; 