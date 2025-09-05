import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageService } from '@/services/messageService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client');

describe('MessageService', () => {
  let messageService: MessageService;
  const mockSupabaseFrom = vi.mocked(supabase.from);

  beforeEach(() => {
    messageService = new MessageService();
    vi.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue({
        insert: mockInsert
      } as any);

      const input = {
        content: 'Nueva tarea: Implementar TDD',
        userId: 'user-123'
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('messages');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        content: 'Nueva tarea: Implementar TDD'
      });
    });

    it('should fail when content is empty', async () => {
      // Arrange
      const input = {
        content: '',
        userId: 'user-123'
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('El contenido no puede estar vacío');
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('should fail when content is only whitespace', async () => {
      // Arrange
      const input = {
        content: '   ',
        userId: 'user-123'
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('El contenido no puede estar vacío');
    });

    it('should fail when userId is missing', async () => {
      // Arrange
      const input = {
        content: 'Test message',
        userId: ''
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario requerido');
    });

    it('should handle database errors', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ 
        error: { message: 'Database connection failed' } 
      });
      mockSupabaseFrom.mockReturnValue({
        insert: mockInsert
      } as any);

      const input = {
        content: 'Test message',
        userId: 'user-123'
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should trim whitespace from content', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue({
        insert: mockInsert
      } as any);

      const input = {
        content: '  Test message with spaces  ',
        userId: 'user-123'
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        content: 'Test message with spaces'
      });
    });

    it('should fail when content exceeds maximum length', async () => {
      // Arrange
      const longContent = 'a'.repeat(2001); // Excede el límite de 2000
      const input = {
        content: longContent,
        userId: 'user-123'
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('El mensaje no puede exceder 2000 caracteres');
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('should fail when userId is only whitespace', async () => {
      // Arrange
      const input = {
        content: 'Test message',
        userId: '   '
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario requerido');
    });

    it('should handle special characters in content', async () => {
      // Arrange
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue({
        insert: mockInsert
      } as any);

      const input = {
        content: '¡Hola! 🎉 @usuario #hashtag https://example.com',
        userId: 'user-123'
      };

      // Act
      const result = await messageService.createMessage(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        content: '¡Hola! 🎉 @usuario #hashtag https://example.com'
      });
    });
  });

  describe('fetchMessages', () => {
    it('should fetch messages with profiles successfully', async () => {
      // Arrange
      const mockMessages = [
        { id: 'msg-1', user_id: 'user-1', content: 'Message 1', created_at: '2024-01-01' }
      ];

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockMessages, error: null })
      });

      const mockProfileSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: { username: 'testuser', avatar_url: null, hearts_count: 0 } 
          })
        })
      });

      const mockBannersSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [] })
        })
      });

      mockSupabaseFrom
        .mockReturnValueOnce({ select: mockSelect } as any)
        .mockReturnValueOnce({ select: mockProfileSelect } as any)
        .mockReturnValueOnce({ select: mockBannersSelect } as any);

      // Act
      const result = await messageService.fetchMessages();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].profile.username).toBe('testuser');
    });

    it('should handle database error when fetching messages', async () => {
      // Arrange
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      mockSupabaseFrom.mockReturnValue({ select: mockSelect } as any);

      // Act
      const result = await messageService.fetchMessages();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('fetchMessageById', () => {
    it('should fetch single message with profile successfully', async () => {
      // Arrange
      const mockMessage = { 
        id: 'msg-1', 
        user_id: 'user-1', 
        content: 'Message 1', 
        created_at: '2024-01-01' 
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockMessage, error: null })
        })
      });

      const mockProfileSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: { username: 'testuser', avatar_url: null, hearts_count: 0 } 
          })
        })
      });

      const mockBannersSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [] })
        })
      });

      mockSupabaseFrom
        .mockReturnValueOnce({ select: mockSelect } as any)
        .mockReturnValueOnce({ select: mockProfileSelect } as any)
        .mockReturnValueOnce({ select: mockBannersSelect } as any);

      // Act
      const result = await messageService.fetchMessageById('msg-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('msg-1');
      expect(result.data.profile.username).toBe('testuser');
    });

    it('should fail when messageId is empty', async () => {
      // Act
      const result = await messageService.fetchMessageById('');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('ID de mensaje requerido');
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('should handle message not found error', async () => {
      // Arrange
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'No rows returned' } 
          })
        })
      });

      mockSupabaseFrom.mockReturnValue({ select: mockSelect } as any);

      // Act
      const result = await messageService.fetchMessageById('non-existent-id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No rows returned');
    });
  });
});