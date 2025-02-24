import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const { data: users, error } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      users: users || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      users: []
    };
  }
}; 