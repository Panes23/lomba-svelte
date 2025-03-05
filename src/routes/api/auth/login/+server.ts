import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL } from '$env/static/private';

const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    const { identifier, password, ipAddress } = await request.json();

    if (!identifier || !password) {
      return json(
        { error: 'Username/Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Cek dulu apakah user ada di tabel users
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq."${identifier}",username.eq."${identifier}"`)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking user:', userError);
      return json(
        { error: 'Terjadi kesalahan saat memeriksa user' },
        { status: 500 }
      );
    }

    // Tentukan email yang akan digunakan untuk login
    const loginEmail = existingUser?.email || (identifier.includes('@') ? identifier : `${identifier}@tebakangka.com`);

    // Login dengan Supabase Auth menggunakan service role
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password
    });

    if (authError) {
      console.error('Auth error:', authError);
      return json(
        { error: 'Username/Email atau password salah' },
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return json(
        { error: 'Gagal mendapatkan data user' },
        { status: 401 }
      );
    }

    // Jika user belum ada di tabel users, buat data baru
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          email: authData.user.email,
          phone: '-',
          birth_date: new Date().toISOString().split('T')[0],
          status: 'active',
          auth_uid: authData.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          alamat_ip: ipAddress,
          last_login: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting user:', insertError);
        return json(
          { error: 'Gagal membuat data user' },
          { status: 500 }
        );
      }
    } else {
      // Cek status user
      if (existingUser.status === 'banned') {
        return json(
          { error: 'Akun Anda telah dibanned sementara waktu. Silakan hubungi admin untuk informasi lebih lanjut.' },
          { status: 403 }
        );
      }

      // Update IP dan last_login
      const { error: updateError } = await supabase
        .from('users')
        .update({
          alamat_ip: ipAddress,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
      }
    }

    // Update data user online
    const now = new Date();
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));

    const username = existingUser?.username || (identifier.includes('@') ? identifier.split('@')[0] : identifier);

    try {
      const { error: upsertError } = await supabase
        .from('user_online')
        .upsert({
          username: username,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          login_date: todayUTC.toISOString().split('T')[0]
        }, {
          onConflict: 'username,login_date'
        });

      if (upsertError) {
        console.error('Error updating online status:', upsertError);
      }
    } catch (error) {
      console.error('Error managing online record:', error);
    }

    // Return session dan user data
    return json({
      session: authData.session,
      user: {
        ...authData.user,
        username: username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}; 