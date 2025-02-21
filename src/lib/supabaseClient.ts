import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fetchFromProxy(table: string, query = '') {
  try {
    const response = await fetch('/api/_db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ table, query })
    });

    if (!response.ok) throw new Error('Failed to fetch data');
    return await response.json();
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
}

export const supabaseClient = {
  from: (table: string) => ({
    select: async (columns = '*') => {
      try {
        const data = await fetchFromProxy(table, `select=${columns}`);
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    order: (column: string, { ascending = true }) => {
      const order = ascending ? 'asc' : 'desc';
      return `order=${column}.${order}`;
    }
  })
}; 