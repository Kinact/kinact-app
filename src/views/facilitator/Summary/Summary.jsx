import { useApp } from '../../../context/AppContext';
import { MOCK_RESIDENTS, MOCK_SESSION_HISTORY } from '../../../data/mockData';
import { TABLERO_COLORS } from '../../../constants/tableros';
import { capitalize, fechaHoyLarga } from '../../../utils/formatters';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ORDEN = {
  bajo: 0, neutro: 1, positivo: 2,
  dependiente: 0, parcial: 1, autonomo: 2,
  false: 0, true: 1
};

// MOCK_SESSION_HISTORY usa 'estado'; las evaluaciones de Survey usan 'estadoEmocional'
const CAMPO_KEY_HIST = {
  estadoEmocional: 'estado',
  engagement: 'engagement',
  autonomia: 'autonomia',
  agitacion: 'agitacion',
  fatiga: 'fatiga'
};

// Accede por índice (las evaluaciones no tienen jugadorId)
function getTendencia(campo, jugadorIndex, jugadorId, evaluaciones) {
  const historial = MOCK_SESSION_HISTORY[jugadorId] || [];
  if (historial.length < 2) return '—';
  const campoHist = CAMPO_KEY_HIST[campo] || campo;
  const anterior = historial[historial.length - 2][campoHist];
  const evalActual = evaluaciones[jugadorIndex];
  if (!evalActual) return '—';
  const actual = evalActual[campo];
  const vAnterior = ORDEN[String(anterior)];
  const vActual   = ORDEN[String(actual)];
  if (vActual === undefined || vAnterior === undefined) return '—';
  if (vActual > vAnterior) return '↑';
  if (vActual < vAnterior) return '↓';
  return '→';
}

function colorTendencia(t) {
  if (t === '↑') return '#16a34a';
  if (t === '↓') return '#dc2626';
  return '#6b7280';
}

function getRecomendacion(evaluacion) {
  if (!evaluacion) return { color: '#2563eb', bg: '#dbeafe', texto: 'Buena evolución general. Continuar con el programa actual.' };
  if (evaluacion.fatiga)
    return { color: '#d97706', bg: '#fef3c7', texto: 'Considera reducir la duración de la próxima sesión. Se observó fatiga física.' };
  if (evaluacion.engagement === 'bajo')
    return { color: '#d97706', bg: '#fef3c7', texto: 'Revisar el nivel de dificultad. El engagement fue bajo esta sesión.' };
  if (evaluacion.autonomia === 'autonomo' && evaluacion.estadoEmocional === 'positivo')
    return { color: '#16a34a', bg: '#dcfce7', texto: 'Excelente sesión. Mantener el nivel y potenciar su rol en el grupo.' };
  return { color: '#2563eb', bg: '#dbeafe', texto: 'Buena evolución general. Continuar con el programa actual.' };
}

function labelEstado(v) {
  return { bajo: 'Bajo', neutro: 'Neutro', positivo: 'Positivo', dependiente: 'Dependiente', parcial: 'Parcial', autonomo: 'Autónomo', true: 'Sí', false: 'No' }[String(v)] || String(v);
}

function colorValor(campo, valor) {
  const positivos = { estadoEmocional: 'positivo', engagement: 'alto', autonomia: 'autonomo' };
  const medios    = { estadoEmocional: 'neutro',   engagement: 'medio', autonomia: 'parcial' };
  if (campo === 'agitacion' || campo === 'fatiga') return valor ? '#dc2626' : '#16a34a';
  if (valor === positivos[campo]) return '#16a34a';
  if (valor === medios[campo])    return '#2563eb';
  return '#d97706';
}

function barColor(pct) {
  if (pct >= 100) return '#16a34a';
  if (pct >= 66)  return '#2563eb';
  if (pct >= 33)  return '#f59e0b';
  return '#ef4444';
}

// ─── Summary ─────────────────────────────────────────────────────────────────

