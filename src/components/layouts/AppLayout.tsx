import React from 'react';
import { Navigation } from '@/components/Navigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
  showMobileHeader?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showMobileHeader = false }) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <main className={`${isMobile ? (showMobileHeader ? 'pt-14 pb-4' : 'pb-4') : 'pb-4 md:pl-20'}`}>
        {children}
      </main>
    </div>
  );
};