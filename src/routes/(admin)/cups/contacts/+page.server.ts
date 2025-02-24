import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      contacts: data || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      contacts: []
    };
  }
}; 