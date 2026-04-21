export const MOCK_CENTER = {
  id: 'centro-01',
  name: 'Residencia Santa Clara',
  facilitators: ['Ana López', 'Laura Martín', 'José García']
};

// Pesos asignados de forma determinista por índice (sin Math.random)
const PESOS_FIJOS = ['10g', '40g', '40g', '90g', '40g', '40g', '40g', '40g', '90g', '40g', '10g'];

export const POOL_PIEZAS = (() => {
  const formas = ['F1-circular', 'F2-hoja', 'F3-bloque', 'F4-cilindro'];
  const colores = ['roja', 'azul', 'verde', 'amarilla'];
  const piezas = [];
  let id = 1;

  formas.forEach((forma, fi) => {
    colores.forEach((color, ci) => {
      const pesoIdx = (fi * colores.length + ci) % PESOS_FIJOS.length;
      piezas.push({
        id: `P${String(id).padStart(2, '0')}`,
        forma, color,
        peso: PESOS_FIJOS[pesoIdx],
        estado: 'mesa',
        propietarioId: null
      });
      id++;
    });
  });

  while (piezas.length < 44) {
    const idx = piezas.length;
    const forma = formas[idx % 4];
    const color = colores[idx % 4];
    const peso = ['40g', '40g', '40g', '10g', '90g'][idx % 5];
    piezas.push({
      id: `P${String(id).padStart(2, '0')}`,
      forma, color, peso,
      estado: 'mesa',
      propietarioId: null
    });
    id++;
  }

  return piezas;
})();

