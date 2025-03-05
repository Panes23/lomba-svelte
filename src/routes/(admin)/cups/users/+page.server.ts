import { supabaseClient } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, setHeaders, depends, fetch }) => {
  try {
    // Set header untuk mencegah caching
    setHeaders({
      'cache-control': 'no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0'
    });

    // Tandai dependensi untuk invalidasi
    depends('app:privilage');

    // Ambil data users dengan logging
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    // Ambil data akses pengguna dengan fresh data
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/privilage?level=superadmin&_t=${timestamp}`);
    const privilageData = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch privileges:', privilageData.error);
      return {
        users: users?.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          birth_date: user.birth_date,
          status: user.status,
          alamat_ip: user.alamat_ip,
          last_login: user.last_login,
          created_at: user.created_at
        })) || [],
        userAccess: []
      };
    }

    // Debug: Log final data being returned
    const returnData = {
      users: users?.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        birth_date: user.birth_date,
        status: user.status,
        alamat_ip: user.alamat_ip,
        last_login: user.last_login,
        created_at: user.created_at
      })) || [],
      userAccess: privilageData.akses || []
    };

    return returnData;
  } catch (error) {
    console.error('Error in load function:', error);
    if (error instanceof Response) {
      throw error;
    }
    return {
      users: [],
      userAccess: []
    };
  }
}; 