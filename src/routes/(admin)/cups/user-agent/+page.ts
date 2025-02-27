import type { PageLoad } from './$types';

interface PageData {
  coretax: any[];
  privilages: any[];
}

export const load: PageLoad<PageData> = async ({ data }) => {
  return {
    coretax: data.coretax,
    privilages: data.privilages
  };
}; 