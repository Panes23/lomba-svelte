import { json } from '@sveltejs/kit';

export async function PUT({ request }) {
  try {
    const { fileName, file } = await request.json();
    const REGION = process.env.VITE_BUNNY_REGION;
    const STORAGE_ZONE = process.env.VITE_BUNNY_STORAGE_ZONE;
    const ACCESS_KEY = process.env.VITE_BUNNY_ACCESS_KEY;

    const response = await fetch(
      `https://${REGION}.storage.bunnycdn.com/${STORAGE_ZONE}/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': ACCESS_KEY,
          'Content-Type': 'application/octet-stream'
        },
        body: file
      }
    );

    if (!response.ok) throw new Error('Upload failed');
    
    return json({
      url: `https://${STORAGE_ZONE}.b-cdn.net/${fileName}`
    });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
} 