export default function Summary() {
  const { sessionState, evaluaciones, navigateTo } = useApp();
  const jugadores = sessionState?.jugadores || [];

  // Métricas globales
  const turnosTotales       = sessionState?.turnoNumero || 0;
  const totalIntercambios   = jugadores.reduce((sum, j) => sum + (j.intercambios?.length || 0), 0);
  const totalMediaciones    = jugadores.reduce((sum, j) => sum + (j.acciones?.filter(a => !a.autonomo).length || 0), 0);
  const tablerosCompletados = jugadores.filter(j => j.tablero?.every(g => g.ocupado)).length;

  // Observaciones no vacías
  const observacionesFiltradas = (evaluaciones || [])
    .map((e, i) => e?.observaciones?.trim() ? `${MOCK_RESIDENTS[i]?.nombre}: ${e.observaciones.trim()}` : null)
    .filter(Boolean);

  const nuevaSesion = () => navigateTo('session-selector');
  const verDashboard = () => navigateTo('center');

  const METRICAS = [
    { valor: turnosTotales,       label: 'Turnos jugados'       },
    { valor: totalIntercambios,   label: 'Intercambios totales' },
    { valor: totalMediaciones,    label: 'Mediaciones'          },
    { valor: tablerosCompletados, label: 'Tableros completados' }
  ];

  const CAMPOS_EVAL = [
    { key: 'estadoEmocional', label: 'Estado emocional' },
    { key: 'engagement',      label: 'Engagement'       },
    { key: 'autonomia',       label: 'Autonomía'        },
    { key: 'agitacion',       label: 'Agitación'        },
    { key: 'fatiga',          label: 'Fatiga'           }
  ];

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', padding: 16, overflowY: 'auto' }}>
      <div style={{
        maxWidth: 900, margin: '0 auto',
        background: 'white', borderRadius: 16,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 16
      }}>

        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Resumen de sesión</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
              KIN DÍA — {fechaHoyLarga()}
            </span>
          </div>
          <span style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 20,
            background: '#dcfce7', color: '#15803d', fontWeight: 500
          }}>
            Guardado en 4 perfiles
          </span>
        </div>

        {/* ── Métricas globales ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {METRICAS.map(m => (
            <div key={m.label} style={{
              background: '#f9fafb', borderRadius: 8,
              padding: 10, textAlign: 'center'
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>{m.valor}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* ── Grid de jugadores ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {jugadores.map((jugador, index) => {
            const evalJug    = evaluaciones?.[index] || {};
            const rec        = getRecomendacion(evalJug);
            const tableroKey = jugador.tableroAsignado || 'casa';
            const colores    = TABLERO_COLORS[tableroKey] || TABLERO_COLORS.casa;
            const gapsCompletados = jugador.tablero?.filter(g => g.ocupado).length || 0;
            const pct        = Math.round((gapsCompletados / 9) * 100);
            const residente  = MOCK_RESIDENTS[index];

            return (
              <div key={jugador.id} style={{
                background: 'white', borderRadius: 10, padding: 10,
                border: evalJug.agitacion ? '1.5px solid #fca5a5' : '0.5px solid #e5e7eb',
                display: 'flex', flexDirection: 'column', gap: 6
              }}>

                {/* Cabecera tarjeta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{jugador.nombre}</span>
                  <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: colores.bg, color: colores.text, fontWeight: 500 }}>
                    {tableroKey}
                  </span>
                </div>

                {/* Barra progreso */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: barColor(pct), transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#6b7280', whiteSpace: 'nowrap' }}>{gapsCompletados}/9</span>
                </div>

                <div style={{ fontSize: 11, color: '#6b7280' }}>
                  {jugador.intercambios?.length || 0} intercambios
                </div>

                {/* Divisor */}
                <div style={{ height: 1, background: '#f3f4f6' }} />

                {/* Métricas de evaluación */}
                {CAMPOS_EVAL.map(({ key, label }) => {
                  const val = evalJug[key];
                  const tend = getTendencia(key, index, residente?.id, evaluaciones || []);
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                      <span style={{ color: '#6b7280' }}>{label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: colorValor(key, val), fontWeight: 500 }}>
                          {labelEstado(val)}
                        </span>
                        <span style={{ color: colorTendencia(tend), fontWeight: 600 }}>{tend}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Recomendación */}
                <div style={{ background: rec.bg, borderRadius: 6, padding: 8, marginTop: 2 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: rec.color, marginBottom: 3 }}>
                    Próxima sesión
                  </div>
                  <div style={{ fontSize: 10, color: rec.color, lineHeight: 1.4 }}>
                    {rec.texto}
                  </div>
                </div>

                {/* Botón ver perfil */}
                <button
                  onClick={() => navigateTo('resident', { residentId: residente?.id || 'r1' })}
                  style={{
                    width: '100%', marginTop: 4,
                    padding: '5px 0', fontSize: 11,
                    borderRadius: 6, border: '1px solid #e5e7eb',
                    background: 'white', color: '#374151',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  Ver perfil
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Observaciones ── */}
        {observacionesFiltradas.length > 0 && (
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Observaciones generales
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {observacionesFiltradas.map((obs, i) => (
                <div key={i} style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                  {obs}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Pie ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            ↑ mejora &nbsp;·&nbsp; → sin cambio &nbsp;·&nbsp; ↓ descenso
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={nuevaSesion}
              style={{
                padding: '8px 16px', fontSize: 13,
                borderRadius: 8, border: '1px solid #e5e7eb',
                background: 'white', color: '#374151',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
              }}
            >
              Nueva sesión
            </button>
            <button
              onClick={verDashboard}
              style={{
                padding: '8px 20px', fontSize: 13,
                borderRadius: 8, border: 'none',
                background: '#2563eb', color: 'white',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
              }}
            >
              Ver dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
