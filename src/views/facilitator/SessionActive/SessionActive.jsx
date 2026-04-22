import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_RESIDENTS, POOL_PIEZAS, TABLEROS_CONFIG } from '../../../data/mockData';
import { TABLERO_COLORS } from '../../../constants/tableros';
import { formatTime } from '../../../utils/formatters';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timerColor(seg) {
  if (seg > 300) return '#22c55e';
  if (seg > 120) return '#f59e0b';
  return '#ef4444';
}

const PIEZA_COLORS = {
  roja:     { bg: '#fee2e2', text: '#991b1b' },
  azul:     { bg: '#dbeafe', text: '#1e40af' },
  verde:    { bg: '#dcfce7', text: '#166534' },
  amarilla: { bg: '#fef9c3', text: '#92400e' }
};

function btn(bg, color, border, fontSize = '11px', padding = '4px 10px') {
  return {
    padding,
    fontSize,
    borderRadius: 6,
    border: `1px solid ${border || '#e5e7eb'}`,
    background: bg || 'white',
    color: color || '#374151',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
    lineHeight: 1.4,
    whiteSpace: 'nowrap'
  };
}

// ─── PlayerBlock ──────────────────────────────────────────────────────────────

function PlayerBlock({
  jugador, esActivo, turnoNumero, pool,
  piezaSeleccionada, accionPendiente, todosJugadores,
  onRegistrar, onColocarGap, onIntercambio,
  onSetPiezaSeleccionada, onSetAccionPendiente
}) {
  const [intercambioDestino, setIntercambioDestino] = useState(null);
  const [piezaDestinoId, setPiezaDestinoId]         = useState('');
  const [autonomo, setAutonomo]                     = useState(true);

  const colores     = TABLERO_COLORS[jugador.tableroAsignado] || TABLERO_COLORS.casa;
  const piezaActual = piezaSeleccionada[jugador.id] || null;
  const pendiente   = accionPendiente[jugador.id] || null;
  const piezasMesa  = pool.filter(p => p.estado === 'mesa');
  const otrosJugadores = todosJugadores.filter(j => j.id !== jugador.id);

  const jugadorDestino         = intercambioDestino ? todosJugadores.find(j => j.id === intercambioDestino) : null;
  const piezasDestinoDisponibles = jugadorDestino ? jugadorDestino.piezasEnMano : [];
  const gapsCompletados        = jugador.tablero.filter(g => g.ocupado).length;

  const limpiarPendiente = (id) =>
    onSetAccionPendiente(prev => { const n = { ...prev }; delete n[id]; return n; });

  const handleColocarGap = (gapId) => {
    if (!pendiente?.pieza) return;
    onColocarGap(jugador.id, gapId, pendiente.pieza);
  };

  const handleConfirmarIntercambio = () => {
    if (!intercambioDestino || !piezaDestinoId || !pendiente?.pieza) return;
    const piezaDestino = piezasDestinoDisponibles.find(p => p.id === piezaDestinoId);
    if (!piezaDestino) return;
    onIntercambio(jugador.id, intercambioDestino, pendiente.pieza, piezaDestino);
    setIntercambioDestino(null);
    setPiezaDestinoId('');
    onSetPiezaSeleccionada(prev => { const n = { ...prev }; delete n[jugador.id]; return n; });
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 10,
      border: esActivo ? '2px solid #2563eb' : '0.5px solid #e5e7eb',
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      overflow: 'hidden'
    }}>

      {/* ── Cabecera ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{jugador.nombre}</span>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: colores.bg, color: colores.text, fontWeight: 500 }}>
          {jugador.tableroAsignado}
        </span>
      </div>

      {/* ── Tablero 3×3 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gap: 3 }}>
        {jugador.tablero.map(slot => {
          const clickable = pendiente?.tipo === 'gap' && !slot.ocupado;
          return (
            <div
              key={slot.id}
              onClick={() => clickable && handleColocarGap(slot.id)}
              style={{
                width: 32, height: 32,
                borderRadius: 4,
                background: slot.ocupado ? colores.bg : '#f3f4f6',
                border: slot.ocupado
                  ? 'none'
                  : clickable
                    ? '1px dashed #2563eb'
                    : '1px dashed #d1d5db',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: clickable ? 'pointer' : 'default',
                fontSize: 9, color: colores.text, fontWeight: 600
              }}
            >
              {slot.ocupado && slot.pieza ? slot.pieza.forma.split('-')[0] : null}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10, color: '#6b7280' }}>{gapsCompletados}/9 gaps · {jugador.turnosSinColocar} sin colocar</div>

      {/* ── Piezas en mano ── */}
      {jugador.piezasEnMano.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxHeight: 40, overflowY: 'auto' }}>
          {jugador.piezasEnMano.map(pieza => {
            const pc = PIEZA_COLORS[pieza.color] || { bg: '#f3f4f6', text: '#374151' };
            return (
              <span key={pieza.id} style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: pc.bg, color: pc.text }}>
                {pieza.forma.split('-')[0]} {pieza.color} {pieza.peso}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Selector de pieza de la mesa ── */}
      <select
        style={{ fontSize: 11, width: '100%', padding: 4, borderRadius: 4, border: '1px solid #e5e7eb', fontFamily: 'inherit' }}
        value={piezaActual?.id || ''}
        onChange={e => {
          const pieza = pool.find(p => p.id === e.target.value) || null;
          onSetPiezaSeleccionada(prev => ({ ...prev, [jugador.id]: pieza }));
        }}
      >
        <option value="">— Seleccionar pieza —</option>
        {piezasMesa.map(p => (
          <option key={p.id} value={p.id}>
            {p.id} · {p.forma} · {p.color} · {p.peso}
          </option>
        ))}
      </select>

      {/* ── Botones de acción ── */}
      {piezaActual && !pendiente && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <button onClick={() => onRegistrar(jugador.id, 'queda', piezaActual, autonomo)} style={btn()}>
            Se queda
          </button>
          <button
            onClick={() => onSetAccionPendiente(prev => ({ ...prev, [jugador.id]: { tipo: 'gap', pieza: piezaActual } }))}
            style={btn('#dcfce7', '#15803d', '#86efac')}
          >
            Coloca gap
          </button>
          <button
            onClick={() => onSetAccionPendiente(prev => ({ ...prev, [jugador.id]: { tipo: 'intercambio', pieza: piezaActual } }))}
            style={btn('#fef3c7', '#b45309', '#fcd34d')}
          >
            Intercambia
          </button>
        </div>
      )}

      {/* ── Toggle autonomía ── */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button
          onClick={() => setAutonomo(true)}
          style={btn(autonomo ? '#dbeafe' : undefined, autonomo ? '#1d4ed8' : undefined, autonomo ? '#93c5fd' : '#e5e7eb', '10px', '2px 6px')}
        >Autónomo</button>
        <button
          onClick={() => setAutonomo(false)}
          style={btn(!autonomo ? '#fef3c7' : undefined, !autonomo ? '#b45309' : undefined, !autonomo ? '#fcd34d' : '#e5e7eb', '10px', '2px 6px')}
        >Con facilitador</button>
      </div>

      {/* ── Panel: selección de gap ── */}
      {pendiente?.tipo === 'gap' && (
        <div style={{ background: '#fef3c7', borderRadius: 4, padding: 6 }}>
          <div style={{ fontSize: 10, color: '#92400e', marginBottom: 4 }}>
            Elige el hueco donde colocar
          </div>
          <button onClick={() => limpiarPendiente(jugador.id)} style={btn('#fee2e2', '#b91c1c', '#fca5a5', '10px', '2px 8px')}>
            Cancelar
          </button>
        </div>
      )}

      {/* ── Panel: intercambio ── */}
      {pendiente?.tipo === 'intercambio' && (
        <div style={{ background: '#fef3c7', borderRadius: 4, padding: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Intercambiar con:</div>
          <select
            style={{ fontSize: 11, padding: 4, borderRadius: 4, border: '1px solid #e5e7eb', fontFamily: 'inherit', width: '100%' }}
            value={intercambioDestino || ''}
            onChange={e => { setIntercambioDestino(e.target.value); setPiezaDestinoId(''); }}
          >
            <option value="">— Elegir jugador —</option>
            {otrosJugadores.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
          </select>

          {intercambioDestino && (
            <>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Recibir a cambio:</div>
              <select
                style={{ fontSize: 11, padding: 4, borderRadius: 4, border: '1px solid #e5e7eb', fontFamily: 'inherit', width: '100%' }}
                value={piezaDestinoId}
                onChange={e => setPiezaDestinoId(e.target.value)}
              >
                <option value="">— Elegir pieza —</option>
                {piezasDestinoDisponibles.map(p => (
                  <option key={p.id} value={p.id}>{p.id} · {p.forma} · {p.color}</option>
                ))}
              </select>
            </>
          )}

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button
              onClick={handleConfirmarIntercambio}
              disabled={!intercambioDestino || !piezaDestinoId}
              style={{ ...btn('#dcfce7', '#15803d', '#86efac', '11px', '4px 8px'), opacity: (!intercambioDestino || !piezaDestinoId) ? 0.45 : 1 }}
            >Confirmar</button>
            <button
              onClick={() => { limpiarPendiente(jugador.id); setIntercambioDestino(null); setPiezaDestinoId(''); }}
              style={btn('#fee2e2', '#b91c1c', '#fca5a5', '11px', '4px 8px')}
            >Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Historial de intercambios ── */}
      {jugador.intercambios.length > 0 && (
        <details style={{ fontSize: 10, color: '#6b7280' }}>
          <summary style={{ cursor: 'pointer' }}>Ver intercambios ({jugador.intercambios.length})</summary>
          {jugador.intercambios.map((ic, idx) => (
            <div key={idx} style={{ paddingLeft: 8, marginTop: 2 }}>
              T{ic.turno ?? '?'}: dio {ic.piezaDada?.forma?.split('-')[0] ?? '?'} → recibió {ic.piezaRecibida?.forma?.split('-')[0] ?? '?'}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

// ─── Panel IA ─────────────────────────────────────────────────────────────────

function PanelIA({ jugadores, pool }) {
  const insights = useMemo(() => {
    const result = [];

    const jugAtascado = jugadores.find(j => j.turnosSinColocar >= 3);
    if (jugAtascado) {
      result.push({
        tipo: 'warning',
        titulo: 'Mediación sugerida',
        texto: `${jugAtascado.nombre} lleva ${jugAtascado.turnosSinColocar} turnos sin colocar. Revisa si algún compañero tiene lo que necesita.`
      });
    }

    const lider = [...jugadores].sort((a, b) =>
      b.tablero.filter(g => g.ocupado).length - a.tablero.filter(g => g.ocupado).length
    )[0];
    const liderGaps = lider.tablero.filter(g => g.ocupado).length;
    if (liderGaps > 0) {
      result.push({
        tipo: 'info',
        titulo: 'Avance positivo',
        texto: `${lider.nombre} va muy bien (${liderGaps}/9 gaps).`
      });
    }

    return result;
  }, [jugadores]);

  const enMesa    = pool.filter(p => p.estado === 'mesa').length;
  const enMano    = pool.filter(p => p.estado === 'mano').length;
  const colocadas = pool.filter(p => p.estado === 'colocada').length;

  return (
    <div style={{
      width: 176, flexShrink: 0,
      background: 'white', borderRadius: 10,
      border: '0.5px solid #e5e7eb',
      padding: 10,
      display: 'flex', flexDirection: 'column', gap: 8,
      overflowY: 'auto'
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Asistente IA</div>

      {insights.map((ins, idx) => (
        <div key={idx} style={{
          background: ins.tipo === 'warning' ? '#fef3c7' : '#dbeafe',
          borderRadius: 6, padding: '6px 8px'
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2, color: ins.tipo === 'warning' ? '#92400e' : '#1d4ed8' }}>
            {ins.titulo}
          </div>
          <div style={{ fontSize: 10, lineHeight: 1.4, color: ins.tipo === 'warning' ? '#78350f' : '#1e40af' }}>
            {ins.texto}
          </div>
        </div>
      ))}

      <div style={{ background: '#f9fafb', borderRadius: 6, padding: '6px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Pool de piezas</div>
        {[
          { label: 'En mesa',   value: enMesa,    color: '#6b7280' },
          { label: 'En mano',   value: enMano,    color: '#d97706' },
          { label: 'Colocadas', value: colocadas, color: '#16a34a' }
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: item.color, marginTop: 2 }}>
            <span>{item.label}</span>
            <span style={{ fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
        <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 4 }}>
          Total: {enMesa + enMano + colocadas}/44
        </div>
      </div>
    </div>
  );
}

// ─── Modal Ajustes ────────────────────────────────────────────────────────────

function ModalAjustes({ jugadores, onGuardar, onCerrar }) {
  const [local, setLocal] = useState(jugadores);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{ width: 400, background: 'white', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Ajustes de sesión</div>

        {local.map(j => (
          <div key={j.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              style={{ flex: 1, height: 36, padding: '0 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }}
              value={j.nombre}
              onChange={e => setLocal(prev => prev.map(p => p.id === j.id ? { ...p, nombre: e.target.value } : p))}
            />
            <select
              style={{ height: 36, padding: '0 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }}
              value={j.tableroAsignado}
              onChange={e => setLocal(prev => prev.map(p => p.id === j.id ? { ...p, tableroAsignado: e.target.value } : p))}
            >
              {Object.keys(TABLEROS_CONFIG).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => { onGuardar(local); onCerrar(); }} style={btn('#dbeafe', '#1d4ed8', '#93c5fd', '13px', '8px 16px')}>
            Guardar
          </button>
          <button onClick={onCerrar} style={btn(undefined, undefined, undefined, '13px', '8px 16px')}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SessionActive (principal) ────────────────────────────────────────────────

export default function SessionActive() {
  const { navigateTo, setSessionState, sessionState } = useApp();

  const [sesion, setSesion] = useState({
    activa: false,
    tiempoRestante: 1500,
    turnoActual: 0,
    turnoNumero: 0
  });

  // Prefer jugadores from context (set by SessionSelector) over the default mock
  const [jugadores, setJugadores] = useState(() => {
    const ctx = sessionState?.jugadores;
    if (ctx?.length > 0 && ctx[0]?.tableroAsignado) return ctx;
    return MOCK_RESIDENTS.slice(0, 4).map((r, i) => ({
      id: r.id,
      nombre: r.nombre,
      iniciales: r.iniciales,
      tableroAsignado: ['casa', 'barco', 'flor', 'cafe'][i],
      tablero: Array(9).fill(null).map((_, idx) => ({ id: idx, ocupado: false, pieza: null })),
      piezasEnMano: [],
      acciones: [],
      intercambios: [],
      turnosSinColocar: 0
    }));
  });

  const [pool, setPool] = useState(() =>
    sessionState?.pool?.length > 0 ? [...sessionState.pool] : POOL_PIEZAS
  );
  const [piezaSeleccionada, setPiezaSeleccionada] = useState({});
  const [accionPendiente, setAccionPendiente] = useState({});
  const [mostrarAjustes, setMostrarAjustes]   = useState(false);

  // Temporizador — ref evita intervalos huérfanos en StrictMode
  const intervalRef = useRef(null);
  useEffect(() => {
    if (!sesion.activa) return;
    intervalRef.current = setInterval(() => {
      setSesion(s => {
        if (s.tiempoRestante <= 0) return { ...s, activa: false };
        return { ...s, tiempoRestante: s.tiempoRestante - 1 };
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [sesion.activa]);

  // ── Acciones ──

  const registrarAccion = (jugadorId, tipo, pieza, autonomo) => {
    const nuevaAccion = { tipo, pieza, autonomo, turno: sesion.turnoNumero, timestamp: Date.now() };

    if (tipo === 'queda') {
      setJugadores(prev => prev.map(j =>
        j.id === jugadorId
          ? { ...j, piezasEnMano: [...j.piezasEnMano, pieza], acciones: [...j.acciones, nuevaAccion] }
          : j
      ));
      setPool(prev => prev.map(p => p.id === pieza.id ? { ...p, estado: 'mano', propietarioId: jugadorId } : p));
      setPiezaSeleccionada(prev => ({ ...prev, [jugadorId]: null }));
    }

    if (tipo === 'gap') {
      setAccionPendiente(prev => ({ ...prev, [jugadorId]: { tipo: 'gap', pieza } }));
      setPiezaSeleccionada(prev => ({ ...prev, [jugadorId]: null }));
    }

    if (tipo === 'intercambio') {
      setAccionPendiente(prev => ({ ...prev, [jugadorId]: { tipo: 'intercambio', pieza } }));
      setPiezaSeleccionada(prev => ({ ...prev, [jugadorId]: null }));
    }
  };

  const colocarEnGap = (jugadorId, gapId, pieza) => {
    setJugadores(prev => prev.map(j => {
      if (j.id !== jugadorId) return j;
      return {
        ...j,
        tablero: j.tablero.map(g => g.id === gapId ? { ...g, ocupado: true, pieza } : g),
        piezasEnMano: j.piezasEnMano.filter(p => p.id !== pieza.id),
        turnosSinColocar: 0
      };
    }));
    setPool(prev => prev.map(p => p.id === pieza.id ? { ...p, estado: 'colocada' } : p));
    setAccionPendiente(prev => { const n = { ...prev }; delete n[jugadorId]; return n; });
    setPiezaSeleccionada(prev => ({ ...prev, [jugadorId]: null }));
  };

  const ejecutarIntercambio = (jugadorOrigenId, jugadorDestinoId, piezaOrigen, piezaDestino) => {
    setJugadores(prev => prev.map(j => {
      if (j.id === jugadorOrigenId) {
        return {
          ...j,
          piezasEnMano: [...j.piezasEnMano.filter(p => p.id !== piezaOrigen.id), piezaDestino],
          intercambios: [...j.intercambios, {
            conJugadorId: jugadorDestinoId,
            piezaDada: piezaOrigen,
            piezaRecibida: piezaDestino,
            turno: sesion.turnoNumero
          }]
        };
      }
      if (j.id === jugadorDestinoId) {
        return { ...j, piezasEnMano: [...j.piezasEnMano.filter(p => p.id !== piezaDestino.id), piezaOrigen] };
      }
      return j;
    }));
    setAccionPendiente(prev => { const n = { ...prev }; delete n[jugadorOrigenId]; return n; });
    setPiezaSeleccionada(prev => ({ ...prev, [jugadorOrigenId]: null }));
  };

  const cambioTurno = () => {
    // Captura el índice actual antes del setState para evitar stale closure
    const turnoActualSnap = sesion.turnoActual;
    setSesion(s => ({ ...s, turnoActual: (s.turnoActual + 1) % 4, turnoNumero: s.turnoNumero + 1 }));
    setJugadores(prev => prev.map((j, i) =>
      i === turnoActualSnap ? { ...j, turnosSinColocar: j.turnosSinColocar + 1 } : j
    ));
  };

  const terminarSesion = () => {
    if (!confirm('¿Terminar la sesión activa?')) return;
    // Sincronizar al contexto global para que V2A (encuesta) tenga los datos
    setSessionState(prev => ({ ...prev, jugadores, pool, activa: false, turnoNumero: sesion.turnoNumero }));
    navigateTo('survey');
  };

  const jugadorActivo = jugadores[sesion.turnoActual];

  return (
    <div style={{ height: '100vh', background: '#1a1a1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Zona superior ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 8, padding: '8px 8px 0', overflow: 'hidden' }}>

        {/* Grid 2×2 */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8 }}>
          {jugadores.map((jugador, i) => (
            <PlayerBlock
              key={jugador.id}
              jugador={jugador}
              esActivo={sesion.turnoActual === i}
              turnoNumero={sesion.turnoNumero}
              pool={pool}
              piezaSeleccionada={piezaSeleccionada}
              accionPendiente={accionPendiente}
              todosJugadores={jugadores}
              onRegistrar={registrarAccion}
              onColocarGap={colocarEnGap}
              onIntercambio={ejecutarIntercambio}
              onSetPiezaSeleccionada={setPiezaSeleccionada}
              onSetAccionPendiente={setAccionPendiente}
            />
          ))}
        </div>

        {/* Panel IA */}
        <PanelIA jugadores={jugadores} pool={pool} />
      </div>

      {/* ── Banner inferior ── */}
      <div style={{
        height: 52, flexShrink: 0, margin: 8,
        background: 'white', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: timerColor(sesion.tiempoRestante), lineHeight: 1 }}>
            {formatTime(sesion.tiempoRestante)}
          </span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            KIN DÍA · Turno: {jugadorActivo?.nombre}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={cambioTurno} style={btn(undefined, undefined, undefined, '12px', '6px 12px')}>
            Cambio turno
          </button>
          <button
            onClick={() => setSesion(s => ({ ...s, activa: !s.activa }))}
            style={btn(
              sesion.activa ? '#fef3c7' : '#dbeafe',
              sesion.activa ? '#b45309' : '#1d4ed8',
              sesion.activa ? '#fcd34d' : '#93c5fd',
              '12px', '6px 12px'
            )}
          >
            {sesion.activa ? 'Pausa' : 'Iniciar'}
          </button>
          <button onClick={() => setMostrarAjustes(true)} style={btn(undefined, undefined, undefined, '12px', '6px 12px')}>
            Ajustes
          </button>
          <button onClick={terminarSesion} style={btn('#fee2e2', '#b91c1c', '#fca5a5', '12px', '6px 12px')}>
            Terminar sesión
          </button>
        </div>
      </div>

      {/* ── Modal ajustes ── */}
      {mostrarAjustes && (
        <ModalAjustes
          jugadores={jugadores}
          onGuardar={setJugadores}
          onCerrar={() => setMostrarAjustes(false)}
        />
      )}
    </div>
  );
}
