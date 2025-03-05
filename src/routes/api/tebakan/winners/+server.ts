import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const lombaId = url.searchParams.get('lomba_id');
    
    if (!lombaId) {
      return json({ error: 'Lomba ID is required' }, { status: 400 });
    }

    // First check if lomba exists and get its details
    const { data: lombaData, error: lombaError } = await supabaseClient
      .from('lomba')
      .select('id, result, guess_type, max_winner')
      .eq('id', lombaId)
      .single();

    if (lombaError) {
      console.error('Error checking lomba:', lombaError);
      return json({ error: 'Lomba not found' }, { status: 404 });
    }

    // Tentukan panjang angka yang harus dicocokkan berdasarkan tipe tebakan
    const targetLength = parseInt(lombaData.guess_type[0]);
    const targetNumber = lombaData.result.slice(-targetLength);

    // Get tebakan data and fake users in parallel
    const [tebakanResult, fakeUsersResult] = await Promise.all([
      supabaseClient
        .from('tebakan')
        .select('userid_website, number, created_at, website_id, websites:website_id(nama)')
        .eq('lomba_id', lombaId)
        .order('created_at', { ascending: true }),
      supabaseClient
        .from('fake_users')
        .select('userid_website, website_id')
    ]);

    if (tebakanResult.error) {
      console.error('Error fetching tebakan:', tebakanResult.error);
      return json({ error: tebakanResult.error.message }, { status: 500 });
    }

    if (fakeUsersResult.error) {
      console.error('Error fetching fake users:', fakeUsersResult.error);
      return json({ error: fakeUsersResult.error.message }, { status: 500 });
    }

    // Buat Set untuk menyimpan fake user IDs
    const fakeUserSet = new Set(
      fakeUsersResult.data?.map(user => `${user.userid_website}-${user.website_id}`) || []
    );

    // Filter tebakan yang memiliki angka yang cocok
    const winners = (tebakanResult.data || [])
      .filter(guess => {
        const parts = guess.number.split('-');
        return parts.some(part => part.endsWith(targetNumber));
      })
      .map(guess => ({
        ...guess,
        isFake: fakeUserSet.has(`${guess.userid_website}-${guess.website_id}`),
        matchingPart: guess.number.split('-').find(part => part.endsWith(targetNumber))
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, lombaData.max_winner);

    return json(winners, {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return json({ 
      error: 'Failed to fetch winners data',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}; 