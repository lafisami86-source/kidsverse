/**
 * Cloudinary integration for media uploads
 * Handles image uploads for drawings, avatars, etc.
 */

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export interface UploadOptions {
  folder?: string;
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  resourceType?: 'image' | 'video';
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kidsverse-uploads';

export function getCloudinaryUrl(publicId: string, options?: { width?: number; height?: number; quality?: number }): string {
  const params = new URLSearchParams();
  if (options?.width) params.set('w', String(options.width));
  if (options?.height) params.set('h', String(options.height));
  if (options?.quality) params.set('q', String(options.quality));

  const transform = params.toString() ? `${params.toString()}/` : '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}${publicId}`;
}

export async function uploadImage(
  file: File | Blob,
  options?: UploadOptions
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  if (options?.folder) formData.append('folder', options.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  return response.json();
}

export async function deleteImage(publicId: string): Promise<void> {
  // Server-side only - needs API secret
  // This would be called from an API route
  const timestamp = Math.floor(Date.now() / 1000).toString();

  console.warn('deleteImage should be called from server-side API route only');
}
