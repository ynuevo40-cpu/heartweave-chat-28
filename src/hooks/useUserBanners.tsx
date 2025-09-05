import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserBanner {
  id: string;
  emoji: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  hearts_required: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface BannerStats {
  total: number;
  unlocked: number;
  userHearts: number;
}

export const useUserBanners = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<UserBanner[]>([]);
  const [stats, setStats] = useState<BannerStats>({
    total: 0,
    unlocked: 0,
    userHearts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBanners = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's hearts count
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('hearts_count')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const userHearts = profileData?.hearts_count || 0;

      // Get all banners
      const { data: bannersData, error: bannersError } = await supabase
        .from('banners')
        .select('*')
        .order('hearts_required');

      if (bannersError) throw bannersError;

      // Get user's unlocked banners
      const { data: userBannersData, error: userBannersError } = await supabase
        .from('user_banners')
        .select('banner_id, unlocked_at')
        .eq('user_id', user.id);

      if (userBannersError) throw userBannersError;

      const unlockedBannerIds = new Set(userBannersData?.map(ub => ub.banner_id) || []);

      // Combine data
      const combinedBanners: UserBanner[] = (bannersData || []).map(banner => ({
        id: banner.id,
        emoji: banner.emoji,
        name: banner.name,
        rarity: banner.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        hearts_required: banner.hearts_required,
        unlocked: unlockedBannerIds.has(banner.id) || userHearts >= banner.hearts_required,
        unlocked_at: userBannersData?.find(ub => ub.banner_id === banner.id)?.unlocked_at
      }));

      setBanners(combinedBanners);
      
      const unlockedCount = combinedBanners.filter(b => b.unlocked).length;
      
      setStats({
        total: combinedBanners.length,
        unlocked: unlockedCount,
        userHearts
      });

    } catch (err: any) {
      console.error('Error fetching user banners:', err);
      setError(err.message || 'Error al cargar los banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBanners();
  }, [user]);

  return {
    banners,
    stats,
    loading,
    error,
    refetch: fetchUserBanners
  };
};