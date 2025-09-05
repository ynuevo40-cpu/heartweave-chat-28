import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ActivityReward {
  type: 'daily_login' | 'first_message' | 'profile_visit' | 'banner_equip';
  hearts: number;
  description: string;
}

const ACTIVITY_REWARDS: Record<string, ActivityReward> = {
  daily_login: {
    type: 'daily_login',
    hearts: 10,
    description: 'Iniciar sesión diariamente'
  },
  first_message: {
    type: 'first_message',
    hearts: 5,
    description: 'Primer mensaje del día'
  },
  profile_visit: {
    type: 'profile_visit',
    hearts: 2,
    description: 'Visitar un perfil'
  },
  banner_equip: {
    type: 'banner_equip',
    hearts: 3,
    description: 'Equipar un banner'
  }
};

export const useActivityRewards = () => {
  const { user } = useAuth();

  const giveActivityReward = async (activityType: keyof typeof ACTIVITY_REWARDS) => {
    if (!user) return;

    const reward = ACTIVITY_REWARDS[activityType];
    if (!reward) return;

    try {
      // Check if user already got this reward today
      const today = new Date().toDateString();
      const storageKey = `reward_${activityType}_${today}_${user.id}`;
      
      if (localStorage.getItem(storageKey)) {
        return; // Already rewarded today
      }

      // Give hearts reward
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('hearts_count')
        .eq('user_id', user.id)
        .single();

      if (profileError) return;

      const currentHearts = profileData?.hearts_count || 0;
      const newHeartsCount = currentHearts + reward.hearts;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ hearts_count: newHeartsCount })
        .eq('user_id', user.id);

      if (updateError) return;

      // Mark as rewarded today
      localStorage.setItem(storageKey, 'true');

      // Show notification
      toast.success(`+${reward.hearts} corazones por ${reward.description}! 💝`, {
        duration: 3000
      });

    } catch (error) {
      console.error('Error giving activity reward:', error);
    }
  };

  // Auto-reward daily login
  useEffect(() => {
    if (user) {
      giveActivityReward('daily_login');
    }
  }, [user]);

  return {
    giveActivityReward
  };
};