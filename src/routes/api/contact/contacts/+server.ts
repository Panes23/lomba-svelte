import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET() {
  try {
    const { data: contacts, error } = await supabaseClient
      .from('contacts')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return json(
      { error: 'Gagal memuat data kontak' },
      { status: 500 }
    );
  }
} 