import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  try {
    const { url } = await request.json();
    const REGION = import.meta.env.VITE_BUNNY_REGION;
    const STORAGE_ZONE = import.meta.env.VITE_BUNNY_STORAGE_ZONE;
    const ACCESS_KEY = import.meta.env.VITE_BUNNY_ACCESS_KEY;

    // Extract filename from URL
    const filePath = url.split('.net/')[1];
    if (!filePath) return json({ success: true });

    const response = await fetch(
      `https://${REGION}.storage.bunnycdn.com/${STORAGE_ZONE}/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'AccessKey': ACCESS_KEY,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Delete failed with status: ${response.status}`);
    }

    return json({ success: true });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
} 