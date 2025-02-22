import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET() {
  try {
    const { data: socialMedia, error } = await supabaseClient
      .from('social_media')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return json(socialMedia);
  } catch (err) {
    console.error('Error fetching social media:', err);
    return json(
      { error: 'Gagal memuat data social media' },
      { status: 500 }
    );
  }
} 