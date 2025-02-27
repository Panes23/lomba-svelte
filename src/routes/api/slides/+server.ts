import { json } from '@sveltejs/kit';
import { supabaseClient } from '$lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabaseClient
      .from('slides')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;
    return json(data || []);
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { data: newSlide, error } = await supabaseClient
      .from('slides')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return json({ success: true, data: newSlide });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
}

export async function PUT({ request }) {
  try {
    const { id, ...data } = await request.json();
    
    // Handle bulk update
    if (Array.isArray(data.slides)) {
      const { error } = await supabaseClient
        .from('slides')
        .upsert(data.slides);

      if (error) throw error;
    } 
    // Handle single update
    else {
      const { error } = await supabaseClient
        .from('slides')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    }

    return json({ success: true });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    const { id, imageUrl, imageMobileUrl } = await request.json();
    
    // Delete from Supabase first
    const { error: dbError } = await supabaseClient
      .from('slides')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Then delete images from Bunny.net
    const REGION = import.meta.env.VITE_BUNNY_REGION;
    const STORAGE_ZONE = import.meta.env.VITE_BUNNY_STORAGE_ZONE;
    const ACCESS_KEY = import.meta.env.VITE_BUNNY_ACCESS_KEY;

    // Helper function to delete from Bunny
    async function deleteFromBunny(url: string) {
      try {
        // Extract filename from URL
        const filePath = url.split('.net/')[1];
        if (!filePath) return;

        const deleteUrl = `https://${REGION}.storage.bunnycdn.com/${STORAGE_ZONE}/${filePath}`;
        console.log('Deleting file:', deleteUrl);

        const response = await fetch(
          deleteUrl,
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
      } catch (err) {
        console.error('Error deleting from Bunny:', err);
        // Continue even if file deletion fails
      }
    }

    // Delete both images
    const deletePromises = [];
    if (imageUrl) deletePromises.push(deleteFromBunny(imageUrl));
    if (imageMobileUrl) deletePromises.push(deleteFromBunny(imageMobileUrl));
    
    await Promise.allSettled(deletePromises);

    return json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return json({ error: err.message }, { status: 500 });
  }
} 