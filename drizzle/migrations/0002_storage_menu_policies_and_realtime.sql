-- Admins manage files in the private "menu" bucket
CREATE POLICY "menu bucket admin read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'menu' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "menu bucket admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "menu bucket admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'menu' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'menu' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "menu bucket admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'menu' AND public.has_role(auth.uid(), 'admin'));

-- Realtime for admin dashboards
ALTER TABLE public.offers REPLICA IDENTITY FULL;
ALTER TABLE public.bulk_orders REPLICA IDENTITY FULL;
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.offers; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.bulk_orders; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_locations; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Delivery partner accept / reject bookkeeping
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS picked_up_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rejected_by uuid[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS orders_status_created_idx ON public.orders (status, created_at DESC);
