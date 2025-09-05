import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export default function BackButton({ to, className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`glass border border-border/50 hover:bg-background-secondary/70 transition-all ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Atrás
    </Button>
  );
}