import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const lombaId = url.searchParams.get('lomba_id');
    
    if (!lombaId) {
      return json({ error: 'Lomba ID is required' }, { status: 400 });
    }

    // First check if lomba exists
    const { data: lombaData, error: lombaError } = await supabaseClient
      .from('lomba')
      .select('id')
      .eq('id', lombaId)
      .single();

    if (lombaError) {
      console.error('Error checking lomba:', lombaError);
      return json({ error: 'Lomba not found' }, { status: 404 });
    }

    // Then get tebakan data
    const { data, error } = await supabaseClient
      .from('tebakan')
      .select('userid_website, number, created_at, website_id, websites:website_id(nama)')
      .eq('lomba_id', lombaId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tebakan:', error);
      return json({ error: error.message }, { status: 500 });
    }

    return json(data || [], {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return json({ 
      error: 'Failed to fetch tebakan data',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}; 