export const TABLEROS_CONFIG = {
  casa:  { gaps: 9, descripcion: 'Una casa de pueblo',  formasReq: ['F1-circular','F2-hoja','F2-hoja','F2-hoja','F3-bloque','F3-bloque','F3-bloque','F3-bloque','F4-cilindro'] },
  barco: { gaps: 9, descripcion: 'Un velero en el mar', formasReq: ['F1-circular','F2-hoja','F2-hoja','F2-hoja','F2-hoja','F3-bloque','F3-bloque','F3-bloque','F4-cilindro'] },
  flor:  { gaps: 9, descripcion: 'Una flor en maceta',  formasReq: ['F1-circular','F1-circular','F2-hoja','F2-hoja','F2-hoja','F2-hoja','F3-bloque','F3-bloque','F4-cilindro'] },
  cafe:  { gaps: 9, descripcion: 'Una taza de café',    formasReq: ['F1-circular','F2-hoja','F2-hoja','F2-hoja','F3-bloque','F3-bloque','F3-bloque','F3-bloque','F4-cilindro'] }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8 RESIDENTES · Incorporación: 3 feb 2026 · 10 sesiones (3 feb – 7 abr 2026)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_RESIDENTS = [
  { id: 'r1', nombre: 'Rosa Ferrer',     iniciales: 'RF', tableroHabitual: 'casa',  sesiones: 10, incorporacion: '2026-02-03' },
  { id: 'r2', nombre: 'Paco Romero',     iniciales: 'PR', tableroHabitual: 'barco', sesiones: 10, incorporacion: '2026-02-03' },
  { id: 'r3', nombre: 'Dolores Méndez',  iniciales: 'DM', tableroHabitual: 'flor',  sesiones: 10, incorporacion: '2026-02-03' },
  { id: 'r4', nombre: 'Tomás Herrera',   iniciales: 'TH', tableroHabitual: 'cafe',  sesiones: 10, incorporacion: '2026-02-03' },
  { id: 'r5', nombre: 'Concha Morales',  iniciales: 'CM', tableroHabitual: 'casa',  sesiones: 10, incorporacion: '2026-02-03' },
  { id: 'r6', nombre: 'Emilio Sáenz',    iniciales: 'ES', tableroHabitual: 'barco', sesiones: 10, incorporacion: '2026-02-03' },
  { id: 'r7', nombre: 'Pilar Castillo',  iniciales: 'PC', tableroHabitual: 'flor',  sesiones: 10, incorporacion: '2026-02-03' },
  { id: 'r8', nombre: 'Bernardo Gil',    iniciales: 'BG', tableroHabitual: 'cafe',  sesiones: 10, incorporacion: '2026-02-03' }
];

// ─────────────────────────────────────────────────────────────────────────────
// 10 SESIONES SEMANALES (martes)
// S1  2026-02-03 · S2  2026-02-10 · S3  2026-02-17 · S4  2026-02-24
// S5  2026-03-03 · S6  2026-03-10 · S7  2026-03-17 · S8  2026-03-24
// S9  2026-03-31 · S10 2026-04-07
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_SESSION_HISTORY = {

  // ── r1 Rosa Ferrer · Arco: inicio bajo → mejora progresiva → cierre alto ──
  r1: [
    { sesion: 1,  fecha: '2026-02-03', gapsCompletados: 5, intercambios: 1, mediaciones: 6, estado: 'bajo',     engagement: 'bajo',  autonomia: 'dependiente', agitacion: true,  fatiga: false },
    { sesion: 2,  fecha: '2026-02-10', gapsCompletados: 5, intercambios: 2, mediaciones: 5, estado: 'neutro',   engagement: 'bajo',  autonomia: 'dependiente', agitacion: false, fatiga: false },
    { sesion: 3,  fecha: '2026-02-17', gapsCompletados: 6, intercambios: 2, mediaciones: 5, estado: 'neutro',   engagement: 'medio', autonomia: 'dependiente', agitacion: false, fatiga: true  },
    { sesion: 4,  fecha: '2026-02-24', gapsCompletados: 6, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 5,  fecha: '2026-03-03', gapsCompletados: 6, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 6,  fecha: '2026-03-10', gapsCompletados: 7, intercambios: 3, mediaciones: 3, estado: 'positivo', engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 7,  fecha: '2026-03-17', gapsCompletados: 7, intercambios: 4, mediaciones: 3, estado: 'positivo', engagement: 'alto',  autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 8,  fecha: '2026-03-24', gapsCompletados: 8, intercambios: 4, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo',    agitacion: false, fatiga: false },
    { sesion: 9,  fecha: '2026-03-31', gapsCompletados: 8, intercambios: 5, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo',    agitacion: false, fatiga: false },
    { sesion: 10, fecha: '2026-04-07', gapsCompletados: 9, intercambios: 5, mediaciones: 1, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo',    agitacion: false, fatiga: false }
  ],

  // ── r2 Paco Romero · Arco: meseta estable con mejora suave al final ────────
  r2: [
    { sesion: 1,  fecha: '2026-02-03', gapsCompletados: 5, intercambios: 2, mediaciones: 5, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: true  },
    { sesion: 2,  fecha: '2026-02-10', gapsCompletados: 5, intercambios: 2, mediaciones: 5, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: true  },
    { sesion: 3,  fecha: '2026-02-17', gapsCompletados: 6, intercambios: 2, mediaciones: 4, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: false },
    { sesion: 4,  fecha: '2026-02-24', gapsCompletados: 5, intercambios: 3, mediaciones: 4, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: true  },
    { sesion: 5,  fecha: '2026-03-03', gapsCompletados: 6, intercambios: 3, mediaciones: 4, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: false },
    { sesion: 6,  fecha: '2026-03-10', gapsCompletados: 6, intercambios: 3, mediaciones: 3, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: false },
    { sesion: 7,  fecha: '2026-03-17', gapsCompletados: 7, intercambios: 3, mediaciones: 3, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: false },
    { sesion: 8,  fecha: '2026-03-24', gapsCompletados: 6, intercambios: 4, mediaciones: 3, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: true  },
    { sesion: 9,  fecha: '2026-03-31', gapsCompletados: 7, intercambios: 4, mediaciones: 3, estado: 'neutro', engagement: 'alto',  autonomia: 'parcial', agitacion: false, fatiga: false },
    { sesion: 10, fecha: '2026-04-07', gapsCompletados: 7, intercambios: 4, mediaciones: 2, estado: 'neutro', engagement: 'alto',  autonomia: 'parcial', agitacion: false, fatiga: false }
  ],

  // ── r3 Dolores Méndez · Arco: buen nivel desde el inicio, mejora constante ─
  r3: [
    { sesion: 1,  fecha: '2026-02-03', gapsCompletados: 7, intercambios: 3, mediaciones: 3, estado: 'positivo', engagement: 'alto', autonomia: 'parcial',  agitacion: false, fatiga: false },
    { sesion: 2,  fecha: '2026-02-10', gapsCompletados: 7, intercambios: 4, mediaciones: 3, estado: 'positivo', engagement: 'alto', autonomia: 'parcial',  agitacion: false, fatiga: false },
    { sesion: 3,  fecha: '2026-02-17', gapsCompletados: 7, intercambios: 4, mediaciones: 2, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 4,  fecha: '2026-02-24', gapsCompletados: 8, intercambios: 4, mediaciones: 2, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 5,  fecha: '2026-03-03', gapsCompletados: 8, intercambios: 5, mediaciones: 2, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 6,  fecha: '2026-03-10', gapsCompletados: 8, intercambios: 5, mediaciones: 2, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 7,  fecha: '2026-03-17', gapsCompletados: 9, intercambios: 5, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 8,  fecha: '2026-03-24', gapsCompletados: 9, intercambios: 6, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 9,  fecha: '2026-03-31', gapsCompletados: 9, intercambios: 6, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 10, fecha: '2026-04-07', gapsCompletados: 9, intercambios: 6, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false }
  ],

  // ── r4 Tomás Herrera · Arco: agitación inicial → estabilización gradual ────
  r4: [
    { sesion: 1,  fecha: '2026-02-03', gapsCompletados: 3, intercambios: 1, mediaciones: 7, estado: 'bajo',     engagement: 'bajo',  autonomia: 'dependiente', agitacion: true,  fatiga: false },
    { sesion: 2,  fecha: '2026-02-10', gapsCompletados: 4, intercambios: 1, mediaciones: 6, estado: 'bajo',     engagement: 'bajo',  autonomia: 'dependiente', agitacion: true,  fatiga: false },
    { sesion: 3,  fecha: '2026-02-17', gapsCompletados: 4, intercambios: 2, mediaciones: 6, estado: 'neutro',   engagement: 'medio', autonomia: 'dependiente', agitacion: true,  fatiga: false },
    { sesion: 4,  fecha: '2026-02-24', gapsCompletados: 5, intercambios: 2, mediaciones: 5, estado: 'neutro',   engagement: 'medio', autonomia: 'dependiente', agitacion: false, fatiga: false },
    { sesion: 5,  fecha: '2026-03-03', gapsCompletados: 5, intercambios: 2, mediaciones: 5, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 6,  fecha: '2026-03-10', gapsCompletados: 5, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 7,  fecha: '2026-03-17', gapsCompletados: 6, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 8,  fecha: '2026-03-24', gapsCompletados: 6, intercambios: 3, mediaciones: 3, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 9,  fecha: '2026-03-31', gapsCompletados: 6, intercambios: 3, mediaciones: 3, estado: 'neutro',   engagement: 'alto',  autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 10, fecha: '2026-04-07', gapsCompletados: 7, intercambios: 4, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'parcial',     agitacion: false, fatiga: false }
  ],

  // ── r5 Concha Morales · Arco: alto rendimiento constante desde el día 1 ───
  r5: [
    { sesion: 1,  fecha: '2026-02-03', gapsCompletados: 8, intercambios: 5, mediaciones: 2, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 2,  fecha: '2026-02-10', gapsCompletados: 9, intercambios: 5, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 3,  fecha: '2026-02-17', gapsCompletados: 9, intercambios: 6, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 4,  fecha: '2026-02-24', gapsCompletados: 9, intercambios: 6, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 5,  fecha: '2026-03-03', gapsCompletados: 8, intercambios: 5, mediaciones: 2, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 6,  fecha: '2026-03-10', gapsCompletados: 9, intercambios: 6, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 7,  fecha: '2026-03-17', gapsCompletados: 9, intercambios: 7, mediaciones: 1, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 8,  fecha: '2026-03-24', gapsCompletados: 9, intercambios: 7, mediaciones: 0, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 9,  fecha: '2026-03-31', gapsCompletados: 9, intercambios: 7, mediaciones: 0, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 10, fecha: '2026-04-07', gapsCompletados: 9, intercambios: 8, mediaciones: 0, estado: 'positivo', engagement: 'alto', autonomia: 'autonomo', agitacion: false, fatiga: false }
  ],

  // ── r6 Emilio Sáenz · Arco: paciente frágil con fatiga crónica, mejora lenta
  r6: [
    { sesion: 1,  fecha: '2026-02-03', gapsCompletados: 3, intercambios: 1, mediaciones: 6, estado: 'bajo',   engagement: 'bajo',  autonomia: 'dependiente', agitacion: false, fatiga: true  },
    { sesion: 2,  fecha: '2026-02-10', gapsCompletados: 3, intercambios: 1, mediaciones: 6, estado: 'neutro', engagement: 'bajo',  autonomia: 'dependiente', agitacion: false, fatiga: true  },
    { sesion: 3,  fecha: '2026-02-17', gapsCompletados: 4, intercambios: 2, mediaciones: 6, estado: 'neutro', engagement: 'bajo',  autonomia: 'dependiente', agitacion: false, fatiga: true  },
    { sesion: 4,  fecha: '2026-02-24', gapsCompletados: 4, intercambios: 2, mediaciones: 5, estado: 'neutro', engagement: 'medio', autonomia: 'dependiente', agitacion: false, fatiga: true  },
    { sesion: 5,  fecha: '2026-03-03', gapsCompletados: 4, intercambios: 2, mediaciones: 5, estado: 'neutro', engagement: 'medio', autonomia: 'dependiente', agitacion: false, fatiga: false },
    { sesion: 6,  fecha: '2026-03-10', gapsCompletados: 5, intercambios: 2, mediaciones: 4, estado: 'neutro', engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: true  },
    { sesion: 7,  fecha: '2026-03-17', gapsCompletados: 5, intercambios: 3, mediaciones: 4, estado: 'neutro', engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 8,  fecha: '2026-03-24', gapsCompletados: 5, intercambios: 3, mediaciones: 4, estado: 'neutro', engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 9,  fecha: '2026-03-31', gapsCompletados: 6, intercambios: 3, mediaciones: 3, estado: 'neutro', engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 10, fecha: '2026-04-07', gapsCompletados: 6, intercambios: 3, mediaciones: 3, estado: 'neutro', engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: true  }
  ],

  // ── r7 Pilar Castillo · Arco: buena → bache semanas 4-5 → recuperación ─────
  r7: [
    { sesion: 1,  fecha: '2026-02-03', gapsCompletados: 6, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',  agitacion: false, fatiga: false },
    { sesion: 2,  fecha: '2026-02-10', gapsCompletados: 7, intercambios: 4, mediaciones: 3, estado: 'positivo', engagement: 'alto',  autonomia: 'parcial',  agitacion: false, fatiga: false },
    { sesion: 3,  fecha: '2026-02-17', gapsCompletados: 7, intercambios: 4, mediaciones: 3, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 4,  fecha: '2026-02-24', gapsCompletados: 5, intercambios: 2, mediaciones: 5, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',  agitacion: false, fatiga: true  },
    { sesion: 5,  fecha: '2026-03-03', gapsCompletados: 4, intercambios: 2, mediaciones: 5, estado: 'bajo',     engagement: 'medio', autonomia: 'parcial',  agitacion: true,  fatiga: true  },
    { sesion: 6,  fecha: '2026-03-10', gapsCompletados: 5, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',  agitacion: false, fatiga: false },
    { sesion: 7,  fecha: '2026-03-17', gapsCompletados: 7, intercambios: 4, mediaciones: 3, estado: 'positivo', engagement: 'alto',  autonomia: 'parcial',  agitacion: false, fatiga: false },
    { sesion: 8,  fecha: '2026-03-24', gapsCompletados: 8, intercambios: 4, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 9,  fecha: '2026-03-31', gapsCompletados: 8, intercambios: 5, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo', agitacion: false, fatiga: false },
    { sesion: 10, fecha: '2026-04-07', gapsCompletados: 9, intercambios: 5, mediaciones: 1, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo', agitacion: false, fatiga: false }
  ],

  // ── r8 Bernardo Gil · Arco: fatiga inicial → engagement progresivo ──────────
  r8: [
    { sesion: 1,  fecha: '2026-02-03', gapsCompletados: 4, intercambios: 1, mediaciones: 5, estado: 'neutro',   engagement: 'bajo',  autonomia: 'dependiente', agitacion: false, fatiga: true  },
    { sesion: 2,  fecha: '2026-02-10', gapsCompletados: 4, intercambios: 2, mediaciones: 5, estado: 'neutro',   engagement: 'bajo',  autonomia: 'dependiente', agitacion: false, fatiga: true  },
    { sesion: 3,  fecha: '2026-02-17', gapsCompletados: 5, intercambios: 2, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'dependiente', agitacion: false, fatiga: true  },
    { sesion: 4,  fecha: '2026-02-24', gapsCompletados: 5, intercambios: 2, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 5,  fecha: '2026-03-03', gapsCompletados: 6, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 6,  fecha: '2026-03-10', gapsCompletados: 6, intercambios: 3, mediaciones: 3, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 7,  fecha: '2026-03-17', gapsCompletados: 7, intercambios: 3, mediaciones: 3, estado: 'positivo', engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 8,  fecha: '2026-03-24', gapsCompletados: 7, intercambios: 4, mediaciones: 3, estado: 'positivo', engagement: 'alto',  autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 9,  fecha: '2026-03-31', gapsCompletados: 8, intercambios: 4, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo',    agitacion: false, fatiga: false },
    { sesion: 10, fecha: '2026-04-07', gapsCompletados: 8, intercambios: 5, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo',    agitacion: false, fatiga: false }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// ESCALAS CLÍNICAS
// Revisión trimestral: Enero 2026 (basal) → Abril 2026 (tras 10 sesiones)
// TUG mensual: enero, febrero, marzo, abril
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_ESCALAS = {

  // r1 Rosa Ferrer · DCL leve, dep leve → mejora con intervención
  r1: {
    mec:    [
      { fecha: '2026-01-07', valor: 19, condEspeciales: false },
      { fecha: '2026-04-07', valor: 21, condEspeciales: false }
    ],
    gds:    [
      { fecha: '2026-01-07', valor: 10, condEspeciales: false },
      { fecha: '2026-04-07', valor: 6,  condEspeciales: false }
    ],
    barthel:[
      { fecha: '2026-01-07', valor: 68, condEspeciales: false },
      { fecha: '2026-04-07', valor: 74, condEspeciales: false }
    ],
    tug:    [
      { fecha: '2026-01-07', valor: 19.2 },
      { fecha: '2026-02-03', valor: 17.8 },
      { fecha: '2026-03-03', valor: 16.1 },
      { fecha: '2026-04-07', valor: 14.4 }
    ]
  },

  // r2 Paco Romero · Borderline cognitivo, dep leve, movilidad comprometida → estable
  r2: {
    mec:    [
      { fecha: '2026-01-07', valor: 24, condEspeciales: false },
      { fecha: '2026-04-07', valor: 25, condEspeciales: false }
    ],
    gds:    [
      { fecha: '2026-01-07', valor: 9,  condEspeciales: false },
      { fecha: '2026-04-07', valor: 7,  condEspeciales: false }
    ],
    barthel:[
      { fecha: '2026-01-07', valor: 75, condEspeciales: false },
      { fecha: '2026-04-07', valor: 77, condEspeciales: false }
    ],
    tug:    [
      { fecha: '2026-01-07', valor: 22.5 },
      { fecha: '2026-02-03', valor: 22.1 },
      { fecha: '2026-03-03', valor: 21.4 },
      { fecha: '2026-04-07', valor: 20.8 }
    ]
  },

  // r3 Dolores Méndez · Cognitivamente preservada, sin depresión, buena autonomía → mejora
  r3: {
    mec:    [
      { fecha: '2026-01-07', valor: 27, condEspeciales: false },
      { fecha: '2026-04-07', valor: 28, condEspeciales: false }
    ],
    gds:    [
      { fecha: '2026-01-07', valor: 5,  condEspeciales: false },
      { fecha: '2026-04-07', valor: 3,  condEspeciales: false }
    ],
    barthel:[
      { fecha: '2026-01-07', valor: 88, condEspeciales: false },
      { fecha: '2026-04-07', valor: 93, condEspeciales: false }
    ],
    tug:    [
      { fecha: '2026-01-07', valor: 12.5 },
      { fecha: '2026-02-03', valor: 11.8 },
      { fecha: '2026-03-03', valor: 11.2 },
      { fecha: '2026-04-07', valor: 10.6 }
    ]
  },

  // r4 Tomás Herrera · DCL, dep moderada, alta dependencia funcional → estabilización
  r4: {
    mec:    [
      { fecha: '2026-01-07', valor: 22, condEspeciales: false },
      { fecha: '2026-04-07', valor: 22, condEspeciales: false }
    ],
    gds:    [
      { fecha: '2026-01-07', valor: 11, condEspeciales: false },
      { fecha: '2026-04-07', valor: 9,  condEspeciales: false }
    ],
    barthel:[
      { fecha: '2026-01-07', valor: 58, condEspeciales: false },
      { fecha: '2026-04-07', valor: 62, condEspeciales: false }
    ],
    tug:    [
      { fecha: '2026-01-07', valor: 26.0 },
      { fecha: '2026-02-03', valor: 25.5 },
      { fecha: '2026-03-03', valor: 24.8 },
      { fecha: '2026-04-07', valor: 23.9 }
    ]
  },

  // r5 Concha Morales · Alto rendimiento cognitivo y funcional, sin depresión → excelente
  r5: {
    mec:    [
      { fecha: '2026-01-07', valor: 29, condEspeciales: false },
      { fecha: '2026-04-07', valor: 29, condEspeciales: false }
    ],
    gds:    [
      { fecha: '2026-01-07', valor: 2,  condEspeciales: false },
      { fecha: '2026-04-07', valor: 1,  condEspeciales: false }
    ],
    barthel:[
      { fecha: '2026-01-07', valor: 96, condEspeciales: false },
      { fecha: '2026-04-07', valor: 98, condEspeciales: false }
    ],
    tug:    [
      { fecha: '2026-01-07', valor: 9.8 },
      { fecha: '2026-02-03', valor: 9.5 },
      { fecha: '2026-03-03', valor: 9.2 },
      { fecha: '2026-04-07', valor: 8.9 }
    ]
  },

  // r6 Emilio Sáenz · DCL moderado, dep moderada, alta dependencia, riesgo caídas alto
  r6: {
    mec:    [
      { fecha: '2026-01-07', valor: 20, condEspeciales: false },
      { fecha: '2026-04-07', valor: 20, condEspeciales: false }
    ],
    gds:    [
      { fecha: '2026-01-07', valor: 12, condEspeciales: false },
      { fecha: '2026-04-07', valor: 10, condEspeciales: false }
    ],
    barthel:[
      { fecha: '2026-01-07', valor: 52, condEspeciales: false },
      { fecha: '2026-04-07', valor: 57, condEspeciales: false }
    ],
    tug:    [
      { fecha: '2026-01-07', valor: 28.5 },
      { fecha: '2026-02-03', valor: 27.9 },
      { fecha: '2026-03-03', valor: 27.2 },
      { fecha: '2026-04-07', valor: 26.8 }
    ]
  },

  // r7 Pilar Castillo · Borderline cognitivo, dep leve, buen Barthel → mejora tras bache
  r7: {
    mec:    [
      { fecha: '2026-01-07', valor: 26, condEspeciales: false },
      { fecha: '2026-04-07', valor: 27, condEspeciales: false }
    ],
    gds:    [
      { fecha: '2026-01-07', valor: 7,  condEspeciales: false },
      { fecha: '2026-04-07', valor: 4,  condEspeciales: false }
    ],
    barthel:[
      { fecha: '2026-01-07', valor: 82, condEspeciales: false },
      { fecha: '2026-04-07', valor: 87, condEspeciales: false }
    ],
    tug:    [
      { fecha: '2026-01-07', valor: 14.8 },
      { fecha: '2026-02-03', valor: 14.2 },
      { fecha: '2026-03-03', valor: 13.1 },
      { fecha: '2026-04-07', valor: 11.9 }
    ]
  },

  // r8 Bernardo Gil · DCL leve, dep leve, dependencia leve → responde bien al programa
  r8: {
    mec:    [
      { fecha: '2026-01-07', valor: 23, condEspeciales: false },
      { fecha: '2026-04-07', valor: 25, condEspeciales: false }
    ],
    gds:    [
      { fecha: '2026-01-07', valor: 8,  condEspeciales: false },
      { fecha: '2026-04-07', valor: 5,  condEspeciales: false }
    ],
    barthel:[
      { fecha: '2026-01-07', valor: 70, condEspeciales: false },
      { fecha: '2026-04-07', valor: 76, condEspeciales: false }
    ],
    tug:    [
      { fecha: '2026-01-07', valor: 17.5 },
      { fecha: '2026-02-03', valor: 16.2 },
      { fecha: '2026-03-03', valor: 14.9 },
      { fecha: '2026-04-07', valor: 13.5 }
    ]
  }
};
