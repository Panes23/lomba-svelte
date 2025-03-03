import { error, json } from '@sveltejs/kit';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { VITE_SUPABASE_URL } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST({ request }) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      console.error('Missing userId in request');
      return json({ error: 'User ID diperlukan' }, { status: 400 });
    }

    // Coba ambil dari tabel users dulu
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Database error:', userError);
      return json({ error: 'Error mengambil username' }, { status: 500 });
    }

    // Jika ditemukan di tabel users, gunakan username dari sana
    if (userData && userData.username) {
      return json({ username: userData.username });
    }

    // Jika tidak ditemukan, coba ambil dari auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authError) {
      console.error('Error getting auth user:', authError);
      return json({ error: 'Error mengambil data user' }, { status: 500 });
    }

    if (authUser && authUser.user.email) {
      const username = authUser.user.email.split('@')[0];
      console.log('Username generated from email:', username);
      return json({ username });
    }

    // Jika semua gagal, kembalikan default username
    console.log('No username found, returning default');
    return json({ username: 'User' });
  } catch (err) {
    console.error('Error in get-username endpoint:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
} 