import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/connection', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/storage/cloudinary', () => ({
  uploadToCloudinary: vi.fn(),
  extractPublicIdFromUrl: vi.fn(),
  deleteFromCloudinary: vi.fn(),
}));

// Import after mocks
import { uploadProfileImage } from '@/lib/actions/profile';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { uploadToCloudinary, extractPublicIdFromUrl } from '@/lib/storage/cloudinary';

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@university.edu',
  },
};

describe('uploadProfileImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should upload image successfully', async () => {
    const mockFile = new File(['image data'], 'test.jpg', {
      type: 'image/jpeg',
    });
    const mockUploadResult = {
      public_id: 'profile-user-123',
      secure_url: 'https://res.cloudinary.com/test/image/upload/profile-user-123.jpg',
      url: 'http://res.cloudinary.com/test/image/upload/profile-user-123.jpg',
      width: 400,
      height: 400,
      format: 'jpg',
      bytes: 1024,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-123',
      profileImageUrl: null,
    } as any);
    vi.mocked(uploadToCloudinary).mockResolvedValue(mockUploadResult);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-123',
      profileImageUrl: mockUploadResult.secure_url,
    } as any);

    const formData = new FormData();
    formData.append('image', mockFile);

    const result = await uploadProfileImage(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBe(mockUploadResult.secure_url);
      expect(result.data.publicId).toBe(mockUploadResult.public_id);
    }
    expect(uploadToCloudinary).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { profileImageUrl: mockUploadResult.secure_url },
    });
  });

  it('should return error if no file provided', async () => {
    const formData = new FormData();

    const result = await uploadProfileImage(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('No image file provided');
    }
  });

  it('should return error for invalid file type', async () => {
    const mockFile = new File(['data'], 'test.pdf', { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('image', mockFile);

    const result = await uploadProfileImage(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid file type');
    }
  });

  it('should return error for file too large', async () => {
    // Create a mock file that's larger than 10MB
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const mockFile = new File([largeBuffer], 'large.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('image', mockFile);

    const result = await uploadProfileImage(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('File size too large');
    }
  });

  it('should delete old image before uploading new one', async () => {
    const mockFile = new File(['image data'], 'test.jpg', {
      type: 'image/jpeg',
    });
    const oldImageUrl = 'https://res.cloudinary.com/test/image/upload/old-image.jpg';
    const mockUploadResult = {
      public_id: 'profile-user-123',
      secure_url: 'https://res.cloudinary.com/test/image/upload/profile-user-123.jpg',
      url: 'http://res.cloudinary.com/test/image/upload/profile-user-123.jpg',
      width: 400,
      height: 400,
      format: 'jpg',
      bytes: 1024,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-123',
      profileImageUrl: oldImageUrl,
    } as any);
    vi.mocked(extractPublicIdFromUrl).mockReturnValue('old-image');
    vi.mocked(uploadToCloudinary).mockResolvedValue(mockUploadResult);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-123',
      profileImageUrl: mockUploadResult.secure_url,
    } as any);

    const formData = new FormData();
    formData.append('image', mockFile);

    await uploadProfileImage(formData);

    expect(extractPublicIdFromUrl).toHaveBeenCalledWith(oldImageUrl);
  });

  it('should redirect if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { redirect } = await import('next/navigation');

    const mockFile = new File(['image data'], 'test.jpg', {
      type: 'image/jpeg',
    });
    const formData = new FormData();
    formData.append('image', mockFile);

    await uploadProfileImage(formData);

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('should return error on upload failure', async () => {
    const mockFile = new File(['image data'], 'test.jpg', {
      type: 'image/jpeg',
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-123',
      profileImageUrl: null,
    } as any);
    vi.mocked(uploadToCloudinary).mockRejectedValue(
      new Error('Upload failed')
    );

    const formData = new FormData();
    formData.append('image', mockFile);

    const result = await uploadProfileImage(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Upload failed');
    }
  });
});

