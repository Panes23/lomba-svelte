import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from '$env/static/private';

export async function POST({ request }) {
  try {
    const { endpoint, method = 'GET', body } = await request.json();
    
    // Parse endpoint untuk mendapatkan table name dan query params
    const [table, queryString] = endpoint.split('?');
    const query = supabaseClient.from(table);
    
    if (method === 'GET') {
      // Buat query builder
      let queryBuilder = query.select();
      
      // Handle query parameters
      if (queryString) {
        const params = new URLSearchParams(queryString);
        
        // Handle select parameter
        const select = params.get('select');
        if (select) {
          queryBuilder = query.select(select);
        }
        
        // Handle filters
        params.forEach((value, key) => {
          if (key.includes('.eq.')) {
            const [field] = key.split('.eq.');
            queryBuilder = queryBuilder.eq(field, value);
          }
        });
      } else {
        // Jika tidak ada query string, select semua kolom
        queryBuilder = query.select('*');
      }
      
      const { data, error } = await queryBuilder;
      if (error) throw error;
      if (!data) return json([]); // Return empty array jika tidak ada data
      return json(data);
    } else if (method === 'POST') {
      const { data, error } = await query.insert(body).select().single();
      if (error) throw error;
      return json(data);
    }
  } catch (err) {
    console.error('Proxy error:', err);
    return json({ error: err.message }, { status: 500 });
  }
} 