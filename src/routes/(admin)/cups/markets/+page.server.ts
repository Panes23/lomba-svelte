import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('markets')
      .select('*')
      .order('name');

    if (error) throw error;

    return {
      markets: data || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      markets: []
    };
  }
}; 