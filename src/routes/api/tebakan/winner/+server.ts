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

    return json({
      tebakan: tebakanResult.data || [],
      fakeUsers: fakeUsersResult.data || []
    }, {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return json({ 
      error: 'Failed to fetch data',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}; 