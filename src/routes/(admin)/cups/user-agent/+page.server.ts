import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    // Get session from cookie
    const adminData = cookies.get('admin_data');
    if (!adminData) {
      throw new Error('Not authenticated');
    }

    const { data: users, error: usersError } = await supabaseClient
      .from('coretax')
      .select(`
        id,
        username,
        email,
        level,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    const { data: privilages, error: privilagesError } = await supabaseClient
      .from('privilage')
      .select('level')
      .order('level');

    if (usersError) throw usersError;
    if (privilagesError) throw privilagesError;

    return {
      users: users || [],
      privilages: privilages || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      users: [],
      privilages: []
    };
  }
}; 