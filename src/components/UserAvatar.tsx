import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

export const UserAvatar = ({ 
  src, 
  name, 
  size = 'md', 
  showGlow = false,
  className 
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl'
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        showGlow && 'glow-primary',
        'ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300',
        className
      )}
    >
      <AvatarImage src={src} alt={name} className="object-cover" />
      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};