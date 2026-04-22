-- ─────────────────────────────────────────────────────────────────────────────
-- KINACT · Seed de datos históricos (8 residentes · 10 sesiones · escalas)
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ⚠️  Ejecutar UNA SOLA VEZ. Si hay que repetir, borrar primero con:
--     DELETE FROM public.kinact_sesiones WHERE residente_id IN ('r1','r2','r3','r4','r5','r6','r7','r8');
--     DELETE FROM public.kinact_escalas  WHERE residente_id IN ('r1','r2','r3','r4','r5','r6','r7','r8');
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. SESIONES (10 sesiones × 8 residentes = 80 filas)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.kinact_sesiones
  (residente_id, fecha, sesion_num, tablero, gaps_completados, intercambios, mediaciones, estado, engagement, autonomia, agitacion, fatiga, observaciones)
VALUES
-- ── r1 Rosa Ferrer · casa ──────────────────────────────────────────────────
('r1','2026-02-03', 1,'casa',5,1,6,'bajo',    'bajo', 'dependiente',true, false,''),
('r1','2026-02-10', 2,'casa',5,2,5,'neutro',  'bajo', 'dependiente',false,false,''),
('r1','2026-02-17', 3,'casa',6,2,5,'neutro',  'medio','dependiente',false,true, ''),
('r1','2026-02-24', 4,'casa',6,3,4,'neutro',  'medio','parcial',    false,false,''),
('r1','2026-03-03', 5,'casa',6,3,4,'neutro',  'medio','parcial',    false,false,''),
('r1','2026-03-10', 6,'casa',7,3,3,'positivo','medio','parcial',    false,false,''),
('r1','2026-03-17', 7,'casa',7,4,3,'positivo','alto', 'parcial',    false,false,''),
('r1','2026-03-24', 8,'casa',8,4,2,'positivo','alto', 'autonomo',   false,false,''),
('r1','2026-03-31', 9,'casa',8,5,2,'positivo','alto', 'autonomo',   false,false,''),
('r1','2026-04-07',10,'casa',9,5,1,'positivo','alto', 'autonomo',   false,false,''),

-- ── r2 Paco Romero · barco ────────────────────────────────────────────────
('r2','2026-02-03', 1,'barco',5,2,5,'neutro','medio','parcial',false,true, ''),
('r2','2026-02-10', 2,'barco',5,2,5,'neutro','medio','parcial',false,true, ''),
('r2','2026-02-17', 3,'barco',6,2,4,'neutro','medio','parcial',false,false,''),
('r2','2026-02-24', 4,'barco',5,3,4,'neutro','medio','parcial',false,true, ''),
('r2','2026-03-03', 5,'barco',6,3,4,'neutro','medio','parcial',false,false,''),
('r2','2026-03-10', 6,'barco',6,3,3,'neutro','medio','parcial',false,false,''),
('r2','2026-03-17', 7,'barco',7,3,3,'neutro','medio','parcial',false,false,''),
('r2','2026-03-24', 8,'barco',6,4,3,'neutro','medio','parcial',false,true, ''),
('r2','2026-03-31', 9,'barco',7,4,3,'neutro','alto', 'parcial',false,false,''),
('r2','2026-04-07',10,'barco',7,4,2,'neutro','alto', 'parcial',false,false,''),

-- ── r3 Dolores Méndez · flor ──────────────────────────────────────────────
('r3','2026-02-03', 1,'flor',7,3,3,'positivo','alto','parcial', false,false,''),
('r3','2026-02-10', 2,'flor',7,4,3,'positivo','alto','parcial', false,false,''),
('r3','2026-02-17', 3,'flor',7,4,2,'positivo','alto','autonomo',false,false,''),
('r3','2026-02-24', 4,'flor',8,4,2,'positivo','alto','autonomo',false,false,''),
('r3','2026-03-03', 5,'flor',8,5,2,'positivo','alto','autonomo',false,false,''),
('r3','2026-03-10', 6,'flor',8,5,2,'positivo','alto','autonomo',false,false,''),
('r3','2026-03-17', 7,'flor',9,5,1,'positivo','alto','autonomo',false,false,''),
('r3','2026-03-24', 8,'flor',9,6,1,'positivo','alto','autonomo',false,false,''),
('r3','2026-03-31', 9,'flor',9,6,1,'positivo','alto','autonomo',false,false,''),
('r3','2026-04-07',10,'flor',9,6,1,'positivo','alto','autonomo',false,false,''),

