import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET({ url }) {
  try {
    const level = url.searchParams.get('level');
    
    if (!level) {
      throw new Error('Level is required');
    }

    const { data, error } = await supabaseClient
      .from('privilage')
      .select('akses')
      .eq('level', level)
      .single();

    if (error) throw error;
    return json(data || {});
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
} 