import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_RESIDENTS, MOCK_SESSION_HISTORY, MOCK_ESCALAS } from '../../../data/mockData';
import { fmtFechaCorta as fmtCorta, fmtFechaLarga as fmtLarga } from '../../../utils/formatters';
import FamilyMetrics from '../FamilyMetrics/FamilyMetrics';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function traducirEstado(v)   { return { bajo: 'Difícil', neutro: 'Regular', positivo: 'Bien' }[v] || 'Bien'; }
function colorEstado(v)      { return { bajo: '#ef4444', neutro: '#f59e0b', positivo: '#16a34a' }[v] || '#16a34a'; }
function bgEstado(v)         { return { bajo: '#fee2e2', neutro: '#fef3c7', positivo: '#dcfce7' }[v] || '#dcfce7'; }
function traducirAutonomia(v){ return { dependiente: 'Con mucho apoyo', parcial: 'Con algo de ayuda', autonomo: 'Por su cuenta' }[v] || ''; }

function generarMensajeCalido(sesion, nombre) {
  const primerNombre = nombre.split(' ')[0];
  const estado  = { bajo: 'ha necesitado más apoyo hoy', neutro: 'ha tenido una sesión tranquila', positivo: 'ha tenido una sesión muy activa' }[sesion.estado];
  const tablero = sesion.gapsCompletados === 9
    ? 'Ha completado su tablero por completo'
    : `Ha completado ${sesion.gapsCompletados} de 9 piezas de su tablero`;
  const social  = sesion.intercambios > 3
    ? `Ha colaborado con sus compañeros ${sesion.intercambios} veces, muchas de ellas por iniciativa propia`
    : sesion.intercambios > 0
      ? `Ha participado en ${sesion.intercambios} intercambios con el grupo`
      : 'Ha trabajado de manera más independiente hoy';
  const energia = sesion.fatiga
    ? 'Se ha notado algo de cansancio al final.'
    : 'Ha mantenido buena energía durante toda la sesión.';
  return `${primerNombre} ${estado}. ${tablero}. ${social}. ${energia}`;
}

const BARRA_ANCHO = { bajo: '40%', neutro: '70%', positivo: '100%' };

// ─── FamilyPortal ─────────────────────────────────────────────────────────────

