import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface NotificationSettings {
  enableNotifications: boolean;
  enableMessageSounds: boolean;
  notificationPermission: NotificationPermission;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  playMessageSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'notification-settings';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enableNotifications: false,
    enableMessageSounds: false,
    notificationPermission: 'default'
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          notificationPermission: Notification.permission
        }));
      } catch (error) {
        console.error('Error parsing notification settings:', error);
      }
    } else {
      setSettings(prev => ({
        ...prev,
        notificationPermission: Notification.permission
      }));
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    const { notificationPermission, ...settingsToSave } = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
  }, [settings]);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setSettings(prev => ({ ...prev, notificationPermission: permission }));
    return permission;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!settings.enableNotifications || settings.notificationPermission !== 'granted') {
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const playMessageSound = () => {
    if (!settings.enableMessageSounds) return;

    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      settings,
      updateSettings,
      requestNotificationPermission,
      showNotification,
      playMessageSound
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationSettings = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationSettings must be used within a NotificationProvider');
  }
  return context;
};