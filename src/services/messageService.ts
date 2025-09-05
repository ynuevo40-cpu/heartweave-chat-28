import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/hooks/useChat';

export interface CreateMessageInput {
  content: string;
  userId: string;
}

// Constantes para validaciones
export const MESSAGE_CONSTRAINTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 2000,
  TRIM_WHITESPACE: true
} as const;

export interface MessageServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class MessageService {
  async createMessage(input: CreateMessageInput): Promise<MessageServiceResult> {
    try {
      // Validar entrada
      const validation = this.validateMessageInput(input);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Insertar mensaje en la base de datos
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: input.userId,
          content: input.content.trim()
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error desconocido' };
    }
  }

  /**
   * Valida los datos de entrada para crear un mensaje
   * @private
   */
  private validateMessageInput(input: CreateMessageInput): { isValid: boolean; error?: string } {
    if (!input.content || !input.content.trim()) {
      return { isValid: false, error: 'El contenido no puede estar vacío' };
    }

    if (input.content.length > MESSAGE_CONSTRAINTS.MAX_LENGTH) {
      return { isValid: false, error: `El mensaje no puede exceder ${MESSAGE_CONSTRAINTS.MAX_LENGTH} caracteres` };
    }

    if (!input.userId || !input.userId.trim()) {
      return { isValid: false, error: 'Usuario requerido' };
    }

    return { isValid: true };
  }

  async fetchMessages(): Promise<MessageServiceResult> {
    try {
      // Obtener todos los mensajes
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (messagesError) {
        return { success: false, error: messagesError.message };
      }

      // Enriquecer mensajes con perfiles y banners
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(message => this.enrichMessageWithProfile(message))
      );

      return { success: true, data: messagesWithProfiles };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al cargar mensajes' };
    }
  }

  async fetchMessageById(messageId: string): Promise<MessageServiceResult> {
    try {
      if (!messageId) {
        return { success: false, error: 'ID de mensaje requerido' };
      }

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (messageError) {
        return { success: false, error: messageError.message };
      }

      const messageWithProfile = await this.enrichMessageWithProfile(message);
      return { success: true, data: messageWithProfile };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al obtener mensaje' };
    }
  }

  /**
   * Enriquece un mensaje con datos de perfil y banners equipados
   * @private
   */
  private async enrichMessageWithProfile(message: any) {
    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url, hearts_count')
      .eq('user_id', message.user_id)
      .single();

    // Obtener banners equipados
    const { data: equippedBanners } = await supabase
      .from('equipped_banners')
      .select(`
        position,
        banners(name, emoji, rarity)
      `)
      .eq('user_id', message.user_id)
      .order('position');

    return {
      ...message,
      profile,
      equipped_banners: equippedBanners?.map(eb => ({
        position: eb.position,
        banner: eb.banners
      })) || []
    };
  }
}

export const messageService = new MessageService();