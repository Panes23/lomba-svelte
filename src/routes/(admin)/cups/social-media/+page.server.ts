import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('social_media')
      .select('*')
      .order('name');

    if (error) throw error;

    return {
      socialMedia: data || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      socialMedia: []
    };
  }
}; 