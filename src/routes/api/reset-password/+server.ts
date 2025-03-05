import { supabaseClient } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);

    if (error) throw error;

    return json({ success: true });

  } catch (err) {
    console.error('Error:', err);
    return json({ 
      error: err.message || 'Terjadi kesalahan saat mengirim link reset password',
      code: err.code
    }, { status: 400 });
  }
}; 