import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
  // Skip auth check untuk halaman login
  if (url.pathname === '/cups/login') {
    return {};
  }

  // Cek auth di server side
  // Note: Actual auth check will be done client side with sessionStorage
  return {};
}; 