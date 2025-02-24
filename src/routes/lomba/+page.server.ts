import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data: markets, error } = await supabaseClient
      .from('markets')
      .select('*')
      .order('id');

    if (error) throw error;

    return {
      markets: markets || []
    };
  } catch (err) {
    console.error('Error loading markets:', err);
    return {
      markets: []
    };
  }
}; 