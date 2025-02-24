import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    // Get session from cookie
    const adminData = cookies.get('admin_data');
    if (!adminData) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabaseClient
      .from('coretax')
      .select('id, username, email, level, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      users: data || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      users: []
    };
  }
}; 