import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends }) => {
  // Track dependency untuk slides
  depends('app:slides');
  
  try {
    const { data, error } = await supabaseClient
      .from('slides')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;

    const sortedData = data?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    return {
      slides: sortedData || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      slides: []
    };
  }
}; 