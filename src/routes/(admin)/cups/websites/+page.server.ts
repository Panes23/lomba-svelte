import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('websites')
      .select('*')
      .order('nama');

    if (error) throw error;

    return {
      websites: data || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      websites: []
    };
  }
}; 