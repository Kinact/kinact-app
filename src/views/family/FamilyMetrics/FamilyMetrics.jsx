import { useState, useMemo } from 'react';
import { fmtFechaCorta } from '../../../utils/formatters';
import FamilyMetricDetail from '../FamilyMetricDetail/FamilyMetricDetail';

// ─── Helpers de mapeo ────────────────────────────────────────────────────────

const AUTONOMIA_PCT   = { autonomo: 100, parcial: 55, dependiente: 20 };
const AUTONOMIA_LABEL = { autonomo: 'Autónoma', parcial: 'Parcial', dependiente: 'Dependiente' };
const ESTADO_LABEL    = { positivo: 'Positivo', neutro: 'Neutro', bajo: 'Bajo' };
const ENG_LABEL       = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };
const ORDEN_STR       = { bajo: 0, dependiente: 0, neutro: 1, parcial: 1, medio: 1, positivo: 2, alto: 2, autonomo: 2 };

function tendenciaNum(prev, last, invertido = false) {
  if (prev == null || last == null) return 'igual';
  const diff = parseFloat(last) - parseFloat(prev);
  if (diff === 0) return 'igual';
  return (invertido ? diff < 0 : diff > 0) ? 'mejora' : 'baja';
}

function tendenciaStr(prev, last) {
  if (!prev || !last) return 'igual';
  const diff = (ORDEN_STR[last] ?? 1) - (ORDEN_STR[prev] ?? 1);
  return diff > 0 ? 'mejora' : diff < 0 ? 'baja' : 'igual';
}

// Construye DATOS_ACTUALES a partir de datos reales
function buildDatos(sesiones, escalas) {
  const last = sesiones[sesiones.length - 1];
  const prev = sesiones[sesiones.length - 2];

  const mecRows     = escalas?.mec     || [];
  const gdsRows     = escalas?.gds     || [];
  const barthelRows = escalas?.barthel || [];
  const tugRows     = escalas?.tug     || [];

  const mecLast     = mecRows[mecRows.length - 1];
  const gdsLast     = gdsRows[gdsRows.length - 1];
  const barthelLast = barthelRows[barthelRows.length - 1];
  const tugLast     = tugRows[tugRows.length - 1];

  const gdsLabel = gdsLast
    ? (gdsLast.valor <= 5 ? 'Sin síntomas' : gdsLast.valor <= 10 ? 'Tristeza leve' : 'Tristeza moderada')
    : 'Sin datos';
  const barthelLabel = barthelLast
    ? (barthelLast.valor >= 91 ? 'Independiente' : barthelLast.valor >= 61 ? 'Leve ayuda' : 'Necesita apoyo')
    : 'Sin datos';
  const tugLabel = tugLast
    ? (tugLast.valor <= 12 ? 'Muy bien' : tugLast.valor <= 20 ? 'Precaución' : 'Riesgo caídas')
    : 'Sin datos';

  return {
    turnos:                   { valor: last?.gapsCompletados ?? '—',                 tendencia: tendenciaNum(prev?.gapsCompletados, last?.gapsCompletados) },
    colaboraciones:           { valor: last?.intercambios    ?? '—',                 tendencia: tendenciaNum(prev?.intercambios,    last?.intercambios) },
    autonomia_juego:          { valor: last ? `${AUTONOMIA_PCT[last.autonomia] ?? 55}%` : '—', tendencia: tendenciaNum(AUTONOMIA_PCT[prev?.autonomia], AUTONOMIA_PCT[last?.autonomia]) },
    estado_animo:             { valor: last ? (ESTADO_LABEL[last.estado] ?? '—')    : '—',     tendencia: tendenciaStr(prev?.estado,      last?.estado) },
    engagement:               { valor: last ? (ENG_LABEL[last.engagement] ?? '—')  : '—',     tendencia: tendenciaStr(prev?.engagement,  last?.engagement) },
    autonomia_general:        { valor: last ? (AUTONOMIA_LABEL[last.autonomia] ?? '—') : '—', tendencia: tendenciaStr(prev?.autonomia,   last?.autonomia) },
    memoria:                  { valor: mecLast     ? `${mecLast.valor}/30`           : 'Sin datos', tendencia: tendenciaNum(mecRows[mecRows.length - 2]?.valor,     mecLast?.valor) },
    estado_emocional_clinico: { valor: gdsLabel,                                                    tendencia: tendenciaNum(gdsRows[gdsRows.length - 2]?.valor,     gdsLast?.valor, true) },
    autonomia_diaria:         { valor: barthelLabel,                                               tendencia: tendenciaNum(barthelRows[barthelRows.length - 2]?.valor, barthelLast?.valor) },
    movilidad:                { valor: tugLabel,                                                    tendencia: tendenciaNum(tugRows[tugRows.length - 2]?.valor,      tugLast?.valor, true) }
  };
}

