import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_RESIDENTS } from '../../../data/mockData';

// ─── Mock data ────────────────────────────────────────────────────────────────

// Grupo A: altas prestaciones · Grupo B: mayor soporte
const GRUPO_A_IDS = ['r1', 'r3', 'r5', 'r7']; // Rosa, Dolores, Concha, Pilar
const GRUPO_B_IDS = ['r2', 'r4', 'r6', 'r8']; // Paco, Tomás, Emilio, Bernardo

function primerNombre(id) {
  return MOCK_RESIDENTS.find(r => r.id === id)?.nombre.split(' ')[0] || id;
}

const SESIONES_PROGRAMADAS = [
  { id: 'sp1', nombre: 'Grupo A', hora: 'HOY · 11:00h', esHoy: true,
    jugadores: GRUPO_A_IDS.map(primerNombre),
    residenteIds: GRUPO_A_IDS,
    tableros: GRUPO_A_IDS.map(id => MOCK_RESIDENTS.find(r => r.id === id)?.tableroHabitual || 'casa') },
  { id: 'sp2', nombre: 'Grupo B', hora: 'LUN 27 · 10:30h', esHoy: false,
    jugadores: GRUPO_B_IDS.map(primerNombre),
    residenteIds: GRUPO_B_IDS,
    tableros: GRUPO_B_IDS.map(id => MOCK_RESIDENTS.find(r => r.id === id)?.tableroHabitual || 'casa') },
  { id: 'sp3', nombre: 'Grupo A', hora: 'MAR 28 · 11:00h', esHoy: false,
    jugadores: GRUPO_A_IDS.map(primerNombre),
    residenteIds: GRUPO_A_IDS,
    tableros: GRUPO_A_IDS.map(id => MOCK_RESIDENTS.find(r => r.id === id)?.tableroHabitual || 'casa') },
  { id: 'sp4', nombre: 'Grupo B', hora: 'MIÉ 29 · 10:30h', esHoy: false,
    jugadores: GRUPO_B_IDS.map(primerNombre),
    residenteIds: GRUPO_B_IDS,
    tableros: GRUPO_B_IDS.map(id => MOCK_RESIDENTS.find(r => r.id === id)?.tableroHabitual || 'casa') },
];

const SESIONES_RECIENTES = [
  { id: 'sr1', nombre: 'Grupo A', fecha: '7 abr', duracion: '25 min',
    jugadores: GRUPO_A_IDS.map(primerNombre),
    residenteIds: GRUPO_A_IDS, estado: 'completada' },
  { id: 'sr2', nombre: 'Grupo B', fecha: '7 abr', duracion: '23 min',
    jugadores: GRUPO_B_IDS.map(primerNombre),
    residenteIds: GRUPO_B_IDS, estado: 'completada' },
  { id: 'sr3', nombre: 'Grupo A', fecha: '31 mar', duracion: '26 min',
    jugadores: GRUPO_A_IDS.map(primerNombre),
    residenteIds: GRUPO_A_IDS, estado: 'completada' },
  { id: 'sr4', nombre: 'Grupo B', fecha: '31 mar', duracion: '22 min',
    jugadores: GRUPO_B_IDS.map(primerNombre),
    residenteIds: GRUPO_B_IDS, estado: 'completada' },
  { id: 'sr5', nombre: 'Grupo A', fecha: '24 mar', duracion: '25 min',
    jugadores: GRUPO_A_IDS.map(primerNombre),
    residenteIds: GRUPO_A_IDS, estado: 'completada' },
];

