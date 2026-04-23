import { useMemo, useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_CENTER, MOCK_SESSION_HISTORY, MOCK_ESCALAS } from '../../../data/mockData';
import { supabase } from '../../../lib/supabase';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MES_ACTUAL = (() => {
  const s = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
})();

const PROXIMAS_SESIONES = [
  { dia: 'Lun 27', grupo: 'Grupo A', hora: '11:00h', estado: 'pendiente' },
  { dia: 'Mar 28', grupo: 'Grupo B', hora: '10:30h', estado: 'pendiente' },
  { dia: 'Mié 29', grupo: 'Grupo A', hora: '11:00h', estado: 'pendiente' }
];

const ESTADO_SESION = {
  completada: { bg: '#dcfce7', color: '#15803d' },
  hoy:        { bg: '#dbeafe', color: '#1d4ed8' },
  pendiente:  { bg: '#f9fafb', color: '#9ca3af' }
};

// Grupos calculados con los 8 residentes actuales
// Grupo A: perfiles de alto rendimiento
// Grupo B: perfiles con más soporte
// Sugerencia: combinación complementaria
const GRUPOS_DINAMISMO = [
  {
    id: 'A',
    residentes: ['r5', 'r3', 'r7', 'r1'],
    intercambios: 7.2,
    color: 'success',
    descripcion: 'Alta reciprocidad. Concha actúa como catalizadora natural; Dolores refuerza la autonomía del grupo.'
  },
  {
    id: 'B',
    residentes: ['r2', 'r4', 'r6', 'r8'],
    intercambios: 4.6,
    color: 'warning',
    descripcion: 'Ritmo moderado. El grupo avanza de forma sólida. Considera introducir un perfil más activo.'
  },
  {
    id: null,
    residentes: ['r5', 'r8', 'r1', 'r4'],
    intercambios: null,
    color: 'info',
    descripcion: 'Combinación sugerida: Concha y Rosa pueden guiar la dinámica de Bernardo y Tomás. Perfiles complementarios.'
  }
];

const GRUPO_STYLES = {
  success: { bg: '#dcfce7', border: '#86efac', color: '#15803d', btnBg: '#dcfce7', btnColor: '#15803d', btnBorder: '#86efac' },
  warning: { bg: '#fef3c7', border: '#fcd34d', color: '#b45309', btnBg: '#fef3c7', btnColor: '#b45309', btnBorder: '#fcd34d' },
  info:    { bg: '#dbeafe', border: '#93c5fd', color: '#1d4ed8', btnBg: '#dbeafe', btnColor: '#1d4ed8', btnBorder: '#93c5fd' }
};

// ─── CenterDashboard ──────────────────────────────────────────────────────────

