-- ══════════════════════════════════════════════════════════════
-- KINACT · Fase 2: Multi-tenant (idempotente, re-ejecutable)
-- ══════════════════════════════════════════════════════════════

-- ── 1. Tabla organizaciones ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizaciones (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre     text NOT NULL,
  plan       text NOT NULL DEFAULT 'trial',
  activa     boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.organizaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_all" ON public.organizaciones;
CREATE POLICY "org_all" ON public.organizaciones FOR ALL USING (true) WITH CHECK (true);

-- ── 2. Tablas de datos (crear si no existen) ──────────────────
CREATE TABLE IF NOT EXISTS public.kinact_sesiones (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  residente_id     text NOT NULL,
  fecha            date NOT NULL,
  sesion_num       integer DEFAULT 1,
  tablero          text,
  gaps_completados integer DEFAULT 0,
  intercambios     integer DEFAULT 0,
  mediaciones      integer DEFAULT 0,
  estado           text,
  engagement       text,
  autonomia        text,
  agitacion        boolean DEFAULT false,
  fatiga           boolean DEFAULT false,
  observaciones    text,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.kinact_sesiones ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.kinact_escalas (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  residente_id text NOT NULL,
  fecha        date NOT NULL,
  mec          integer,
  gds          integer,
  barthel      integer,
  tug          numeric(5,1),
  mec_cond     boolean DEFAULT false,
  gds_cond     boolean DEFAULT false,
  barthel_cond boolean DEFAULT false,
  tug_cond     boolean DEFAULT false,
  observaciones text,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (residente_id, fecha)
);
ALTER TABLE public.kinact_escalas ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.kinact_familiares (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text NOT NULL,
  nombre       text NOT NULL,
  residente_id text NOT NULL,
  activo       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE public.kinact_familiares ENABLE ROW LEVEL SECURITY;

-- ── 3. Añadir columnas nuevas (si ya existen, se ignoran) ─────
ALTER TABLE public.profiles         ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizaciones(id);
ALTER TABLE public.profiles         ADD COLUMN IF NOT EXISTS nombre text;
ALTER TABLE public.kinact_sesiones  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizaciones(id);
ALTER TABLE public.kinact_escalas   ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizaciones(id);
ALTER TABLE public.kinact_familiares ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizaciones(id);

-- ── 4. Tabla residentes ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.residentes (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id           uuid NOT NULL REFERENCES public.organizaciones(id),
  nombre           text NOT NULL,
  iniciales        text,
  tablero_habitual text NOT NULL DEFAULT 'casa',
  incorporacion    date DEFAULT now(),
  activo           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.residentes ENABLE ROW LEVEL SECURITY;

-- ── 5. Políticas RLS (drop + recrear para idempotencia) ───────
-- profiles: solo el propio usuario
DROP POLICY IF EXISTS "residentes_by_org"   ON public.residentes;
DROP POLICY IF EXISTS "sesiones_by_org"     ON public.kinact_sesiones;
DROP POLICY IF EXISTS "escalas_by_org"      ON public.kinact_escalas;
DROP POLICY IF EXISTS "familiares_by_org"   ON public.kinact_familiares;
DROP POLICY IF EXISTS "kinact_sesiones_all" ON public.kinact_sesiones;
DROP POLICY IF EXISTS "kinact_escalas_all"  ON public.kinact_escalas;
DROP POLICY IF EXISTS "kinact_familiares_all" ON public.kinact_familiares;

CREATE POLICY "residentes_by_org" ON public.residentes
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "sesiones_by_org" ON public.kinact_sesiones
  FOR ALL USING (
    org_id IS NULL OR
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "escalas_by_org" ON public.kinact_escalas
  FOR ALL USING (
    org_id IS NULL OR
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "familiares_by_org" ON public.kinact_familiares
  FOR ALL USING (
    org_id IS NULL OR
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

-- ── 6. Org demo + asignar datos existentes ────────────────────
INSERT INTO public.organizaciones (id, nombre, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Residencia Santa Clara', 'demo')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles          SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.kinact_sesiones   SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.kinact_escalas    SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE public.kinact_familiares SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
