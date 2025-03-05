import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { field, value } = await request.json();

    if (!field || !value) {
      return json({ error: 'Parameter tidak lengkap' }, { status: 400 });
    }

    const { data, error } = await supabaseClient
      .from('users')
      .select(field)
      .eq(field, value)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(`Error checking ${field}:`, error);
      return json({ error: 'Terjadi kesalahan saat memeriksa data' }, { status: 500 });
    }

    return json({ exists: !!data });

  } catch (err) {
    console.error('Error:', err);
    return json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}; 