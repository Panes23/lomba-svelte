import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  if (token_hash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type
    });

    if (error) {
      console.error('Error verifying recovery token:', error);
      throw redirect(303, '/lupa-password');
    }
  } else {
    // Jika tidak ada token recovery, cek session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect(303, '/login');
    }
  }

  return { token_hash, type };
}; 