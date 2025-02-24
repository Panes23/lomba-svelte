import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('privilage')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      privilages: data || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      privilages: []
    };
  }
}; 