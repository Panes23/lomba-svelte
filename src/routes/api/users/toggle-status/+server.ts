import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL } from '$env/static/private';

if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, newStatus } = await request.json();

    if (!userId || !newStatus) {
      return json(
        { message: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Update status user
    const { data, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return json(
        { message: 'Gagal mengubah status user: ' + updateError.message }, 
        { status: 500 }
      );
    }

    return json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return json(
      { message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    );
  }
}; 