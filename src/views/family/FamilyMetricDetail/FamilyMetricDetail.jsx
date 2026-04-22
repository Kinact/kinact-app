// ─── Metric config ────────────────────────────────────────────────────────────

const METRICAS = {
  turnos: {
    titulo: 'Turnos completados', grupo: 'juego', unidad: ' turnos',
    descripcion: 'El número de veces que {nombre} participó activamente durante la sesión de juego, cogiendo y colocando piezas en su tablero.',
    comoSeMide: 'El auxiliar registra automáticamente cada turno completado durante el juego en tiempo real.',
    escala: [
      { label: '16 o más · Participación muy activa', nivel: 'bien' },
      { label: '10 a 15 · Participación normal',      nivel: 'regular' },
      { label: 'Menos de 10 · Participación baja',    nivel: 'atencion' }
    ]
  },
  colaboraciones: {
    titulo: 'Colaboraciones con el grupo', grupo: 'juego', unidad: ' intercambios',
    descripcion: 'El número de veces que {nombre} decidió intercambiar una pieza con otro participante. Cada intercambio implica comunicación, negociación y toma de decisiones sociales.',
    comoSeMide: 'El auxiliar registra cada intercambio en tiempo real, anotando si fue por iniciativa propia o con orientación del equipo.',
    escala: [
      { label: '4 o más · Participación social activa', nivel: 'bien' },
      { label: '2 a 3 · Participación con apoyo',       nivel: 'regular' },
      { label: '0 a 1 · Poca interacción social',       nivel: 'atencion' }
    ]
  },
  autonomia_juego: {
    titulo: 'Decisiones por su cuenta', grupo: 'juego', unidad: '%',
    descripcion: 'El porcentaje de intercambios y decisiones que {nombre} tomó de forma independiente, sin necesitar orientación del equipo.',
    comoSeMide: 'Por cada acción del juego, el auxiliar indica si fue autónoma o con ayuda. Se calcula el porcentaje de autonomía al final.',
    escala: [
      { label: '70% o más · Alta autonomía',           nivel: 'bien' },
      { label: '40% a 69% · Autonomía con apoyo',      nivel: 'regular' },
      { label: 'Menos de 40% · Necesita orientación',  nivel: 'atencion' }
    ]
  },
  estado_animo: {
    titulo: 'Estado de ánimo', grupo: 'observacional', unidad: '',
    descripcion: 'La valoración del equipo sobre cómo se encontraba {nombre} durante la sesión: su expresión, nivel de energía y bienestar general.',
    comoSeMide: 'Al finalizar cada sesión, el auxiliar valora el estado emocional observado en tres niveles: bajo, neutro o positivo.',
    escala: [
      { label: 'Positivo · Buen ánimo y energía',          nivel: 'bien' },
      { label: 'Neutro · Estado tranquilo y estable',       nivel: 'regular' },
      { label: 'Bajo · Necesita atención emocional',        nivel: 'atencion' }
    ]
  },
  engagement: {
    titulo: 'Participación e interés', grupo: 'observacional', unidad: '',
    descripcion: 'El nivel de implicación y entusiasmo de {nombre} durante el juego: si estaba atenta, motivada y conectada con lo que ocurría en la mesa.',
    comoSeMide: 'El auxiliar evalúa al final de cada sesión el nivel de interés observado en tres niveles: bajo, medio o alto.',
    escala: [
      { label: 'Alto · Muy implicada y motivada',   nivel: 'bien' },
      { label: 'Medio · Participación normal',       nivel: 'regular' },
      { label: 'Bajo · Poco interés observado',      nivel: 'atencion' }
    ]
  },
  autonomia_general: {
    titulo: 'Autonomía general', grupo: 'observacional', unidad: '',
    descripcion: 'La percepción del equipo sobre la capacidad de {nombre} para tomar decisiones y desenvolverse de forma independiente durante toda la sesión.',
    comoSeMide: 'El auxiliar valora al final de cada sesión en tres niveles: dependiente (necesitó apoyo constante), parcial o autónoma.',
    escala: [
      { label: 'Autónoma · Se desenvuelve sola',          nivel: 'bien' },
      { label: 'Parcial · Con algo de ayuda',              nivel: 'regular' },
      { label: 'Dependiente · Necesita apoyo constante',   nivel: 'atencion' }
    ]
  },
  memoria: {
    titulo: 'Memoria y atención', grupo: 'clinica', unidad: '/30',
    descripcion: 'Una evaluación realizada por el equipo clínico sobre la memoria, orientación, atención y lenguaje de {nombre}. Refleja su estado cognitivo general.',
    comoSeMide: 'El equipo clínico realiza una prueba sencilla con preguntas y tareas cortas. Se hace cada tres meses. La puntuación va de 0 a 30.',
    escala: [
      { label: '27 a 30 · Funcionamiento normal', nivel: 'bien' },
      { label: '24 a 26 · Zona de atención',       nivel: 'regular' },
      { label: '23 o menos · Deterioro cognitivo', nivel: 'atencion' }
    ]
  },
  estado_emocional_clinico: {
    titulo: 'Estado emocional clínico', grupo: 'clinica', unidad: '/15', invertido: true,
    descripcion: 'Una evaluación específica sobre la presencia de síntomas de tristeza, desánimo o depresión en {nombre}, realizada por el equipo clínico.',
    comoSeMide: 'El equipo hace 15 preguntas sencillas de sí o no sobre cómo se ha sentido la semana anterior. Puntuación de 0 a 15. Menor puntuación es mejor.',
    escala: [
      { label: '0 a 5 · Sin síntomas de tristeza', nivel: 'bien' },
      { label: '6 a 10 · Tristeza leve',            nivel: 'regular' },
      { label: '11 a 15 · Tristeza moderada',        nivel: 'atencion' }
    ]
  },
  autonomia_diaria: {
    titulo: 'Autonomía en el día a día', grupo: 'clinica', unidad: '/100',
    descripcion: 'Una valoración clínica de la capacidad de {nombre} para realizar actividades cotidianas como comer, vestirse, asearse y desplazarse.',
    comoSeMide: 'El equipo clínico evalúa 10 actividades básicas de la vida diaria, puntuando cada una. El resultado va de 0 a 100. Mayor puntuación es mejor.',
    escala: [
      { label: '91 a 100 · Totalmente independiente',        nivel: 'bien' },
      { label: '61 a 90 · Leve dependencia',                 nivel: 'regular' },
      { label: '60 o menos · Necesita ayuda significativa',  nivel: 'atencion' }
    ]
  },
  movilidad: {
    titulo: 'Movilidad y equilibrio', grupo: 'clinica', unidad: ' segundos', invertido: true,
    descripcion: 'La capacidad de {nombre} para levantarse de una silla, caminar unos metros, girar y volver a sentarse. Refleja su fuerza, equilibrio y agilidad general.',
    comoSeMide: 'El equipo cronometra el tiempo que tarda en completar este recorrido. Se realiza una vez al mes. Cuanto menos segundos tarde, mejor es su movilidad.',
    escala: [
      { label: 'Menos de 12s · Movilidad muy buena',     nivel: 'bien' },
      { label: '12 a 20s · Movilidad con precaución',    nivel: 'regular' },
      { label: 'Más de 20s · Mayor riesgo de caídas',    nivel: 'atencion' }
    ]
  }
};

