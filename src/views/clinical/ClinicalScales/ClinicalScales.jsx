import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_RESIDENTS, MOCK_ESCALAS } from '../../../data/mockData';
import { supabase } from '../../../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDiff(actual, ultimo, invertido = false) {
  if (!actual || !ultimo) return null;
  const diff = parseFloat(actual) - parseFloat(ultimo);
  if (isNaN(diff)) return null;
  if (diff === 0) return { texto: 'Sin cambio', color: '#6b7280', flecha: '→' };
  const mejora = invertido ? diff < 0 : diff > 0;
  return {
    texto: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} desde última medición`,
    color: mejora ? '#16a34a' : '#ef4444',
    flecha: diff > 0 ? '↑' : '↓'
  };
}

function interpretMEC(v)     { const n = parseFloat(v); if (isNaN(n)) return null; if (n >= 27) return { t: 'Normal', c: '#16a34a' }; if (n >= 24) return { t: 'Borderline', c: '#f59e0b' }; return { t: 'DCL', c: '#ef4444' }; }
function interpretGDS(v)     { const n = parseFloat(v); if (isNaN(n)) return null; if (n <= 5) return { t: 'Sin depresión', c: '#16a34a' }; if (n <= 10) return { t: 'Dep. leve', c: '#f59e0b' }; return { t: 'Dep. moderada', c: '#ef4444' }; }
function interpretBarthel(v) { const n = parseFloat(v); if (isNaN(n)) return null; if (n >= 91) return { t: 'Independiente', c: '#16a34a' }; if (n >= 61) return { t: 'Dep. leve', c: '#f59e0b' }; if (n >= 21) return { t: 'Dep. moderada', c: '#f59e0b' }; return { t: 'Dep. total', c: '#ef4444' }; }
function interpretTUG(v)     { const n = parseFloat(v); if (isNaN(n)) return null; if (n <= 12) return { t: 'Bajo riesgo caídas', c: '#16a34a' }; if (n <= 20) return { t: 'Riesgo moderado', c: '#f59e0b' }; return { t: 'Alto riesgo caídas', c: '#ef4444' }; }

// ─── EscalaCard ───────────────────────────────────────────────────────────────

function EscalaCard({
  titulo, descripcion, max, placeholder,
  valor, onChange,
  condEspecial, onCondChange,
  ultimo, interpretacion,
  isTUG = false,
  invertido = false,
  referencia = []
}) {
  const diff  = getDiff(valor, ultimo, invertido);
  const interp = valor !== '' ? interpretacion(valor) : null;

  return (
    <div style={{
      background: isTUG ? '#eff6ff' : 'white',
      border: isTUG ? '1px solid #93c5fd' : '1px solid #e5e7eb',
      borderRadius: 10, padding: 12,
      display: 'flex', flexDirection: 'column', gap: 8
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{titulo}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{descripcion}</div>
        </div>
        {ultimo !== undefined && ultimo !== null && (
          <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: 8 }}>
            Último: {ultimo}
          </span>
        )}
      </div>

      {/* Input + feedback en tiempo real */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="number"
          min={0}
          max={max}
          step={isTUG ? 0.1 : 1}
          value={valor}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: 70, fontSize: 18, padding: 8,
            textAlign: 'center', borderRadius: 8,
            border: '1px solid #d1d5db',
            fontFamily: 'inherit', color: '#111827',
            outline: 'none'
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {diff && (
            <span style={{ fontSize: 11, color: diff.color, fontWeight: 500 }}>
              {diff.flecha} {diff.texto}
            </span>
          )}
          {interp && (
            <span style={{ fontSize: 11, color: interp.c, fontWeight: 600 }}>
              {interp.t}
            </span>
          )}
        </div>
      </div>

      {/* Referencia */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {referencia.map(r => (
          <span key={r.rango} style={{ fontSize: 10, color: r.color }}>
            {r.rango} — {r.label}
          </span>
        ))}
      </div>

      {/* Nota TUG */}
      {isTUG && (
        <div style={{
          fontSize: 10, color: '#2563eb',
          background: '#e0f2fe', borderRadius: 4, padding: 4
        }}>
          Medir 3 veces y registrar la media.
        </div>
      )}

      {/* Condiciones especiales */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={condEspecial}
          onChange={e => onCondChange(e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
        Medición bajo condiciones especiales (excluir de tendencias)
      </label>
    </div>
  );
}

// ─── ClinicalScales ───────────────────────────────────────────────────────────

export default function ClinicalScales() {
  const { navigateTo, goBack } = useApp();

  const [residActual, setResidActual] = useState(0);
  const [valores, setValores] = useState(
    MOCK_RESIDENTS.map(r => ({
      residenteId: r.id,
      mec: '', gds: '', barthel: '', tug: '',
      condEspeciales: { mec: false, gds: false, barthel: false, tug: false },
      observaciones: ''
    }))
  );

  const residente = MOCK_RESIDENTS[residActual];
  const v         = valores[residActual];

  const setV    = (campo, valor) => setValores(prev => prev.map((e, i) => i === residActual ? { ...e, [campo]: valor } : e));
  const setCond = (escala, valor) => setValores(prev => prev.map((e, i) => i === residActual ? { ...e, condEspeciales: { ...e.condEspeciales, [escala]: valor } } : e));

  const histEscalas  = MOCK_ESCALAS[residente.id] || {};
  const ultimoMEC    = histEscalas.mec?.slice(-1)[0]?.valor;
  const ultimoGDS    = histEscalas.gds?.slice(-1)[0]?.valor;
  const ultimoBarthel = histEscalas.barthel?.slice(-1)[0]?.valor;
  const ultimoTUG    = histEscalas.tug?.slice(-1)[0]?.valor;

  const guardarEscala = async (idx) => {
    const r   = MOCK_RESIDENTS[idx];
    const v   = valores[idx];
    const hoy = new Date().toISOString().split('T')[0];

    // localStorage como fallback
    try {
      const entrada = { residenteId: r.id, fecha: hoy, valores: v };
      const prev = JSON.parse(localStorage.getItem('kinact_escalas') || '[]');
      const filtrado = prev.filter(e => !(e.residenteId === r.id && e.fecha === hoy));
      localStorage.setItem('kinact_escalas', JSON.stringify([...filtrado, entrada]));
    } catch { /* silencioso */ }

    // Supabase — solo si hay al menos un valor registrado
    const tieneValor = v.mec !== '' || v.gds !== '' || v.barthel !== '' || v.tug !== '';
    if (!tieneValor) return;

    // Upsert: reemplaza si ya existe entrada del mismo residente y fecha
    const { error } = await supabase
      .from('kinact_escalas')
      .upsert({
        residente_id:  r.id,
        fecha:         hoy,
        mec:           v.mec     !== '' ? Number(v.mec)     : null,
        gds:           v.gds     !== '' ? Number(v.gds)     : null,
        barthel:       v.barthel !== '' ? Number(v.barthel) : null,
        tug:           v.tug     !== '' ? Number(v.tug)     : null,
        mec_cond:      v.condEspeciales.mec,
        gds_cond:      v.condEspeciales.gds,
        barthel_cond:  v.condEspeciales.barthel,
        tug_cond:      v.condEspeciales.tug,
        observaciones: v.observaciones || ''
      }, { onConflict: 'residente_id,fecha' });

    if (error) console.warn('Error guardando escala:', error.message);
  };

  const handleSiguiente = async () => {
    await guardarEscala(residActual);
    setResidActual(i => i + 1);
  };

  const handleGuardarCerrar = async () => {
    await guardarEscala(residActual);
    goBack();
  };

  const esUltimo = residActual === MOCK_RESIDENTS.length - 1;

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', padding: 16, overflowY: 'auto' }}>
      <div style={{
        maxWidth: 800, margin: '0 auto',
        background: 'white', borderRadius: 16,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 14
      }}>

        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Revisión trimestral · Abril 2026</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Registro de escalas clínicas</div>
          </div>
          <span style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 20,
            background: '#fef3c7', color: '#b45309', fontWeight: 500
          }}>
            {MOCK_RESIDENTS.length} residentes pendientes
          </span>
        </div>

        {/* ── Tabs de residentes ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MOCK_RESIDENTS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setResidActual(i)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                border: i === residActual ? '0.5px solid #93c5fd' : '0.5px solid #e5e7eb',
                background: i === residActual ? '#dbeafe' : '#f9fafb',
                color: i === residActual ? '#1d4ed8' : '#6b7280'
              }}
            >
              {r.nombre.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* ── Grid 2×2 de escalas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <EscalaCard
            titulo="MEC"
            descripcion="Mini-Examen Cognoscitivo"
            max={30}
            placeholder="0–30"
            valor={v.mec}
            onChange={val => setV('mec', val)}
            condEspecial={v.condEspeciales.mec}
            onCondChange={val => setCond('mec', val)}
            ultimo={ultimoMEC}
            interpretacion={interpretMEC}
            invertido={false}
            referencia={[
              { rango: '27–30', label: 'Normal',              color: '#16a34a' },
              { rango: '24–26', label: 'Borderline',           color: '#f59e0b' },
              { rango: '≤23',   label: 'Deterioro cognitivo',  color: '#ef4444' }
            ]}
          />

          <EscalaCard
            titulo="GDS-15"
            descripcion="Escala de Depresión Geriátrica"
            max={15}
            placeholder="0–15"
            valor={v.gds}
            onChange={val => setV('gds', val)}
            condEspecial={v.condEspeciales.gds}
            onCondChange={val => setCond('gds', val)}
            ultimo={ultimoGDS}
            interpretacion={interpretGDS}
            invertido={true}
            referencia={[
              { rango: '0–5',   label: 'Sin depresión',   color: '#16a34a' },
              { rango: '6–10',  label: 'Dep. leve',       color: '#f59e0b' },
              { rango: '11–15', label: 'Dep. moderada',   color: '#ef4444' }
            ]}
          />

          <EscalaCard
            titulo="Barthel"
            descripcion="Índice de autonomía en AVD"
            max={100}
            placeholder="0–100"
            valor={v.barthel}
            onChange={val => setV('barthel', val)}
            condEspecial={v.condEspeciales.barthel}
            onCondChange={val => setCond('barthel', val)}
            ultimo={ultimoBarthel}
            interpretacion={interpretBarthel}
            invertido={false}
            referencia={[
              { rango: '91–100', label: 'Independiente', color: '#16a34a' },
              { rango: '61–90',  label: 'Dep. leve',     color: '#f59e0b' },
              { rango: '21–60',  label: 'Dep. moderada', color: '#f59e0b' },
              { rango: '0–20',   label: 'Dep. total',    color: '#ef4444' }
            ]}
          />

          <EscalaCard
            titulo="TUG"
            descripcion="Timed Up and Go · medición mensual"
            max={60}
            placeholder="seg"
            valor={v.tug}
            onChange={val => setV('tug', val)}
            condEspecial={v.condEspeciales.tug}
            onCondChange={val => setCond('tug', val)}
            ultimo={ultimoTUG}
            interpretacion={interpretTUG}
            isTUG={true}
            invertido={true}
            referencia={[
              { rango: '< 12s',  label: 'Bajo riesgo caídas', color: '#16a34a' },
              { rango: '12–20s', label: 'Riesgo moderado',    color: '#f59e0b' },
              { rango: '> 20s',  label: 'Alto riesgo caídas', color: '#ef4444' }
            ]}
          />
        </div>

        {/* ── Observaciones ── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Observaciones clínicas (opcional)
          </div>
          <textarea
            value={v.observaciones}
            onChange={e => setV('observaciones', e.target.value)}
            placeholder="Notas sobre la medición, comportamiento del residente o circunstancias relevantes..."
            style={{
              width: '100%', height: 52, fontSize: 12,
              padding: 8, borderRadius: 8,
              border: '1px solid #d1d5db',
              resize: 'none', fontFamily: 'inherit',
              color: '#111827', outline: 'none'
            }}
          />
        </div>

        {/* ── Aviso trimestral ── */}
        <div style={{
          background: '#fef3c7', borderRadius: 8,
          padding: 10, border: '0.5px solid #fcd34d'
        }}>
          <span style={{ fontSize: 11, color: '#92400e' }}>
            Próxima revisión trimestral: julio 2026. La app enviará un recordatorio automático 7 días antes.
          </span>
        </div>

        {/* ── Pie ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={goBack}
            style={btnBase()}
          >
            Cancelar
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSiguiente}
              disabled={esUltimo}
              style={{
                ...btnBase(),
                opacity: esUltimo ? 0.4 : 1,
                cursor: esUltimo ? 'not-allowed' : 'pointer'
              }}
            >
              Guardar y siguiente residente
            </button>
            <button
              onClick={handleGuardarCerrar}
              style={btnBase('#2563eb', 'white', '#2563eb')}
            >
              Guardar y cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

function btnBase(bg, color, border) {
  return {
    padding: '8px 16px', fontSize: 13,
    borderRadius: 8, border: `1px solid ${border || '#e5e7eb'}`,
    background: bg || 'white', color: color || '#374151',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
  };
}
