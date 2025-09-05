-- Enable RLS on banners table (was missing)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create policy for banners (public reference data)
CREATE POLICY "Banners are viewable by everyone" 
ON public.banners 
FOR SELECT 
USING (true);