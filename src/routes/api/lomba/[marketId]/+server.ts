import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET({ params, url }) {
  try {
    const { marketId } = params;
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { data: lomba, error } = await supabaseClient
      .from('lomba')
      .select(`
        id,
        market_id,
        tanggal,
        prize_pool,
        result,
        guess_type,
        max_winner,
        created_at,
        updated_at,
        markets (
          name,
          buka,
          tutup,
          image
        )
      `)
      .eq('market_id', marketId)
      .eq('tanggal', date)
      .order('guess_type');

    if (error) throw error;

    return json(lomba);
  } catch (err) {
    console.error('Error fetching lomba:', err);
    return json(
      { error: 'Gagal memuat data lomba' },
      { status: 500 }
    );
  }
}

export async function POST({ request, params }) {
  try {
    const { marketId } = params;
    const { userId, guessNumber } = await request.json();

    const { data, error } = await supabaseClient
      .from('lomba_entries')
      .insert({
        lomba_id: marketId,
        user_id: userId,
        guess_number: guessNumber,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return json(data);
  } catch (err) {
    console.error('Error submitting entry:', err);
    return json(
      { error: 'Gagal mengirim tebakan' },
      { status: 500 }
    );
  }
} 