-- ── r4 Tomás Herrera · cafe ───────────────────────────────────────────────
('r4','2026-02-03', 1,'cafe',3,1,7,'bajo',    'bajo', 'dependiente',true, false,''),
('r4','2026-02-10', 2,'cafe',4,1,6,'bajo',    'bajo', 'dependiente',true, false,''),
('r4','2026-02-17', 3,'cafe',4,2,6,'neutro',  'medio','dependiente',true, false,''),
('r4','2026-02-24', 4,'cafe',5,2,5,'neutro',  'medio','dependiente',false,false,''),
('r4','2026-03-03', 5,'cafe',5,2,5,'neutro',  'medio','parcial',    false,false,''),
('r4','2026-03-10', 6,'cafe',5,3,4,'neutro',  'medio','parcial',    false,false,''),
('r4','2026-03-17', 7,'cafe',6,3,4,'neutro',  'medio','parcial',    false,false,''),
('r4','2026-03-24', 8,'cafe',6,3,3,'neutro',  'medio','parcial',    false,false,''),
('r4','2026-03-31', 9,'cafe',6,3,3,'neutro',  'alto', 'parcial',    false,false,''),
('r4','2026-04-07',10,'cafe',7,4,2,'positivo','alto', 'parcial',    false,false,''),

-- ── r5 Concha Morales · casa ──────────────────────────────────────────────
('r5','2026-02-03', 1,'casa',8,5,2,'positivo','alto','autonomo',false,false,''),
('r5','2026-02-10', 2,'casa',9,5,1,'positivo','alto','autonomo',false,false,''),
('r5','2026-02-17', 3,'casa',9,6,1,'positivo','alto','autonomo',false,false,''),
('r5','2026-02-24', 4,'casa',9,6,1,'positivo','alto','autonomo',false,false,''),
('r5','2026-03-03', 5,'casa',8,5,2,'positivo','alto','autonomo',false,false,''),
('r5','2026-03-10', 6,'casa',9,6,1,'positivo','alto','autonomo',false,false,''),
('r5','2026-03-17', 7,'casa',9,7,1,'positivo','alto','autonomo',false,false,''),
('r5','2026-03-24', 8,'casa',9,7,0,'positivo','alto','autonomo',false,false,''),
('r5','2026-03-31', 9,'casa',9,7,0,'positivo','alto','autonomo',false,false,''),
('r5','2026-04-07',10,'casa',9,8,0,'positivo','alto','autonomo',false,false,''),

-- ── r6 Emilio Sáenz · barco ───────────────────────────────────────────────
('r6','2026-02-03', 1,'barco',3,1,6,'bajo',  'bajo', 'dependiente',false,true, ''),
('r6','2026-02-10', 2,'barco',3,1,6,'neutro','bajo', 'dependiente',false,true, ''),
('r6','2026-02-17', 3,'barco',4,2,6,'neutro','bajo', 'dependiente',false,true, ''),
('r6','2026-02-24', 4,'barco',4,2,5,'neutro','medio','dependiente',false,true, ''),
('r6','2026-03-03', 5,'barco',4,2,5,'neutro','medio','dependiente',false,false,''),
('r6','2026-03-10', 6,'barco',5,2,4,'neutro','medio','parcial',    false,true, ''),
('r6','2026-03-17', 7,'barco',5,3,4,'neutro','medio','parcial',    false,false,''),
('r6','2026-03-24', 8,'barco',5,3,4,'neutro','medio','parcial',    false,false,''),
('r6','2026-03-31', 9,'barco',6,3,3,'neutro','medio','parcial',    false,false,''),
('r6','2026-04-07',10,'barco',6,3,3,'neutro','medio','parcial',    false,true, ''),

-- ── r7 Pilar Castillo · flor ──────────────────────────────────────────────
('r7','2026-02-03', 1,'flor',6,3,4,'neutro',  'medio','parcial', false,false,''),
('r7','2026-02-10', 2,'flor',7,4,3,'positivo','alto', 'parcial', false,false,''),
('r7','2026-02-17', 3,'flor',7,4,3,'positivo','alto', 'autonomo',false,false,''),
('r7','2026-02-24', 4,'flor',5,2,5,'neutro',  'medio','parcial', false,true, ''),
('r7','2026-03-03', 5,'flor',4,2,5,'bajo',    'medio','parcial', true, true, ''),
('r7','2026-03-10', 6,'flor',5,3,4,'neutro',  'medio','parcial', false,false,''),
('r7','2026-03-17', 7,'flor',7,4,3,'positivo','alto', 'parcial', false,false,''),
('r7','2026-03-24', 8,'flor',8,4,2,'positivo','alto', 'autonomo',false,false,''),
('r7','2026-03-31', 9,'flor',8,5,2,'positivo','alto', 'autonomo',false,false,''),
('r7','2026-04-07',10,'flor',9,5,1,'positivo','alto', 'autonomo',false,false,''),

