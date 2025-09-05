import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HeartService } from '@/services/heartService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('HeartService', () => {
  let heartService: HeartService;
  const mockSupabaseFrom = vi.mocked(supabase.from);

  beforeEach(() => {
    heartService = new HeartService();
    vi.clearAllMocks();
  });

  describe('giveHeart', () => {
    it('should give heart successfully', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue({
        insert: mockInsert
      } as any);

      const input = {
        giverId: 'giver-123',
        receiverId: 'receiver-456',
        messageId: 'msg-789'
      };

      // Act
      const result = await heartService.giveHeart(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        giver_id: 'giver-123',
        receiver_id: 'receiver-456',
        message_id: 'msg-789'
      });
    });

    it('should fail when trying to give heart to self', async () => {
      // Arrange
      const input = {
        giverId: 'user-123',
        receiverId: 'user-123'
      };

      // Act
      const result = await heartService.giveHeart(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No puedes darte un corazón a ti mismo');
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('should handle duplicate heart error', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ 
        error: { code: '23505', message: 'Duplicate key' } 
      });
      mockSupabaseFrom.mockReturnValue({
        insert: mockInsert
      } as any);

      const input = {
        giverId: 'giver-123',
        receiverId: 'receiver-456'
      };

      // Act
      const result = await heartService.giveHeart(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Ya le diste un corazón a este usuario');
      expect(result.isDuplicate).toBe(true);
    });

    it('should fail when giverId is missing', async () => {
      // Arrange
      const input = {
        giverId: '',
        receiverId: 'receiver-456'
      };

      // Act
      const result = await heartService.giveHeart(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('IDs de usuario requeridos');
    });

    it('should fail when receiverId is missing', async () => {
      // Arrange
      const input = {
        giverId: 'giver-123',
        receiverId: ''
      };

      // Act
      const result = await heartService.giveHeart(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('IDs de usuario requeridos');
    });

    it('should handle database error gracefully', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ 
        error: { message: 'Connection timeout' } 
      });
      mockSupabaseFrom.mockReturnValue({
        insert: mockInsert
      } as any);

      const input = {
        giverId: 'user-123',
        receiverId: 'user-456'
      };

      // Act
      const result = await heartService.giveHeart(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    it('should include messageId when provided', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue({
        insert: mockInsert
      } as any);

      const input = {
        giverId: 'user-123',
        receiverId: 'user-456',
        messageId: 'msg-789'
      };

      // Act
      const result = await heartService.giveHeart(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        giver_id: 'user-123',
        receiver_id: 'user-456',
        message_id: 'msg-789'
      });
    });
  });
});