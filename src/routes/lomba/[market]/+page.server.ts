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

    // Ambil semua data lomba untuk market tersebut
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
      .eq('market_id', market.id)
      .order('tanggal', { ascending: false }); // Urutkan berdasarkan tanggal terbaru

    if (lombaError) throw lombaError;

    return {
      market,
      lomba: lomba || [],
    };
  } catch (err) {
    console.error('Error loading market data:', err);
    throw error(500, 'Gagal memuat data');
  }
}; 