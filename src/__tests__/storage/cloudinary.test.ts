import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  extractPublicIdFromUrl,
} from '@/lib/storage/cloudinary';

// Mock cloudinary
vi.mock('cloudinary', () => {
  const mockUploader = {
    upload_stream: vi.fn((options, callback) => {
      const stream = {
        end: vi.fn((buffer: Buffer) => {
          // Simulate successful upload
          setTimeout(() => {
            callback(null, {
              public_id: options.public_id || 'test-public-id',
              secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
              url: 'http://res.cloudinary.com/test/image/upload/test.jpg',
              width: 400,
              height: 400,
              format: 'jpg',
              bytes: 1024,
            });
          }, 10);
        }),
      };
      return stream;
    }),
    destroy: vi.fn((publicId: string) => {
      return Promise.resolve({ result: 'ok' });
    }),
  };

  const mockUrl = vi.fn((publicId: string, options: any) => {
    return `https://res.cloudinary.com/test/image/upload/${options.width || 'w_auto'}/${publicId}.${options.fetch_format || 'auto'}`;
  });

  return {
    v2: {
      config: vi.fn(),
      uploader: mockUploader,
      url: mockUrl,
    },
  };
});

describe('Cloudinary Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadToCloudinary', () => {
    it('should upload buffer to Cloudinary successfully', async () => {
      const buffer = Buffer.from('test image data');
      const options = {
        folder: 'profiles',
        public_id: 'user-123',
      };

      const result = await uploadToCloudinary(buffer, options);

      expect(result).toMatchObject({
        public_id: 'user-123',
        secure_url: expect.stringContaining('cloudinary.com'),
        width: 400,
        height: 400,
        format: 'jpg',
        bytes: 1024,
      });
    });

    it('should use default folder if not provided', async () => {
      const buffer = Buffer.from('test image data');

      const result = await uploadToCloudinary(buffer);

      expect(result.public_id).toBeDefined();
      expect(result.secure_url).toBeDefined();
    });

    it('should reject on upload error', async () => {
      const { v2 } = await import('cloudinary');
      const mockUploader = v2.uploader as any;
      
      mockUploader.upload_stream.mockImplementationOnce((options: any, callback: any) => {
        const stream = {
          end: vi.fn(() => {
            callback(new Error('Upload failed'), null);
          }),
        };
        return stream;
      });

      const buffer = Buffer.from('test image data');

      await expect(uploadToCloudinary(buffer)).rejects.toThrow('Cloudinary upload failed');
    });
  });

  describe('deleteFromCloudinary', () => {
    it('should delete image from Cloudinary successfully', async () => {
      const result = await deleteFromCloudinary('test-public-id');

      expect(result).toBe(true);
    });

    it('should return false on delete error', async () => {
      const { v2 } = await import('cloudinary');
      const mockUploader = v2.uploader as any;
      
      mockUploader.destroy.mockRejectedValueOnce(new Error('Delete failed'));

      const result = await deleteFromCloudinary('test-public-id');

      expect(result).toBe(false);
    });
  });

  describe('getOptimizedImageUrl', () => {
    it('should generate optimized image URL', () => {
      const url = getOptimizedImageUrl('test-public-id', {
        width: 200,
        height: 200,
        quality: 'auto',
      });

      expect(url).toContain('cloudinary.com');
      expect(url).toContain('test-public-id');
    });

    it('should use default options if not provided', () => {
      const url = getOptimizedImageUrl('test-public-id');

      expect(url).toContain('cloudinary.com');
      expect(url).toContain('test-public-id');
    });
  });

  describe('extractPublicIdFromUrl', () => {
    it('should extract public_id from Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/test/image/upload/v1234567890/profiles/user-123.jpg';
      const publicId = extractPublicIdFromUrl(url);

      expect(publicId).toBe('profiles/user-123');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/image.jpg';
      const publicId = extractPublicIdFromUrl(url);

      expect(publicId).toBeNull();
    });

    it('should handle URL without extension', () => {
      const url = 'https://res.cloudinary.com/test/image/upload/v1234567890/profiles/user-123';
      const publicId = extractPublicIdFromUrl(url);

      expect(publicId).toBe('profiles/user-123');
    });
  });
});

