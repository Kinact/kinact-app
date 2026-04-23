import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_SESSION_HISTORY, MOCK_ESCALAS, TABLEROS_CONFIG } from '../../../data/mockData';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORES_TABLERO = {
  casa:  { bg: '#1e40af', text: '#bfdbfe' },
  barco: { bg: '#166534', text: '#86efac' },
  flor:  { bg: '#92400e', text: '#fcd34d' },
  cafe:  { bg: '#7f1d1d', text: '#fca5a5' }
};

// MOCK_SESSION_HISTORY usa 'estado', no 'estadoEmocional'
const CAMPO_KEY = {
  estadoEmocional: 'estado',
  engagement:      'engagement',
  autonomia:       'autonomia',
  agitacion:       'agitacion',
  fatiga:          'fatiga'
};

const LABELS_EVOL = {
  estadoEmocional: 'Estado emocional',
  engagement:      'Engagement',
  autonomia:       'Autonomía',
  agitacion:       'Agitación',
  fatiga:          'Fatiga'
};

const VALOR_DISPLAY = {
  positivo: 'Positivo', neutro: 'Neutro', bajo: 'Bajo',
  alto: 'Alto', medio: 'Medio',
  autonomo: 'Autónomo', parcial: 'Parcial', dependiente: 'Dependiente',
  true: 'Sí', false: 'No'
};

const ORDEN = {
  estado:     { bajo: 0, neutro: 1, positivo: 2 },
  engagement: { bajo: 0, medio: 1, alto: 2 },
  autonomia:  { dependiente: 0, parcial: 1, autonomo: 2 }
};

const LIMITES  = { tug: 60,   mec: 30,          gds: 15,       barthel: 100 };
const ETIQUETA = { tug: 'TUG (segundos)', mec: 'MEC (0-30)', gds: 'GDS-15 (0-15)', barthel: 'Barthel (0-100)' };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEstadoResidente(id) {
  const hist  = MOCK_SESSION_HISTORY[id] || [];
  if (!hist.length) return { label: 'Sin sesiones', color: '#4b5563' };
  const ul    = hist[hist.length - 1];
  const tug   = MOCK_ESCALAS[id]?.tug?.slice(-1)[0]?.valor;
  if (ul.engagement === 'bajo' || ul.fatiga)        return { label: 'Alerta activa',   color: '#f87171', alerta: true };
  if (tug != null && tug > 20)                       return { label: 'TUG alto riesgo', color: '#f87171', alerta: true };
  if (ul.engagement === 'alto' && ul.estado === 'positivo')
                                                     return { label: `S${hist.length} · Progreso`, color: '#4ade80' };
  return { label: `S${hist.length} · Estable`, color: '#9ca3af' };
}

function getUltimaFecha(id) {
  const hist = MOCK_SESSION_HISTORY[id] || [];
  if (!hist.length) return '—';
  return new Date(hist[hist.length - 1].fecha)
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function metricaColor(v, tipo) {
  if (tipo === 'mec')     return v >= 27 ? '#4ade80' : v >= 24 ? '#fb923c' : '#f87171';
  if (tipo === 'gds')     return v <=  5 ? '#4ade80' : v <= 10 ? '#fb923c' : '#f87171';
  if (tipo === 'barthel') return v >= 91 ? '#4ade80' : v >= 61 ? '#fb923c' : '#f87171';
  if (tipo === 'tug')     return v <= 12 ? '#4ade80' : v <= 20 ? '#fb923c' : '#f87171';
  return '#9ca3af';
}

function getInterpretacion(tipo, v) {
  const n = parseFloat(v);
  if (tipo === 'tug')     return n <= 12 ? 'Bajo riesgo caídas'  : n <= 20 ? 'Riesgo moderado'    : 'Alto riesgo caídas';
  if (tipo === 'mec')     return n >= 27 ? 'Normal'              : n >= 24 ? 'Borderline'          : 'Deterioro cognitivo';
  if (tipo === 'gds')     return n <=  5 ? 'Sin depresión'       : n <= 10 ? 'Dep. leve'           : 'Dep. moderada';
  if (tipo === 'barthel') return n >= 91 ? 'Independiente'       : n >= 61 ? 'Dep. leve'           : n >= 21 ? 'Dep. moderada' : 'Dep. total';
  return '';
}

function getTendencia(campo, ultima, penultima) {
  if (!ultima || !penultima) return '→';
  const key  = CAMPO_KEY[campo];
  const vU   = ultima[key];
  const vP   = penultima[key];
  if (vU === undefined || vP === undefined || vU === vP) return '→';
  // Para booleanos: false es mejor (sin agitación / sin fatiga)
  if (campo === 'agitacion' || campo === 'fatiga') return (!vU && vP) ? '↑' : '↓';
  const ord  = ORDEN[key];
  if (!ord) return '→';
  return (ord[vU] ?? 0) > (ord[vP] ?? 0) ? '↑' : '↓';
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// ─── Subcomponents ───────────────────────────────────────────────────────────

function MetricCard({ label, valor, subtexto, color }) {
  return (
    <div style={{ background: '#1f2937', borderRadius: 6, padding: '9px 10px' }}>
      <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color }}>{valor}</div>
      {subtexto && <div style={{ fontSize: 10, color, marginTop: 2 }}>{subtexto}</div>}
    </div>
  );
}

