import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const { data: websites, error } = await supabaseClient
      .from('websites')
      .select(`
        id,
        nama,
        link_website,
        color
      `)
      .order('nama');

    if (error) throw error;

    return json(websites || []);

  } catch (error) {
    console.error('Error fetching websites:', error);
    return json({ error: 'Failed to fetch websites' }, { status: 500 });
  }
}; 