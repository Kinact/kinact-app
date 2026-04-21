-- ─────────────────────────────────────────────────────────────────────────────
-- KINACT · Tabla de escalas clínicas
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kinact_escalas (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  residente_id     text        NOT NULL,
  fecha            date        NOT NULL,
  mec              integer,
  gds              integer,
  barthel          integer,
  tug              numeric(5,1),
  mec_cond         boolean     DEFAULT false,
  gds_cond         boolean     DEFAULT false,
  barthel_cond     boolean     DEFAULT false,
  tug_cond         boolean     DEFAULT false,
  observaciones    text,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (residente_id, fecha)
);

ALTER TABLE public.kinact_escalas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kinact_escalas_all"
  ON public.kinact_escalas
  FOR ALL
  USING (true)
  WITH CHECK (true);
