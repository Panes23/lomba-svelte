import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, depends }) => {
  // Track dependencies
  depends('app:markets');
  depends('app:slides');

  return {
    markets: data?.markets || [],
    slides: data?.slides || []
  };
}; 