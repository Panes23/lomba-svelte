import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET() {
  try {
    const { data: slides, error } = await supabaseClient
      .from('slides')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return json(slides);
  } catch (err) {
    console.error('Error fetching slides:', err);
    return json(
      { error: 'Gagal memuat slider' },
      { status: 500 }
    );
  }
} 