export default function CenterDashboard() {
  const { navigateTo, residents } = useApp();

  // ── Datos desde Supabase ───────────────────────────────────────────────────
  const [sesionesDB,  setSesionesDB]  = useState(null); // null = cargando
  const [escalasDB,   setEscalasDB]   = useState(null);

  useEffect(() => {
    // Todas las sesiones
    supabase
      .from('kinact_sesiones')
      .select('residente_id, fecha, sesion_num, gaps_completados, intercambios, mediaciones, estado, engagement, autonomia, agitacion, fatiga')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSesionesDB(data && data.length > 0 ? data : null);
      });

    // Todas las escalas clínicas
    supabase
      .from('kinact_escalas')
      .select('residente_id, fecha, mec, gds, barthel, tug')
      .order('fecha', { ascending: true })
      .then(({ data }) => {
        setEscalasDB(data && data.length > 0 ? data : null);
      });
  }, []);

  // ── Stats globales — usa Supabase si disponible, si no mock ───────────────
  const stats = useMemo(() => {
    const sesiones = sesionesDB ?? Object.values(MOCK_SESSION_HISTORY).flat();

    const sesionesTotal     = sesiones.length;
    const intercambiosTotal = sesiones.reduce((s, h) => s + (h.intercambios || 0), 0);
    const mediacionesTotal  = sesiones.reduce((s, h) => s + (h.mediaciones || 0), 0);
    const mediacionesMedia  = sesionesTotal ? (mediacionesTotal / sesionesTotal).toFixed(1) : '0';

    // Mediaciones de las primeras sesiones vs. últimas (mejora)
    const sesOrden = [...sesiones].sort((a, b) => a.fecha > b.fecha ? 1 : -1);
    const primeras4 = sesOrden.slice(0, Math.min(4, sesOrden.length));
    const medPrimero = primeras4.length
      ? (primeras4.reduce((s, h) => s + (h.mediaciones || 0), 0) / primeras4.length).toFixed(1)
      : mediacionesMedia;

    // Asistencia: sesiones por residente / total esperado
    const sesionesPorResidente = {};
    sesiones.forEach(s => {
      sesionesPorResidente[s.residente_id] = (sesionesPorResidente[s.residente_id] || 0) + 1;
    });
    const maxSesiones = Math.max(...Object.values(sesionesPorResidente), 1);
    const asistenciaMedia = Math.round(
      residents.reduce((sum, r) => {
        const n = sesionesPorResidente[r.id] || 0;
        return sum + (n / maxSesiones) * 100;
      }, 0) / residents.length
    );

    // Escalas: última medición por residente
    const escalasFuente = escalasDB
      ? (() => {
          // Agrupar por residente
          const byRes = {};
          escalasDB.forEach(row => {
            if (!byRes[row.residente_id]) byRes[row.residente_id] = { tug: [], gds: [], barthel: [], mec: [] };
            if (row.tug     != null) byRes[row.residente_id].tug.push({     fecha: row.fecha, valor: row.tug });
            if (row.gds     != null) byRes[row.residente_id].gds.push({     fecha: row.fecha, valor: row.gds });
            if (row.barthel != null) byRes[row.residente_id].barthel.push({ fecha: row.fecha, valor: row.barthel });
            if (row.mec     != null) byRes[row.residente_id].mec.push({     fecha: row.fecha, valor: row.mec });
          });
          return byRes;
        })()
      : MOCK_ESCALAS;

    const tugValues     = Object.values(escalasFuente).map(e => e.tug?.slice(-1)[0]?.valor).filter(v => v != null);
    const tugPrimeros   = Object.values(escalasFuente).map(e => e.tug?.[0]?.valor).filter(v => v != null);
    const gdsValues     = Object.values(escalasFuente).map(e => e.gds?.slice(-1)[0]?.valor).filter(v => v != null);
    const gdsPrimeros   = Object.values(escalasFuente).map(e => e.gds?.[0]?.valor).filter(v => v != null);
    const barthelValues = Object.values(escalasFuente).map(e => e.barthel?.slice(-1)[0]?.valor).filter(v => v != null);

    const avg = arr => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

    const tugMedio    = avg(tugValues)?.toFixed(1)     ?? 'N/A';
    const tugMedioIni = avg(tugPrimeros)?.toFixed(1)   ?? null;
    const gdsMedio    = avg(gdsValues)?.toFixed(1)     ?? 'N/A';
    const gdsMedioIni = avg(gdsPrimeros)?.toFixed(1)   ?? null;
    const barthelMedio = avg(barthelValues) != null ? Math.round(avg(barthelValues)) : 78;

    return {
      asistenciaMedia, tugMedio, gdsMedio, barthelMedio,
      sesionesTotal, mediacionesMedia, intercambiosTotal,
      tugMedioIni, gdsMedioIni, medPrimero,
      fuenteDB: sesionesDB !== null
    };
  }, [sesionesDB, escalasDB]);

  // ── Últimas 5 sesiones para el panel ──────────────────────────────────────
  const ultimasSesiones = useMemo(() => {
    if (sesionesDB) return sesionesDB.slice(0, 5);
    // Fallback: últimas del mock
    return Object.values(MOCK_SESSION_HISTORY)
      .flat()
      .sort((a, b) => b.fecha > a.fecha ? 1 : -1)
      .slice(0, 5)
      .map(s => {
        const res = residents.find(r =>
          (MOCK_SESSION_HISTORY[r.id] || []).some(h => h.sesion === s.sesion && h.fecha === s.fecha)
        );
        return { ...s, residente_id: res?.id };
      });
  }, [sesionesDB]);

  // ── Alertas clínicas ──────────────────────────────────────────────────────
  const alertas = useMemo(() => residents.map(r => {
    const hist = sesionesDB
      ? sesionesDB.filter(s => s.residente_id === r.id).slice(-3)
      : (MOCK_SESSION_HISTORY[r.id] || []).slice(-3);

    const escalasRes = escalasDB
      ? (() => {
          const rows = escalasDB.filter(row => row.residente_id === r.id && row.tug != null);
          return rows.length ? rows[rows.length - 1].tug : null;
        })()
      : MOCK_ESCALAS[r.id]?.tug?.slice(-1)[0]?.valor;

    if (hist.length >= 3 && hist.every(h => h.engagement === 'bajo' || h.fatiga)) {
      return { residente: r, motivo: '3 sesiones consecutivas con engagement bajo o fatiga detectada.' };
    }
    if (escalasRes != null && escalasRes > 20) {
      return { residente: r, motivo: `TUG ${escalasRes}s — alto riesgo de caídas.` };
    }
    return null;
  }).filter(Boolean), [sesionesDB, escalasDB]);

  // ── Estado por residente ───────────────────────────────────────────────────
  const estadoResidente = (r) => {
    const estaEnAlerta = alertas.some(a => a.residente.id === r.id);
    const hist = sesionesDB
      ? sesionesDB.filter(s => s.residente_id === r.id)
      : (MOCK_SESSION_HISTORY[r.id] || []);
    const ult = hist[hist.length - 1];
    if (estaEnAlerta) return '#ef4444';
    if (ult?.engagement === 'medio') return '#f59e0b';
    return '#22c55e';
  };

  const verdes   = residents.filter(r => estadoResidente(r) === '#22c55e').length;
  const naranjas = residents.filter(r => estadoResidente(r) === '#f59e0b').length;
  const rojos    = residents.filter(r => estadoResidente(r) === '#ef4444').length;

  const verPerfil = (id) => navigateTo('resident', { residentId: id });

  const FILA1 = [
    {
      valor: residents.length,
      label: 'Residentes activos',
      sub: `${verdes} estables · ${naranjas} seguimiento · ${rojos} alerta`,
      color: '#111827'
    },
    {
      valor: `${stats.asistenciaMedia}%`,
      label: 'Asistencia media',
      sub: `Sobre ${Math.max(...Object.values(
        (sesionesDB || []).reduce((acc, s) => { acc[s.residente_id] = (acc[s.residente_id] || 0) + 1; return acc; }, {})
      ) || [10])} sesiones`,
      color: stats.asistenciaMedia >= 70 ? '#16a34a' : '#d97706'
    },
    {
      valor: stats.sesionesTotal,
      label: 'Sesiones registradas',
      sub: stats.fuenteDB ? 'Guardadas en Supabase' : 'Datos locales',
      color: '#16a34a'
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
      color: stats.tugMedio === 'N/A' ? '#6b7280'
        : parseFloat(stats.tugMedio) <= 12 ? '#16a34a'
        : parseFloat(stats.tugMedio) <= 20 ? '#d97706'
        : '#dc2626'
    },
    {
      valor: stats.gdsMedio,
      label: 'GDS-15 medio',
      sub: stats.gdsMedioIni ? `Inicio: ${stats.gdsMedioIni}` : 'Depresión geriátrica',
      color: stats.gdsMedio === 'N/A' ? '#6b7280'
        : parseFloat(stats.gdsMedio) < 6 ? '#16a34a'
        : parseFloat(stats.gdsMedio) < 11 ? '#d97706'
        : '#dc2626'
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
            <button onClick={() => navigateTo('residents')}       style={btnBase()}>Gestión de residentes</button>
            <button onClick={() => navigateTo('user-management')} style={btnBase()}>Gestión de usuarios</button>
            <button                                               style={btnBase()}>Exportar informe mensual</button>
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
                  <button onClick={() => verPerfil(a.residente.id)} style={btnBase()}>Ver perfil</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Zona central: 2 columnas fijas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12, alignItems: 'start' }}>

          {/* ── Columna izquierda ── */}
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
                  <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }}>{residents.length} en programa ▾</span>
                </summary>

                {residents.map((r, i) => {
                  const hist = sesionesDB
                    ? sesionesDB.filter(s => s.residente_id === r.id)
                    : (MOCK_SESSION_HISTORY[r.id] || []);
                  const tugRows = escalasDB
                    ? escalasDB.filter(row => row.residente_id === r.id && row.tug != null)
                    : (MOCK_ESCALAS[r.id]?.tug || []);
                  const tug     = tugRows[tugRows.length - 1]?.tug ?? tugRows[tugRows.length - 1]?.valor;
                  const tugPrev = tugRows[tugRows.length - 2]?.tug ?? tugRows[tugRows.length - 2]?.valor;
                  const tugTend = tug && tugPrev ? (tug < tugPrev ? '↓' : tug > tugPrev ? '↑' : '→') : '';
                  const estadoColor = estadoResidente(r);

                  return (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '5px 0',
                        borderBottom: i < residents.length - 1 ? '0.5px solid #f3f4f6' : 'none',
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

          {/* ── Columna derecha ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Actividad reciente */}
            <div style={{ ...cardStyle, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Últimas sesiones registradas
                {stats.fuenteDB && (
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>· Supabase</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ultimasSesiones.slice(0, 5).map((s, i) => {
                  const res = residents.find(r => r.id === s.residente_id);
                  const engColor = s.engagement === 'alto' ? '#15803d' : s.engagement === 'medio' ? '#d97706' : '#dc2626';
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', fontSize: 11,
                      padding: '4px 0',
                      borderBottom: i < 4 ? '0.5px solid #f3f4f6' : 'none'
                    }}>
                      <span style={{ color: '#374151', fontWeight: 500 }}>
                        {res?.nombre || s.residente_id}
                      </span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ color: '#9ca3af' }}>{s.gaps_completados}/9 gaps</span>
                        <span style={{ color: engColor, fontWeight: 500 }}>{s.engagement}</span>
                        <span style={{ color: '#9ca3af' }}>{s.fecha}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mapa de dinamismo de grupo */}
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

              {GRUPOS_DINAMISMO.map((grupo, gi) => {
                const gs = GRUPO_STYLES[grupo.color];
                const esNuevo = grupo.id === null;
                return (
                  <div key={gi} style={{
                    background: gs.bg, border: `1px solid ${gs.border}`,
                    borderRadius: 8, padding: 10
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      {esNuevo ? (
                        <>
                          <span style={{ fontSize: 11, fontWeight: 600, color: gs.color }}>Sugerencia — combinación nueva</span>
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

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                      {grupo.residentes.map((rid, i) => {
                        const r = residents.find(m => m.id === rid);
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
                        {esNuevo ? 'Probar grupo' : 'Usar grupo'}
                      </button>
                    </div>

                    <div style={{ fontSize: 10, color: gs.color, marginTop: 6, lineHeight: 1.4 }}>
                      {grupo.descripcion}
                    </div>
                  </div>
                );
              })}
            </div>
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
