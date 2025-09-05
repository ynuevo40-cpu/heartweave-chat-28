import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/UserAvatar';
import { BannerBadge } from '@/components/BannerBadge';
import { AppLayout } from '@/components/layouts/AppLayout';
import { EditDescriptionDialog } from '@/components/EditDescriptionDialog';
import BackButton from '@/components/BackButton';
import { Heart, Settings, Trophy, ArrowLeft, MessageCircle, Award, Camera, Upload } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserBanners } from '@/hooks/useUserBanners';
import { useAuth } from '@/hooks/useAuth';
import { heartService } from '@/services/heartService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, error, isOwnProfile, refetch } = useUserProfile(userId);
  const { banners: allBanners } = useUserBanners();
  
  const [equippedBannerIds, setEquippedBannerIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDescriptionUpdate = (newDescription: string) => {
    refetch(); // Refresh profile data
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB');
      return;
    }

    setUploading(true);
    
    try {
      // Crear path con estructura de carpeta por usuario
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Subir imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Actualizar perfil con nueva URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Foto de perfil actualizada correctamente');
      refetch(); // Refresh profile data
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(`Error al subir la imagen: ${error.message || 'Error desconocido'}`);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (profile?.equipped_banners) {
      setEquippedBannerIds(profile.equipped_banners.map(eb => eb.banner.id));
    }
  }, [profile]);

  const getNextBanner = () => {
    if (!profile || !allBanners.length) return null;
    
    const userHeartsCount = profile.hearts_count;
    const unlockedBannerIds = new Set(profile.user_banners.map(ub => ub.banner_id));
    
    const nextBanner = allBanners.find(banner => 
      !unlockedBannerIds.has(banner.id) && 
      banner.hearts_required > userHeartsCount
    );
    
    return nextBanner;
  };

  const handleGiveHeart = async () => {
    if (!user?.id || !profile || isOwnProfile) return;

    try {
      const result = await heartService.giveHeart({
        giverId: user.id,
        receiverId: profile.user_id
      });

      if (result.success) {
        toast.success('¡Corazón enviado! ❤️');
        refetch(); // Refresh profile to show updated heart count
      } else {
        if (result.isDuplicate) {
          toast.error('Ya le diste un corazón a este usuario');
        } else {
          toast.error(result.error || 'Error al enviar corazón');
        }
      }
    } catch (error) {
      console.error('Error giving heart:', error);
      toast.error('Error al enviar corazón');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando perfil...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Perfil no encontrado'}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const nextBanner = getNextBanner();
  const progressToNext = nextBanner ? (profile.hearts_count / nextBanner.hearts_required) * 100 : 100;
  
  // Get all unlocked banners (both from user_banners and by hearts requirement)
  const unlockedBannerIds = new Set(profile.user_banners.map(ub => ub.banner_id));
  const unlockedBanners = allBanners.filter(banner => 
    unlockedBannerIds.has(banner.id) || banner.hearts_required <= profile.hearts_count
  );
  const lockedBanners = allBanners.filter(banner => 
    !unlockedBannerIds.has(banner.id) && banner.hearts_required > profile.hearts_count
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-2xl font-bold cyber-glow">
              {isOwnProfile ? 'Mi Perfil' : `Perfil de ${profile.username}`}
            </h1>
          </div>
          <div className="flex gap-2">
            {!isOwnProfile && (
              <Button 
                size="sm" 
                onClick={() => navigate('/chat')}
                className="bg-gradient-primary"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
            )}
            {isOwnProfile && (
              <EditDescriptionDialog 
                currentDescription={profile.description} 
                onDescriptionUpdate={handleDescriptionUpdate}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="glass border-border/50 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <UserAvatar 
                    name={profile.username} 
                    src={profile.avatar_url}
                    size="xl" 
                    showGlow={profile.hearts_count > 100}
                  />
                  {isOwnProfile && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary border border-border hover:bg-primary/80 transition-colors group"
                        title="Cambiar foto de perfil"
                      >
                        {uploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </>
                  )}
                  {!isOwnProfile && user && (
                    <button
                      onClick={handleGiveHeart}
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 p-2 rounded-full bg-background border border-border hover:bg-heart/10 transition-colors group"
                    >
                      <Heart className="w-4 h-4 text-muted-foreground group-hover:text-heart group-hover:fill-current transition-all" />
                    </button>
                  )}
                </div>
              </div>
              <CardTitle className="text-3xl cyber-glow">{profile.username}</CardTitle>
              
              {/* Description */}
              {profile.description && (
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
                  {profile.description}
                </p>
              )}
              
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-heart">
                  <Heart className="h-5 w-5 fill-current heart-pulse" />
                  <span className="text-xl font-bold">{profile.hearts_count}</span>
                </div>
                <div className="text-muted-foreground">
                  <Trophy className="h-4 w-4 inline mr-1" />
                  {profile.message_count} mensajes
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </CardHeader>
            
            <CardContent>
              {/* Equipped Banners */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Banners Equipados</h3>
                <div className="flex gap-2 justify-center min-h-[40px]">
                  {profile.equipped_banners
                    .sort((a, b) => a.position - b.position)
                    .map((equippedBanner) => (
                      <BannerBadge
                        key={equippedBanner.banner.id}
                        emoji={equippedBanner.banner.emoji}
                        name={equippedBanner.banner.name}
                        rarity={equippedBanner.banner.rarity as any}
                      />
                    ))}
                  {profile.equipped_banners.length === 0 && (
                    <p className="text-muted-foreground text-sm">No hay banners equipados</p>
                  )}
                </div>
              </div>

              {/* Progress to Next Banner */}
              {nextBanner && (
                <div className="space-y-3 mt-6 p-4 bg-background-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Próximo Banner</span>
                    <BannerBadge
                      emoji={nextBanner.emoji}
                      name={nextBanner.name}
                      rarity={nextBanner.rarity as any}
                      size="sm"
                    />
                  </div>
                  <Progress value={progressToNext} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {profile.hearts_count}/{nextBanner.hearts_required} corazones
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Banner Settings Button - Solo para el propio perfil */}
          {isOwnProfile && (
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Configuración de Banners</h3>
                    <p className="text-sm text-muted-foreground">
                      Personaliza qué banners mostrar junto a tu nombre
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/banner-settings', { state: { from: '/profile' } })}
                    variant="outline"
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Banners Collection Section */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Colección de Banners
                <span className="text-sm font-normal text-muted-foreground">
                  ({unlockedBanners.length} desbloqueados)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unlockedBanners.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No hay banners desbloqueados</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ¡Consigue más corazones para desbloquear banners!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Equipped Banners */}
                  {unlockedBanners.some(banner => equippedBannerIds.includes(banner.id)) && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Equipados</h4>
                      <div className="flex gap-2 flex-wrap">
                        {unlockedBanners
                          .filter(banner => equippedBannerIds.includes(banner.id))
                          .map(banner => (
                            <BannerBadge
                              key={banner.id}
                              emoji={banner.emoji}
                              name={banner.name}
                              rarity={banner.rarity as any}
                              size="sm"
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* All Unlocked Banners */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Todos los Banners Desbloqueados
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {unlockedBanners.map(banner => (
                        <div key={banner.id} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-background-secondary/50 transition-colors">
                          <BannerBadge
                            emoji={banner.emoji}
                            name=""
                            rarity={banner.rarity as any}
                            size="sm"
                          />
                          <span className="text-xs text-center text-muted-foreground">
                            {banner.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}