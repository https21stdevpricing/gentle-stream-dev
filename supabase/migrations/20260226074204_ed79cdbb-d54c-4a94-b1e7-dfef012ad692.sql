
-- Some policies already exist, just add the missing ones
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can upload to uploads' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can upload to uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update uploads' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can update uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete uploads' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can delete uploads" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');
  END IF;
END $$;
