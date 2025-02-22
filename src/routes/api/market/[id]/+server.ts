import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET({ params }) {
  try {
    const { id } = params;

    // Coba cari berdasarkan id dulu
    let { data: market, error } = await supabaseClient
      .from('markets')
      .select('*')
      .eq('id', id)
      .single();

    // Jika tidak ditemukan, coba cari berdasarkan name
    if (!market) {
      const { data: marketByName, error: nameError } = await supabaseClient
        .from('markets')
        .select('*')
        .eq('name', id)
        .single();

      if (nameError) throw nameError;
      market = marketByName;
    }

    if (!market) {
      return json(
        { error: 'Pasaran tidak ditemukan' },
        { status: 404 }
      );
    }

    return json(market);
  } catch (err) {
    console.error('Error fetching market:', err);
    return json(
      { error: 'Gagal memuat data pasaran' },
      { status: 500 }
    );
  }
} 