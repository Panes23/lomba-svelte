import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    // Get session
    const { data: { session } } = await locals.supabase.auth.getSession();
    if (!session) throw new Error('No session');

    // Fetch coretax data dengan session
    const { data: coretaxData, error: coretaxError } = await locals.supabase
      .from('coretax')
      .select(`
        id,
        username,
        email,
        level,
        level_id,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (coretaxError) {
      console.error('Coretax error:', coretaxError);
      throw coretaxError;
    }

    // Fetch privilages dengan session
    const { data: privilagesData, error: privilagesError } = await locals.supabase
      .from('privilage')
      .select('*')
      .order('level');

    if (privilagesError) {
      console.error('Privilages error:', privilagesError);
      throw privilagesError;
    }

    const result = {
      coretax: coretaxData || [],
      privilages: privilagesData || []
    };

    return result;

  } catch (error) {
    console.error('Load error:', error);
    return {
      coretax: [],
      privilages: []
    };
  }
}; 