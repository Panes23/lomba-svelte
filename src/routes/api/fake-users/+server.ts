import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('fake_users')
      .select('userid_website, website_id');

    if (error) throw error;

    return json(data || [], {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      }
    });
  } catch (err) {
    console.error('Error fetching fake users:', err);
    return json({ error: 'Failed to fetch fake users' }, { status: 500 });
  }
}; 