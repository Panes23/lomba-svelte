import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    // Fetch markets data
    const { data: markets, error: marketsError } = await supabaseClient
      .from('markets')
      .select('*')
      .order('name');

    if (marketsError) {
      console.error('Markets error:', marketsError);
    }

    // Fetch slides data
    const { data: slides, error: slidesError } = await supabaseClient
      .from('slides')
      .select('*')
      .order('position', { ascending: true });

    if (slidesError) {
      console.error('Slides error:', slidesError);
    }

    return {
      markets: markets || [],
      slides: slides || []
    };
  } catch (error) {
    console.error('Server error:', error);
    return {
      markets: [],
      slides: []
    };
  }
}; 