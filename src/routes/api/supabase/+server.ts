import { error, json } from '@sveltejs/kit';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from '$env/static/private';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { table, query } = await request.json();
    
    const response = await fetch(`${VITE_SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        'apikey': VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch data');
    
    const data = await response.json();
    return json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    throw error(500, 'Internal server error');
  }
}; 