-- ══════════════════════════════════════════════════════════════
-- KINACT · Fase 2: Multi-tenant
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ══════════════════════════════════════════════════════════════

-- ── 1. Tabla de organizaciones ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizaciones (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      text NOT NULL,
  plan        text NOT NULL DEFAULT 'trial',
  activa      boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.organizaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_all" ON public.organizaciones FOR ALL USING (true) WITH CHECK (true);

-- ── 2. Añadir org_id a profiles ───────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizaciones(id),
  ADD COLUMN IF NOT EXISTS nombre  text;

-- ── 3. Añadir org_id a las tablas de datos ────────────────────
ALTER TABLE public.kinact_sesiones  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizaciones(id);
ALTER TABLE public.kinact_escalas   ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizaciones(id);
ALTER TABLE public.kinact_familiares ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizaciones(id);

-- ── 4. Tabla de residentes (reemplaza MOCK_RESIDENTS) ─────────
CREATE TABLE IF NOT EXISTS public.residentes (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id          uuid NOT NULL REFERENCES public.organizaciones(id),
  nombre          text NOT NULL,
  iniciales       text,
  tablero_habitual text NOT NULL DEFAULT 'casa',
  incorporacion   date DEFAULT now(),
  activo          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.residentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "residentes_by_org" ON public.residentes
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

-- ── 5. RLS: cada tabla filtra por org_id del usuario ──────────
-- kinact_sesiones
DROP POLICY IF EXISTS "kinact_sesiones_all" ON public.kinact_sesiones;
CREATE POLICY "sesiones_by_org" ON public.kinact_sesiones
  FOR ALL USING (
    org_id IS NULL OR
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

-- kinact_escalas
DROP POLICY IF EXISTS "kinact_escalas_all" ON public.kinact_escalas;
CREATE POLICY "escalas_by_org" ON public.kinact_escalas
  FOR ALL USING (
    org_id IS NULL OR
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

-- kinact_familiares
DROP POLICY IF EXISTS "kinact_familiares_all" ON public.kinact_familiares;
CREATE POLICY "familiares_by_org" ON public.kinact_familiares
  FOR ALL USING (
    org_id IS NULL OR
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

-- ── 6. Organización de demostración ──────────────────────────
-- Inserta la org demo y actualiza los perfiles existentes
INSERT INTO public.organizaciones (id, nombre, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Residencia Santa Clara', 'demo')
ON CONFLICT (id) DO NOTHING;

-- Asignar todos los perfiles existentes a la org demo
UPDATE public.profiles
SET org_id = '00000000-0000-0000-0000-000000000001'
WHERE org_id IS NULL;

-- Asignar datos existentes a la org demo
UPDATE public.kinact_sesiones  SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.kinact_escalas   SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.kinact_familiares SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
