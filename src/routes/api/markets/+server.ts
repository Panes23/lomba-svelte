import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET() {
  try {
    const { data: markets, error } = await supabaseClient
      .from('markets')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return json(markets);
  } catch (err) {
    console.error('Error fetching markets:', err);
    return json(
      { error: 'Gagal memuat data pasaran' },
      { status: 500 }
    );
  }
} 