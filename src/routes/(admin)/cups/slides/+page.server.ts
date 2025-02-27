import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    // Gunakan server-side client untuk fetch data
    const { data, error } = await supabaseClient
      .from('slides')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;

    return {
      slides: data || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      slides: []
    };
  }
}; 