export default function FamilyPortal() {
  const { selectedResidentId, logout } = useApp();
  const [abierto,       setAbierto]      = useState(false);
  const [vistaActual,   setVistaActual]  = useState('portal');

  const residenteId  = selectedResidentId || 'r1';
  const residente    = MOCK_RESIDENTS.find(r => r.id === residenteId);
  const historial    = MOCK_SESSION_HISTORY[residenteId] || [];
  const escalas      = MOCK_ESCALAS[residenteId] || {};
  const ultimaSesion = historial[historial.length - 1];

  // Navegación a métricas (FamilyMetrics gestiona su propio detalle internamente)
  if (vistaActual === 'metricas') {
    return (
      <FamilyMetrics
        residenteNombre={residente?.nombre || 'María Carmen'}
        onBack={() => setVistaActual('portal')}
      />
    );
  }

  // Guard: si no hay datos todavía
  if (!residente || !ultimaSesion) {
    return (
      <div style={{ background: '#1a1a1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: 14 }}>Sin datos de sesión disponibles.</div>
      </div>
    );
  }

  const tug_actual   = escalas.tug?.[escalas.tug.length - 1]?.valor ?? null;
  const tug_anterior = escalas.tug?.[escalas.tug.length - 2]?.valor ?? null;
  const gds_actual   = escalas.gds?.[escalas.gds.length - 1]?.valor ?? null;

  // Guard: comparación segura de TUG
  const tugTend = (tug_actual !== null && tug_anterior !== null)
    ? (tug_actual < tug_anterior ? '↑ mejorando' : tug_actual > tug_anterior ? '↓ empeorando' : '→ estable')
    : '→ estable';
  const tugColor = tugTend.startsWith('↑') ? '#16a34a' : tugTend.startsWith('↓') ? '#ef4444' : '#6b7280';

  const ultimaSesionAnterior = historial[historial.length - 2];
  const estadoTend = ultimaSesionAnterior
    ? ultimaSesion.estado === ultimaSesionAnterior.estado ? '→' : (
        { bajo: 0, neutro: 1, positivo: 2 }[ultimaSesion.estado] >
        { bajo: 0, neutro: 1, positivo: 2 }[ultimaSesionAnterior.estado] ? '↑' : '↓'
      )
    : '→';
  const primerasSesion = historial[0];
  const intercambiosTend = ultimaSesion.intercambios > (primerasSesion?.intercambios || 0) ? '↑ más que al inicio' : '→ similar al inicio';

  const estadoLabel = { bajo: 'Necesita apoyo', neutro: 'Estable', positivo: 'Muy positivo' }[ultimaSesion.estado] || 'Estable';
  const tableroColor = ultimaSesion.gapsCompletados === 9 ? 'positivo' : 'neutro';

  const borderColor = colorEstado(ultimaSesion.estado) + '40'; // hex alpha ~25%

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: 16 }}>
      <div style={{
        maxWidth: 420, width: '100%',
        background: 'white', borderRadius: 16,
        padding: 16,
        display: 'flex', flexDirection: 'column', gap: 14,
        alignSelf: 'flex-start'
      }}>

        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#dbeafe', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 600, color: '#1d4ed8'
          }}>
            {residente.iniciales}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#111827' }}>{residente.nombre}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Residencia Santa Clara · Programa KINACT</div>
          </div>
        </div>

        {/* ── Mensaje cálido ── */}
        <div style={{
          background: bgEstado(ultimaSesion.estado),
          borderRadius: 10, padding: 12,
          border: `1px solid ${borderColor}`
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: colorEstado(ultimaSesion.estado), marginBottom: 6 }}>
            Última sesión · {fmtLarga(ultimaSesion.fecha)}
          </div>
          <div style={{ fontSize: 13, color: colorEstado(ultimaSesion.estado), lineHeight: 1.5 }}>
            {generarMensajeCalido(ultimaSesion, residente.nombre)}
          </div>
        </div>

        {/* ── 3 Indicadores ── */}
        <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Esta semana</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>

            {/* Estado de ánimo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: bgEstado(ultimaSesion.estado),
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: colorEstado(ultimaSesion.estado) }} />
              </div>
              <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>Estado de ánimo</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: colorEstado(ultimaSesion.estado), textAlign: 'center' }}>
                {traducirEstado(ultimaSesion.estado)}
              </span>
            </div>

            {/* Colaboraciones */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 600, color: '#1d4ed8'
              }}>
                {ultimaSesion.intercambios}
              </div>
              <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>Colaboraciones</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1d4ed8', textAlign: 'center' }}>Esta sesión</span>
            </div>

            {/* Tablero */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: bgEstado(tableroColor),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: colorEstado(tableroColor)
              }}>
                {ultimaSesion.gapsCompletados}/9
              </div>
              <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>Tablero</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: colorEstado(tableroColor), textAlign: 'center' }}>
                {ultimaSesion.gapsCompletados === 9 ? 'Completado' : 'En progreso'}
              </span>
            </div>

          </div>
        </div>

        {/* ── Historial semanal ── */}
        <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Cómo ha ido cada semana</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {historial.slice(-6).map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#9ca3af', width: 52, flexShrink: 0 }}>{fmtCorta(h.fecha)}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#f3f4f6', overflow: 'hidden' }}>
                  <div style={{
                    width: BARRA_ANCHO[h.estado] || '70%',
                    height: '100%',
                    borderRadius: 4,
                    background: colorEstado(h.estado),
                    transition: 'width 0.3s'
                  }} />
                </div>
                <span style={{ fontSize: 11, color: colorEstado(h.estado), width: 48, flexShrink: 0 }}>
                  {traducirEstado(h.estado)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Desplegable "Cómo se mueve y cómo está" ── */}
        <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
          <div
            onClick={() => setAbierto(a => !a)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Cómo se mueve y cómo está</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{abierto ? '▲' : '▾'} Ver historial</span>
          </div>

          {abierto && (
            <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

              {/* Movilidad */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Movilidad</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>Tiempo en levantarse y caminar</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{
                    fontSize: 16, fontWeight: 600,
                    color: tug_actual !== null ? (tug_actual <= 12 ? '#16a34a' : tug_actual <= 20 ? '#f59e0b' : '#ef4444') : '#9ca3af'
                  }}>
                    {tug_actual !== null ? `${tug_actual}s` : 'Sin datos'}
                  </span>
                  {tug_actual !== null && (
                    <span style={{ fontSize: 11, color: tugColor }}>{tugTend}</span>
                  )}
                </div>
              </div>

              {/* Estado emocional */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Estado emocional</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>Valoración del equipo este mes</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: colorEstado(ultimaSesion.estado) }}>
                    {estadoLabel}
                  </span>
                  <span style={{ fontSize: 11, color: estadoTend === '↑' ? '#16a34a' : estadoTend === '↓' ? '#ef4444' : '#6b7280' }}>
                    {estadoTend} vs sesión anterior
                  </span>
                </div>
              </div>

              {/* Autonomía */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Autonomía en el juego</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>Toma de decisiones por su cuenta</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginTop: 6 }}>
                  {traducirAutonomia(ultimaSesion.autonomia)}
                </div>
              </div>

              {/* Interacción */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Interacción con compañeros</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>Participación en actividades del grupo</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>
                    {ultimaSesion.intercambios} colaboraciones esta sesión
                  </span>
                  <span style={{ fontSize: 11, color: intercambiosTend.startsWith('↑') ? '#16a34a' : '#6b7280' }}>
                    {intercambiosTend}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ── Ver todas las métricas ── */}
        <div
          onClick={() => setVistaActual('metricas')}
          style={{
            background: 'white', borderRadius: 12, border: '0.5px solid #e5e7eb',
            padding: '12px 14px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Ver todas las métricas</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Seguimiento detallado del programa</div>
          </div>
          <div style={{ fontSize: 14, color: '#d1d5db' }}>›</div>
        </div>

        {/* ── Próxima sesión ── */}
        <div style={{
          background: 'white', border: '1px solid #f3f4f6',
          borderRadius: 10, padding: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Próxima sesión</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Miércoles 16 de abril · 11:00h</div>
          </div>
          <button style={{
            height: 36, padding: '6px 14px', fontSize: 12,
            borderRadius: 7, border: '1px solid #e5e7eb',
            background: 'white', color: '#374151',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
          }}>
            Contactar al equipo
          </button>
        </div>

        {/* ── Volver ── */}
        <button
          onClick={logout}
          style={{
            padding: '8px 0', fontSize: 12,
            borderRadius: 7, border: '1px solid #e5e7eb',
            background: 'white', color: '#6b7280',
            cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          ← Salir
        </button>

      </div>
    </div>
  );
}