// Construye el historial por métrica para FamilyMetricDetail
function buildHistorialPorMetrica(sesiones, escalas) {
  const ultimas = sesiones.slice(-7); // hasta 7 sesiones en el gráfico

  return {
    turnos:            ultimas.map(s => ({ fecha: fmtFechaCorta(s.fecha), valor: s.gapsCompletados })),
    colaboraciones:    ultimas.map(s => ({ fecha: fmtFechaCorta(s.fecha), valor: s.intercambios })),
    autonomia_juego:   ultimas.map(s => ({ fecha: fmtFechaCorta(s.fecha), valor: AUTONOMIA_PCT[s.autonomia] ?? 55 })),
    estado_animo:      ultimas.map(s => ({ fecha: fmtFechaCorta(s.fecha), valor: ESTADO_LABEL[s.estado] ?? 'Neutro' })),
    engagement:        ultimas.map(s => ({ fecha: fmtFechaCorta(s.fecha), valor: ENG_LABEL[s.engagement] ?? 'Medio' })),
    autonomia_general: ultimas.map(s => ({ fecha: fmtFechaCorta(s.fecha), valor: AUTONOMIA_LABEL[s.autonomia] ?? 'Parcial' })),
    memoria:           (escalas?.mec     || []).map(m => ({ fecha: fmtFechaCorta(m.fecha), valor: m.valor })),
    estado_emocional_clinico: (escalas?.gds || []).map(g => ({ fecha: fmtFechaCorta(g.fecha), valor: g.valor })),
    autonomia_diaria:  (escalas?.barthel || []).map(b => ({ fecha: fmtFechaCorta(b.fecha), valor: b.valor })),
    movilidad:         (escalas?.tug     || []).map(t => ({ fecha: fmtFechaCorta(t.fecha), valor: t.valor }))
  };
}

// ─── Bloques de métricas ─────────────────────────────────────────────────────

const BLOQUES = [
  {
    id: 'juego',
    titulo: 'Durante el juego',
    metricas: [
      { id: 'turnos',          titulo: 'Piezas colocadas',              subtitulo: 'Participación activa en la sesión' },
      { id: 'colaboraciones',  titulo: 'Colaboraciones con el grupo',   subtitulo: 'Intercambios realizados esta sesión' },
      { id: 'autonomia_juego', titulo: 'Decisiones por su cuenta',      subtitulo: 'Sin necesitar ayuda del equipo' }
    ]
  },
  {
    id: 'observacional',
    titulo: 'Cómo se encuentra',
    metricas: [
      { id: 'estado_animo',      titulo: 'Estado de ánimo',         subtitulo: 'Valorado por el equipo en cada sesión' },
      { id: 'engagement',        titulo: 'Participación e interés', subtitulo: 'Nivel de implicación durante el juego' },
      { id: 'autonomia_general', titulo: 'Autonomía general',       subtitulo: 'Percepción del equipo sobre su independencia' }
    ]
  },
  {
    id: 'clinica',
    titulo: 'Evaluaciones del equipo clínico',
    subtituloBloq: 'Realizadas periódicamente por los profesionales del centro',
    metricas: [
      { id: 'memoria',                  titulo: 'Memoria y atención',       subtitulo: 'Test cognitivo (MEC)' },
      { id: 'estado_emocional_clinico', titulo: 'Estado emocional clínico', subtitulo: 'Escala GDS-15' },
      { id: 'autonomia_diaria',         titulo: 'Autonomía en el día a día', subtitulo: 'Escala de Barthel' },
      { id: 'movilidad',                titulo: 'Movilidad y equilibrio',   subtitulo: 'Test TUG (segundos)' }
    ]
  }
];

const TENDENCIA_LABEL = { mejora: '↑ mejora', igual: '→ estable', baja: '↓ descenso' };
const TENDENCIA_COLOR = { mejora: '#16a34a', igual: '#6b7280', baja: '#dc2626' };

function getColorValor(tendencia) {
  return tendencia === 'mejora' ? '#16a34a' : tendencia === 'baja' ? '#dc2626' : '#6b7280';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FamilyMetrics({ residenteNombre = '', historialSesiones = [], escalas = {}, onBack }) {
  const [metricaDetalle, setMetricaDetalle] = useState(null);

  const datos = useMemo(() => buildDatos(historialSesiones, escalas), [historialSesiones, escalas]);
  const historialPorMetrica = useMemo(() => buildHistorialPorMetrica(historialSesiones, escalas), [historialSesiones, escalas]);

  if (metricaDetalle !== null) {
    return (
      <FamilyMetricDetail
        metricaId={metricaDetalle}
        residenteNombre={residenteNombre}
        historialData={historialPorMetrica[metricaDetalle]}
        onBack={() => setMetricaDetalle(null)}
      />
    );
  }

  return (
    <div style={{
      maxWidth: 420, margin: '0 auto', background: '#f9fafb', padding: 16,
      display: 'flex', flexDirection: 'column', gap: 14,
      minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'inherit'
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
            Seguimiento de {residenteNombre}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            Actualizado tras cada sesión
          </div>
        </div>
      </div>

      {/* BLOQUES */}
      {BLOQUES.map(bloque => (
        <div key={bloque.id} style={{
          background: 'white', borderRadius: 12, border: '0.5px solid #e5e7eb',
          padding: 12, display: 'flex', flexDirection: 'column', gap: 2
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', marginBottom: 8 }}>
            {bloque.titulo}
          </div>
          {bloque.subtituloBloq && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: -4, marginBottom: 8 }}>
              {bloque.subtituloBloq}
            </div>
          )}

          {bloque.metricas.map((metrica, index) => {
            const dato    = datos[metrica.id];
            const esUltimo = index === bloque.metricas.length - 1;
            return (
              <div
                key={metrica.id}
                onClick={() => setMetricaDetalle(metrica.id)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 0', cursor: 'pointer',
                  borderBottom: esUltimo ? 'none' : '0.5px solid #f3f4f6'
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: '#111827' }}>{metrica.titulo}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{metrica.subtitulo}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: getColorValor(dato?.tendencia) }}>
                      {dato?.valor ?? '—'}
                    </div>
                    <div style={{ fontSize: 10, color: TENDENCIA_COLOR[dato?.tendencia] || '#6b7280', marginTop: 1 }}>
                      {TENDENCIA_LABEL[dato?.tendencia] || '→ estable'}
                    </div>
                  </div>
                  <span style={{ fontSize: 14, color: '#d1d5db' }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
