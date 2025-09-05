-- Políticas RLS correctas para el bucket de avatares

-- 1. Política para permitir a los usuarios autenticados subir sus propios avatares
CREATE POLICY "usuarios_pueden_subir_avatares" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Política para permitir a los usuarios autenticados actualizar sus propios avatares
CREATE POLICY "usuarios_pueden_actualizar_avatares" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Política para permitir acceso público de lectura a los avatares
CREATE POLICY "acceso_publico_avatares" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 4. Política para permitir a los usuarios eliminar sus propios avatares
CREATE POLICY "usuarios_pueden_eliminar_avatares" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);