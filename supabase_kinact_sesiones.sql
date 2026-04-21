-- ─────────────────────────────────────────────────────────────────────────────
-- KINACT · Tabla de sesiones de juego
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kinact_sesiones (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  residente_id     text        NOT NULL,          -- ID del residente (r1, r2…)
  fecha            date        NOT NULL,
  sesion_num       integer     NOT NULL DEFAULT 1,
  tablero          text,                           -- 'casa' | 'barco' | 'flor' | 'cafe'
  gaps_completados integer     DEFAULT 0,
  intercambios     integer     DEFAULT 0,
  mediaciones      integer     DEFAULT 0,
  estado           text,                           -- 'bajo' | 'neutro' | 'positivo'
  engagement       text,                           -- 'bajo' | 'medio' | 'alto'
  autonomia        text,                           -- 'dependiente' | 'parcial' | 'autonomo'
  agitacion        boolean     DEFAULT false,
  fatiga           boolean     DEFAULT false,
  observaciones    text,
  created_at       timestamptz DEFAULT now()
);

-- Row Level Security: acceso libre (ajustar en producción)
ALTER TABLE public.kinact_sesiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kinact_sesiones_all"
  ON public.kinact_sesiones
  FOR ALL
  USING (true)
  WITH CHECK (true);
