import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BannerBadge, type BannerRarity } from '@/components/BannerBadge';
import { Navigation } from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { Heart, Lock, Unlock, Star, Loader2 } from 'lucide-react';
import { useUserBanners } from '@/hooks/useUserBanners';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Banners() {
  const { banners, stats, loading, error } = useUserBanners();
  const isMobile = useIsMobile();

  // Organizar banners por rareza
  const bannersByRarity: Record<BannerRarity, typeof banners> = {
    common: banners.filter(b => b.rarity === 'common'),
    rare: banners.filter(b => b.rarity === 'rare'),
    epic: banners.filter(b => b.rarity === 'epic'),
    legendary: banners.filter(b => b.rarity === 'legendary')
  };

  const rarityInfo = {
  common: {
    title: 'Comunes',
    description: 'Fáciles de conseguir para motivar rápido',
    color: 'banner-common',
    bgColor: 'bg-banner-common/10',
    borderColor: 'border-banner-common/30'
  },
  rare: {
    title: 'Raros', 
    description: 'Medio esfuerzo, buen logro',
    color: 'banner-rare',
    bgColor: 'bg-banner-rare/10',
    borderColor: 'border-banner-rare/30'
  },
  epic: {
    title: 'Épicos',
    description: 'Jugadores activos y queridos',
    color: 'banner-epic',
    bgColor: 'bg-banner-epic/10', 
    borderColor: 'border-banner-epic/30'
  },
  legendary: {
    title: 'Legendarios',
    description: 'Los más difíciles y raros',
    color: 'banner-legendary',
    bgColor: 'bg-banner-legendary/10',
    borderColor: 'border-banner-legendary/30'
  }
  };

  const getProgressPercentage = (requiredHearts: number) => {
    if (stats.userHearts >= requiredHearts) return 100;
    return Math.min((stats.userHearts / requiredHearts) * 100, 100);
  };

  const getTotalByRarity = (rarity: BannerRarity) => {
    const total = bannersByRarity[rarity].length;
    const unlocked = bannersByRarity[rarity].filter(b => b.unlocked).length;
    return { total, unlocked };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Navigation />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando banners...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Navigation />
        <div className="text-center text-muted-foreground">
          <p>Error al cargar los banners</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <main className={`${isMobile ? 'pb-4' : 'pb-20 md:pl-20'}`}>
        {/* Header */}
        <div className="sticky top-0 z-40 glass border-b border-border/50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <BackButton />
              <h1 className="text-2xl font-bold cyber-glow">Sistema de Banners</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Colecciona banners ganando corazones ❤️
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* User Progress Overview */}
          <Card className="glass border-border/50 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-lg md:text-2xl">
                <Heart className="h-5 w-5 md:h-6 md:w-6 text-heart fill-current heart-pulse" />
                <span className="text-xl md:text-2xl">{stats.userHearts}</span>
                <span className="text-muted-foreground text-sm md:text-base">Corazones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-center">
                {Object.entries(rarityInfo).map(([rarity, info]) => {
                  const rarityStats = getTotalByRarity(rarity as BannerRarity);
                  return (
                    <div key={rarity} className={`p-2 md:p-3 rounded-lg ${info.bgColor} ${info.borderColor} border`}>
                      <div className={`text-base md:text-lg font-bold ${info.color}`}>
                        {rarityStats.unlocked}/{rarityStats.total}
                      </div>
                      <div className="text-xs text-muted-foreground">{info.title}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Banner Categories */}
          {Object.entries(rarityInfo).map(([rarity, info]) => {
            const categoryBanners = banners.filter(b => b.rarity === rarity as BannerRarity);
            
            return (
              <Card key={rarity} className="glass border-border/50">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${info.color}`}>
                    <Star className="h-5 w-5" />
                    {info.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:gap-4">
                    {categoryBanners.map((banner) => {
                      const progress = getProgressPercentage(banner.hearts_required);
                      
                      return (
                        <div
                          key={banner.id}
                          className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg border transition-all ${
                            banner.unlocked 
                              ? `${info.bgColor} ${info.borderColor} hover:scale-102` 
                              : 'bg-muted/20 border-muted/30 opacity-60'
                          }`}
                        >
                          {/* Banner Badge */}
                          <div className="flex-shrink-0">
                            <BannerBadge
                              emoji={banner.emoji}
                              name={banner.name}
                              rarity={banner.rarity}
                              size={isMobile ? "sm" : "md"}
                            />
                          </div>

                          {/* Progress Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <span className="font-medium text-sm md:text-base">
                                {banner.hearts_required} corazones requeridos
                              </span>
                              <div className="flex items-center gap-2">
                                {banner.unlocked ? (
                                  <div className="flex items-center gap-1 text-success">
                                    <Unlock className="h-4 w-4" />
                                    <span className="text-xs md:text-sm font-medium">Desbloqueado</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Lock className="h-4 w-4" />
                                    <span className="text-xs md:text-sm">
                                      {banner.hearts_required - stats.userHearts} más necesarios
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {!banner.unlocked && (
                              <div className="space-y-1">
                                <Progress value={progress} className="h-2" />
                                <div className="text-xs text-muted-foreground text-right">
                                  {stats.userHearts}/{banner.hearts_required} ({progress.toFixed(1)}%)
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Tips */}
          <Card className="glass border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  💡 Tips para conseguir corazones
                </h3>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>• Participa activamente en el chat</p>
                  <p>• Sé amigable y positivo con otros usuarios</p>
                  <p>• Comparte contenido interesante</p>
                  <p>• Los corazones se guardan permanentemente en tu perfil</p>
                  <p>• Los mensajes se borran cada 30 minutos, pero los ❤️ quedan para siempre</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}