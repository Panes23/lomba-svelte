import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL } from '$env/static/private';

const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return json(
        { error: 'Username/Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah user sudah ada di tabel users
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq."${identifier}",username.eq."${identifier}"`)
      .single();

    let authData;

    // Coba login dengan email
    authData = await supabase.auth.signInWithPassword({
      email: existingUser?.email || identifier,
      password
    });

    // Jika gagal login
    if (!authData.data.user || !authData.data.session) {
      return json(
        { error: 'Username/Email atau password salah' },
        { status: 401 }
      );
    }

    // Jika user belum ada di tabel users, buat data baru
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.data.user.id,
          username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          email: authData.data.user.email,
          phone: '-',  // Default value untuk kolom not-null
          birth_date: new Date().toISOString().split('T')[0], // Default value untuk kolom not-null
          status: 'active',
          auth_uid: authData.data.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting user data:', insertError);
        return json(
          { error: 'Gagal membuat data user' },
          { status: 500 }
        );
      }
    } else if (existingUser.status === 'banned') {
      return json(
        { error: 'Akun Anda telah dibanned sementara waktu. Silakan hubungi admin untuk informasi lebih lanjut.' },
        { status: 403 }
      );
    }

    // Jika email belum dikonfirmasi
    if (!authData.data.user.email_confirmed_at) {
      return json(
        { error: 'Email belum dikonfirmasi. Silakan cek email Anda untuk konfirmasi.' },
        { status: 401 }
      );
    }

    // Simpan data user online
    const { error: insertError } = await supabase
      .from('user_online')
      .upsert({
        username: existingUser.username,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'username'
      });

    if (insertError) {
      console.error('Error saving online user:', insertError);
    }

    return json({ 
      session: authData.data.session, 
      user: authData.data.user 
    });
  } catch (error) {
    console.error('Login error:', error);
    return json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}; 