import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const slideData = await request.json();

    const { data, error } = await supabaseClient
      .from('slides')
      .update(slideData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return json({ data });
  } catch (err) {
    console.error('Error updating slide:', err);
    return new Response(JSON.stringify({ error: 'Failed to update slide' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 