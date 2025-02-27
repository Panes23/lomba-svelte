import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('coretax')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return json(data);
  } catch (err) {
    console.error('Error fetching coretax:', err);
    return json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}; 