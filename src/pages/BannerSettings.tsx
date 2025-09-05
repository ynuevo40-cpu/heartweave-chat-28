import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BannerBadge } from '@/components/BannerBadge';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserBanners } from '@/hooks/useUserBanners';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActivityRewards } from '@/hooks/useActivityRewards';
import { ArrowLeft, Settings, Check, Key } from 'lucide-react';

export default function BannerSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { banners, refetch: refetchBanners } = useUserBanners();
  const { giveActivityReward } = useActivityRewards();
  const [equippedBannerIds, setEquippedBannerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [secretPassword, setSecretPassword] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchEquippedBanners();
    }
  }, [user?.id]);

  const fetchEquippedBanners = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('equipped_banners')
        .select('banner_id')
        .eq('user_id', user.id)
        .order('position');

      if (error) throw error;

      setEquippedBannerIds(data?.map(eb => eb.banner_id) || []);
    } catch (error) {
      console.error('Error fetching equipped banners:', error);
    }
  };

  const toggleBanner = async (bannerId: string) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const isEquipped = equippedBannerIds.includes(bannerId);

      if (isEquipped) {
        // Unequip banner
        const { error } = await supabase
          .from('equipped_banners')
          .delete()
          .eq('user_id', user.id)
          .eq('banner_id', bannerId);

        if (error) throw error;

        setEquippedBannerIds(prev => prev.filter(id => id !== bannerId));
        toast.success('Banner desequipado');
      } else {
        // Check if user already has 2 banners equipped
        if (equippedBannerIds.length >= 2) {
          toast.error('Solo puedes equipar máximo 2 banners');
          return;
        }

        // Equip banner
        const { error } = await supabase
          .from('equipped_banners')
          .insert({
            user_id: user.id,
            banner_id: bannerId,
            position: equippedBannerIds.length + 1
          });

        if (error) throw error;

        setEquippedBannerIds(prev => [...prev, bannerId]);
        giveActivityReward('banner_equip');
        toast.success('Banner equipado');
      }
    } catch (error: any) {
      console.error('Error toggling banner:', error);
      toast.error('Error al cambiar banner');
    } finally {
      setLoading(false);
    }
  };

  const unlockAllBanners = async () => {
    if (!user?.id || secretPassword !== 'HeiderLeyenda') {
      toast.error('Contraseña incorrecta');
      return;
    }

    try {
      setLoading(true);
      
      // Get current hearts count
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('hearts_count')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const currentHearts = profileData?.hearts_count || 0;
      const newHeartsCount = currentHearts + 1000;

      // Update hearts count
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ hearts_count: newHeartsCount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('¡Has recibido 1000 corazones! 💝');
      setSecretPassword('');
      refetchBanners();
      
    } catch (error: any) {
      console.error('Error adding hearts:', error);
      toast.error('Error al añadir corazones');
    } finally {
      setLoading(false);
    }
  };

  const userBanners = banners.filter(banner => banner.unlocked);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-3 md:p-4">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              // Volver a donde vino el usuario, por defecto al chat
              const from = location.state?.from || '/chat';
              navigate(from);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Volver</span>
            <span className="sm:hidden">Volver</span>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold cyber-glow">Configuración de Banners</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base px-2">
            Selecciona hasta 2 banners para mostrar junto a tu nombre
          </p>
        </div>

        {/* Secret Password */}
        <Card className="glass border-border/50 mb-4 md:mb-6">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Key className="w-4 h-4 md:w-5 md:h-5" />
              Conseguir 1000 Corazones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="password"
                placeholder="Contraseña secreta..."
                value={secretPassword}
                onChange={(e) => setSecretPassword(e.target.value)}
                className="flex-1 text-sm md:text-base"
              />
              <Button 
                onClick={unlockAllBanners}
                disabled={!secretPassword || loading}
                variant="outline"
                className="w-full sm:w-auto text-sm"
              >
                <span className="sm:hidden">Recibir</span>
                <span className="hidden sm:inline">Recibir Corazones</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Si conoces la contraseña secreta, recibirás 1000 corazones gratis
            </p>
          </CardContent>
        </Card>

        {/* Currently Equipped */}
        <Card className="glass border-border/50 mb-4 md:mb-6">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg">Banners Equipados ({equippedBannerIds.length}/2)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {equippedBannerIds.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay banners equipados</p>
              ) : (
                equippedBannerIds.map(bannerId => {
                  const banner = banners.find(b => b.id === bannerId);
                  if (!banner) return null;
                  return (
                    <BannerBadge
                      key={bannerId}
                      emoji={banner.emoji}
                      name={banner.name}
                      rarity={banner.rarity as any}
                      size="sm"
                      className="flex-shrink-0"
                    />
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Banners */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg">Banners Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            {userBanners.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-muted-foreground text-sm md:text-base">No tienes banners desbloqueados aún</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Consigue más corazones para desbloquear nuevos banners
                </p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {userBanners.map((banner) => {
                  const isEquipped = equippedBannerIds.includes(banner.id);
                  return (
                    <div 
                      key={banner.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 rounded-lg border border-border/50 hover:bg-background-secondary/50 transition-colors space-y-3 sm:space-y-0"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <BannerBadge
                          emoji={banner.emoji}
                          name={banner.name}
                          rarity={banner.rarity as any}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm md:text-base truncate">{banner.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">Requiere {banner.hearts_required} corazones</p>
                        </div>
                      </div>
                      
                      <Button
                        variant={isEquipped ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleBanner(banner.id)}
                        disabled={loading || (!isEquipped && equippedBannerIds.length >= 2)}
                        className={`w-full sm:w-auto flex-shrink-0 text-xs md:text-sm ${isEquipped ? "bg-success hover:bg-success/80" : ""}`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            Equipado
                          </>
                        ) : (
                          'Equipar'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}