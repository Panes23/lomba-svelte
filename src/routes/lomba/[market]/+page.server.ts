import { error } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    // Ambil data market
    const { data: market, error: marketError } = await supabaseClient
      .from('markets')
      .select('*')
      .eq('name', params.market)
      .single();

    if (marketError) throw marketError;
    if (!market) throw error(404, 'Market tidak ditemukan');

    // Ambil data lomba untuk market tersebut
    const today = new Date().toISOString().split('T')[0];
    const { data: lomba, error: lombaError } = await supabaseClient
      .from('lomba')
      .select(`
        *,
        id,
        markets (
          name,
          buka,
          tutup,
          image
        )
      `)
      .eq('market_id', market.id)
      .eq('tanggal', today);

    if (lombaError) throw lombaError;

    return {
      market,
      lomba: lomba || [],
      selectedDate: today
    };
  } catch (err) {
    console.error('Error loading market data:', err);
    throw error(500, 'Gagal memuat data');
  }
}; 