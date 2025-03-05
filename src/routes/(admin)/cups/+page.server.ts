import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { VITE_SUPABASE_URL } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fungsi helper untuk mendapatkan range tanggal
function getDateRange(period: string) {
  const now = new Date();
  const start = new Date();
  
  switch(period) {
    case 'daily':
      start.setDate(start.getDate() - 7); // 7 hari terakhir
      break;
    case 'monthly':
      start.setMonth(start.getMonth() - 12); // 12 bulan terakhir
      break;
    case 'yearly':
      start.setFullYear(start.getFullYear() - 5); // 5 tahun terakhir
      break;
    default:
      start.setDate(start.getDate() - 7);
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString()
  };
}

export const load: PageServerLoad = async ({ cookies, url }) => {
  try {
    // Cek admin data dari cookie
    const adminData = cookies.get('admin_data');
    if (!adminData) {
      throw redirect(303, '/cups/login');
    }

    const admin = JSON.parse(adminData);

    // Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get period from query parameter atau default ke 'daily'
    const period = url.searchParams.get('period') || 'daily';
    const { start, end } = getDateRange(period);

    // Ambil total users dan count berdasarkan status
    const [
      { count: totalUsers, error: totalError },
      { count: activeUsers, error: activeError },
      { count: bannedUsers, error: bannedError },
      { count: onlineUsers, error: onlineError },
      { data: chartData, error: chartError }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('status', 'banned'),
      supabaseAdmin.from('user_online').select('*', { count: 'exact', head: true })
        .gte('updated_at', today.toISOString()),
      supabaseAdmin.from('user_online')
        .select('username, created_at')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true })
    ]);

    if (totalError) throw totalError;
    if (activeError) throw activeError;
    if (bannedError) throw bannedError;
    if (onlineError) throw onlineError;
    if (chartError) throw chartError;

    // Proses data untuk chart
    const processedChartData = chartData?.reduce((acc: any, curr: any) => {
      const date = new Date(curr.created_at);
      let key = '';
      
      switch(period) {
        case 'daily':
          key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          break;
        case 'monthly':
          key = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          break;
        case 'yearly':
          key = date.toLocaleDateString('id-ID', { year: 'numeric' });
          break;
      }
      
      if (!acc[key]) {
        acc[key] = new Set();
      }
      acc[key].add(curr.username);
      return acc;
    }, {});

    const chartLabels = Object.keys(processedChartData || {});
    const chartValues = Object.values(processedChartData || {}).map((set: any) => set.size);

    return {
      admin,
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      bannedUsers: bannedUsers || 0,
      onlineUsers: onlineUsers || 0,
      chartData: {
        labels: chartLabels,
        values: chartValues
      },
      currentPeriod: period
    };
  } catch (err) {
    console.error('Load error:', err);
    if (err.status === 303) {
      throw err;
    }
    throw error(500, err.message || 'Internal server error');
  }
}; 