import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {  
    // Gunakan locals.supabase untuk autentikasi
    const { data: fakeUsers, error: fakeUsersError } = await locals.supabase
      .from('fake_users')
      .select(`
        id,
        userid_website,
        website_id,
        created_at,
        updated_at,
        websites (
          id,
          nama,
          link_website,
          color
        )
      `)
      .order('created_at', { ascending: false });

    if (fakeUsersError) throw fakeUsersError;

    return {
      fakeUsers: fakeUsers || []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      fakeUsers: []
    };
  }
}; 