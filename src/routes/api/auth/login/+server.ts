import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function POST({ request }) {
  try {
    const { identifier, password } = await request.json();

    // Cek apakah input adalah email atau username
    const isEmail = identifier.includes('@');
    
    let loginEmail = identifier;
    if (!isEmail) {
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('email')
        .eq('username', identifier.toLowerCase())
        .single();

      if (userError || !userData) {
        return json({ error: 'Username tidak ditemukan' }, { status: 400 });
      }
      loginEmail = userData.email;
    }

    const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        await supabaseClient.auth.resend({
          type: 'signup',
          email: loginEmail
        });
        return json({ 
          error: 'Email belum dikonfirmasi. Silakan cek inbox email Anda untuk konfirmasi.' 
        }, { status: 400 });
      }
      return json({ error: 'Username/Email atau password salah' }, { status: 401 });
    }

    // Return session data untuk cookie
    return json({
      session: authData.session,
      user: authData.user
    });

  } catch (err) {
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
} 