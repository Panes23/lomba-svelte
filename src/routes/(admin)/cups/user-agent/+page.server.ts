import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { VITE_SUPABASE_URL } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    // Cek admin data dari cookie
    const adminData = cookies.get('admin_data');
    if (!adminData) {
      throw redirect(303, '/cups/login');
    }

    const admin = JSON.parse(adminData);
    
    // Cek akses user agent
    const { data: privilageData } = await supabaseAdmin
      .from('privilage')
      .select('akses')
      .eq('level', admin.level)
      .single();

    if (!privilageData?.akses?.includes('user agent')) {
      throw error(403, 'Unauthorized - Insufficient privileges');
    }

    // Ambil data coretax dan privilage
    const [coretaxResult, privilagesResult] = await Promise.all([
      supabaseAdmin.from('coretax').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('privilage').select('*')
    ]);

    if (coretaxResult.error) throw coretaxResult.error;
    if (privilagesResult.error) throw privilagesResult.error;

    return {
      coretax: coretaxResult.data || [],
      privilages: privilagesResult.data || []
    };
  } catch (err) {
    console.error('Load error:', err);
    if (err.status === 303) {
      throw err;
    }
    throw error(500, err.message || 'Internal server error');
  }
}; 