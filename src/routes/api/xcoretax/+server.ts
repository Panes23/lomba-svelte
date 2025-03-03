import { error, json } from '@sveltejs/kit';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { VITE_SUPABASE_URL } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET({ cookies }) {
  try {
    // Cek admin data dari cookie
    const adminData = cookies.get('admin_data');
    if (!adminData) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = JSON.parse(adminData);

    // Cek akses user agent
    const { data: privilageData } = await supabaseAdmin
      .from('privilage')
      .select('akses')
      .eq('level', admin.level)
      .single();

    if (!privilageData?.akses?.includes('user agent')) {
      return json({ error: 'Insufficient privileges' }, { status: 403 });
    }

    // Ambil data coretax
    const { data, error: coretaxError } = await supabaseAdmin
      .from('coretax')
      .select('*')
      .order('created_at', { ascending: false });

    if (coretaxError) {
      throw coretaxError;
    }

    return json(data || []);
  } catch (err) {
    console.error('API error:', err);
    return json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
} 