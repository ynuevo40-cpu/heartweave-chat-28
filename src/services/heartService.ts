import { supabase } from '@/integrations/supabase/client';

export interface GiveHeartInput {
  giverId: string;
  receiverId: string;
  messageId?: string;
}

export interface HeartServiceResult {
  success: boolean;
  error?: string;
  isDuplicate?: boolean;
}

export class HeartService {
  async giveHeart(input: GiveHeartInput): Promise<HeartServiceResult> {
    try {
      // Validaciones
      if (!input.giverId || !input.receiverId) {
        return { success: false, error: 'IDs de usuario requeridos' };
      }

      if (input.giverId === input.receiverId) {
        return { success: false, error: 'No puedes darte un corazón a ti mismo' };
      }

      // Intentar insertar corazón
      const { error } = await supabase
        .from('hearts')
        .insert({
          giver_id: input.giverId,
          receiver_id: input.receiverId,
          message_id: input.messageId || null
        });

      if (error) {
        if (error.code === '23505') { // Violación de restricción única
          return { success: false, error: 'Ya le diste un corazón a este usuario', isDuplicate: true };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al enviar corazón' };
    }
  }
}

export const heartService = new HeartService();