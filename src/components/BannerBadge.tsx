import { cn } from '@/lib/utils';

export type BannerRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface BannerBadgeProps {
  emoji: string;
  name: string;
  rarity: BannerRarity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BannerBadge = ({ 
  emoji, 
  name, 
  rarity, 
  size = 'md',
  className 
}: BannerBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2'
  };

  const rarityClasses = {
    common: 'banner-common bg-banner-common/10 border-banner-common/30',
    rare: 'banner-rare bg-banner-rare/10 border-banner-rare/30',
    epic: 'banner-epic bg-banner-epic/10 border-banner-epic/30',
    legendary: 'banner-legendary bg-banner-legendary/10 border-banner-legendary/30 animate-pulse glow-primary'
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium backdrop-blur-sm',
      'transition-all duration-300 hover:scale-105 hover:shadow-lg',
      rarity === 'legendary' && 'animate-pulse glow-primary hover:animate-bounce',
      sizeClasses[size],
      rarityClasses[rarity],
      className
    )}>
      <span className="text-base">{emoji}</span>
      {name && <span className="truncate">{name}</span>}
    </span>
  );
};

export const banners = [
  // Comunes
  { id: 1, emoji: '🌱', name: 'Nuevo en H', rarity: 'common' as BannerRarity, hearts: 1 },
  { id: 2, emoji: '😂', name: 'Divertido', rarity: 'common' as BannerRarity, hearts: 5 },
  { id: 3, emoji: '💪', name: 'Fuerte', rarity: 'common' as BannerRarity, hearts: 10 },
  { id: 4, emoji: '🤡', name: 'Payaso', rarity: 'common' as BannerRarity, hearts: 15 },
  
  // Raros
  { id: 5, emoji: '🔥', name: 'Popular', rarity: 'rare' as BannerRarity, hearts: 25 },
  { id: 6, emoji: '🧠', name: 'Coquito', rarity: 'rare' as BannerRarity, hearts: 40 },
  { id: 7, emoji: '⚽', name: 'Siuuuuuu', rarity: 'rare' as BannerRarity, hearts: 50 },
  { id: 8, emoji: '👻', name: 'Misterioso', rarity: 'rare' as BannerRarity, hearts: 60 },
  
  // Épicos
  { id: 9, emoji: '🐐', name: 'El GOAT', rarity: 'epic' as BannerRarity, hearts: 80 },
  { id: 10, emoji: '❤️', name: 'Lo más bello', rarity: 'epic' as BannerRarity, hearts: 100 },
  { id: 11, emoji: '😈', name: 'Modo Diablo', rarity: 'epic' as BannerRarity, hearts: 130 },
  { id: 12, emoji: '🪄', name: 'El Mago', rarity: 'epic' as BannerRarity, hearts: 150 },
  
  // Legendarios
  { id: 13, emoji: '👑', name: 'La Leyenda', rarity: 'legendary' as BannerRarity, hearts: 200 },
  { id: 14, emoji: '🌌', name: 'Fundador del Todo', rarity: 'legendary' as BannerRarity, hearts: 250 },
  { id: 15, emoji: '🐉', name: 'Dragón Supremo', rarity: 'legendary' as BannerRarity, hearts: 300 },
  { id: 16, emoji: '✨', name: 'Inalcanzable', rarity: 'legendary' as BannerRarity, hearts: 500 },
];