-- ── r8 Bernardo Gil · cafe ────────────────────────────────────────────────
('r8','2026-02-03', 1,'cafe',4,1,5,'neutro',  'bajo', 'dependiente',false,true, ''),
('r8','2026-02-10', 2,'cafe',4,2,5,'neutro',  'bajo', 'dependiente',false,true, ''),
('r8','2026-02-17', 3,'cafe',5,2,4,'neutro',  'medio','dependiente',false,true, ''),
('r8','2026-02-24', 4,'cafe',5,2,4,'neutro',  'medio','parcial',    false,false,''),
('r8','2026-03-03', 5,'cafe',6,3,4,'neutro',  'medio','parcial',    false,false,''),
('r8','2026-03-10', 6,'cafe',6,3,3,'neutro',  'medio','parcial',    false,false,''),
('r8','2026-03-17', 7,'cafe',7,3,3,'positivo','medio','parcial',    false,false,''),
('r8','2026-03-24', 8,'cafe',7,4,3,'positivo','alto', 'parcial',    false,false,''),
('r8','2026-03-31', 9,'cafe',8,4,2,'positivo','alto', 'autonomo',   false,false,''),
('r8','2026-04-07',10,'cafe',8,5,2,'positivo','alto', 'autonomo',   false,false,'');


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ESCALAS CLÍNICAS (fechas basal + TUG mensual + post-programa)
--    Cada fila = una fecha; campos NULL si no se midió ese día
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.kinact_escalas
  (residente_id, fecha, mec, gds, barthel, tug, mec_cond, gds_cond, barthel_cond, tug_cond, observaciones)
VALUES
-- ── r1 Rosa Ferrer ────────────────────────────────────────────────────────
('r1','2026-01-07',19,10, 68,19.2,false,false,false,false,'Evaluación basal'),
('r1','2026-02-03',NULL,NULL,NULL,17.8,false,false,false,false,'TUG mensual'),
('r1','2026-03-03',NULL,NULL,NULL,16.1,false,false,false,false,'TUG mensual'),
('r1','2026-04-07',21, 6,  74,14.4,false,false,false,false,'Evaluación post-programa'),

-- ── r2 Paco Romero ────────────────────────────────────────────────────────
('r2','2026-01-07',24, 9, 75,22.5,false,false,false,false,'Evaluación basal'),
('r2','2026-02-03',NULL,NULL,NULL,22.1,false,false,false,false,'TUG mensual'),
('r2','2026-03-03',NULL,NULL,NULL,21.4,false,false,false,false,'TUG mensual'),
('r2','2026-04-07',25, 7, 77,20.8,false,false,false,false,'Evaluación post-programa'),

-- ── r3 Dolores Méndez ─────────────────────────────────────────────────────
('r3','2026-01-07',27, 5, 88,12.5,false,false,false,false,'Evaluación basal'),
('r3','2026-02-03',NULL,NULL,NULL,11.8,false,false,false,false,'TUG mensual'),
('r3','2026-03-03',NULL,NULL,NULL,11.2,false,false,false,false,'TUG mensual'),
('r3','2026-04-07',28, 3, 93,10.6,false,false,false,false,'Evaluación post-programa'),

-- ── r4 Tomás Herrera ──────────────────────────────────────────────────────
('r4','2026-01-07',22,11, 58,26.0,false,false,false,false,'Evaluación basal'),
('r4','2026-02-03',NULL,NULL,NULL,25.5,false,false,false,false,'TUG mensual'),
('r4','2026-03-03',NULL,NULL,NULL,24.8,false,false,false,false,'TUG mensual'),
('r4','2026-04-07',22, 9, 62,23.9,false,false,false,false,'Evaluación post-programa'),

-- ── r5 Concha Morales ─────────────────────────────────────────────────────
('r5','2026-01-07',29, 2, 96, 9.8,false,false,false,false,'Evaluación basal'),
('r5','2026-02-03',NULL,NULL,NULL, 9.5,false,false,false,false,'TUG mensual'),
('r5','2026-03-03',NULL,NULL,NULL, 9.2,false,false,false,false,'TUG mensual'),
('r5','2026-04-07',29, 1, 98, 8.9,false,false,false,false,'Evaluación post-programa'),

-- ── r6 Emilio Sáenz ───────────────────────────────────────────────────────
('r6','2026-01-07',20,12, 52,28.5,false,false,false,false,'Evaluación basal'),
('r6','2026-02-03',NULL,NULL,NULL,27.9,false,false,false,false,'TUG mensual'),
('r6','2026-03-03',NULL,NULL,NULL,27.2,false,false,false,false,'TUG mensual'),
('r6','2026-04-07',20,10, 57,26.8,false,false,false,false,'Evaluación post-programa'),

-- ── r7 Pilar Castillo ─────────────────────────────────────────────────────
('r7','2026-01-07',26, 7, 82,14.8,false,false,false,false,'Evaluación basal'),
('r7','2026-02-03',NULL,NULL,NULL,14.2,false,false,false,false,'TUG mensual'),
('r7','2026-03-03',NULL,NULL,NULL,13.1,false,false,false,false,'TUG mensual'),
('r7','2026-04-07',27, 4, 87,11.9,false,false,false,false,'Evaluación post-programa'),

-- ── r8 Bernardo Gil ───────────────────────────────────────────────────────
('r8','2026-01-07',23, 8, 70,17.5,false,false,false,false,'Evaluación basal'),
('r8','2026-02-03',NULL,NULL,NULL,16.2,false,false,false,false,'TUG mensual'),
('r8','2026-03-03',NULL,NULL,NULL,14.9,false,false,false,false,'TUG mensual'),
('r8','2026-04-07',25, 5, 76,13.5,false,false,false,false,'Evaluación post-programa');
