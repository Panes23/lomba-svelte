import { supabaseClient } from '$lib/supabaseClient';

// Daftar domain yang didukung
const domains = [
  'https://tebakangka.com',
  'https://tebakangka.net',
  'https://tebakangka.org'
];

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
  '/cookies',
  '/sitemap'
];

export async function GET({ url, request }) {
  try {
    // Deteksi domain dari request
    const host = request.headers.get('host');
    const protocol = url.protocol || 'https:';
    const currentDomain = `${protocol}//${host}`;
    
    // Pilih domain yang sesuai atau gunakan default
    const domain = domains.find(d => d.includes(host)) || domains[0];

    // Fetch data dari Supabase
    const [marketsRes, lombaRes] = await Promise.all([
      supabaseClient.from('markets').select('name').order('name'),
      supabaseClient.from('lomba').select('id, created_at').order('created_at', { ascending: false })
    ]);

    if (marketsRes.error) throw marketsRes.error;
    if (lombaRes.error) throw lombaRes.error;

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset 
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
>
  ${staticPages.map(page => `
  <url>
    <loc>${domain}${page}</loc>
    ${domains.map(d => d !== domain ? `
    <xhtml:link 
      rel="alternate" 
      hreflang="${d.includes('.com') ? 'x-default' : d.split('.').pop()}"
      href="${d}${page}"
    />` : '').join('')}
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}

  ${marketsRes.data.map(market => `
  <url>
    <loc>${domain}/lomba/${encodeURIComponent(market.name.toLowerCase())}</loc>
    ${domains.map(d => d !== domain ? `
    <xhtml:link 
      rel="alternate" 
      hreflang="${d.includes('.com') ? 'x-default' : d.split('.').pop()}"
      href="${d}/lomba/${encodeURIComponent(market.name.toLowerCase())}"
    />` : '').join('')}
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}

  ${lombaRes.data.map(item => `
  <url>
    <loc>${domain}/tebakan/${item.id}</loc>
    ${domains.map(d => d !== domain ? `
    <xhtml:link 
      rel="alternate" 
      hreflang="${d.includes('.com') ? 'x-default' : d.split('.').pop()}"
      href="${d}/tebakan/${item.id}"
    />` : '').join('')}
    <lastmod>${new Date(item.created_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`.trim();

    // Return response dengan header yang sesuai
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
} 