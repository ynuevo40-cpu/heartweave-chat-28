import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface EditDescriptionDialogProps {
  currentDescription?: string;
  onDescriptionUpdate: (newDescription: string) => void;
}

export const EditDescriptionDialog = ({ currentDescription, onDescriptionUpdate }: EditDescriptionDialogProps) => {
  const { user } = useAuth();
  const [description, setDescription] = useState(currentDescription || '');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ description: description.trim() || null })
        .eq('user_id', user.id);

      if (error) throw error;

      onDescriptionUpdate(description.trim());
      toast.success('Descripción actualizada');
      setOpen(false);
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error('Error al actualizar descripción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-border/50">
          <Settings className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Descripción</DialogTitle>
          <DialogDescription>
            Añade una descripción personal a tu perfil (máximo 200 caracteres)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Escribe algo sobre ti..."
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            className="min-h-[100px] resize-none"
            maxLength={200}
          />
          <div className="text-xs text-muted-foreground text-right">
            {description.length}/200 caracteres
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDescription(currentDescription || '');
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};