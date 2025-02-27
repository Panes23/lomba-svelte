import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || '';

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const uploadPath = path ? `/${path}/${fileName}` : `/${fileName}`;

    const REGION = import.meta.env.VITE_BUNNY_REGION;
    const STORAGE_ZONE = import.meta.env.VITE_BUNNY_STORAGE_ZONE;
    const ACCESS_KEY = import.meta.env.VITE_BUNNY_ACCESS_KEY;

    const response = await fetch(
      `https://${REGION}.storage.bunnycdn.com/${STORAGE_ZONE}/${uploadPath}`,
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

    const imageUrl = `https://${STORAGE_ZONE}.b-cdn.net/${uploadPath}`;

    return json({ url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return json({ error: 'Upload failed' }, { status: 500 });
  }
}; 