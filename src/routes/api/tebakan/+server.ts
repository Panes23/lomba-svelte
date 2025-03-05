import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const lombaId = url.searchParams.get('lomba_id');
    
    if (!lombaId) {
      return json({ error: 'Lomba ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseClient
      .from('tebakan')
      .select('userid_website')
      .eq('lomba_id', lombaId);

    if (error) throw error;

    return json(data || [], {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      }
    });
  } catch (err) {
    console.error('Error fetching tebakan:', err);
    return json({ error: 'Failed to fetch tebakan' }, { status: 500 });
  }
}; 