import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { TABLERO_COLORS } from '../../../constants/tableros';

const ESTADO_OPCIONES = [
  { valor: 'bajo',     emoji: ':(',  label: 'Bajo / retraído',  color: '#ef4444', bg: '#fee2e2' },
  { valor: 'neutro',   emoji: ':|',  label: 'Neutro / estable', color: '#2563eb', bg: '#dbeafe' },
  { valor: 'positivo', emoji: ':)',  label: 'Positivo / activo', color: '#16a34a', bg: '#dcfce7' }
];

const ENGAGEMENT_OPCIONES = [
  { valor: 'bajo',  label: 'Bajo',  barColor: '#ef4444', color: '#ef4444', bg: '#fee2e2' },
  { valor: 'medio', label: 'Medio', barColor: '#f59e0b', color: '#d97706', bg: '#fef3c7' },
  { valor: 'alto',  label: 'Alto',  barColor: '#16a34a', color: '#16a34a', bg: '#dcfce7' }
];

const AUTONOMIA_OPCIONES = [
  { valor: 'dependiente', letra: 'D', label: 'Dependiente', color: '#ef4444', bg: '#fee2e2' },
  { valor: 'parcial',     letra: 'P', label: 'Parcial',     color: '#d97706', bg: '#fef3c7' },
  { valor: 'autonomo',    letra: 'A', label: 'Autónomo',    color: '#16a34a', bg: '#dcfce7' }
];

