import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET({ url }) {
  try {
    const email = url.searchParams.get('email');
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('id, username, email, phone, birth_date')
      .eq('email', email)
      .single();

    if (error) throw error;

    return json(data);
  } catch (err) {
    return json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }
} 