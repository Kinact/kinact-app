-- ══════════════════════════════════════════════════════════════
-- KINACT · Fix: aislamiento multi-tenant estricto
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════════

-- ── 1. Asignar org demo a filas históricas con org_id NULL ────
-- (Las filas NULL son datos previos al fix; las asignamos a la
--  org demo para que no queden huérfanas ni visibles a todos)
UPDATE public.kinact_sesiones
   SET org_id = '00000000-0000-0000-0000-000000000001'
 WHERE org_id IS NULL;

UPDATE public.kinact_escalas
   SET org_id = '00000000-0000-0000-0000-000000000001'
 WHERE org_id IS NULL;

UPDATE public.kinact_familiares
   SET org_id = '00000000-0000-0000-0000-000000000001'
 WHERE org_id IS NULL;

-- ── 2. Reemplazar políticas RLS con versión estricta ──────────
-- Elimina el "org_id IS NULL OR" que filtraba filas nulas

DROP POLICY IF EXISTS "sesiones_by_org"   ON public.kinact_sesiones;
DROP POLICY IF EXISTS "escalas_by_org"    ON public.kinact_escalas;
DROP POLICY IF EXISTS "familiares_by_org" ON public.kinact_familiares;

CREATE POLICY "sesiones_by_org" ON public.kinact_sesiones
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "escalas_by_org" ON public.kinact_escalas
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "familiares_by_org" ON public.kinact_familiares
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

-- ── 3. Verificación post-fix ──────────────────────────────────
-- Ejecuta esto para confirmar que no quedan filas NULL:
SELECT 'sesiones'   AS tabla, COUNT(*) AS filas_sin_org FROM public.kinact_sesiones   WHERE org_id IS NULL
UNION ALL
SELECT 'escalas'    AS tabla, COUNT(*) AS filas_sin_org FROM public.kinact_escalas    WHERE org_id IS NULL
UNION ALL
SELECT 'familiares' AS tabla, COUNT(*) AS filas_sin_org FROM public.kinact_familiares WHERE org_id IS NULL;
-- Resultado esperado: 0, 0, 0
