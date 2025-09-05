-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  hearts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create banner types enum
CREATE TYPE public.banner_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Create banners reference table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  description TEXT,
  hearts_required INTEGER NOT NULL,
  rarity banner_rarity NOT NULL DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default banners
INSERT INTO public.banners (name, emoji, description, hearts_required, rarity) VALUES
('Nuevo en H', '🌱', 'Bienvenido a la comunidad', 1, 'common'),
('Divertido', '😂', 'Haces reír a todos', 5, 'common'),
('Fuerte', '💪', 'Usuario activo y fuerte', 10, 'common'),
('Payaso', '🤡', 'El bromista de la comunidad', 15, 'common'),
('Popular', '🔥', 'Querido por todos', 25, 'rare'),
('Coquito', '🧠', 'Inteligente y sabio', 40, 'rare'),
('Siuuuuuu', '⚽', 'Fan del fútbol', 50, 'rare'),
('Misterioso', '👻', 'Enigmático y misterioso', 60, 'rare'),
('El GOAT', '🐐', 'El mejor de todos', 80, 'epic'),
('Lo más bello', '❤️', 'Belleza pura', 100, 'epic'),
('Modo Diablo', '😈', 'Poder supremo', 130, 'epic'),
('El Mago', '🪄', 'Mágico y especial', 150, 'epic'),
('La Leyenda', '👑', 'Leyenda viviente', 200, 'legendary'),
('Fundador del Todo', '🌌', 'Creador de mundos', 250, 'legendary'),
('Dragón Supremo', '🐉', 'Poder dracónico', 300, 'legendary'),
('Inalcanzable', '✨', 'Perfección absoluta', 500, 'legendary');

-- Create user_banners table (banners unlocked by users)
CREATE TABLE public.user_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, banner_id)
);

-- Enable RLS on user_banners
ALTER TABLE public.user_banners ENABLE ROW LEVEL SECURITY;

-- Create policies for user_banners
CREATE POLICY "Users can view their own banners" 
ON public.user_banners 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view others banners for display" 
ON public.user_banners 
FOR SELECT 
USING (true);

-- Create equipped_banners table (max 2 banners equipped per user)
CREATE TABLE public.equipped_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position IN (1, 2)),
  equipped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, position),
  UNIQUE(user_id, banner_id)
);

-- Enable RLS on equipped_banners
ALTER TABLE public.equipped_banners ENABLE ROW LEVEL SECURITY;

-- Create policies for equipped_banners
CREATE POLICY "Users can manage their own equipped banners" 
ON public.equipped_banners 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view equipped banners" 
ON public.equipped_banners 
FOR SELECT 
USING (true);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 minutes')
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Everyone can view messages" 
ON public.messages 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert messages" 
ON public.messages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create hearts table (to track who gave hearts to whom)
CREATE TABLE public.hearts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(giver_id, receiver_id, message_id)
);

-- Enable RLS on hearts
ALTER TABLE public.hearts ENABLE ROW LEVEL SECURITY;

-- Create policies for hearts
CREATE POLICY "Everyone can view hearts" 
ON public.hearts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can give hearts" 
ON public.hearts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = giver_id AND giver_id != receiver_id);

-- Create function to update hearts count and unlock banners
CREATE OR REPLACE FUNCTION public.update_hearts_and_banners()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_hearts_count INTEGER;
  banner_record RECORD;
BEGIN
  -- Update hearts count in profiles
  UPDATE public.profiles 
  SET hearts_count = (
    SELECT COUNT(*) 
    FROM public.hearts 
    WHERE receiver_id = NEW.receiver_id
  )
  WHERE user_id = NEW.receiver_id;
  
  -- Get updated hearts count
  SELECT hearts_count INTO new_hearts_count
  FROM public.profiles 
  WHERE user_id = NEW.receiver_id;
  
  -- Unlock new banners based on hearts count
  FOR banner_record IN 
    SELECT b.id, b.hearts_required
    FROM public.banners b
    WHERE b.hearts_required <= new_hearts_count
    AND NOT EXISTS (
      SELECT 1 FROM public.user_banners ub 
      WHERE ub.user_id = NEW.receiver_id AND ub.banner_id = b.id
    )
  LOOP
    INSERT INTO public.user_banners (user_id, banner_id)
    VALUES (NEW.receiver_id, banner_record.id);
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for hearts
CREATE TRIGGER update_hearts_and_banners_trigger
AFTER INSERT ON public.hearts
FOR EACH ROW
EXECUTE FUNCTION public.update_hearts_and_banners();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create function to clean old messages
CREATE OR REPLACE FUNCTION public.clean_old_messages()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.messages 
  WHERE expires_at < now();
$$;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.hearts REPLICA IDENTITY FULL;
ALTER TABLE public.user_banners REPLICA IDENTITY FULL;
ALTER TABLE public.equipped_banners REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hearts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_banners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipped_banners;