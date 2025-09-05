import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserBanners } from '@/hooks/useUserBanners';
import { supabase } from '@/integrations/supabase/client';
import { mockUser } from '@/test/testUtils';

// Mock Supabase
vi.mock('@/integrations/supabase/client');

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser })
}));

describe('useUserBanners', () => {
  const mockSupabaseFrom = vi.mocked(supabase.from);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user banners successfully', async () => {
    // Arrange
    const mockProfileSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ 
          data: { hearts_count: 15 }, 
          error: null 
        })
      })
    });

    const mockBannersSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ 
        data: [
          { id: 'banner-1', emoji: '⭐', name: 'Estrella', rarity: 'common', hearts_required: 5 },
          { id: 'banner-2', emoji: '🏆', name: 'Trofeo', rarity: 'rare', hearts_required: 20 }
        ], 
        error: null 
      })
    });

    const mockUserBannersSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ 
        data: [
          { banner_id: 'banner-1', unlocked_at: '2024-01-01' }
        ], 
        error: null 
      })
    });

    mockSupabaseFrom
      .mockReturnValueOnce({ select: mockProfileSelect } as any) // profiles
      .mockReturnValueOnce({ select: mockBannersSelect } as any) // banners
      .mockReturnValueOnce({ select: mockUserBannersSelect } as any); // user_banners

    // Act
    const { result } = renderHook(() => useUserBanners());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.banners).toHaveLength(2);
    expect(result.current.banners[0].unlocked).toBe(true); // 15 hearts >= 5 required
    expect(result.current.banners[1].unlocked).toBe(false); // 15 hearts < 20 required
    expect(result.current.stats.userHearts).toBe(15);
    expect(result.current.stats.unlocked).toBe(1);
  });

  it('should handle no user gracefully', async () => {
    // Re-mock useAuth for this specific test
    vi.doMock('@/hooks/useAuth', () => ({
      useAuth: () => ({ user: null })
    }));

    // Act
    const { result } = renderHook(() => useUserBanners());

    // Assert
    expect(result.current.loading).toBe(true);
    expect(result.current.banners).toEqual([]);
    expect(mockSupabaseFrom).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    // Arrange
    const mockProfileSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Profile not found' } 
        })
      })
    });

    mockSupabaseFrom.mockReturnValue({ select: mockProfileSelect } as any);

    // Act
    const { result } = renderHook(() => useUserBanners());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Profile not found');
    expect(result.current.banners).toEqual([]);
  });
});