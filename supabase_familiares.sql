-- ─────────────────────────────────────────────────────────────────────────────
-- KINACT · Accesos de familiares + columna residente_id en profiles
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Añadir residente_id al perfil (nil-safe, idempotente)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS residente_id text;

-- 2. Tabla de accesos familiares
CREATE TABLE IF NOT EXISTS public.kinact_familiares (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text        NOT NULL,
  nombre       text        NOT NULL,
  residente_id text        NOT NULL,
  activo       boolean     DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.kinact_familiares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kinact_familiares_all"
  ON public.kinact_familiares
  FOR ALL
  USING (true)
  WITH CHECK (true);
