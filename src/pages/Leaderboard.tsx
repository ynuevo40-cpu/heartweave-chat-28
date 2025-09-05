import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/UserAvatar';
import { BannerBadge } from '@/components/BannerBadge';
import { Navigation } from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { Crown, Heart, Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Leaderboard() {
  const { rankings, stats, loading, error } = useRankings();
  const isMobile = useIsMobile();
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-banner-legendary" />;
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Award className="h-6 w-6 text-banner-common" />;
      default:
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Navigation />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando rankings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Navigation />
        <div className="text-center text-muted-foreground">
          <p>Error al cargar los rankings</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const getRankStyle = (rank: number) => {
    if (rank <= 3) {
      return "glow-primary bg-gradient-to-r from-primary/10 to-accent/10";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <main className={`${isMobile ? 'pb-4' : 'pb-20 md:pl-20'}`}>
        {/* Header */}
        <div className="sticky top-0 z-40 glass border-b border-border/50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <BackButton />
              <h1 className="text-2xl font-bold cyber-glow">Rankings Globales</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Los usuarios más populares de H Chat
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          {/* Top 3 Podium */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {rankings.slice(0, 3).map((user, index) => (
              <Card 
                key={user.id} 
                className={`glass border-border/50 ${getRankStyle(user.rank)} ${
                  index === 0 ? 'md:order-2 scale-105' : index === 1 ? 'md:order-1' : 'md:order-3'
                }`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="flex justify-center mb-4">
                    <UserAvatar 
                      name={user.username}
                      src={user.avatar_url}
                      size={user.rank === 1 ? "xl" : "lg"}
                      showGlow={user.rank <= 3}
                    />
                  </div>
                  <CardTitle className={`${user.rank === 1 ? 'text-xl cyber-glow' : 'text-lg'} text-center`}>
                    {user.username}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Heart className="h-5 w-5 fill-current text-heart heart-pulse" />
                    <span className="text-xl font-bold">{user.hearts_count}</span>
                  </div>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {user.equipped_banners?.map((equippedBanner) => (
                      <BannerBadge
                        key={equippedBanner.banner_id}
                        emoji={equippedBanner.banner?.emoji || '🏆'}
                        name={equippedBanner.banner?.name || 'Banner'}
                        rarity={equippedBanner.banner?.rarity as any || 'common'}
                        size="sm"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leaderboard List */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tabla de Posiciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {rankings.map((user) => (
                  <div 
                    key={user.id}
                    className={`flex items-center gap-4 p-4 hover:bg-background-secondary/50 transition-colors ${
                      getRankStyle(user.rank)
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8">
                      {user.rank <= 3 ? (
                        getRankIcon(user.rank)
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          {user.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <UserAvatar 
                      name={user.username}
                      src={user.avatar_url}
                      size="md"
                      showGlow={user.rank <= 3}
                    />

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold truncate ${
                          user.rank === 1 ? 'cyber-glow' : ''
                        }`}>
                          {user.username}
                        </h3>
                        <div className="flex items-center gap-1 text-heart">
                          <Heart className="h-4 w-4 fill-current" />
                          <span className="font-bold">{user.hearts_count}</span>
                        </div>
                      </div>
                      
                      {/* Banners */}
                      <div className="flex gap-1 flex-wrap">
                        {user.equipped_banners?.map((equippedBanner) => (
                          <BannerBadge
                            key={equippedBanner.banner_id}
                            emoji={equippedBanner.banner?.emoji || '🏆'}
                            name={equippedBanner.banner?.name || 'Banner'}
                            rarity={equippedBanner.banner?.rarity as any || 'common'}
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Position Badge */}
                    <div className={`text-sm px-2 py-1 rounded-full ${
                      user.rank <= 3 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      #{user.rank}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="glass border-border/50 text-center">
              <CardContent className="pt-6">
                <Heart className="h-8 w-8 mx-auto mb-2 text-heart" />
                <p className="text-2xl font-bold">
                  {stats.totalHearts}
                </p>
                <p className="text-sm text-muted-foreground">Total Corazones</p>
              </CardContent>
            </Card>
            
            <Card className="glass border-border/50 text-center">
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Usuarios Activos</p>
              </CardContent>
            </Card>
            
            <Card className="glass border-border/50 text-center">
              <CardContent className="pt-6">
                <Award className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{stats.totalBanners}</p>
                <p className="text-sm text-muted-foreground">Banners Disponibles</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}