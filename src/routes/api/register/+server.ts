import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const { email, password, username, phone, birth_date } = await request.json();

    // Register dengan Supabase Auth
    const { data, error: signUpError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone,
          birth_date
        },
        emailRedirectTo: `${url.origin}/auth/callback`
      }
    });

    if (signUpError) throw signUpError;

    if (!data?.user?.id) {
      throw new Error('Gagal membuat akun');
    }

    // Insert ke tabel users
    const { error: insertError } = await supabaseClient
      .from('users')
      .insert({
        id: data.user.id,
        username,
        email,
        phone,
        birth_date,
        auth_uid: data.user.id
      });

    if (insertError) {
      throw insertError;
    }

    return json({ success: true, userId: data.user.id });

  } catch (err) {
    console.error('Error:', err);
    return json({ 
      error: err.message || 'Terjadi kesalahan saat mendaftar',
      code: err.code
    }, { status: 400 });
  }
}; 