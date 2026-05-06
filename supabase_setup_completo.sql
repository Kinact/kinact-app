-- ══════════════════════════════════════════════════════════════════════════════
-- KINACT · Setup completo desde cero (idempotente, re-ejecutable)
-- Ejecutar en: Supabase → SQL Editor → New Query
-- Orden: ejecutar este único archivo. Cubre TODO.
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 1. TABLA: profiles ────────────────────────────────────────────────────────
-- Supabase crea auth.users automáticamente. Nosotros creamos public.profiles
-- vinculada, con el rol y org del usuario.

CREATE TABLE IF NOT EXISTS public.profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol              text NOT NULL DEFAULT 'facilitador',
  nombre           text,
  org_id           uuid,
  residente_id     text,
  onboarding_done  boolean NOT NULL DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Trigger: crear perfil vacío al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. TABLA: organizaciones ──────────────────────────────────────────────────

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

-- Añadir FK de profiles → organizaciones (si aún no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_org_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_org_id_fkey
      FOREIGN KEY (org_id) REFERENCES public.organizaciones(id);
  END IF;
END $$;


-- ── 3. TABLA: residentes ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.residentes (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id           uuid NOT NULL REFERENCES public.organizaciones(id),
  ref_id           text,
  nombre           text NOT NULL,
  iniciales        text,
  tablero_habitual text NOT NULL DEFAULT 'casa',
  incorporacion    date DEFAULT now(),
  activo           boolean DEFAULT true,
  sesiones         integer DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE public.residentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "residentes_by_org" ON public.residentes;
CREATE POLICY "residentes_by_org" ON public.residentes
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );


-- ── 4. TABLA: kinact_sesiones ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kinact_sesiones (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id           uuid REFERENCES public.organizaciones(id),
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

DROP POLICY IF EXISTS "sesiones_by_org" ON public.kinact_sesiones;
CREATE POLICY "sesiones_by_org" ON public.kinact_sesiones
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );


-- ── 5. TABLA: kinact_escalas ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kinact_escalas (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id       uuid REFERENCES public.organizaciones(id),
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

DROP POLICY IF EXISTS "escalas_by_org" ON public.kinact_escalas;
CREATE POLICY "escalas_by_org" ON public.kinact_escalas
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );


-- ── 6. TABLA: kinact_familiares ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kinact_familiares (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id       uuid REFERENCES public.organizaciones(id),
  email        text NOT NULL,
  nombre       text NOT NULL,
  residente_id text NOT NULL,
  activo       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.kinact_familiares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "familiares_by_org" ON public.kinact_familiares;
CREATE POLICY "familiares_by_org" ON public.kinact_familiares
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );


-- ── 7. TABLA: kinact_facilitadores ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.kinact_facilitadores (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id       uuid REFERENCES public.organizaciones(id),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre       text NOT NULL,
  email        text NOT NULL,
  activo       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.kinact_facilitadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "facilitadores_by_org" ON public.kinact_facilitadores;
CREATE POLICY "facilitadores_by_org" ON public.kinact_facilitadores
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );


-- ── 8. FUNCIÓN: create_facilitador_profile ────────────────────────────────────
-- Permite al director crear el perfil de un facilitador sin perder su sesión.
-- Se ejecuta con SECURITY DEFINER para saltarse RLS en profiles.

CREATE OR REPLACE FUNCTION public.create_facilitador_profile(
  p_user_id uuid,
  p_nombre  text,
  p_org_id  uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, rol, nombre, org_id, onboarding_done)
  VALUES (p_user_id, 'facilitador', p_nombre, p_org_id, true)
  ON CONFLICT (id) DO UPDATE
    SET rol = 'facilitador', nombre = p_nombre, org_id = p_org_id;
END;
$$;


-- ── 9. ORG DEMO + RESIDENTES DEMO ─────────────────────────────────────────────
-- Organización demo para datos históricos del seed

INSERT INTO public.organizaciones (id, nombre, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Residencia Santa Clara', 'demo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.residentes
  (org_id, ref_id, nombre, iniciales, tablero_habitual, incorporacion, activo, sesiones)
VALUES
  ('00000000-0000-0000-0000-000000000001','r1','Rosa Ferrer',    'RF','casa', '2026-02-03',true,10),
  ('00000000-0000-0000-0000-000000000001','r2','Paco Romero',    'PR','barco','2026-02-03',true,10),
  ('00000000-0000-0000-0000-000000000001','r3','Dolores Méndez', 'DM','flor', '2026-02-03',true,10),
  ('00000000-0000-0000-0000-000000000001','r4','Tomás Herrera',  'TH','cafe', '2026-02-03',true,10),
  ('00000000-0000-0000-0000-000000000001','r5','Concha Morales', 'CM','casa', '2026-02-03',true,10),
  ('00000000-0000-0000-0000-000000000001','r6','Emilio Sáenz',   'ES','barco','2026-02-03',true,10),
  ('00000000-0000-0000-0000-000000000001','r7','Pilar Castillo', 'PC','flor', '2026-02-03',true,10),
  ('00000000-0000-0000-0000-000000000001','r8','Bernardo Gil',   'BG','cafe', '2026-02-03',true,10)
ON CONFLICT DO NOTHING;


-- ── 10. SEED: sesiones históricas ─────────────────────────────────────────────

INSERT INTO public.kinact_sesiones
  (org_id, residente_id, fecha, sesion_num, tablero, gaps_completados, intercambios, mediaciones, estado, engagement, autonomia, agitacion, fatiga, observaciones)
VALUES
('00000000-0000-0000-0000-000000000001','r1','2026-02-03', 1,'casa',5,1,6,'bajo',    'bajo', 'dependiente',true, false,''),
('00000000-0000-0000-0000-000000000001','r1','2026-02-10', 2,'casa',5,2,5,'neutro',  'bajo', 'dependiente',false,false,''),
('00000000-0000-0000-0000-000000000001','r1','2026-02-17', 3,'casa',6,2,5,'neutro',  'medio','dependiente',false,true, ''),
('00000000-0000-0000-0000-000000000001','r1','2026-02-24', 4,'casa',6,3,4,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r1','2026-03-03', 5,'casa',6,3,4,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r1','2026-03-10', 6,'casa',7,3,3,'positivo','medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r1','2026-03-17', 7,'casa',7,4,3,'positivo','alto', 'parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r1','2026-03-24', 8,'casa',8,4,2,'positivo','alto', 'autonomo',   false,false,''),
('00000000-0000-0000-0000-000000000001','r1','2026-03-31', 9,'casa',8,5,2,'positivo','alto', 'autonomo',   false,false,''),
('00000000-0000-0000-0000-000000000001','r1','2026-04-07',10,'casa',9,5,1,'positivo','alto', 'autonomo',   false,false,''),

('00000000-0000-0000-0000-000000000001','r2','2026-02-03', 1,'barco',5,2,5,'neutro','medio','parcial',false,true, ''),
('00000000-0000-0000-0000-000000000001','r2','2026-02-10', 2,'barco',5,2,5,'neutro','medio','parcial',false,true, ''),
('00000000-0000-0000-0000-000000000001','r2','2026-02-17', 3,'barco',6,2,4,'neutro','medio','parcial',false,false,''),
('00000000-0000-0000-0000-000000000001','r2','2026-02-24', 4,'barco',5,3,4,'neutro','medio','parcial',false,true, ''),
('00000000-0000-0000-0000-000000000001','r2','2026-03-03', 5,'barco',6,3,4,'neutro','medio','parcial',false,false,''),
('00000000-0000-0000-0000-000000000001','r2','2026-03-10', 6,'barco',6,3,3,'neutro','medio','parcial',false,false,''),
('00000000-0000-0000-0000-000000000001','r2','2026-03-17', 7,'barco',7,3,3,'neutro','medio','parcial',false,false,''),
('00000000-0000-0000-0000-000000000001','r2','2026-03-24', 8,'barco',6,4,3,'neutro','medio','parcial',false,true, ''),
('00000000-0000-0000-0000-000000000001','r2','2026-03-31', 9,'barco',7,4,3,'neutro','alto', 'parcial',false,false,''),
('00000000-0000-0000-0000-000000000001','r2','2026-04-07',10,'barco',7,4,2,'neutro','alto', 'parcial',false,false,''),

('00000000-0000-0000-0000-000000000001','r3','2026-02-03', 1,'flor',7,3,3,'positivo','alto','parcial', false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-02-10', 2,'flor',7,4,3,'positivo','alto','parcial', false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-02-17', 3,'flor',7,4,2,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-02-24', 4,'flor',8,4,2,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-03-03', 5,'flor',8,5,2,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-03-10', 6,'flor',8,5,2,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-03-17', 7,'flor',9,5,1,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-03-24', 8,'flor',9,6,1,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-03-31', 9,'flor',9,6,1,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r3','2026-04-07',10,'flor',9,6,1,'positivo','alto','autonomo',false,false,''),

('00000000-0000-0000-0000-000000000001','r4','2026-02-03', 1,'cafe',3,1,7,'bajo',    'bajo', 'dependiente',true, false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-02-10', 2,'cafe',4,1,6,'bajo',    'bajo', 'dependiente',true, false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-02-17', 3,'cafe',4,2,6,'neutro',  'medio','dependiente',true, false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-02-24', 4,'cafe',5,2,5,'neutro',  'medio','dependiente',false,false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-03-03', 5,'cafe',5,2,5,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-03-10', 6,'cafe',5,3,4,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-03-17', 7,'cafe',6,3,4,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-03-24', 8,'cafe',6,3,3,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-03-31', 9,'cafe',6,3,3,'neutro',  'alto', 'parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r4','2026-04-07',10,'cafe',7,4,2,'positivo','alto', 'parcial',    false,false,''),

('00000000-0000-0000-0000-000000000001','r5','2026-02-03', 1,'casa',8,5,2,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-02-10', 2,'casa',9,5,1,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-02-17', 3,'casa',9,6,1,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-02-24', 4,'casa',9,6,1,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-03-03', 5,'casa',8,5,2,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-03-10', 6,'casa',9,6,1,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-03-17', 7,'casa',9,7,1,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-03-24', 8,'casa',9,7,0,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-03-31', 9,'casa',9,7,0,'positivo','alto','autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r5','2026-04-07',10,'casa',9,8,0,'positivo','alto','autonomo',false,false,''),

('00000000-0000-0000-0000-000000000001','r6','2026-02-03', 1,'barco',3,1,6,'bajo',  'bajo', 'dependiente',false,true, ''),
('00000000-0000-0000-0000-000000000001','r6','2026-02-10', 2,'barco',3,1,6,'neutro','bajo', 'dependiente',false,true, ''),
('00000000-0000-0000-0000-000000000001','r6','2026-02-17', 3,'barco',4,2,6,'neutro','bajo', 'dependiente',false,true, ''),
('00000000-0000-0000-0000-000000000001','r6','2026-02-24', 4,'barco',4,2,5,'neutro','medio','dependiente',false,true, ''),
('00000000-0000-0000-0000-000000000001','r6','2026-03-03', 5,'barco',4,2,5,'neutro','medio','dependiente',false,false,''),
('00000000-0000-0000-0000-000000000001','r6','2026-03-10', 6,'barco',5,2,4,'neutro','medio','parcial',    false,true, ''),
('00000000-0000-0000-0000-000000000001','r6','2026-03-17', 7,'barco',5,3,4,'neutro','medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r6','2026-03-24', 8,'barco',5,3,4,'neutro','medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r6','2026-03-31', 9,'barco',6,3,3,'neutro','medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r6','2026-04-07',10,'barco',6,3,3,'neutro','medio','parcial',    false,true, ''),

('00000000-0000-0000-0000-000000000001','r7','2026-02-03', 1,'flor',6,3,4,'neutro',  'medio','parcial', false,false,''),
('00000000-0000-0000-0000-000000000001','r7','2026-02-10', 2,'flor',7,4,3,'positivo','alto', 'parcial', false,false,''),
('00000000-0000-0000-0000-000000000001','r7','2026-02-17', 3,'flor',7,4,3,'positivo','alto', 'autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r7','2026-02-24', 4,'flor',5,2,5,'neutro',  'medio','parcial', false,true, ''),
('00000000-0000-0000-0000-000000000001','r7','2026-03-03', 5,'flor',4,2,5,'bajo',    'medio','parcial', true, true, ''),
('00000000-0000-0000-0000-000000000001','r7','2026-03-10', 6,'flor',5,3,4,'neutro',  'medio','parcial', false,false,''),
('00000000-0000-0000-0000-000000000001','r7','2026-03-17', 7,'flor',7,4,3,'positivo','alto', 'parcial', false,false,''),
('00000000-0000-0000-0000-000000000001','r7','2026-03-24', 8,'flor',8,4,2,'positivo','alto', 'autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r7','2026-03-31', 9,'flor',8,5,2,'positivo','alto', 'autonomo',false,false,''),
('00000000-0000-0000-0000-000000000001','r7','2026-04-07',10,'flor',9,5,1,'positivo','alto', 'autonomo',false,false,''),

('00000000-0000-0000-0000-000000000001','r8','2026-02-03', 1,'cafe',4,1,5,'neutro',  'bajo', 'dependiente',false,true, ''),
('00000000-0000-0000-0000-000000000001','r8','2026-02-10', 2,'cafe',4,2,5,'neutro',  'bajo', 'dependiente',false,true, ''),
('00000000-0000-0000-0000-000000000001','r8','2026-02-17', 3,'cafe',5,2,4,'neutro',  'medio','dependiente',false,true, ''),
('00000000-0000-0000-0000-000000000001','r8','2026-02-24', 4,'cafe',5,2,4,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r8','2026-03-03', 5,'cafe',6,3,4,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r8','2026-03-10', 6,'cafe',6,3,3,'neutro',  'medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r8','2026-03-17', 7,'cafe',7,3,3,'positivo','medio','parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r8','2026-03-24', 8,'cafe',7,4,3,'positivo','alto', 'parcial',    false,false,''),
('00000000-0000-0000-0000-000000000001','r8','2026-03-31', 9,'cafe',8,4,2,'positivo','alto', 'autonomo',   false,false,''),
('00000000-0000-0000-0000-000000000001','r8','2026-04-07',10,'cafe',8,5,2,'positivo','alto', 'autonomo',   false,false,'');


-- ── 11. SEED: escalas clínicas históricas ─────────────────────────────────────

INSERT INTO public.kinact_escalas
  (org_id, residente_id, fecha, mec, gds, barthel, tug, mec_cond, gds_cond, barthel_cond, tug_cond, observaciones)
VALUES
('00000000-0000-0000-0000-000000000001','r1','2026-01-07',19,10, 68,19.2,false,false,false,false,'Evaluación basal'),
('00000000-0000-0000-0000-000000000001','r1','2026-02-03',NULL,NULL,NULL,17.8,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r1','2026-03-03',NULL,NULL,NULL,16.1,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r1','2026-04-07',21, 6,  74,14.4,false,false,false,false,'Evaluación post-programa'),
('00000000-0000-0000-0000-000000000001','r2','2026-01-07',24, 9, 75,22.5,false,false,false,false,'Evaluación basal'),
('00000000-0000-0000-0000-000000000001','r2','2026-02-03',NULL,NULL,NULL,22.1,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r2','2026-03-03',NULL,NULL,NULL,21.4,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r2','2026-04-07',25, 7, 77,20.8,false,false,false,false,'Evaluación post-programa'),
('00000000-0000-0000-0000-000000000001','r3','2026-01-07',27, 5, 88,12.5,false,false,false,false,'Evaluación basal'),
('00000000-0000-0000-0000-000000000001','r3','2026-02-03',NULL,NULL,NULL,11.8,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r3','2026-03-03',NULL,NULL,NULL,11.2,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r3','2026-04-07',28, 3, 93,10.6,false,false,false,false,'Evaluación post-programa'),
('00000000-0000-0000-0000-000000000001','r4','2026-01-07',22,11, 58,26.0,false,false,false,false,'Evaluación basal'),
('00000000-0000-0000-0000-000000000001','r4','2026-02-03',NULL,NULL,NULL,25.5,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r4','2026-03-03',NULL,NULL,NULL,24.8,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r4','2026-04-07',22, 9, 62,23.9,false,false,false,false,'Evaluación post-programa'),
('00000000-0000-0000-0000-000000000001','r5','2026-01-07',29, 2, 96, 9.8,false,false,false,false,'Evaluación basal'),
('00000000-0000-0000-0000-000000000001','r5','2026-02-03',NULL,NULL,NULL, 9.5,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r5','2026-03-03',NULL,NULL,NULL, 9.2,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r5','2026-04-07',29, 1, 98, 8.9,false,false,false,false,'Evaluación post-programa'),
('00000000-0000-0000-0000-000000000001','r6','2026-01-07',20,12, 52,28.5,false,false,false,false,'Evaluación basal'),
('00000000-0000-0000-0000-000000000001','r6','2026-02-03',NULL,NULL,NULL,27.9,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r6','2026-03-03',NULL,NULL,NULL,27.2,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r6','2026-04-07',20,10, 57,26.8,false,false,false,false,'Evaluación post-programa'),
('00000000-0000-0000-0000-000000000001','r7','2026-01-07',26, 7, 82,14.8,false,false,false,false,'Evaluación basal'),
('00000000-0000-0000-0000-000000000001','r7','2026-02-03',NULL,NULL,NULL,14.2,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r7','2026-03-03',NULL,NULL,NULL,13.1,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r7','2026-04-07',27, 4, 87,11.9,false,false,false,false,'Evaluación post-programa'),
('00000000-0000-0000-0000-000000000001','r8','2026-01-07',23, 8, 70,17.5,false,false,false,false,'Evaluación basal'),
('00000000-0000-0000-0000-000000000001','r8','2026-02-03',NULL,NULL,NULL,16.2,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r8','2026-03-03',NULL,NULL,NULL,14.9,false,false,false,false,'TUG mensual'),
('00000000-0000-0000-0000-000000000001','r8','2026-04-07',25, 5, 76,13.5,false,false,false,false,'Evaluación post-programa')
ON CONFLICT (residente_id, fecha) DO NOTHING;
