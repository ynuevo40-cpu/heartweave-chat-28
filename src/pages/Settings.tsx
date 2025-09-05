import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components/layouts/AppLayout';
import BackButton from '@/components/BackButton';
import { Settings as SettingsIcon, Bell, Volume2, Shield } from 'lucide-react';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { toast } from 'sonner';

export default function Settings() {
  const { 
    settings, 
    updateSettings, 
    requestNotificationPermission, 
    showNotification,
    playMessageSound 
  } = useNotificationSettings();
  
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && settings.notificationPermission !== 'granted') {
      setIsRequestingPermission(true);
      try {
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
          updateSettings({ enableNotifications: true });
          toast.success('Notificaciones activadas correctamente');
        } else {
          toast.error('Permiso de notificaciones denegado');
        }
      } catch (error) {
        toast.error('Error al solicitar permisos de notificación');
      } finally {
        setIsRequestingPermission(false);
      }
    } else {
      updateSettings({ enableNotifications: enabled });
      if (enabled) {
        toast.success('Notificaciones activadas');
      } else {
        toast.success('Notificaciones desactivadas');
      }
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ enableMessageSounds: enabled });
    if (enabled) {
      playMessageSound(); // Play test sound
      toast.success('Sonidos de mensajes activados');
    } else {
      toast.success('Sonidos de mensajes desactivados');
    }
  };

  const testNotification = () => {
    showNotification('¡Notificación de prueba!', {
      body: 'Esta es una notificación de ejemplo para probar el sistema.',
      tag: 'test-notification'
    });
  };

  const testSound = () => {
    playMessageSound();
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            <h1 className="text-2xl font-bold cyber-glow">Configuración</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Activar notificaciones
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Recibe notificaciones cuando lleguen nuevos mensajes
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={handleNotificationToggle}
                  disabled={isRequestingPermission}
                />
              </div>

              {/* Notification Permission Status */}
              <div className="p-3 rounded-lg bg-background-secondary/50">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Estado del permiso:</span>
                  <span className={`font-medium ${
                    settings.notificationPermission === 'granted' 
                      ? 'text-success' 
                      : settings.notificationPermission === 'denied' 
                      ? 'text-destructive' 
                      : 'text-warning'
                  }`}>
                    {settings.notificationPermission === 'granted' && 'Concedido'}
                    {settings.notificationPermission === 'denied' && 'Denegado'}
                    {settings.notificationPermission === 'default' && 'No solicitado'}
                  </span>
                </div>
                {settings.notificationPermission === 'denied' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Para habilitar las notificaciones, debes permitirlo en la configuración de tu navegador
                  </p>
                )}
              </div>

              {/* Test Notification Button */}
              {settings.enableNotifications && settings.notificationPermission === 'granted' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testNotification}
                  className="w-full"
                >
                  Probar notificación
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Sound Settings */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Sonidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Message Sounds */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="message-sounds" className="text-sm font-medium">
                    Sonido de mensajes
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Reproduce un sonido cuando lleguen nuevos mensajes
                  </p>
                </div>
                <Switch
                  id="message-sounds"
                  checked={settings.enableMessageSounds}
                  onCheckedChange={handleSoundToggle}
                />
              </div>

              {/* Test Sound Button */}
              {settings.enableMessageSounds && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testSound}
                  className="w-full"
                >
                  Probar sonido
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  💡 Las configuraciones se guardan automáticamente en tu navegador
                </p>
                <p className="text-xs text-muted-foreground">
                  Si cambias de navegador o borras los datos, tendrás que configurar las notificaciones de nuevo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}