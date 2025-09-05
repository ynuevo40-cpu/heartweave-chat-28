import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cb82e7a68a2245039673a67ae0332578',
  appName: 'heartweave-chat',
  webDir: 'dist',
  server: {
    url: 'https://cb82e7a6-8a22-4503-9673-a67ae0332578.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;