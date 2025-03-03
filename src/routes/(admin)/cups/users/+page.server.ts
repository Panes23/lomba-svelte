import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    // Cek admin data dari cookie
    const adminData = cookies.get('admin_data');
    if (!adminData) {
      throw error(401, 'Not authenticated');
    }
    const admin = JSON.parse(adminData);

    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, username, email, phone, birth_date, created_at, updated_at, status')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    return {
      users: users || [],
      admin: null
    };
  } catch (err) {
    return {
      users: [],
      admin: null
    };
  }
}; 