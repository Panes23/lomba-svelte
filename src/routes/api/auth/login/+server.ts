import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function POST({ request }) {
  try {
    const { identifier, password } = await request.json();

    // Cek apakah identifier adalah email atau username
    const isEmail = identifier.includes('@');
    
    let loginEmail = identifier;
    if (!isEmail) {
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select()
        .eq('username', identifier.toLowerCase())
        .single();
      
      if (userError) {
        return json({ error: 'Username tidak ditemukan' }, { status: 400 });
      }
      loginEmail = userData.email;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        await supabaseClient.auth.resend({
          type: 'signup',
          email: loginEmail
        });
        
        return json(
          { error: 'Email belum dikonfirmasi. Silakan cek inbox email Anda untuk konfirmasi.' }, 
          { status: 400 }
        );
      }
      
      return json(
        { error: 'Username/Email atau password salah' }, 
        { status: 401 }
      );
    }

    return json({ user: data.user });
  } catch (err) {
    return json(
      { error: 'Terjadi kesalahan, silakan coba lagi' }, 
      { status: 500 }
    );
  }
} 