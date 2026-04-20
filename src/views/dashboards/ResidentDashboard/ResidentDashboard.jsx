import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_RESIDENTS, MOCK_SESSION_HISTORY, MOCK_ESCALAS } from '../../../data/mockData';
import { TABLERO_COLORS } from '../../../constants/tableros';
import { fmtFecha, fmtFechaCorta } from '../../../utils/formatters';

// ─── Colores ──────────────────────────────────────────────────────────────────

const HEAT = {
  estado:    { bajo: '#fca5a5',      neutro: '#bfdbfe',   positivo: '#86efac' },
  engagement:{ bajo: '#fca5a5',      medio: '#fcd34d',    alto: '#86efac'     },
  autonomia: { dependiente: '#fca5a5', parcial: '#fcd34d', autonomo: '#86efac' },
  agitacion: { true: '#fca5a5',      false: '#86efac'                         }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function heatColor(campo, valor) {
  const map = HEAT[campo];
  if (!map) return '#e5e7eb';
  return map[String(valor)] || '#e5e7eb';
}

function tendenciaColor(t, inversa = false) {
  if (t === '→') return '#6b7280';
  const bueno = inversa ? '↓' : '↑';
  return t === bueno ? '#16a34a' : '#dc2626';
}

function calcTendencia(arr, campo, inversa = false) {
  if (!arr || arr.length < 2) return '→';
  const v1 = arr[0][campo];
  const vN = arr[arr.length - 1][campo];
  if (typeof vN === 'number') {
    if (vN > v1) return inversa ? '↓' : '↑';
    if (vN < v1) return inversa ? '↑' : '↓';
    return '→';
  }
  const orden = { bajo: 0, neutro: 1, positivo: 2, dependiente: 0, parcial: 1, autonomo: 2 };
  const o1 = orden[v1] ?? -1;
  const oN = orden[vN] ?? -1;
  if (oN > o1) return inversa ? '↓' : '↑';
  if (oN < o1) return inversa ? '↑' : '↓';
  return '→';
}

// Colores de valor clínico
function colorMEC(v)    { if (v < 23) return '#dc2626'; if (v < 27) return '#d97706'; return '#16a34a'; }
function colorGDS(v)    { if (v >= 11) return '#dc2626'; if (v >= 6) return '#d97706'; return '#16a34a'; }
function colorBarthel(v){ if (v < 21) return '#dc2626'; if (v < 61) return '#d97706'; if (v < 91) return '#f59e0b'; return '#16a34a'; }
function colorTUG(v)    { if (v > 20) return '#dc2626'; if (v > 12) return '#d97706'; return '#16a34a'; }

function interpretaMEC(v)    { if (v < 23) return 'Deterioro'; if (v < 27) return 'Leve'; return 'Normal'; }
function interpretaGDS(v)    { if (v >= 11) return 'Dep. severa'; if (v >= 6) return 'Dep. moderada'; return 'Normal'; }
function interpretaBarthel(v){ if (v < 21) return 'Dependencia total'; if (v < 61) return 'Dep. severa'; if (v < 91) return 'Dep. moderada'; return 'Independiente'; }
function interpretaTUG(v)    { if (v > 20) return 'Alto riesgo'; if (v > 12) return 'Riesgo moderado'; return 'Normal'; }

const ESCALAS_DEF = [
  { id: 'mec',     nombre: 'MEC',     desc: 'Mini Examen Cognoscitivo', colorFn: colorMEC,     interpFn: interpretaMEC,     unidad: 'pts',  inversa: false },
  { id: 'gds',     nombre: 'GDS-15',  desc: 'Escala de depresión geriátrica', colorFn: colorGDS, interpFn: interpretaGDS, unidad: 'pts',  inversa: true  },
  { id: 'barthel', nombre: 'Barthel', desc: 'Índice de dependencia funcional', colorFn: colorBarthel, interpFn: interpretaBarthel, unidad: 'pts', inversa: false },
  { id: 'tug',     nombre: 'TUG',     desc: 'Timed Up and Go (movilidad)',     colorFn: colorTUG, interpFn: interpretaTUG, unidad: 's',   inversa: true  }
];

// ─── ResidentDashboard ────────────────────────────────────────────────────────

export default function ResidentDashboard() {
  const { navigateTo, selectedResidentId } = useApp();
  const [escalaAbierta, setEscalaAbierta] = useState(null);

  const residenteId = selectedResidentId || 'r1';
  const residente   = MOCK_RESIDENTS.find(r => r.id === residenteId);
  const historial   = MOCK_SESSION_HISTORY[residenteId] || [];
  const escalas     = MOCK_ESCALAS[residenteId] || {};

  if (!residente) return null;

  const coloresTablero = TABLERO_COLORS[residente.tableroHabitual] || TABLERO_COLORS.casa;

  // ── Cálculos de métricas ──
  const asistencia       = historial.length > 0 ? Math.round((historial.length / 13) * 100) : 0;
  const gapsMedia        = historial.length > 0 ? (historial.reduce((s, h) => s + h.gapsCompletados, 0) / historial.length).toFixed(1) : '0';
  const intercambiosMedia= historial.length > 0 ? (historial.reduce((s, h) => s + h.intercambios, 0) / historial.length).toFixed(1) : '0';
  const mediacionesMedia = historial.length > 0 ? (historial.reduce((s, h) => s + h.mediaciones, 0) / historial.length).toFixed(1) : '0';
  const s1               = historial[0];
  const sN               = historial[historial.length - 1];
  const tendenciaGaps    = sN && s1 ? (sN.gapsCompletados > s1.gapsCompletados ? '↑' : sN.gapsCompletados < s1.gapsCompletados ? '↓' : '→') : '→';
  const tendenciaMed     = calcTendencia(historial, 'mediaciones', true);

  const METRICAS = [
    {
      valor: `${asistencia}%`,
      label: 'Asistencia',
      sub: `${historial.length} sesiones registradas`,
      tend: calcTendencia(historial, 'gapsCompletados'),
      inversa: false
    },
    {
      valor: gapsMedia,
      label: 'Gaps / sesión',
      sub: s1 ? `↑ desde ${s1.gapsCompletados} en sesión 1` : '',
      tend: tendenciaGaps,
      inversa: false
    },
    {
      valor: intercambiosMedia,
      label: 'Intercambios / sesión',
      sub: 'Media de intercambios',
      tend: calcTendencia(historial, 'intercambios'),
      inversa: false
    },
    {
      valor: mediacionesMedia,
      label: 'Mediaciones / sesión',
      sub: '↓ es señal de mejora',
      tend: tendenciaMed,
      inversa: true
    }
  ];

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', padding: 16, overflowY: 'auto' }}>
      <div style={{
        maxWidth: 900, margin: '0 auto',
        background: 'white', borderRadius: 16,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 14
      }}>

        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 600, color: '#1d4ed8', flexShrink: 0
            }}>
              {residente.iniciales}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{residente.nombre}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                Sesión {residente.sesiones} &nbsp;·&nbsp; Incorporado: {fmtFecha(residente.incorporacion, 'd MMM yyyy')} &nbsp;·&nbsp; Tablero habitual:&nbsp;
                <span style={{ fontWeight: 500, color: coloresTablero.text }}>{residente.tableroHabitual}</span>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnBase()}>Exportar PDF</button>
            <button onClick={() => navigateTo('clinical-scales')} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>Añadir escala clínica</button>
          </div>
        </div>

        {/* ── 4 Métricas clave ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {METRICAS.map(m => (
            <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>{m.valor}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: tendenciaColor(m.tend, m.inversa) }}>{m.tend}</span>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{m.label}</div>
              {m.sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{m.sub}</div>}
            </div>
          ))}
        </div>

        {/* ── Zona central 2 columnas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>

          {/* Mapa de calor */}
          <div style={cardStyle}>
            <div style={titleStyle}>Evolución por sesión</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {[
                { campo: 'estado',     label: 'Estado' },
                { campo: 'engagement', label: 'Engagement' },
                { campo: 'autonomia',  label: 'Autonomía' },
                { campo: 'agitacion',  label: 'Agitación' }
              ].map(({ campo, label }) => {
                const tend = campo === 'agitacion'
                  ? calcTendencia(historial, campo, true)
                  : calcTendencia(historial, campo, campo === 'agitacion');
                return (
                  <div key={campo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 72, textAlign: 'right', fontSize: 11, color: '#6b7280', flexShrink: 0 }}>
                      {label}
                    </span>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {historial.map((h, i) => (
                        <div
                          key={i}
                          title={`S${h.sesion}: ${String(h[campo])}`}
                          style={{
                            width: 14, height: 8,
                            borderRadius: 2,
                            background: heatColor(campo, h[campo])
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tendenciaColor(tend, campo === 'agitacion'), marginLeft: 2 }}>
                      {tend}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Leyenda */}
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              {[
                { color: '#fca5a5', label: 'Bajo / Sí' },
                { color: '#fcd34d', label: 'Medio / Parcial' },
                { color: '#bfdbfe', label: 'Neutro' },
                { color: '#86efac', label: 'Alto / Positivo' }
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9ca3af' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Escalas clínicas */}
          <div style={cardStyle}>
            <div style={titleStyle}>Escalas clínicas validadas</div>

            <div style={{ marginTop: 8 }}>
              {ESCALAS_DEF.map((def, idx) => {
                const datos  = escalas[def.id] || [];
                const ultimo = datos[datos.length - 1];
                const penult = datos[datos.length - 2];
                const abierta = escalaAbierta === def.id;
                const esTUG   = def.id === 'tug';
                const tend    = datos.length >= 2
                  ? (ultimo.valor < penult.valor
                      ? (def.inversa ? '↑' : '↓')
                      : ultimo.valor > penult.valor
                        ? (def.inversa ? '↓' : '↑')
                        : '→')
                  : '—';

                return (
                  <div
                    key={def.id}
                    onClick={() => setEscalaAbierta(a => a === def.id ? null : def.id)}
                    style={{
                      borderBottom: idx < ESCALAS_DEF.length - 1 ? '0.5px solid #f3f4f6' : 'none',
                      padding: '8px 0',
                      cursor: 'pointer',
                      ...(esTUG ? { background: '#eff6ff', borderRadius: 6, padding: 8 } : {})
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{def.nombre}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{def.desc}</div>
                      </div>
                      {ultimo && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: def.colorFn(ultimo.valor) }}>
                            {ultimo.valor}{def.unidad}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: tendenciaColor(tend, def.inversa) }}>
                            {tend}
                          </span>
                        </div>
                      )}
                      {!ultimo && <span style={{ fontSize: 11, color: '#9ca3af' }}>Sin datos</span>}
                    </div>

                    {/* Historial expandible */}
                    {abierta && datos.length > 0 && (
                      <div style={{ marginTop: 6, paddingLeft: 4 }}>
                        {datos.map((d, i) => {
                          const prev = datos[i - 1];
                          const t = prev
                            ? d.valor < prev.valor
                              ? (def.inversa ? '↑' : '↓')
                              : d.valor > prev.valor
                                ? (def.inversa ? '↓' : '↑')
                                : '→'
                            : '—';
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '3px 0', borderTop: i > 0 ? '0.5px solid #f3f4f6' : 'none' }}>
                              <span style={{ color: '#9ca3af' }}>{fmtFecha(d.fecha)}</span>
                              <span style={{ fontWeight: 600, color: def.colorFn(d.valor) }}>{d.valor}{def.unidad}</span>
                              <span style={{ color: '#6b7280' }}>{def.interpFn(d.valor)}</span>
                              <span style={{ fontWeight: 600, color: tendenciaColor(t, def.inversa) }}>{t}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Última recomendación */}
            {sN && (
              <div style={{ background: '#f0fdf4', borderRadius: 6, padding: 8, marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#15803d', marginBottom: 3 }}>Última recomendación</div>
                <div style={{ fontSize: 10, color: '#166534', lineHeight: 1.4 }}>
                  {sN.autonomia === 'autonomo' && sN.estado === 'positivo'
                    ? 'Mantener el nivel. Excelente progresión.'
                    : sN.mediaciones > 3
                      ? 'Considerar ejercicios de negociación grupal.'
                      : 'Buena evolución. Continuar programa actual.'}
                </div>
                <div style={{ fontSize: 10, color: '#86efac', marginTop: 2 }}>{fmtFechaCorta(sN.fecha)}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Historial de sesiones ── */}
        <div style={cardStyle}>
          <div style={titleStyle}>Historial de sesiones</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 10, overflowX: 'auto' }}>
            {historial.map((h, i) => {
              const esUltima = i === historial.length - 1;
              const pct      = Math.round((h.gapsCompletados / 9) * 100);
              const gColor   = pct >= 100 ? '#16a34a' : pct >= 66 ? '#2563eb' : pct >= 33 ? '#f59e0b' : '#ef4444';
              return (
                <div key={h.sesion} style={{
                  textAlign: 'center', padding: 6,
                  background: esUltima ? '#dbeafe' : '#f9fafb',
                  borderRadius: 6, fontSize: 10,
                  border: esUltima ? '1px solid #bfdbfe' : '1px solid transparent'
                }}>
                  <div style={{ fontWeight: 600, color: esUltima ? '#1d4ed8' : '#374151' }}>S{h.sesion}</div>
                  <div style={{ color: '#9ca3af', marginTop: 1 }}>{fmtFechaCorta(h.fecha)}</div>
                  <div style={{ color: gColor, fontWeight: 600, marginTop: 2 }}>{h.gapsCompletados}/9</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Pie ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => navigateTo('center')}
            style={btnBase()}
          >
            ← Volver al dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

function btnBase(bg, color, border) {
  return {
    padding: '7px 14px', fontSize: 12,
    borderRadius: 7, border: `1px solid ${border || '#e5e7eb'}`,
    background: bg || 'white', color: color || '#374151',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
  };
}

const cardStyle = {
  background: 'white',
  border: '1px solid #f3f4f6',
  borderRadius: 10,
  padding: 12
};

const titleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#374151'
};
