import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { VITE_SUPABASE_URL } from '$env/static/private';

const supabaseAdmin = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST({ request }) {
  try {
    const { usernameOrEmail, password } = await request.json();

    if (!usernameOrEmail || !password) {
      return json(
        { message: 'Username/email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Login dengan Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: usernameOrEmail.includes('@') ? usernameOrEmail : 'boss.rangga23@gmail.com',
      password: password
    });

    if (authError) {
      return json(
        { message: authError.message },
        { status: 401 }
      );
    }

    // Ambil data dari coretax
    const { data: userData, error: userError } = await supabaseAdmin
      .from('coretax')
      .select('*')
      .or(`email.eq."${usernameOrEmail}",username.eq."${usernameOrEmail}"`)
      .single();

    if (userError || !userData) {
      return json(
        { message: 'Data user tidak ditemukan' },
        { status: 404 }
      );
    }

    // Return data yang diperlukan
    return json({
      data: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        level: userData.level,
        access_token: authData.session?.access_token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
} 