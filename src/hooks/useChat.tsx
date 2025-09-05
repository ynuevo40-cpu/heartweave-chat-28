import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { toast } from 'sonner';
import { messageService } from '@/services/messageService';
import { heartService } from '@/services/heartService';

export interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
    hearts_count: number;
  } | null;
  equipped_banners: Array<{
    position: number;
    banner: {
      name: string;
      emoji: string;
      rarity: string;
    };
  }>;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showNotification, playMessageSound } = useNotificationSettings();

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Fetch the complete message with profile and banners
          fetchNewMessage(payload.new.id);
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const result = await messageService.fetchMessages();
      
      if (result.success) {
        setMessages(result.data || []);
      } else {
        toast.error(result.error || 'Error al cargar mensajes');
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewMessage = async (messageId: string) => {
    try {
      const result = await messageService.fetchMessageById(messageId);
      
      if (result.success && result.data) {
        const newMessage = result.data;
        setMessages(prev => [...prev, newMessage]);
        
        // Show notification and play sound only for messages from other users
        if (user && newMessage.user_id !== user.id) {
          showNotification('Nuevo mensaje', {
            body: `${newMessage.profile?.username}: ${newMessage.content}`,
            tag: 'new-message',
            icon: newMessage.profile?.avatar_url || '/favicon.ico'
          });
          
          playMessageSound();
        }
      }
    } catch (error: any) {
      console.error('Error fetching new message:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const result = await messageService.createMessage({
        content,
        userId: user.id
      });

      if (!result.success) {
        toast.error(result.error || 'Error al enviar mensaje');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
    }
  };

  const giveHeart = async (receiverId: string) => {
    if (!user || user.id === receiverId) return;

    try {
      const result = await heartService.giveHeart({
        giverId: user.id,
        receiverId
      });

      if (result.success) {
        toast.success('¡Corazón enviado! ❤️');
      } else if (result.isDuplicate) {
        toast.error('Ya le diste un corazón a este usuario');
      } else {
        toast.error(result.error || 'Error al enviar corazón');
      }
    } catch (error: any) {
      console.error('Error giving heart:', error);
      toast.error('Error al enviar corazón');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Mensaje eliminado');
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error('Error al eliminar mensaje');
    }
  };

  const clearAllMessages = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .gte('created_at', '1970-01-01T00:00:00Z'); // Delete all messages

      if (error) throw error;
      
      setMessages([]);
      toast.success('Chat reiniciado - Todos los mensajes han sido eliminados');
    } catch (error: any) {
      console.error('Error clearing all messages:', error);
      toast.error('Error al reiniciar el chat');
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    giveHeart,
    deleteMessage,
    clearAllMessages
  };
};