const HISTORIAL_MOCK = {
  turnos:                   [{ fecha: '10 ene', valor: 11 }, { fecha: '31 mar', valor: 15 }, { fecha: '7 abr', valor: 18 }, { fecha: '14 abr', valor: 19 }],
  colaboraciones:           [{ fecha: '10 ene', valor: 1  }, { fecha: '31 mar', valor: 3  }, { fecha: '7 abr', valor: 4  }, { fecha: '14 abr', valor: 5  }],
  autonomia_juego:          [{ fecha: '10 ene', valor: 40 }, { fecha: '31 mar', valor: 55 }, { fecha: '7 abr', valor: 68 }, { fecha: '14 abr', valor: 78 }],
  estado_animo:             [{ fecha: '10 ene', valor: 'Bajo' }, { fecha: '31 mar', valor: 'Neutro' }, { fecha: '7 abr', valor: 'Positivo' }, { fecha: '14 abr', valor: 'Positivo' }],
  engagement:               [{ fecha: '10 ene', valor: 'Bajo' }, { fecha: '31 mar', valor: 'Medio'  }, { fecha: '7 abr', valor: 'Alto'     }, { fecha: '14 abr', valor: 'Alto'     }],
  autonomia_general:        [{ fecha: '10 ene', valor: 'Dependiente' }, { fecha: '31 mar', valor: 'Parcial' }, { fecha: '7 abr', valor: 'Autónoma' }, { fecha: '14 abr', valor: 'Autónoma' }],
  memoria:                  [{ fecha: 'Jul 2025', valor: 19 }, { fecha: 'Oct 2025', valor: 22 }, { fecha: 'Ene 2026', valor: 22 }],
  estado_emocional_clinico: [{ fecha: 'Jul 2025', valor: 11 }, { fecha: 'Oct 2025', valor: 7  }, { fecha: 'Ene 2026', valor: 3  }],
  autonomia_diaria:         [{ fecha: 'Jul 2025', valor: 65 }, { fecha: 'Oct 2025', valor: 75 }, { fecha: 'Ene 2026', valor: 75 }],
  movilidad:                [{ fecha: 'Ene 2026', valor: 18.3 }, { fecha: 'Feb 2026', valor: 14.8 }, { fecha: 'Mar 2026', valor: 12.1 }, { fecha: 'Abr 2026', valor: 11.2 }]
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNivel(metricaId, valor) {
  const TEXTO = { Positivo:'bien', Alto:'bien', Autónoma:'bien', Neutro:'regular', Medio:'regular', Parcial:'regular', Bajo:'atencion', Dependiente:'atencion' };
  if (typeof valor === 'string' && TEXTO[valor]) return TEXTO[valor];
  const n = parseFloat(valor);
  if (metricaId === 'turnos')                   return n >= 16 ? 'bien' : n >= 10 ? 'regular' : 'atencion';
  if (metricaId === 'colaboraciones')           return n >= 4  ? 'bien' : n >= 2  ? 'regular' : 'atencion';
  if (metricaId === 'autonomia_juego')          return n >= 70 ? 'bien' : n >= 40 ? 'regular' : 'atencion';
  if (metricaId === 'memoria')                  return n >= 27 ? 'bien' : n >= 24 ? 'regular' : 'atencion';
  if (metricaId === 'estado_emocional_clinico') return n <=  5 ? 'bien' : n <= 10 ? 'regular' : 'atencion';
  if (metricaId === 'autonomia_diaria')         return n >= 91 ? 'bien' : n >= 61 ? 'regular' : 'atencion';
  if (metricaId === 'movilidad')                return n <  12 ? 'bien' : n <= 20 ? 'regular' : 'atencion';
  return 'regular';
}

const COLOR_NIVEL = {
  bien:     { bg: '#dcfce7', border: '#86efac', text: '#166534', dot: '#16a34a' },
  regular:  { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', dot: '#d97706' },
  atencion: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', dot: '#dc2626' }
};

const TENDENCIA_LABEL = { mejora: '↑ mejora', igual: '→ estable', baja: '↓ descenso' };
const TENDENCIA_COLOR = { mejora: '#16a34a', igual: '#6b7280', baja: '#dc2626' };

const ORDEN_TEXTO = { Bajo: 0, Dependiente: 0, Neutro: 1, Parcial: 1, Positivo: 2, Alto: 2, Autónoma: 2 };

function getTendencia(historial, invertido) {
  if (historial.length < 2) return null;
  const ult = historial[historial.length - 1].valor;
  const ant = historial[historial.length - 2].valor;
  if (typeof ult === 'string') {
    const diff = (ORDEN_TEXTO[ult] ?? 1) - (ORDEN_TEXTO[ant] ?? 1);
    return diff > 0 ? 'mejora' : diff < 0 ? 'baja' : 'igual';
  }
  const diff = parseFloat(ult) - parseFloat(ant);
  if (diff === 0) return 'igual';
  return (invertido ? diff < 0 : diff > 0) ? 'mejora' : 'baja';
}

function getBarraAncho(historial, index, invertido) {
  const nums = historial.map(h => parseFloat(h.valor)).filter(v => !isNaN(v));
  if (!nums.length) return '60%';
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const v   = parseFloat(historial[index].valor);
  if (isNaN(v) || max === min) return '60%';
  const pct = invertido
    ? ((max - v) / (max - min)) * 80 + 20
    : ((v - min) / (max - min)) * 80 + 20;
  return Math.round(pct) + '%';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FamilyMetricDetail({ metricaId, residenteNombre = '', historialData, onBack }) {
  const metrica        = METRICAS[metricaId];
  const historial      = (historialData && historialData.length > 0) ? historialData : (HISTORIAL_MOCK[metricaId] || []);
  const ultimoValor    = historial[historial.length - 1]?.valor;
  const nivelActual    = getNivel(metricaId, ultimoValor);
  const colores        = COLOR_NIVEL[nivelActual];
  const tendencia      = getTendencia(historial, metrica?.invertido);
  const esTextual      = typeof ultimoValor === 'string' && isNaN(parseFloat(ultimoValor));
  const descripcion    = metrica?.descripcion?.replace('{nombre}', residenteNombre) || '';
  const comoSeMide     = metrica?.comoSeMide || '';

  const notaFinal = {
    bien:     `${residenteNombre} está en el nivel óptimo y muestra una evolución positiva.`,
    regular:  `El equipo está trabajando para mejorar este indicador con ${residenteNombre}.`,
    atencion: `El equipo tiene este indicador bajo seguimiento especial.`
  }[nivelActual];

  return (
    <div style={{
      maxWidth: 420, margin: '0 auto', background: '#f9fafb', padding: 16,
      display: 'flex', flexDirection: 'column', gap: 14,
      minHeight: '100vh', overflowY: 'auto', boxSizing: 'border-box', fontFamily: 'inherit'
    }}>

      {/* CABECERA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            width: 28, height: 28, borderRadius: '50%', background: 'white',
            border: '0.5px solid #e5e7eb', fontSize: 14, color: '#6b7280',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}
        >‹</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>
            {metrica?.titulo}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            Seguimiento de {residenteNombre}
          </div>
        </div>
      </div>

      {/* BLOQUE 1 — Dato actual */}
      <div style={{
        background: colores.bg, borderRadius: 12, padding: 14,
        border: `0.5px solid ${colores.border}`,
        display: 'flex', flexDirection: 'column', gap: 4, minHeight: 80
      }}>
        <div style={{
          fontSize: esTextual ? 24 : 30, fontWeight: 500, color: colores.text
        }}>
          {ultimoValor != null ? `${ultimoValor}${esTextual ? '' : (metrica?.unidad || '')}` : '—'}
        </div>
        {tendencia && (
          <div style={{ fontSize: 12, color: TENDENCIA_COLOR[tendencia] }}>
            {TENDENCIA_LABEL[tendencia]}
            {tendencia !== null && !esTextual && historial.length > 1 && (
              <span style={{ color: '#9ca3af' }}>
                {' · desde '}
                {historial[0].valor}{metrica?.unidad || ''}
                {' al inicio'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* BLOQUE 2 — Qué mide */}
      <div style={{
        background: 'white', borderRadius: 12, padding: 14,
        border: '0.5px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', gap: 6, minHeight: 90
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>¿Qué mide?</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{descripcion}</div>
      </div>

      {/* BLOQUE 3 — Cómo se mide */}
      <div style={{
        background: 'white', borderRadius: 12, padding: 14,
        border: '0.5px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', gap: 6, minHeight: 90
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>¿Cómo se mide?</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{comoSeMide}</div>
      </div>

      {/* BLOQUE 4 — Historial */}
      <div style={{
        background: 'white', borderRadius: 12, padding: 14,
        border: '0.5px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>Historial</div>
        {historial.map((h, i) => {
          const nivel = getNivel(metricaId, h.valor);
          const c     = COLOR_NIVEL[nivel];
          const ancho = getBarraAncho(historial, i, metrica?.invertido);
          const esUlt = i === historial.length - 1;
          return (
            <div key={i} style={{ height: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#9ca3af', width: 56, flexShrink: 0 }}>
                {h.fecha}
              </span>
              <div style={{ flex: 1, position: 'relative', height: 8 }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  width: ancho, borderRadius: 4, background: c.dot,
                  fontWeight: esUlt ? 500 : 400
                }} />
              </div>
              <span style={{
                fontSize: 11, color: c.text, width: 52, textAlign: 'right',
                flexShrink: 0, fontWeight: esUlt ? 600 : 400
              }}>
                {typeof h.valor === 'string' ? h.valor : `${h.valor}${metrica?.unidad || ''}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* BLOQUE 5 — Escala de referencia */}
      <div style={{
        background: 'white', borderRadius: 12, padding: 14,
        border: '0.5px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', gap: 6, minHeight: 140
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>
          ¿Qué significa este resultado?
        </div>
        {metrica?.escala.map((item) => {
          const c       = COLOR_NIVEL[item.nivel];
          const esActual = nivelActual === item.nivel;
          return (
            <div key={item.nivel} style={{
              padding: '8px 10px', borderRadius: 8,
              background: c.bg,
              border: esActual ? `1.5px solid ${c.dot}` : `0.5px solid ${c.border}`,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: c.text, flex: 1 }}>{item.label}</span>
              {esActual && (
                <span style={{
                  fontSize: 10, padding: '2px 6px', background: c.dot,
                  color: 'white', borderRadius: 10, flexShrink: 0
                }}>
                  ← ahora
                </span>
              )}
            </div>
          );
        })}
        <div style={{
          marginTop: 8, paddingTop: 8, borderTop: '0.5px solid #f3f4f6',
          fontSize: 11, color: '#9ca3af', lineHeight: 1.5
        }}>
          {notaFinal}
        </div>
      </div>

    </div>
  );
}
