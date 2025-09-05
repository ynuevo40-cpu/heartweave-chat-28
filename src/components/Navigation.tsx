import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, User, Trophy, Award, Moon, Sun, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const MobileNavigation = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/profile', icon: User, label: 'Perfil' },
    { path: '/leaderboard', icon: Trophy, label: 'Rankings' },
    { path: '/banners', icon: Award, label: 'Banners' },
    { path: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 bg-background/95 backdrop-blur-md">
      <div className="flex justify-around items-center h-14 px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} to={path}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "relative p-2 rounded-xl transition-all duration-300 hover:scale-110 group",
                location.pathname === path 
                  ? "bg-gradient-primary text-white glow-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-card text-card-foreground px-1.5 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {label}
              </span>
            </Button>
          </Link>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-background-secondary group"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-blue-400" />
          )}
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-card text-card-foreground px-1.5 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            Tema
          </span>
        </Button>
      </div>
    </nav>
  );
};

const DesktopNavigation = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/profile', icon: User, label: 'Perfil' },
    { path: '/leaderboard', icon: Trophy, label: 'Rankings' },
    { path: '/banners', icon: Award, label: 'Banners' },
    { path: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="fixed top-0 bottom-auto left-0 right-auto w-20 h-screen border-r bg-background/95 backdrop-blur-md glass border-border/50">
      <div className="flex flex-col h-full py-8 gap-8 px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} to={path}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "relative p-3 rounded-2xl transition-all duration-300 hover:scale-110 group",
                location.pathname === path 
                  ? "bg-gradient-primary text-white glow-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background-secondary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="absolute left-16 top-1/2 -translate-y-1/2 translate-x-2 bg-card text-card-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {label}
              </span>
            </Button>
          </Link>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-3 rounded-2xl transition-all duration-300 hover:scale-110 hover:bg-background-secondary"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-blue-400" />
          )}
        </Button>
      </div>
    </nav>
  );
};

export const Navigation = () => {
  const isMobile = useIsMobile();
  
  // Solo mostrar navegación en escritorio
  return isMobile ? null : <DesktopNavigation />;
};