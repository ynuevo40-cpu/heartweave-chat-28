import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  hearts_count: number;
  created_at: string;
  description?: string;
  equipped_banners: Array<{
    position: number;
    banner: {
      id: string;
      name: string;
      emoji: string;
      rarity: string;
      hearts_required: number;
    };
  }>;
  user_banners: Array<{
    banner_id: string;
    unlocked_at: string;
    banner: {
      id: string;
      name: string;  
      emoji: string;
      rarity: string;
      hearts_required: number;
    };
  }>;
  message_count: number;
}

export const useUserProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    fetchUserProfile();
  }, [targetUserId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (profileError) throw profileError;

      // Get equipped banners
      const { data: equippedBanners, error: equippedError } = await supabase
        .from('equipped_banners')
        .select(`
          position,
          banners(id, name, emoji, rarity, hearts_required)
        `)
        .eq('user_id', targetUserId)
        .order('position');

      if (equippedError) throw equippedError;

      // Get all unlocked banners
      const { data: userBanners, error: userBannersError } = await supabase
        .from('user_banners')
        .select(`
          banner_id,
          unlocked_at,
          banners(id, name, emoji, rarity, hearts_required)
        `)
        .eq('user_id', targetUserId);

      if (userBannersError) throw userBannersError;

      // Get message count
      const { count: messageCount, error: messageError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      if (messageError) throw messageError;

      const userProfile: UserProfile = {
        ...profileData,
        equipped_banners: equippedBanners?.map(eb => ({
          position: eb.position,
          banner: eb.banners
        })) || [],
        user_banners: userBanners?.map(ub => ({
          banner_id: ub.banner_id,
          unlocked_at: ub.unlocked_at,
          banner: ub.banners
        })) || [],
        message_count: messageCount || 0
      };

      setProfile(userProfile);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchUserProfile,
    isOwnProfile: targetUserId === user?.id
  };
};