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

  // Primeras 16 piezas: combinación exhaustiva forma × color
  formas.forEach((forma, fi) => {
    colores.forEach((color, ci) => {
      const pesoIdx = (fi * colores.length + ci) % PESOS_FIJOS.length;
      piezas.push({
        id: `P${String(id).padStart(2, '0')}`,
        forma,
        color,
        peso: PESOS_FIJOS[pesoIdx],
        estado: 'mesa',
        propietarioId: null
      });
      id++;
    });
  });

  // Piezas 17-44: relleno determinista hasta completar el pool
  while (piezas.length < 44) {
    const idx = piezas.length;
    const forma = formas[idx % 4];
    const color = colores[idx % 4];
    const peso = ['40g', '40g', '40g', '10g', '90g'][idx % 5];
    piezas.push({
      id: `P${String(id).padStart(2, '0')}`,
      forma,
      color,
      peso,
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

export const MOCK_RESIDENTS = [
  { id: 'r1', nombre: 'María Carmen', iniciales: 'MC', tableroHabitual: 'casa',  sesiones: 12, incorporacion: '2026-01-10' },
  { id: 'r2', nombre: 'Manuel García', iniciales: 'MG', tableroHabitual: 'barco', sesiones: 10, incorporacion: '2026-01-10' },
  { id: 'r3', nombre: 'Carmen Ruiz',   iniciales: 'CR', tableroHabitual: 'flor',  sesiones: 11, incorporacion: '2026-01-10' },
  { id: 'r4', nombre: 'Antonio Vega',  iniciales: 'AV', tableroHabitual: 'cafe',  sesiones: 9,  incorporacion: '2026-01-10' }
];

export const MOCK_SESSION_HISTORY = {
  r1: [
    { sesion: 1,  fecha: '2026-01-10', gapsCompletados: 6, intercambios: 2, mediaciones: 5, estado: 'bajo',     engagement: 'bajo',  autonomia: 'dependiente', agitacion: true,  fatiga: false },
    { sesion: 2,  fecha: '2026-01-17', gapsCompletados: 6, intercambios: 2, mediaciones: 5, estado: 'neutro',   engagement: 'medio', autonomia: 'dependiente', agitacion: false, fatiga: false },
    { sesion: 3,  fecha: '2026-01-24', gapsCompletados: 7, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: false },
    { sesion: 12, fecha: '2026-04-14', gapsCompletados: 9, intercambios: 5, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo',    agitacion: false, fatiga: false }
  ],
  r2: [
    { sesion: 1,  fecha: '2026-01-10', gapsCompletados: 4, intercambios: 1, mediaciones: 6, estado: 'neutro', engagement: 'medio', autonomia: 'dependiente', agitacion: false, fatiga: true },
    { sesion: 10, fecha: '2026-04-14', gapsCompletados: 4, intercambios: 1, mediaciones: 4, estado: 'neutro', engagement: 'medio', autonomia: 'parcial',     agitacion: false, fatiga: true }
  ],
  r3: [
    { sesion: 1,  fecha: '2026-01-10', gapsCompletados: 5, intercambios: 3, mediaciones: 4, estado: 'neutro',   engagement: 'medio', autonomia: 'parcial',  agitacion: false, fatiga: false },
    { sesion: 11, fecha: '2026-04-14', gapsCompletados: 9, intercambios: 4, mediaciones: 2, estado: 'positivo', engagement: 'alto',  autonomia: 'autonomo', agitacion: false, fatiga: false }
  ],
  r4: [
    { sesion: 1, fecha: '2026-01-10', gapsCompletados: 5, intercambios: 2, mediaciones: 5, estado: 'neutro', engagement: 'medio', autonomia: 'parcial', agitacion: false, fatiga: false },
    { sesion: 9, fecha: '2026-04-14', gapsCompletados: 7, intercambios: 2, mediaciones: 3, estado: 'neutro', engagement: 'alto',  autonomia: 'parcial', agitacion: false, fatiga: false }
  ]
};

export const MOCK_ESCALAS = {
  r1: {
    mec:    [{ fecha: '2025-07-01', valor: 19, condEspeciales: false }, { fecha: '2025-10-01', valor: 22, condEspeciales: false }, { fecha: '2026-01-01', valor: 22, condEspeciales: false }],
    gds:    [{ fecha: '2025-07-01', valor: 11, condEspeciales: false }, { fecha: '2025-10-01', valor: 7,  condEspeciales: false }, { fecha: '2026-01-01', valor: 3,  condEspeciales: false }],
    barthel:[{ fecha: '2025-07-01', valor: 65, condEspeciales: false }, { fecha: '2025-10-01', valor: 75, condEspeciales: false }, { fecha: '2026-01-01', valor: 75, condEspeciales: false }],
    tug:    [{ fecha: '2026-01-01', valor: 18.3 }, { fecha: '2026-02-01', valor: 14.8 }, { fecha: '2026-03-01', valor: 12.1 }, { fecha: '2026-04-01', valor: 11.2 }]
  },
  r2: {
    mec:    [{ fecha: '2025-10-01', valor: 24, condEspeciales: false }, { fecha: '2026-01-01', valor: 25, condEspeciales: false }],
    gds:    [{ fecha: '2025-10-01', valor: 9,  condEspeciales: false }, { fecha: '2026-01-01', valor: 8,  condEspeciales: false }],
    barthel:[{ fecha: '2025-10-01', valor: 80, condEspeciales: false }, { fecha: '2026-01-01', valor: 82, condEspeciales: false }],
    tug:    [{ fecha: '2026-01-01', valor: 22.5 }, { fecha: '2026-03-01', valor: 21.0 }, { fecha: '2026-04-01', valor: 20.8 }]
  },
  r3: {
    mec:    [{ fecha: '2025-10-01', valor: 27, condEspeciales: false }, { fecha: '2026-01-01', valor: 28, condEspeciales: false }],
    gds:    [{ fecha: '2025-10-01', valor: 4,  condEspeciales: false }, { fecha: '2026-01-01', valor: 3,  condEspeciales: false }],
    barthel:[{ fecha: '2025-10-01', valor: 90, condEspeciales: false }, { fecha: '2026-01-01', valor: 92, condEspeciales: false }],
    tug:    [{ fecha: '2026-01-01', valor: 13.2 }, { fecha: '2026-03-01', valor: 11.5 }, { fecha: '2026-04-01', valor: 10.8 }]
  },
  r4: {
    mec:    [{ fecha: '2025-10-01', valor: 25, condEspeciales: false }, { fecha: '2026-01-01', valor: 26, condEspeciales: false }],
    gds:    [{ fecha: '2025-10-01', valor: 6,  condEspeciales: false }, { fecha: '2026-01-01', valor: 5,  condEspeciales: false }],
    barthel:[{ fecha: '2025-10-01', valor: 78, condEspeciales: false }, { fecha: '2026-01-01', valor: 80, condEspeciales: false }],
    tug:    [{ fecha: '2026-01-01', valor: 15.5 }, { fecha: '2026-03-01', valor: 14.2 }, { fecha: '2026-04-01', valor: 13.8 }]
  }
};
