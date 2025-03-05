import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { VITE_SUPABASE_URL } from '$env/static/private';

const supabaseAdmin = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST({ request }) {
  try {
    const { usernameOrEmail, password, ipAddress } = await request.json();

    if (!usernameOrEmail || !password) {
      return json(
        { message: 'Username/email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Cek dulu apakah user ada di tabel coretax
    const { data: coretaxUser, error: coretaxError } = await supabaseAdmin
      .from('coretax')
      .select('*')
      .or(`email.eq.${usernameOrEmail},username.eq.${usernameOrEmail}`)
      .single();

    if (coretaxError || !coretaxUser) {
      return json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Login dengan Supabase Auth menggunakan email dari data coretax
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: coretaxUser.email,
      password: password
    });

    if (authError) {
      return json(
        { message: 'Username/password salah' },
        { status: 401 }
      );
    }

    // Update alamat_ip dan last_login
    const { error: updateError } = await supabaseAdmin
      .from('coretax')
      .update({
        alamat_ip: ipAddress,
        last_login: new Date().toISOString()
      })
      .eq('id', coretaxUser.id);

    if (updateError) {
      console.error('Error updating user data:', updateError);
    }

    return json({
      message: 'Login berhasil',
      data: {
        ...coretaxUser,
        access_token: authData.session?.access_token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return json(
      { 
        message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 