const TABLEROS = ['casa','barco','flor','cafe'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Para sesiones programadas: busca por nombre exacto; si no encuentra, usa
// el residente del mismo índice como fallback (datos de demo).
function resolverJugadores(nombres) {
  return nombres.map((nombre, i) =>
    MOCK_RESIDENTS.find(r => r.nombre === nombre) || MOCK_RESIDENTS[i] || null
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SessionSelector({ onIniciarSesion, onVerResidentes }) {
  const { logout, profile, user } = useApp();
  const nombreFacilitador = profile?.nombre || user?.email?.split('@')[0] || 'Facilitadora';

  const [historialExpandido, setHistorialExpandido]     = useState(false);
  const [nuevaPartidaExpandida, setNuevaPartidaExpandida] = useState(true);
  const [jugadores, setJugadores] = useState([null, null, null, null]);

  const fechaHoy = capitalize(
    new Date().toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  );

  const empezarDisabled   = jugadores.some(id => !id);
  const sesionesVisibles  = historialExpandido ? SESIONES_RECIENTES : SESIONES_RECIENTES.slice(0, 2);
  const slotsExtra        = Math.max(0, 5 - SESIONES_PROGRAMADAS.length);

  const setJugador = (i, val) => {
    const nuevo = [...jugadores];
    nuevo[i] = val || null;
    setJugadores(nuevo);
  };

  const repetirGrupo = (sesion) => {
    setJugadores(sesion.residenteIds.map(id => id || null));
    setNuevaPartidaExpandida(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{
      background: '#1a1a1a', minHeight: '100vh', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
      fontFamily: 'inherit', boxSizing: 'border-box'
    }}>

      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'white' }}>
            Facilitadora: {nombreFacilitador}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
            Residencia Santa Clara · {fechaHoy}
          </div>
        </div>
        <button onClick={logout} style={btn('#transparent', '#4b5563', '0.5px solid #374151')}>
          Cerrar sesión
        </button>
      </div>

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>

        {/* ── COLUMNA IZQUIERDA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Nueva partida */}
          <div style={{
            background: '#2563eb', borderRadius: 8, padding: '14px 16px',
            border: '2px solid #3b82f6'
          }}>
            <div
              onClick={() => setNuevaPartidaExpandida(v => !v)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'white' }}>+ Nueva partida</div>
                <div style={{ fontSize: 11, color: '#bfdbfe', marginTop: 3 }}>
                  Selecciona los jugadores y empieza ahora
                </div>
              </div>
              <span style={{ fontSize: 20, color: 'white', lineHeight: 1 }}>›</span>
            </div>

            {nuevaPartidaExpandida && (
              <div style={{ borderTop: '0.5px solid #3b82f6', paddingTop: 12, marginTop: 14 }}>
                <div style={{ fontSize: 11, color: '#93c5fd', marginBottom: 8 }}>
                  Selecciona 4 jugadores
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Número */}
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)', fontSize: 10, color: 'white',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {i + 1}
                      </div>

                      {/* Select */}
                      <select
                        value={jugadores[i] || ''}
                        onChange={e => setJugador(i, e.target.value)}
                        style={{
                          flex: 1, fontSize: 12, padding: '5px 8px', borderRadius: 6,
                          border: '0.5px solid #3b82f6', background: 'rgba(255,255,255,0.1)',
                          color: jugadores[i] ? 'white' : '#93c5fd',
                          fontFamily: 'inherit', minHeight: 36, cursor: 'pointer'
                        }}
                      >
                        <option value="" style={{ background: '#1e3a8a', color: '#93c5fd' }}>
                          — Seleccionar residente —
                        </option>
                        {MOCK_RESIDENTS.map(r => (
                          <option
                            key={r.id} value={r.id}
                            disabled={jugadores.some((id, j) => j !== i && id === r.id)}
                            style={{ background: '#1e3a8a', color: 'white' }}
                          >
                            {r.nombre}
                          </option>
                        ))}
                      </select>

                      {/* Badge tablero — usa tableroHabitual del residente seleccionado */}
                      <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                        background: 'rgba(255,255,255,0.15)', color: '#bfdbfe'
                      }}>
                        {capitalize(
                          jugadores[i]
                            ? (MOCK_RESIDENTS.find(r => r.id === jugadores[i])?.tableroHabitual || TABLEROS[i])
                            : TABLEROS[i]
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={empezarDisabled}
                  onClick={() => onIniciarSesion(
                    jugadores.map(id => MOCK_RESIDENTS.find(r => r.id === id)),
                    jugadores.map(id => MOCK_RESIDENTS.find(r => r.id === id)?.tableroHabitual || 'casa')
                  )}
                  style={{
                    marginTop: 12, width: '100%', padding: '9px 0',
                    background: empezarDisabled ? 'rgba(255,255,255,0.35)' : 'white',
                    color: empezarDisabled ? 'rgba(29,78,216,0.45)' : '#1d4ed8',
                    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500,
                    cursor: empezarDisabled ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', minHeight: 36
                  }}
                >
                  Empezar partida
                </button>
              </div>
            )}
          </div>

          {/* Partidas recientes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>Partidas recientes</span>
              <button
                onClick={() => setHistorialExpandido(v => !v)}
                style={btn('transparent', '#60a5fa', 'none')}
              >
                {historialExpandido ? 'Ocultar historial ↑' : 'Ver historial completo ↓'}
              </button>
            </div>

            {sesionesVisibles.map(sesion => (
              <div key={sesion.id} style={{
                background: '#262626', borderRadius: 8, border: '0.5px solid #374151',
                padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', cursor: 'default', minHeight: 44
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'white' }}>
                    KIN DÍA · {sesion.nombre}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    {sesion.jugadores.join(' · ')}
                  </div>
                  <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
                    {sesion.fecha} · {sesion.duracion}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 20,
                    background: '#166534', color: '#dcfce7'
                  }}>
                    Completada
                  </span>
                  <button
                    onClick={() => repetirGrupo(sesion)}
                    style={btn('transparent', '#60a5fa', 'none')}
                  >
                    Repetir grupo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>Partidas programadas</div>

          {SESIONES_PROGRAMADAS.map(sesion => sesion.esHoy ? (
            <div key={sesion.id} style={{
              background: '#1e3a5f', borderRadius: 8, border: '2px solid #2563eb',
              padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', minHeight: 44
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#60a5fa', marginBottom: 3 }}>{sesion.hora}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>KIN DÍA · {sesion.nombre}</div>
                <div style={{ fontSize: 11, color: '#93c5fd', marginTop: 2 }}>
                  {sesion.jugadores.join(' · ')}
                </div>
              </div>
              <button
                onClick={() => onIniciarSesion(
                sesion.residenteIds.map(id => MOCK_RESIDENTS.find(r => r.id === id)).filter(Boolean),
                sesion.tableros
              )}
                style={btn('#2563eb', 'white', 'none', true)}
              >
                Iniciar
              </button>
            </div>
          ) : (
            <div key={sesion.id} style={{
              background: '#262626', borderRadius: 8, border: '0.5px solid #374151',
              padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', minHeight: 44
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 3 }}>{sesion.hora}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>KIN DÍA · {sesion.nombre}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  {sesion.jugadores.join(' · ')}
                </div>
              </div>
              <span style={{
                fontSize: 10, padding: '3px 8px', background: '#374151',
                color: '#9ca3af', borderRadius: 4, flexShrink: 0
              }}>
                Pendiente
              </span>
            </div>
          ))}

          {/* Slots vacíos hasta completar mínimo 5 */}
          {Array(slotsExtra).fill(null).map((_, i) => (
            <div
              key={`slot-${i}`}
              style={{
                background: '#1f2937', borderRadius: 8, border: '0.5px dashed #4b5563',
                padding: '10px 12px', display: 'flex', justifyContent: 'center',
                alignItems: 'center', cursor: 'pointer', minHeight: 46
              }}
            >
              <span style={{ fontSize: 12, color: '#6b7280' }}>+ Programar nueva sesión</span>
            </div>
          ))}

          {/* Banner gestionar residentes */}
          <div
            onClick={onVerResidentes}
            style={{
              background: '#1c1f2e', borderRadius: 8, border: '0.5px solid #4b5563',
              padding: '14px 16px', cursor: 'pointer', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
              marginTop: 'auto', minHeight: 44
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#e5e7eb' }}>Gestionar residentes</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
                Fichas, historial y métricas del programa
              </div>
            </div>
            <div style={{
              width: 32, height: 32, background: '#374151', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', fontSize: 16, flexShrink: 0
            }}>›</div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function btn(bg, color, border, filled = false) {
  return {
    fontSize: 11, background: bg, color, border,
    borderRadius: filled ? 6 : 0, padding: filled ? '6px 14px' : 0,
    cursor: 'pointer', fontFamily: 'inherit', minHeight: 36,
    fontWeight: filled ? 500 : 400, flexShrink: 0
  };
}