function Btn({ onClick, bg, color, children, disabled }) {
  return (
    <button onClick={onClick} disabled={!!disabled} style={{
      fontSize: 11, padding: '5px 12px', background: disabled ? '#1f2937' : bg,
      color: disabled ? '#4b5563' : color, borderRadius: 6, border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', minHeight: 36
    }}>
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResidentManager({ onBack, onVerDashboard }) {
  const { residents } = useApp();
  const [busqueda,      setBusqueda]      = useState('');
  const [seleccionado,  setSeleccionado]  = useState(residents[0]?.id || 'r1');
  const [editando,      setEditando]      = useState(false);
  const [nombreEdit,    setNombreEdit]    = useState('');
  const [tableroEdit,   setTableroEdit]   = useState('');
  const [metricaActiva, setMetricaActiva] = useState(null);
  const [valorMetrica,  setValorMetrica]  = useState('');
  const [condEspecial,  setCondEspecial]  = useState(false);

  // Datos derivados
  const filtrados     = residents.filter(r => r.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const residente     = residents.find(r => r.id === seleccionado);
  const historial     = MOCK_SESSION_HISTORY[seleccionado] || [];
  const escalas       = MOCK_ESCALAS[seleccionado] || {};
  const ultima        = historial[historial.length - 1];
  const penultima     = historial[historial.length - 2];
  const tugActual     = escalas.tug?.slice(-1)[0]?.valor;
  const gdsMasRec     = escalas.gds?.slice(-1)[0]?.valor;
  const tColor        = COLORES_TABLERO[residente?.tableroHabitual] || COLORES_TABLERO.casa;

  const guardarEdicion = () => {
    setEditando(false);
  };

  const guardarMetrica = () => {
    setMetricaActiva(null); setValorMetrica(''); setCondEspecial(false);
  };

  const seleccionar = (id) => {
    setSeleccionado(id); setEditando(false); setMetricaActiva(null);
  };

  const metricaOk = valorMetrica !== '' && !isNaN(parseFloat(valorMetrica));

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{
      background: '#1a1a1a', minHeight: '100vh', padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
      fontFamily: 'inherit', boxSizing: 'border-box'
    }}>

      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{
            width: 30, height: 30, borderRadius: '50%', background: '#374151',
            color: '#9ca3af', fontSize: 15, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>‹</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>Residentes del programa</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
              Residencia Santa Clara · {residents.length} residentes activos
            </div>
          </div>
        </div>
        <input
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar residente..."
          style={{
            fontSize: 12, padding: '6px 12px', borderRadius: 8,
            border: '0.5px solid #374151', background: '#262626',
            color: 'white', width: 180, fontFamily: 'inherit', outline: 'none'
          }}
        />
      </div>

      {/* GRID PRINCIPAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 9fr', gap: 12, alignItems: 'stretch', flex: 1 }}>

        {/* ── LISTA ── */}
        <div style={{
          background: '#262626', borderRadius: 8, border: '0.5px solid #374151',
          padding: 10, display: 'flex', flexDirection: 'column', gap: 4
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4b5563',
            padding: '2px 4px 6px', borderBottom: '0.5px solid #374151'
          }}>
            <span>Residente</span><span>Sesión</span>
          </div>

          {filtrados.map(r => {
            const estado = getEstadoResidente(r.id);
            const sel    = r.id === seleccionado;
            return (
              <div
                key={r.id}
                onClick={() => seleccionar(r.id)}
                style={{
                  background: sel ? '#1e3a5f' : estado.alerta ? '#2a1515' : '#1f2937',
                  borderRadius: 6,
                  border: sel ? '1.5px solid #2563eb' : estado.alerta ? '0.5px solid #dc2626' : '0.5px solid #374151',
                  padding: 8, display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', cursor: 'pointer', minHeight: 44
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: sel ? '#1d4ed8' : '#374151',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 500, color: sel ? 'white' : '#d1d5db', flexShrink: 0
                  }}>
                    {r.iniciales}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'white' }}>
                      {r.nombre.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div style={{ fontSize: 10, color: estado.color }}>{estado.label}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#6b7280', flexShrink: 0 }}>
                  {getUltimaFecha(r.id)}
                </div>
              </div>
            );
          })}

          <div style={{
            marginTop: 'auto', borderTop: '0.5px solid #374151', paddingTop: 6,
            textAlign: 'center', fontSize: 10, color: '#4b5563', cursor: 'pointer'
          }}>
            {busqueda
              ? `${filtrados.length} resultado(s)`
              : `↓ Ver todos (${residents.length} residentes)`}
          </div>
        </div>

        {/* ── DETALLE ── */}
        {residente && (
          <div style={{
            background: '#262626', borderRadius: 8, border: '0.5px solid #374151',
            padding: 14, display: 'flex', flexDirection: 'column', gap: 12
          }}>

            {/* S1: Cabecera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', background: tColor.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 500, color: 'white', flexShrink: 0
                }}>
                  {residente.iniciales}
                </div>
                <div>
                  {!editando ? (
                    <>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'white' }}>
                        {residente.nombre}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>
                        Tablero: {cap(residente.tableroHabitual)} · S{historial.length} · Incorporado:{' '}
                        {new Date(residente.incorporacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        value={nombreEdit} onChange={e => setNombreEdit(e.target.value)}
                        style={{
                          fontSize: 14, padding: '4px 8px', borderRadius: 6,
                          border: '0.5px solid #374151', background: '#1f2937',
                          color: 'white', width: 200, fontFamily: 'inherit', outline: 'none'
                        }}
                      />
                      <select
                        value={tableroEdit} onChange={e => setTableroEdit(e.target.value)}
                        style={{
                          fontSize: 11, padding: '3px 6px', borderRadius: 6,
                          border: '0.5px solid #374151', background: '#1f2937',
                          color: 'white', marginTop: 4, display: 'block',
                          fontFamily: 'inherit', cursor: 'pointer'
                        }}
                      >
                        {Object.keys(TABLEROS_CONFIG).map(t => (
                          <option key={t} value={t}>{cap(t)}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!editando ? (
                  <Btn
                    bg="#1e40af" color="#bfdbfe"
                    onClick={() => { setEditando(true); setNombreEdit(residente.nombre); setTableroEdit(residente.tableroHabitual); }}
                  >
                    Editar ficha
                  </Btn>
                ) : (
                  <>
                    <Btn bg="#166534" color="#86efac" onClick={guardarEdicion}>Guardar</Btn>
                    <Btn bg="#374151" color="#9ca3af" onClick={() => setEditando(false)}>Cancelar</Btn>
                  </>
                )}
              </div>
            </div>

            {/* S2: 4 métricas rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
              <MetricCard
                label="Última sesión"
                valor={getUltimaFecha(seleccionado)}
                subtexto={ultima ? `${ultima.gapsCompletados}/9 · ${ultima.intercambios} intercambios` : '—'}
                color="white"
              />
              <MetricCard
                label="Estado general"
                valor={{ positivo: 'Positivo', neutro: 'Neutro', bajo: 'Bajo' }[ultima?.estado] || '—'}
                subtexto={{ alto: 'Engagement alto', medio: 'Engagement medio', bajo: 'Engagement bajo' }[ultima?.engagement] || ''}
                color={{ positivo: '#4ade80', neutro: '#60a5fa', bajo: '#f87171' }[ultima?.estado] || '#9ca3af'}
              />
              <MetricCard
                label="TUG reciente"
                valor={tugActual != null ? `${tugActual}s` : 'Sin datos'}
                subtexto={tugActual != null ? (tugActual <= 12 ? '↑ Bajo riesgo' : tugActual <= 20 ? 'Riesgo moderado' : '↓ Alto riesgo') : 'Añadir medición'}
                color={tugActual != null ? metricaColor(tugActual, 'tug') : '#4b5563'}
              />
              <MetricCard
                label="GDS-15"
                valor={gdsMasRec != null ? `${gdsMasRec}/15` : 'Sin datos'}
                subtexto={gdsMasRec != null ? (gdsMasRec <= 5 ? '↑ Sin depresión' : gdsMasRec <= 10 ? 'Dep. leve' : 'Dep. moderada') : 'Añadir escala'}
                color={gdsMasRec != null ? metricaColor(gdsMasRec, 'gds') : '#4b5563'}
              />
            </div>

            {/* S3: Evolución + Nueva métrica */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

              {/* Evolución reciente */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', marginBottom: 6 }}>
                  Evolución reciente
                </div>
                {Object.keys(LABELS_EVOL).map((campo, i, arr) => {
                  const val  = ultima?.[CAMPO_KEY[campo]];
                  const tend = getTendencia(campo, ultima, penultima);
                  const col  = { '↑': '#4ade80', '→': '#9ca3af', '↓': '#f87171' }[tend];
                  return (
                    <div key={campo} style={{
                      display: 'flex', justifyContent: 'space-between', fontSize: 11,
                      padding: '5px 0',
                      borderBottom: i < arr.length - 1 ? '0.5px solid #374151' : 'none'
                    }}>
                      <span style={{ color: '#6b7280' }}>{LABELS_EVOL[campo]}</span>
                      <span style={{ color: col, fontWeight: 500 }}>
                        {val !== undefined ? (VALOR_DISPLAY[String(val)] || String(val)) : '—'} {tend}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Añadir nueva métrica */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', marginBottom: 6 }}>
                  Añadir nueva métrica
                </div>

                {metricaActiva === null ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {[['tug','+ TUG'],['mec','+ MEC'],['gds','+ GDS-15'],['barthel','+ Barthel']].map(([tipo, label]) => (
                        <button
                          key={tipo}
                          onClick={() => { setMetricaActiva(tipo); setValorMetrica(''); setCondEspecial(false); }}
                          style={{
                            padding: '9px 6px', background: '#1f2937',
                            border: '0.5px solid #374151', borderRadius: 6,
                            color: '#e5e7eb', fontSize: 11, cursor: 'pointer',
                            fontFamily: 'inherit', minHeight: 36
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: '#4b5563', marginTop: 6, lineHeight: 1.4 }}>
                      Solo nuevas mediciones. El historial es de solo lectura.
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'white' }}>
                      {ETIQUETA[metricaActiva]}
                    </div>
                    <input
                      type="number" min={0} max={LIMITES[metricaActiva]}
                      step={metricaActiva === 'tug' ? 0.1 : 1}
                      value={valorMetrica} onChange={e => setValorMetrica(e.target.value)}
                      style={{
                        fontSize: 20, padding: 8, textAlign: 'center', width: 90,
                        borderRadius: 8, border: '0.5px solid #374151',
                        background: '#1f2937', color: 'white',
                        marginTop: 4, fontFamily: 'inherit', outline: 'none', display: 'block'
                      }}
                    />
                    {metricaOk && (
                      <div style={{ fontSize: 11, marginTop: 4, color: metricaColor(parseFloat(valorMetrica), metricaActiva) }}>
                        {getInterpretacion(metricaActiva, valorMetrica)}
                      </div>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#6b7280', cursor: 'pointer', marginTop: 6 }}>
                      <input type="checkbox" checked={condEspecial} onChange={e => setCondEspecial(e.target.checked)} />
                      Medición bajo condiciones especiales
                    </label>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        onClick={guardarMetrica} disabled={!metricaOk}
                        style={{
                          flex: 1, padding: '6px 12px', borderRadius: 6, border: 'none',
                          background: metricaOk ? '#166534' : '#1f2937',
                          color: metricaOk ? '#86efac' : '#4b5563',
                          fontSize: 11, cursor: metricaOk ? 'pointer' : 'not-allowed',
                          fontFamily: 'inherit', minHeight: 36
                        }}
                      >
                        Guardar medición
                      </button>
                      <Btn bg="#374151" color="#9ca3af" onClick={() => setMetricaActiva(null)}>Cancelar</Btn>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* S4: Ver dashboard completo */}
            <div style={{ marginTop: 'auto' }}>
              <button
                onClick={() => onVerDashboard(seleccionado)}
                style={{
                  width: '100%', padding: 10, background: '#1e3a5f',
                  border: '0.5px solid #2563eb', borderRadius: 6,
                  color: '#60a5fa', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit', minHeight: 36
                }}
              >
                Ver dashboard completo →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
