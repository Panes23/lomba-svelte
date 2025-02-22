import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function POST({ request }) {
  try {
    const { username, email, phone, birthDate, password } = await request.json();

    // Validasi data terlebih dahulu
    const { data: existingUser, error: checkError } = await supabaseClient
      .from('users')
      .select()
      .or(`username.eq.${username},email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existingUser) {
      if (existingUser.username === username) {
        return json({ error: 'Username sudah digunakan' }, { status: 400 });
      }
      if (existingUser.email === email) {
        return json({ error: 'Email sudah terdaftar' }, { status: 400 });
      }
      if (existingUser.phone === phone) {
        return json({ error: 'Nomor telepon sudah terdaftar' }, { status: 400 });
      }
    }

    // Jika validasi berhasil, baru register di auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone,
          birth_date: birthDate
        }
      }
    });

    if (authError) throw authError;

    // Simpan data ke users table
    const { error: userError } = await supabaseClient
      .from('users')
      .insert({
        username,
        email,
        phone,
        birth_date: birthDate
      });

    if (userError) {
      // Jika gagal menyimpan ke users table, hapus user dari auth
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return json({ 
      message: 'Registrasi berhasil! Silakan cek email Anda untuk konfirmasi.',
      user: authData.user 
    });
  } catch (err) {
    // Log error untuk debugging
    console.error('Registration error:', err);
    
    return json(
      { error: err.message || 'Terjadi kesalahan, silakan coba lagi' }, 
      { status: 500 }
    );
  }
} 