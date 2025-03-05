import { supabaseClient } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Ambil data markets
    const { data: markets, error: marketsError } = await supabaseClient
      .from('markets')
      .select('name')
      .order('name');

    if (marketsError) throw marketsError;

    // Ambil data lomba
    const { data: lomba, error: lombaError } = await supabaseClient
      .from('lomba')
      .select(`
        id,
        markets:market_id (name),
        guess_type,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (lombaError) throw lombaError;

    // Daftar halaman statis
    const staticPages = [
      '/',
      '/about',
      '/contact',
      '/faq',
      '/login',
      '/register',
      '/lupa-password',
      '/privacy',
      '/terms',
      '/cookies'
    ];

    // Base URL dari environment variable
    const baseUrl = import.meta.env.VITE_BASE_URL || url.origin;

    // Buat XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  
  ${markets.map(market => `
  <url>
    <loc>${baseUrl}/lomba/${encodeURIComponent(market.name)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  
  ${lomba.map(item => `
  <url>
    <loc>${baseUrl}/tebakan/${item.id}</loc>
    <lastmod>${new Date(item.created_at).toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`;

    // Return XML response
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=0, s-maxage=3600'
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}; 