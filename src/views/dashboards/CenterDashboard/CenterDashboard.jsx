import { useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_CENTER, MOCK_RESIDENTS, MOCK_SESSION_HISTORY, MOCK_ESCALAS } from '../../../data/mockData';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MES_ACTUAL = (() => { const s = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' }); return s.charAt(0).toUpperCase() + s.slice(1); })();

const PROXIMAS_SESIONES = [
  { dia: 'Lun 14', grupo: 'Grupo A', hora: '11:00h', estado: 'completada' },
  { dia: 'Mar 15', grupo: 'Grupo B', hora: '10:30h', estado: 'hoy'        },
  { dia: 'Mié 16', grupo: 'Grupo A', hora: '11:00h', estado: 'pendiente'  }
];

const ESTADO_SESION = {
  completada: { bg: '#dcfce7', color: '#15803d' },
  hoy:        { bg: '#dbeafe', color: '#1d4ed8' },
  pendiente:  { bg: '#f9fafb', color: '#9ca3af' }
};

// Grupos con IDs únicos de string — sin mezcla de tipos
const GRUPOS_DINAMISMO = [
  {
    id: 'A',
    residentes: ['r1', 'r3', 'r4', 'r2'],
    intercambios: 8.4,
    color: 'success',
    descripcion: 'Alta reciprocidad. Carmen actúa como catalizadora natural del grupo.',
    esNuevo: false
  },
  {
    id: 'B',
    residentes: ['r2', 'r4', 'r1', 'r3'],
    intercambios: 5.1,
    color: 'warning',
    descripcion: 'Ritmo moderado. Considera añadir un perfil más activo para elevar la dinámica.',
    esNuevo: false
  },
  {
    id: 'C',
    residentes: ['r1', 'r2', 'r3', 'r4'],
    intercambios: null,
    color: 'info',
    descripcion: 'Combinación sugerida por perfiles complementarios. Sin historial previo juntos.',
    esNuevo: true
  }
];

const GRUPO_STYLES = {
  success: { bg: '#dcfce7', border: '#86efac', color: '#15803d', btnBg: '#dcfce7', btnColor: '#15803d', btnBorder: '#86efac' },
  warning: { bg: '#fef3c7', border: '#fcd34d', color: '#b45309', btnBg: '#fef3c7', btnColor: '#b45309', btnBorder: '#fcd34d' },
  info:    { bg: '#dbeafe', border: '#93c5fd', color: '#1d4ed8', btnBg: '#dbeafe', btnColor: '#1d4ed8', btnBorder: '#93c5fd' }
};

// ─── CenterDashboard ──────────────────────────────────────────────────────────

export default function CenterDashboard() {
  const { navigateTo } = useApp();

  // ── Stats globales ──
  const stats = useMemo(() => {
    const allHistorial = Object.values(MOCK_SESSION_HISTORY).flat();

    const asistenciaMedia = Math.round(
      MOCK_RESIDENTS.reduce((s, r) => {
        const h = MOCK_SESSION_HISTORY[r.id] || [];
        return s + (h.length / 13) * 100;
      }, 0) / MOCK_RESIDENTS.length
    );

    // Guard contra división por cero cuando solo algunos residentes tienen escalas
    const tugValues = Object.values(MOCK_ESCALAS)
      .map(e => { const t = e.tug || []; return t[t.length - 1]?.valor ?? null; })
      .filter(v => v !== null);
    const tugMedio = tugValues.length ? (tugValues.reduce((s, v) => s + v, 0) / tugValues.length).toFixed(1) : 'N/A';

    const gdsValues = Object.values(MOCK_ESCALAS)
      .map(e => { const g = e.gds || []; return g[g.length - 1]?.valor ?? null; })
      .filter(v => v !== null);
    const gdsMedio = gdsValues.length ? (gdsValues.reduce((s, v) => s + v, 0) / gdsValues.length).toFixed(1) : 'N/A';

    const barthelValues = Object.values(MOCK_ESCALAS)
      .map(e => { const b = e.barthel || []; return b[b.length - 1]?.valor ?? null; })
      .filter(v => v !== null);
    const barthelMedio = barthelValues.length ? Math.round(barthelValues.reduce((s, v) => s + v, 0) / barthelValues.length) : 78;

    const sesionesTotal    = MOCK_RESIDENTS.reduce((s, r) => s + (MOCK_SESSION_HISTORY[r.id]?.length || 0), 0);
    const intercambiosTotal = allHistorial.reduce((s, h) => s + h.intercambios, 0);
    const mediacionesTotal  = allHistorial.reduce((s, h) => s + h.mediaciones, 0);
    const mediacionesMedia  = allHistorial.length ? (mediacionesTotal / allHistorial.length).toFixed(1) : '0';

    // Tendencias (primero vs último dato disponible)
    const tugPrimero = Object.values(MOCK_ESCALAS).map(e => e.tug?.[0]?.valor).filter(Boolean);
    const tugMedioIni = tugPrimero.length ? (tugPrimero.reduce((s, v) => s + v, 0) / tugPrimero.length).toFixed(1) : null;

    const gdsPrimero = Object.values(MOCK_ESCALAS).map(e => e.gds?.[0]?.valor).filter(Boolean);
    const gdsMedioIni = gdsPrimero.length ? (gdsPrimero.reduce((s, v) => s + v, 0) / gdsPrimero.length).toFixed(1) : null;

    const medPrimero = allHistorial.length ? allHistorial.slice(0, 4).reduce((s, h) => s + h.mediaciones, 0) / 4 : 0;

    return {
      asistenciaMedia, tugMedio, gdsMedio, barthelMedio,
      sesionesTotal, mediacionesMedia, intercambiosTotal,
      tugMedioIni, gdsMedioIni, medPrimero: medPrimero.toFixed(1)
    };
  }, []);

  // ── Alertas clínicas ──
  const alertas = useMemo(() => MOCK_RESIDENTS.map(r => {
    const hist      = MOCK_SESSION_HISTORY[r.id] || [];
    const ultimas3  = hist.slice(-3);
    const tugActual = MOCK_ESCALAS[r.id]?.tug?.slice(-1)[0]?.valor;
    if (ultimas3.length === 3 && ultimas3.every(h => h.engagement === 'bajo' || h.fatiga)) {
      return { residente: r, motivo: '3 sesiones consecutivas con engagement bajo o fatiga detectada.' };
    }
    if (tugActual != null && tugActual > 20) {
      return { residente: r, motivo: `TUG ${tugActual}s este mes — alto riesgo de caídas.` };
    }
    return null;
  }).filter(Boolean), []);

  // ── Estado por residente para lista ──
  const estadoResidente = (r) => {
    const estaEnAlerta = alertas.some(a => a.residente.id === r.id);
    const hist = MOCK_SESSION_HISTORY[r.id] || [];
    const ult  = hist[hist.length - 1];
    if (estaEnAlerta) return '#ef4444';
    if (ult?.engagement === 'medio') return '#f59e0b';
    return '#22c55e';
  };

  const verPerfil = (residenteId) => navigateTo('resident', { residentId: residenteId });

  const verdes   = MOCK_RESIDENTS.filter(r => estadoResidente(r) === '#22c55e').length;
  const naranjas = MOCK_RESIDENTS.filter(r => estadoResidente(r) === '#f59e0b').length;
  const rojos    = MOCK_RESIDENTS.filter(r => estadoResidente(r) === '#ef4444').length;

  const FILA1 = [
    {
      valor: MOCK_RESIDENTS.length,
      label: 'Residentes activos',
      sub: `${verdes} estables · ${naranjas} seguimiento · ${rojos} alerta`,
      color: '#111827'
    },
    {
      valor: `${stats.asistenciaMedia}%`,
      label: 'Asistencia media',
      sub: 'Sobre 13 sesiones programadas',
      color: stats.asistenciaMedia >= 70 ? '#16a34a' : '#d97706'
    },
    {
      valor: `${stats.sesionesTotal}/14`,
      label: 'Sesiones completadas',
      sub: 'Objetivo mensual',
      color: stats.sesionesTotal >= 10 ? '#16a34a' : '#d97706'
    },
    {
      valor: stats.intercambiosTotal,
      label: 'Intercambios totales',
      sub: 'Suma acumulada del programa',
      color: '#2563eb'
    }
  ];

  const FILA2 = [
    {
      valor: `${stats.tugMedio}s`,
      label: 'TUG medio',
      sub: stats.tugMedioIni ? `Inicio: ${stats.tugMedioIni}s` : 'Movilidad funcional',
      color: stats.tugMedio === 'N/A' ? '#6b7280' : parseFloat(stats.tugMedio) <= 12 ? '#16a34a' : parseFloat(stats.tugMedio) <= 20 ? '#d97706' : '#dc2626'
    },
    {
      valor: stats.gdsMedio,
      label: 'GDS-15 medio',
      sub: stats.gdsMedioIni ? `Inicio: ${stats.gdsMedioIni}` : 'Depresión geriátrica',
      color: stats.gdsMedio === 'N/A' ? '#6b7280' : parseFloat(stats.gdsMedio) < 6 ? '#16a34a' : parseFloat(stats.gdsMedio) < 11 ? '#d97706' : '#dc2626'
    },
    {
      valor: stats.mediacionesMedia,
      label: 'Mediaciones / sesión',
      sub: `Inicio: ${stats.medPrimero} · ↓ es mejora`,
      color: parseFloat(stats.mediacionesMedia) < parseFloat(stats.medPrimero) ? '#16a34a' : '#d97706'
    },
    {
      valor: stats.barthelMedio,
      label: 'Barthel medio',
      sub: 'Independencia funcional',
      color: stats.barthelMedio >= 91 ? '#16a34a' : stats.barthelMedio >= 61 ? '#d97706' : '#dc2626'
    }
  ];

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', padding: 16, overflowY: 'auto' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        background: 'white', borderRadius: 16,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 12
      }}>

        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Dashboard del centro</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{MOCK_CENTER.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{MES_ACTUAL}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigateTo('residents')} style={btnBase()}>Gestión de residentes</button>
            <button onClick={() => navigateTo('user-management')} style={btnBase()}>Gestión de usuarios</button>
            <button style={btnBase()}>Exportar informe mensual</button>
            <button onClick={() => navigateTo('clinical-scales')} style={btnBase()}>Escalas clínicas</button>
            <button onClick={() => navigateTo('session-selector')} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>Nueva sesión</button>
          </div>
        </div>

        {/* ── Fila 1 de métricas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {FILA1.map(m => (
            <div key={m.label} style={metricCard}>
              <div style={{ fontSize: 22, fontWeight: 600, color: m.color }}>{m.valor}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Fila 2 de métricas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {FILA2.map(m => (
            <div key={m.label} style={metricCard}>
              <div style={{ fontSize: 22, fontWeight: 600, color: m.color }}>{m.valor}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Alertas clínicas ── */}
        {alertas.length > 0 && (
          <div style={{
            background: '#fee2e2', borderRadius: 10,
            border: '0.5px solid #fca5a5', padding: 10
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#b91c1c', marginBottom: 8 }}>
              Alertas clínicas activas — {alertas.length} residente(s) requieren atención
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {alertas.map(a => (
                <div key={a.residente.id} style={{
                  background: 'white', borderRadius: 8, padding: 8,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flex: 1, minWidth: 200, gap: 12
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{a.residente.nombre}</div>
                    <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{a.motivo}</div>
                  </div>
                  <button
                    onClick={() => verPerfil(a.residente.id)}
                    style={btnBase()}
                  >
                    Ver perfil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Zona central 2 columnas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12 }}>

          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Lista residentes */}
            <div style={{ ...cardStyle, padding: 12 }}>
              <details open>
                <summary style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151',
                  listStyle: 'none', padding: '2px 0 8px'
                }}>
                  <span>Ver todos los residentes</span>
                  <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }}>{MOCK_RESIDENTS.length} en programa ▾</span>
                </summary>

                {MOCK_RESIDENTS.map((r, i) => {
                  const hist = MOCK_SESSION_HISTORY[r.id] || [];
                  const tug  = MOCK_ESCALAS[r.id]?.tug?.slice(-1)[0]?.valor;
                  const tugPrev = MOCK_ESCALAS[r.id]?.tug?.slice(-2, -1)[0]?.valor;
                  const tugTend = tug && tugPrev ? (tug < tugPrev ? '↓' : tug > tugPrev ? '↑' : '→') : '';
                  const estadoColor = estadoResidente(r);

                  return (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '5px 0',
                        borderBottom: i < MOCK_RESIDENTS.length - 1 ? '0.5px solid #f3f4f6' : 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => verPerfil(r.id)}
                    >
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: estadoColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#374151' }}>{r.nombre}</span>
                      </div>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>
                        S{hist.length}{tug ? ` · ${tug}s ${tugTend}` : ''}
                      </span>
                    </div>
                  );
                })}
              </details>
            </div>

            {/* Próximas sesiones */}
            <div style={{ ...cardStyle, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Próximas sesiones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {PROXIMAS_SESIONES.map((s, i) => {
                  const st = ESTADO_SESION[s.estado];
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 11, padding: 5,
                      borderRadius: 4, background: st.bg, color: st.color
                    }}>
                      <span style={{ fontWeight: 500 }}>{s.dia} · {s.grupo}</span>
                      <span>{s.hora}</span>
                    </div>
                  );
                })}
                <div style={{
                  border: '1px dashed #d1d5db', borderRadius: 4,
                  padding: 5, textAlign: 'center',
                  fontSize: 11, color: '#9ca3af', cursor: 'pointer'
                }}>
                  + Programar sesión
                </div>
              </div>
            </div>
          </div>

          {/* Mapa de dinamismo */}
          <div style={{
            background: 'white', borderRadius: 10,
            border: '2px solid #93c5fd', padding: 14,
            display: 'flex', flexDirection: 'column', gap: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Mapa de dinamismo de grupo</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Combinaciones ordenadas por intercambios autónomos</div>
              </div>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 6,
                background: '#dbeafe', color: '#1d4ed8', fontWeight: 500
              }}>
                Basado en {stats.sesionesTotal} sesiones
              </span>
            </div>

            {GRUPOS_DINAMISMO.map(grupo => {
              const gs = GRUPO_STYLES[grupo.color];
              return (
                <div key={grupo.id} style={{
                  background: gs.bg, border: `1px solid ${gs.border}`,
                  borderRadius: 8, padding: 10
                }}>
                  {/* Header del grupo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    {grupo.esNuevo ? (
                      <>
                        <span style={{ fontSize: 11, fontWeight: 600, color: gs.color }}>Sugerencia nueva combinación</span>
                        <span style={{ fontSize: 10, color: gs.color }}>Sin historial previo juntos</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 11, fontWeight: 600, color: gs.color }}>
                          Grupo {grupo.id} — {grupo.color === 'success' ? 'Alta dinámica' : 'Dinámica moderada'}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: gs.color }}>
                          {grupo.intercambios} intercambios / sesión
                        </span>
                      </>
                    )}
                  </div>

                  {/* Fila de residentes */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    {grupo.residentes.map((rid, i) => {
                      const r = MOCK_RESIDENTS.find(m => m.id === rid);
                      if (!r) return null;
                      return (
                        <span key={rid} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{
                            fontSize: 11, padding: '3px 8px', borderRadius: 6,
                            background: 'white', color: gs.color, fontWeight: 500,
                            border: `1px solid ${gs.border}`
                          }}>
                            {r.nombre.split(' ')[0]}
                          </span>
                          {i < grupo.residentes.length - 1 && (
                            <span style={{ fontSize: 11, color: gs.color, fontWeight: 600 }}>+</span>
                          )}
                        </span>
                      );
                    })}
                    <button
                      style={{
                        marginLeft: 'auto',
                        padding: '4px 12px', fontSize: 11,
                        borderRadius: 6, border: `1px solid ${gs.btnBorder}`,
                        background: gs.btnBg, color: gs.btnColor,
                        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
                      }}
                      onClick={() => navigateTo('session-selector')}
                    >
                      {grupo.esNuevo ? 'Probar grupo' : 'Usar grupo'}
                    </button>
                  </div>

                  {/* Descripción */}
                  <div style={{ fontSize: 10, color: gs.color, marginTop: 6, lineHeight: 1.4 }}>
                    {grupo.descripcion}
                    {grupo.color === 'warning' && (
                      <span> Considera añadir un perfil más activo.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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

const metricCard = {
  background: '#f9fafb', borderRadius: 8,
  padding: 10, textAlign: 'center'
};

const cardStyle = {
  background: 'white',
  border: '1px solid #f3f4f6',
  borderRadius: 10
};
