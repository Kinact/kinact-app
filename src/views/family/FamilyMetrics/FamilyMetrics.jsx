import { useState } from 'react';
import FamilyMetricDetail from '../FamilyMetricDetail/FamilyMetricDetail';

// ─── Mock data ────────────────────────────────────────────────────────────────

const DATOS_ACTUALES = {
  turnos:                   { valor: 19,             tendencia: 'mejora' },
  colaboraciones:           { valor: 5,              tendencia: 'mejora' },
  autonomia_juego:          { valor: '78%',          tendencia: 'mejora' },
  estado_animo:             { valor: 'Muy bien',     tendencia: 'mejora' },
  engagement:               { valor: 'Alto',         tendencia: 'mejora' },
  autonomia_general:        { valor: 'Autónoma',     tendencia: 'mejora' },
  memoria:                  { valor: '22/30',        tendencia: 'igual'  },
  estado_emocional_clinico: { valor: 'Sin síntomas', tendencia: 'mejora' },
  autonomia_diaria:         { valor: 'Leve ayuda',   tendencia: 'igual'  },
  movilidad:                { valor: 'Muy bien',     tendencia: 'mejora' },
};

const BLOQUES = [
  {
    id: 'juego',
    titulo: 'Durante el juego',
    metricas: [
      { id: 'turnos',          titulo: 'Turnos completados',          subtitulo: 'Participación activa en la sesión' },
      { id: 'colaboraciones',  titulo: 'Colaboraciones con el grupo', subtitulo: 'Intercambios realizados esta sesión' },
      { id: 'autonomia_juego', titulo: 'Decisiones por su cuenta',    subtitulo: 'Sin necesitar ayuda del equipo' }
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
      { id: 'memoria',                  titulo: 'Memoria y atención',          subtitulo: 'Última revisión: enero 2026' },
      { id: 'estado_emocional_clinico', titulo: 'Estado emocional clínico',    subtitulo: 'Última revisión: enero 2026' },
      { id: 'autonomia_diaria',         titulo: 'Autonomía en el día a día',   subtitulo: 'Última revisión: enero 2026' },
      { id: 'movilidad',                titulo: 'Movilidad y equilibrio',      subtitulo: 'Última medición: abril 2026' }
    ]
  }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TENDENCIA_LABEL = { mejora: '↑ mejora', igual: '→ estable', baja: '↓ descenso' };
const TENDENCIA_COLOR = { mejora: '#16a34a', igual: '#6b7280', baja: '#dc2626' };

function getColorValor(tendencia) {
  return tendencia === 'mejora' ? '#16a34a' : tendencia === 'baja' ? '#dc2626' : '#6b7280';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FamilyMetrics({ residenteNombre = 'María Carmen', onBack }) {
  const [metricaDetalle, setMetricaDetalle] = useState(null);

  // Navegación interna a detalle
  if (metricaDetalle !== null) {
    return (
      <FamilyMetricDetail
        metricaId={metricaDetalle}
        residenteNombre={residenteNombre}
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
            const dato    = DATOS_ACTUALES[metrica.id];
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
                {/* Izquierda */}
                <div>
                  <div style={{ fontSize: 13, color: '#111827' }}>{metrica.titulo}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{metrica.subtitulo}</div>
                </div>

                {/* Derecha */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: getColorValor(dato.tendencia) }}>
                      {dato.valor}
                    </div>
                    <div style={{ fontSize: 10, color: TENDENCIA_COLOR[dato.tendencia], marginTop: 1 }}>
                      {TENDENCIA_LABEL[dato.tendencia]}
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
