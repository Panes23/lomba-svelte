import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data: markets, error } = await supabaseClient
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      markets: markets || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      markets: []
    };
  }
}; 