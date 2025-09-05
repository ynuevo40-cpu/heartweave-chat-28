import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@/test/testUtils';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { messageService } from '@/services/messageService';
import { heartService } from '@/services/heartService';
import { mockUser } from '@/test/testUtils';

// Mock services
vi.mock('@/services/messageService');
vi.mock('@/services/heartService');

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser })
}));

describe('useChat', () => {
  const mockMessageService = vi.mocked(messageService);
  const mockHeartService = vi.mocked(heartService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      // Arrange
      mockMessageService.createMessage.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useChat());

      // Act
      await result.current.sendMessage('Test message');

      // Assert
      expect(mockMessageService.createMessage).toHaveBeenCalledWith({
        content: 'Test message',
        userId: mockUser.id
      });
    });

    it('should not send empty message', async () => {
      // Arrange
      const { result } = renderHook(() => useChat());

      // Act
      await result.current.sendMessage('');

      // Assert
      expect(mockMessageService.createMessage).not.toHaveBeenCalled();
    });

    it('should not send message when user is not authenticated', async () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({ user: null } as any);
      const { result } = renderHook(() => useChat());

      // Act
      await result.current.sendMessage('Test message');

      // Assert
      expect(mockMessageService.createMessage).not.toHaveBeenCalled();
    });
  });

  describe('giveHeart', () => {
    it('should give heart successfully', async () => {
      // Arrange
      mockHeartService.giveHeart.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useChat());

      // Act
      await result.current.giveHeart('receiver-123');

      // Assert
      expect(mockHeartService.giveHeart).toHaveBeenCalledWith({
        giverId: mockUser.id,
        receiverId: 'receiver-123'
      });
    });

    it('should not give heart to self', async () => {
      // Arrange
      const { result } = renderHook(() => useChat());

      // Act
      await result.current.giveHeart(mockUser.id);

      // Assert
      expect(mockHeartService.giveHeart).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should start with loading true', () => {
      // Arrange
      mockMessageService.fetchMessages.mockResolvedValue({ 
        success: true, 
        data: [] 
      });

      // Act
      const { result } = renderHook(() => useChat());

      // Assert
      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false after fetching messages', async () => {
      // Arrange
      mockMessageService.fetchMessages.mockResolvedValue({ 
        success: true, 
        data: [] 
      });

      // Act
      const { result } = renderHook(() => useChat());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});