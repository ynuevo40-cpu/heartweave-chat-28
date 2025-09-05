import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RankingUser {
  id: string;
  username: string;
  avatar_url?: string;
  hearts_count: number;
  rank: number;
  equipped_banners?: Array<{
    banner_id: string;
    position: number;
    banner: {
      id: string;
      emoji: string;
      name: string;
      rarity: string;
    };
  }>;
}

export interface RankingsStats {
  totalHearts: number;
  totalUsers: number;
  totalBanners: number;
}

export const useRankings = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [stats, setStats] = useState<RankingsStats>({
    totalHearts: 0,
    totalUsers: 0,
    totalBanners: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users with their hearts count
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          avatar_url,
          hearts_count
        `)
        .order('hearts_count', { ascending: false })
        .limit(50);

      if (profilesError) throw profilesError;

      // Fetch equipped banners for each user
      const userIds = profilesData?.map(p => p.user_id) || [];
      
      let equippedBannersData: any[] = [];
      if (userIds.length > 0) {
        const { data: bannersData, error: bannersError } = await supabase
          .from('equipped_banners')
          .select(`
            user_id,
            banner_id,
            position,
            banners (
              id,
              emoji,
              name,
              rarity
            )
          `)
          .in('user_id', userIds);

        if (bannersError) {
          console.warn('Error fetching banners:', bannersError);
        } else {
          equippedBannersData = bannersData || [];
        }
      }

      // Add ranking position and merge banners
      const rankedUsers: RankingUser[] = (profilesData || []).map((user, index) => {
        const userBanners = equippedBannersData
          .filter(eb => eb.user_id === user.user_id)
          .sort((a, b) => a.position - b.position)
          .slice(0, 2);
        
        return {
          id: user.user_id,
          username: user.username || 'Usuario',
          avatar_url: user.avatar_url,
          hearts_count: user.hearts_count || 0,
          rank: index + 1,
          equipped_banners: userBanners.map((eb: any) => ({
            banner_id: eb.banner_id,
            position: eb.position,
            banner: {
              id: eb.banners?.id || '',
              emoji: eb.banners?.emoji || '🏆',
              name: eb.banners?.name || 'Banner',
              rarity: eb.banners?.rarity || 'common'
            }
          }))
        };
      });

      setRankings(rankedUsers);

      // Calculate stats
      const totalHearts = rankedUsers.reduce((sum, user) => sum + user.hearts_count, 0);
      
      // Get total banners count
      const { count: bannersCount } = await supabase
        .from('banners')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalHearts,
        totalUsers: rankedUsers.length,
        totalBanners: bannersCount || 0
      });

    } catch (err: any) {
      console.error('Error fetching rankings:', err);
      setError(err.message || 'Error al cargar los rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return {
    rankings,
    stats,
    loading,
    error,
    refetch: fetchRankings
  };
};