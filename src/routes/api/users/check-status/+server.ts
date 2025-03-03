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

    // Ambil data user dari auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authError) {
      console.error('Error getting auth user:', authError);
      return json({ error: 'Error mengambil data user' }, { status: 500 });
    }

    if (!authUser?.user?.email) {
      console.error('Auth user or email not found');
      return json({ error: 'Data user tidak ditemukan' }, { status: 404 });
    }

    // Cek status di tabel users berdasarkan email atau id
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, status, email')
      .or(`email.eq.${authUser.user.email},id.eq.${userId}`)
      .maybeSingle();

    if (userError) {
      console.error('Database error:', userError);
      return json({ error: 'Error mengecek status user' }, { status: 500 });
    }

    // Jika user ditemukan, update ID jika perlu dan return status
    if (userData) {
      // Jika ID berbeda, update ID
      if (userData.id !== userId) {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ id: userId, auth_uid: userId })
          .eq('email', userData.email);

        if (updateError) {
          console.error('Error updating user ID:', updateError);
          // Tetap lanjutkan karena kita masih punya status user
        }
      }
      
      return json({ status: userData.status });
    }

    // Jika user tidak ditemukan, buat baru
    console.log('User not found, creating new user');
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: authUser.user.email,
        username: authUser.user.email.split('@')[0],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: '-',
        birth_date: new Date().toISOString().split('T')[0],
        auth_uid: userId
      });

    if (insertError) {
      console.error('Error creating user:', insertError);
      // Jika error karena duplikat, coba update ID saja
      if (insertError.code === '23505') {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ id: userId, auth_uid: userId })
          .eq('email', authUser.user.email);

        if (updateError) {
          console.error('Error updating existing user:', updateError);
          return json({ error: 'Error memperbarui data user' }, { status: 500 });
        }
      } else {
        return json({ error: 'Error membuat data user' }, { status: 500 });
      }
    }

    return json({ status: 'active' });
  } catch (err) {
    console.error('Error in check-status endpoint:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
} 