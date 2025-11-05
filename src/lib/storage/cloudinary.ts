import { v2 as cloudinary } from 'cloudinary';
import { STORAGE_CONFIG } from '@/lib/config/env';

/**
 * Configure Cloudinary
 */
cloudinary.config({
  cloud_name: STORAGE_CONFIG.cloudName,
  api_key: STORAGE_CONFIG.apiKey,
  api_secret: STORAGE_CONFIG.apiSecret,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: Array<Record<string, any>>;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  allowed_formats?: string[];
  max_file_size?: number;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'connectsphere',
      public_id: options.public_id,
      transformation: options.transformation || [],
      resource_type: options.resource_type || 'image',
      allowed_formats: options.allowed_formats || ['jpg', 'png', 'jpeg', 'webp'],
      max_file_size: options.max_file_size || 10 * 1024 * 1024, // 10MB default
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string
): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
    return false;
  }
}

/**
 * Get optimized image URL from Cloudinary
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
    gravity?: string;
  } = {}
): string {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  };

  return cloudinary.url(publicId, defaultOptions);
}

/**
 * Extract public_id from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    const folderIndex = url.indexOf('/upload/');
    if (folderIndex === -1) return null;
    
    const afterUpload = url.substring(folderIndex + 8);
    const versionAndPath = afterUpload.split('/').slice(1).join('/');
    const pathWithoutExt = versionAndPath.split('.')[0];
    
    return pathWithoutExt || null;
  } catch {
    return null;
  }
}