export default function Survey() {
  const { navigateTo, setEvaluaciones, sessionState } = useApp();

  // Usar los jugadores reales de la sesión activa
  const jugadores = sessionState?.jugadores || [];
  const total     = jugadores.length || 1;

  const [jugadorActual, setJugadorActual] = useState(0);
  const [evaluaciones, setEvaluacionesLocal] = useState(
    Array(total).fill(null).map(() => ({
      estadoEmocional: null,
      engagement:      null,
      autonomia:       null,
      agitacion:       null,
      fatiga:          null,
      observaciones:   ''
    }))
  );

  const jugador    = jugadores[jugadorActual] || {};
  const evalActual = evaluaciones[jugadorActual] || {};
  const tableroKey = jugador.tableroAsignado || jugador.tableroHabitual || 'casa';
  const colores    = TABLERO_COLORS[tableroKey] || TABLERO_COLORS.casa;

  const completo =
    evalActual.estadoEmocional !== null &&
    evalActual.engagement      !== null &&
    evalActual.autonomia       !== null &&
    evalActual.agitacion       !== null &&
    evalActual.fatiga          !== null;

  const setField = (campo, valor) => {
    setEvaluacionesLocal(prev =>
      prev.map((e, i) => i === jugadorActual ? { ...e, [campo]: valor } : e)
    );
  };

  const siguiente = () => {
    if (jugadorActual < total - 1) {
      setJugadorActual(j => j + 1);
    } else {
      setEvaluaciones(evaluaciones);
      navigateTo('summary');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        maxWidth: 700, width: '100%',
        background: 'white', borderRadius: 16,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 16
      }}>

        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Evaluación post-sesión</span>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>{jugador.nombre}</span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: colores.bg, color: colores.text,
              fontWeight: 500, alignSelf: 'flex-start'
            }}>
              {tableroKey}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array(total).fill(null).map((_, i) => (
                <div key={i} style={{
                  width: 28, height: 6, borderRadius: 3,
                  background: i <= jugadorActual ? '#2563eb' : '#e5e7eb'
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{jugadorActual + 1} de {total}</span>
          </div>
        </div>

        {/* ── Grid 2×2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* Bloque 1 — Estado emocional */}
          <div style={cardStyle}>
            <div style={labelStyle}>Estado emocional durante la sesión</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {ESTADO_OPCIONES.map(op => {
                const sel = evalActual.estadoEmocional === op.valor;
                return (
                  <div
                    key={op.valor}
                    onClick={() => setField('estadoEmocional', op.valor)}
                    style={{
                      flex: 1, borderRadius: 8, padding: 10, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      border: sel ? `2px solid ${op.color}` : '1px solid #e5e7eb',
                      background: sel ? op.bg : 'white',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: sel ? op.bg : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, color: sel ? op.color : '#9ca3af', fontWeight: 600
                    }}>
                      {op.emoji}
                    </div>
                    <span style={{ fontSize: 11, color: sel ? op.color : '#6b7280', textAlign: 'center', fontWeight: sel ? 600 : 400 }}>
                      {op.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bloque 2 — Engagement */}
          <div style={cardStyle}>
            <div style={labelStyle}>Nivel de engagement</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {ENGAGEMENT_OPCIONES.map(op => {
                const sel = evalActual.engagement === op.valor;
                return (
                  <div
                    key={op.valor}
                    onClick={() => setField('engagement', op.valor)}
                    style={{
                      flex: 1, borderRadius: 8, padding: '8px 4px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      border: sel ? `2px solid ${op.color}` : '1px solid #e5e7eb',
                      background: sel ? op.bg : 'white',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: 32, height: 6, borderRadius: 3,
                      background: sel ? op.barColor : '#e5e7eb'
                    }} />
                    <span style={{ fontSize: 11, color: sel ? op.color : '#6b7280', fontWeight: sel ? 600 : 400 }}>
                      {op.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bloque 3 — Autonomía */}
          <div style={cardStyle}>
            <div style={labelStyle}>Autonomía percibida</div>
            <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 2 }}>
              Valoración clínica del facilitador, independiente de los datos de sesión
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {AUTONOMIA_OPCIONES.map(op => {
                const sel = evalActual.autonomia === op.valor;
                return (
                  <div
                    key={op.valor}
                    onClick={() => setField('autonomia', op.valor)}
                    style={{
                      flex: 1, borderRadius: 8, padding: 10, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      border: sel ? `2px solid ${op.color}` : '1px solid #e5e7eb',
                      background: sel ? op.bg : 'white',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: sel ? op.bg : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700,
                      color: sel ? op.color : '#9ca3af'
                    }}>
                      {op.letra}
                    </div>
                    <span style={{ fontSize: 11, color: sel ? op.color : '#6b7280', fontWeight: sel ? 600 : 400 }}>
                      {op.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bloque 4 — Indicadores */}
          <div style={cardStyle}>
            <div style={labelStyle}>Indicadores observados</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {[
                { campo: 'agitacion', label: 'Agitación o rechazo' },
                { campo: 'fatiga',    label: 'Fatiga física aparente' }
              ].map(({ campo, label }) => {
                const val = evalActual[campo];
                return (
                  <div key={campo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setField(campo, false)}
                        style={{
                          height: 36, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                          fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
                          background: val === false ? '#dcfce7' : 'white',
                          color:      val === false ? '#15803d' : '#6b7280',
                          border:     val === false ? '1px solid #86efac' : '1px solid #e5e7eb',
                          transition: 'all 0.15s'
                        }}
                      >No</button>
                      <button
                        onClick={() => setField(campo, true)}
                        style={{
                          height: 36, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                          fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
                          background: val === true ? '#fee2e2' : 'white',
                          color:      val === true ? '#b91c1c' : '#6b7280',
                          border:     val === true ? '1px solid #fca5a5' : '1px solid #e5e7eb',
                          transition: 'all 0.15s'
                        }}
                      >Sí</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Observaciones ── */}
        <textarea
          style={{
            width: '100%', fontSize: 12, padding: 8,
            borderRadius: 8, border: '1px solid #d1d5db',
            resize: 'none', height: 52,
            fontFamily: 'inherit', color: '#111827',
            outline: 'none'
          }}
          placeholder="Notas sobre comportamiento, estado o aspectos relevantes observados..."
          value={evalActual.observaciones}
          onChange={e => setField('observaciones', e.target.value)}
        />

        {/* ── Botón siguiente ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={siguiente}
            disabled={!completo}
            style={{
              padding: '10px 28px', fontSize: 14,
              borderRadius: 8, border: 'none',
              fontFamily: 'inherit', fontWeight: 500,
              cursor: completo ? 'pointer' : 'not-allowed',
              background: completo ? '#2563eb' : '#e5e7eb',
              color:      completo ? 'white'   : '#9ca3af',
              transition: 'all 0.15s'
            }}
          >
            {jugadorActual < total - 1 ? 'Siguiente jugador →' : 'Ver resumen →'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Estilos reutilizables ─────────────────────────────────────────────────────

const cardStyle = {
  background: 'white',
  border: '1px solid #f3f4f6',
  borderRadius: 10,
  padding: 12
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#374151'
};
