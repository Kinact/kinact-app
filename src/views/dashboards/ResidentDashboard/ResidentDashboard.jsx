import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../../../context/AppContext';
import { MOCK_RESIDENTS, MOCK_SESSION_HISTORY, MOCK_ESCALAS } from '../../../data/mockData';
import { TABLERO_COLORS } from '../../../constants/tableros';
import { fmtFecha, fmtFechaCorta } from '../../../utils/formatters';
import { supabase } from '../../../lib/supabase';

// ─── Modal de confirmación de borrado ─────────────────────────────────────────

function ModalBorrar({ nombre, onConfirmar, onCancelar, borrando }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: 'white', borderRadius: 14,
        padding: 24, maxWidth: 400, width: '100%',
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
            Borrar datos del programa
          </span>
          <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
            Se eliminarán <strong>todas las sesiones y escalas clínicas</strong> de{' '}
            <strong>{nombre}</strong> guardadas en la base de datos.
            Esta acción no se puede deshacer.
          </span>
        </div>

        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 12, color: '#b91c1c'
        }}>
          ⚠️ Los datos de mock no se ven afectados. Solo se borran los registros reales de Supabase.
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancelar}
            disabled={borrando}
            style={{
              padding: '8px 16px', fontSize: 13, borderRadius: 8,
              border: '1px solid #e5e7eb', background: 'white', color: '#374151',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={borrando}
            style={{
              padding: '8px 18px', fontSize: 13, borderRadius: 8,
              border: 'none', background: borrando ? '#fca5a5' : '#dc2626',
              color: 'white', cursor: borrando ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontWeight: 600
            }}
          >
            {borrando ? 'Borrando…' : 'Sí, borrar datos'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Colores ──────────────────────────────────────────────────────────────────

const HEAT = {
  estado:    { bajo: '#fca5a5',      neutro: '#bfdbfe',   positivo: '#86efac' },
  engagement:{ bajo: '#fca5a5',      medio: '#fcd34d',    alto: '#86efac'     },
  autonomia: { dependiente: '#fca5a5', parcial: '#fcd34d', autonomo: '#86efac' },
  agitacion: { true: '#fca5a5',      false: '#86efac'                         }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function heatColor(campo, valor) {
  const map = HEAT[campo];
  if (!map) return '#e5e7eb';
  return map[String(valor)] || '#e5e7eb';
}

function tendenciaColor(t, inversa = false) {
  if (t === '→') return '#6b7280';
  const bueno = inversa ? '↓' : '↑';
  return t === bueno ? '#16a34a' : '#dc2626';
}

function calcTendencia(arr, campo, inversa = false) {
  if (!arr || arr.length < 2) return '→';
  const v1 = arr[0][campo];
  const vN = arr[arr.length - 1][campo];
  if (typeof vN === 'number') {
    if (vN > v1) return inversa ? '↓' : '↑';
    if (vN < v1) return inversa ? '↑' : '↓';
    return '→';
  }
  const orden = { bajo: 0, neutro: 1, positivo: 2, dependiente: 0, parcial: 1, autonomo: 2 };
  const o1 = orden[v1] ?? -1;
  const oN = orden[vN] ?? -1;
  if (oN > o1) return inversa ? '↓' : '↑';
  if (oN < o1) return inversa ? '↑' : '↓';
  return '→';
}

// Colores de valor clínico
function colorMEC(v)    { if (v < 23) return '#dc2626'; if (v < 27) return '#d97706'; return '#16a34a'; }
function colorGDS(v)    { if (v >= 11) return '#dc2626'; if (v >= 6) return '#d97706'; return '#16a34a'; }
function colorBarthel(v){ if (v < 21) return '#dc2626'; if (v < 61) return '#d97706'; if (v < 91) return '#f59e0b'; return '#16a34a'; }
function colorTUG(v)    { if (v > 20) return '#dc2626'; if (v > 12) return '#d97706'; return '#16a34a'; }

function interpretaMEC(v)    { if (v < 23) return 'Deterioro'; if (v < 27) return 'Leve'; return 'Normal'; }
function interpretaGDS(v)    { if (v >= 11) return 'Dep. severa'; if (v >= 6) return 'Dep. moderada'; return 'Normal'; }
function interpretaBarthel(v){ if (v < 21) return 'Dependencia total'; if (v < 61) return 'Dep. severa'; if (v < 91) return 'Dep. moderada'; return 'Independiente'; }
function interpretaTUG(v)    { if (v > 20) return 'Alto riesgo'; if (v > 12) return 'Riesgo moderado'; return 'Normal'; }

const ESCALAS_DEF = [
  { id: 'mec',     nombre: 'MEC',     desc: 'Mini Examen Cognoscitivo', colorFn: colorMEC,     interpFn: interpretaMEC,     unidad: 'pts',  inversa: false },
  { id: 'gds',     nombre: 'GDS-15',  desc: 'Escala de depresión geriátrica', colorFn: colorGDS, interpFn: interpretaGDS, unidad: 'pts',  inversa: true  },
  { id: 'barthel', nombre: 'Barthel', desc: 'Índice de dependencia funcional', colorFn: colorBarthel, interpFn: interpretaBarthel, unidad: 'pts', inversa: false },
  { id: 'tug',     nombre: 'TUG',     desc: 'Timed Up and Go (movilidad)',     colorFn: colorTUG, interpFn: interpretaTUG, unidad: 's',   inversa: true  }
];

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportarPDF(residente, historial, escalas, metricas) {
  const doc     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W       = 210;
  const M       = 16;           // margen lateral
  const col     = W - M * 2;
  const hoy     = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  let y         = 0;

  // ── Helpers de dibujo ──────────────────────────────────────────────────────
  const saltoSiNecesario = (h = 30) => {
    if (y + h > 275) { doc.addPage(); y = 20; }
  };

  const seccion = (titulo) => {
    saltoSiNecesario(14);
    doc.setFillColor(241, 245, 249);
    doc.rect(M, y, col, 7, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(titulo.toUpperCase(), M + 3, y + 4.8);
    y += 10;
  };

  const fila = (cols, alturas = 6, fondoPar = false, i = 0) => {
    saltoSiNecesario(alturas + 2);
    if (fondoPar && i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(M, y, col, alturas, 'F');
    }
    const anchos = Array.isArray(cols[0]) ? cols.map(c => c[1]) : null;
    const textos = Array.isArray(cols[0]) ? cols.map(c => c[0]) : cols;
    let x = M + 2;
    textos.forEach((t, idx) => {
      const ancho = anchos ? anchos[idx] : col / textos.length;
      doc.text(String(t ?? '—'), x, y + alturas - 1.5);
      x += ancho;
    });
    doc.setDrawColor(229, 231, 235);
    doc.line(M, y + alturas, M + col, y + alturas);
    y += alturas;
  };

  // ── CABECERA ────────────────────────────────────────────────────────────────
  doc.setFillColor(29, 78, 216);
  doc.rect(0, 0, W, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('KINACT', M, 13);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Informe individual de residente', M, 20);
  doc.text('Residencia Santa Clara', M, 26);
  doc.setFontSize(9);
  doc.text(hoy, W - M, 20, { align: 'right' });

  y = 38;

  // ── DATOS DEL RESIDENTE ─────────────────────────────────────────────────────
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(M, y, col, 22, 3, 3, 'F');

  // Avatar
  doc.setFillColor(29, 78, 216);
  doc.circle(M + 11, y + 11, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text(residente.iniciales, M + 11, y + 13, { align: 'center' });

  // Info
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text(residente.nombre, M + 23, y + 10);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Tablero: ${residente.tableroHabitual}   ·   Incorporación: ${residente.incorporacion}   ·   ${residente.sesiones} sesiones completadas`,
    M + 23, y + 17
  );

  y += 28;

  // ── MÉTRICAS CLAVE ──────────────────────────────────────────────────────────
  seccion('Métricas de rendimiento');

  const metW = col / 4;
  metricas.forEach((m, i) => {
    const x = M + i * metW;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, metW - 2, 18, 2, 2, 'FD');
    doc.setDrawColor(229, 231, 235);

    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(String(m.valor), x + metW / 2 - 1, y + 9, { align: 'center' });

    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(m.label, x + metW / 2 - 1, y + 14, { align: 'center' });

    // Tendencia con color
    const tendColor = m.tend === '→' ? [107,114,128] : (m.tend === '↑' && !m.inversa) || (m.tend === '↓' && m.inversa) ? [22,163,74] : [220,38,38];
    doc.setTextColor(...tendColor);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(m.tend, x + metW - 5, y + 5);
  });

  y += 24;

  // ── ESCALAS CLÍNICAS ────────────────────────────────────────────────────────
  seccion('Escalas clínicas validadas');

  ESCALAS_DEF.forEach(def => {
    const datos = escalas[def.id] || [];
    saltoSiNecesario(8 + datos.length * 6);

    // Título de escala
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`${def.nombre} — ${def.desc}`, M + 2, y + 5);

    if (datos.length === 0) {
      doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text('Sin registros', M + 2, y + 11);
      y += 14;
      return;
    }

    y += 7;

    // Cabecera tabla
    doc.setFillColor(241, 245, 249);
    doc.rect(M, y, col, 5.5, 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    [[`Fecha`, 40], [`Valor`, 30], [`Interpretación`, 60], [`Tend.`, 20]].forEach(([t, w], i, arr) => {
      let x = M + 2; arr.slice(0, i).forEach(([, ww]) => x += ww);
      doc.text(t, x, y + 4);
    });
    y += 5.5;

    // Filas
    datos.forEach((d, i) => {
      const prev = datos[i - 1];
      const t = prev
        ? d.valor < prev.valor ? (def.inversa ? '↑ Mejora' : '↓ Baja') : d.valor > prev.valor ? (def.inversa ? '↓ Baja' : '↑ Mejora') : '→ Estable'
        : '— Inicial';

      if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(M, y, col, 5.5, 'F'); }
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);

      const tendColor = t.includes('Mejora') ? [22,163,74] : t.includes('Baja') ? [220,38,38] : [107,114,128];
      const celdas = [
        [fmtFecha(d.fecha), 40, [107,114,128]],
        [`${d.valor} ${def.unidad}`, 30, [17,24,39]],
        [def.interpFn(d.valor), 60, [71,85,105]],
        [t, 20, tendColor]
      ];
      let x = M + 2;
      celdas.forEach(([txt, w, rgb]) => {
        doc.setTextColor(...rgb);
        doc.text(String(txt), x, y + 4);
        x += w;
      });
      doc.setDrawColor(229, 231, 235);
      doc.line(M, y + 5.5, M + col, y + 5.5);
      y += 5.5;
    });
    y += 5;
  });

  // ── HISTORIAL DE SESIONES ───────────────────────────────────────────────────
  seccion('Historial de sesiones');

  // Cabecera
  doc.setFillColor(241, 245, 249);
  doc.rect(M, y, col, 5.5, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  const hCols = [['Ses.', 14], ['Fecha', 26], ['Gaps', 18], ['Estado', 28], ['Engagement', 30], ['Autonomía', 30], ['Intercamb.', 22], ['Mediaciones', 10]];
  let hx = M + 2;
  hCols.forEach(([t, w]) => { doc.text(t, hx, y + 4); hx += w; });
  y += 5.5;

  historial.forEach((h, i) => {
    saltoSiNecesario(6);
    if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(M, y, col, 5.5, 'F'); }

    const estadoColor = h.estado === 'positivo' ? [22,163,74] : h.estado === 'bajo' ? [220,38,38] : [71,85,105];
    const autoColor   = h.autonomia === 'autonomo' ? [22,163,74] : h.autonomia === 'dependiente' ? [220,38,38] : [71,85,105];

    const celdas = [
      [`S${h.sesion}`,     14, [29,78,216]],
      [fmtFechaCorta(h.fecha), 26, [107,114,128]],
      [`${h.gapsCompletados}/9`, 18, [17,24,39]],
      [h.estado,           28, estadoColor],
      [h.engagement,       30, [71,85,105]],
      [h.autonomia,        30, autoColor],
      [String(h.intercambios), 22, [71,85,105]],
      [String(h.mediaciones),  10, [71,85,105]]
    ];
    let cx = M + 2;
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    celdas.forEach(([t, w, rgb]) => {
      doc.setTextColor(...rgb);
      doc.text(String(t), cx, y + 4);
      cx += w;
    });
    doc.setDrawColor(229, 231, 235);
    doc.line(M, y + 5.5, M + col, y + 5.5);
    y += 5.5;
  });

  y += 6;

  // ── RECOMENDACIÓN CLÍNICA ───────────────────────────────────────────────────
  const sN = historial[historial.length - 1];
  if (sN) {
    saltoSiNecesario(20);
    const recomendacion = sN.autonomia === 'autonomo' && sN.estado === 'positivo'
      ? 'Mantener el nivel. Excelente progresión. El residente muestra autonomía completa y estado emocional positivo.'
      : sN.mediaciones > 3
        ? 'Considerar ejercicios de negociación grupal para reducir las mediaciones necesarias.'
        : 'Buena evolución general. Continuar con el programa actual y monitorizar la progresión.';

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(M, y, col, 16, 3, 3, 'FD');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('Recomendación clínica', M + 3, y + 6);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 101, 52);
    doc.text(recomendacion, M + 3, y + 12, { maxWidth: col - 6 });
    y += 20;
  }

  // ── PIE DE PÁGINA ───────────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text(
      `KINACT · Residencia Santa Clara · ${residente.nombre} · Generado el ${hoy} · Pág. ${p}/${pages}`,
      W / 2, 291, { align: 'center' }
    );
  }

  doc.save(`kinact-${residente.nombre.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─── ResidentDashboard ────────────────────────────────────────────────────────

export default function ResidentDashboard() {
  const { navigateTo, goBack, selectedResidentId, userRole } = useApp();
  const [escalaAbierta, setEscalaAbierta]   = useState(null);
  const [sesionesReales, setSesionesReales] = useState(null);
  const [escalasReales, setEscalasReales]   = useState(null);
  const [modalBorrar, setModalBorrar]       = useState(false);
  const [borrando, setBorrando]             = useState(false);

  const residenteId = selectedResidentId || 'r1';
  const residente   = MOCK_RESIDENTS.find(r => r.id === residenteId);

  // ── Cargar sesiones y escalas reales de Supabase ───────────────────────────
  useEffect(() => {
    setSesionesReales(null);
    setEscalasReales(null);

    // Sesiones
    supabase
      .from('kinact_sesiones')
      .select('*')
      .eq('residente_id', residenteId)
      .order('fecha', { ascending: true })
      .order('sesion_num', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSesionesReales(data.map((s, i) => ({
            sesion:          s.sesion_num || i + 1,
            fecha:           s.fecha,
            gapsCompletados: s.gaps_completados,
            intercambios:    s.intercambios,
            mediaciones:     s.mediaciones,
            estado:          s.estado,
            engagement:      s.engagement,
            autonomia:       s.autonomia,
            agitacion:       s.agitacion,
            fatiga:          s.fatiga
          })));
        } else {
          setSesionesReales(MOCK_SESSION_HISTORY[residenteId] || []);
        }
      });

    // Escalas clínicas
    supabase
      .from('kinact_escalas')
      .select('*')
      .eq('residente_id', residenteId)
      .order('fecha', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Transformar al formato { mec: [{fecha, valor, condEspeciales}], ... }
          const escalas = { mec: [], gds: [], barthel: [], tug: [] };
          data.forEach(row => {
            if (row.mec     != null) escalas.mec.push({     fecha: row.fecha, valor: row.mec,     condEspeciales: row.mec_cond });
            if (row.gds     != null) escalas.gds.push({     fecha: row.fecha, valor: row.gds,     condEspeciales: row.gds_cond });
            if (row.barthel != null) escalas.barthel.push({ fecha: row.fecha, valor: row.barthel, condEspeciales: row.barthel_cond });
            if (row.tug     != null) escalas.tug.push({     fecha: row.fecha, valor: row.tug });
          });
          setEscalasReales(escalas);
        } else {
          setEscalasReales(MOCK_ESCALAS[residenteId] || {});
        }
      });
  }, [residenteId]);

  const historial = sesionesReales ?? MOCK_SESSION_HISTORY[residenteId] ?? [];
  const escalas   = escalasReales  ?? MOCK_ESCALAS[residenteId] ?? {};

  if (!residente) return null;

  const coloresTablero = TABLERO_COLORS[residente.tableroHabitual] || TABLERO_COLORS.casa;

  // ── Cálculos de métricas ──
  const SESIONES_PROGRAMA = 10; // programa de 10 sesiones semanales
  const asistencia       = historial.length > 0 ? Math.round((historial.length / SESIONES_PROGRAMA) * 100) : 0;
  const gapsMedia        = historial.length > 0 ? (historial.reduce((s, h) => s + h.gapsCompletados, 0) / historial.length).toFixed(1) : '0';
  const intercambiosMedia= historial.length > 0 ? (historial.reduce((s, h) => s + h.intercambios, 0) / historial.length).toFixed(1) : '0';
  const mediacionesMedia = historial.length > 0 ? (historial.reduce((s, h) => s + h.mediaciones, 0) / historial.length).toFixed(1) : '0';
  const s1               = historial[0];
  const sN               = historial[historial.length - 1];
  const tendenciaGaps    = sN && s1 ? (sN.gapsCompletados > s1.gapsCompletados ? '↑' : sN.gapsCompletados < s1.gapsCompletados ? '↓' : '→') : '→';
  const tendenciaMed     = calcTendencia(historial, 'mediaciones', true);

  // ── Borrar datos de un residente (solo director) ──────────────────────────
  const borrarDatos = async () => {
    setBorrando(true);
    await supabase.from('kinact_sesiones').delete().eq('residente_id', residenteId);
    await supabase.from('kinact_escalas').delete().eq('residente_id', residenteId);
    setSesionesReales([]);
    setEscalasReales({});
    setBorrando(false);
    setModalBorrar(false);
  };

  const METRICAS = [
    {
      valor: `${asistencia}%`,
      label: 'Asistencia',
      sub: `${historial.length} sesiones registradas`,
      tend: calcTendencia(historial, 'gapsCompletados'),
      inversa: false
    },
    {
      valor: gapsMedia,
      label: 'Gaps / sesión',
      sub: s1 ? `↑ desde ${s1.gapsCompletados} en sesión 1` : '',
      tend: tendenciaGaps,
      inversa: false
    },
    {
      valor: intercambiosMedia,
      label: 'Intercambios / sesión',
      sub: 'Media de intercambios',
      tend: calcTendencia(historial, 'intercambios'),
      inversa: false
    },
    {
      valor: mediacionesMedia,
      label: 'Mediaciones / sesión',
      sub: '↓ es señal de mejora',
      tend: tendenciaMed,
      inversa: true
    }
  ];

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', padding: 16, overflowY: 'auto' }}>
      <div style={{
        maxWidth: 900, margin: '0 auto',
        background: 'white', borderRadius: 16,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 14
      }}>

        {/* ── Cabecera ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 600, color: '#1d4ed8', flexShrink: 0
            }}>
              {residente.iniciales}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{residente.nombre}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                Sesión {residente.sesiones} &nbsp;·&nbsp; Incorporado: {fmtFecha(residente.incorporacion, 'd MMM yyyy')} &nbsp;·&nbsp; Tablero habitual:&nbsp;
                <span style={{ fontWeight: 500, color: coloresTablero.text }}>{residente.tableroHabitual}</span>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => exportarPDF(residente, historial, escalas, METRICAS)} style={btnBase('#fef3c7', '#92400e', '#fcd34d')}>Exportar PDF</button>
            <button onClick={() => navigateTo('clinical-scales')} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>Añadir escala clínica</button>
            {userRole === 'director' && (
              <button onClick={() => setModalBorrar(true)} style={btnBase('#fee2e2', '#b91c1c', '#fecaca')}>Borrar datos</button>
            )}
          </div>
        </div>

        {/* ── 4 Métricas clave ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {METRICAS.map(m => (
            <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>{m.valor}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: tendenciaColor(m.tend, m.inversa) }}>{m.tend}</span>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{m.label}</div>
              {m.sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{m.sub}</div>}
            </div>
          ))}
        </div>

        {/* ── Zona central 2 columnas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>

          {/* Mapa de calor */}
          <div style={cardStyle}>
            <div style={titleStyle}>Evolución por sesión</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {[
                { campo: 'estado',     label: 'Estado' },
                { campo: 'engagement', label: 'Engagement' },
                { campo: 'autonomia',  label: 'Autonomía' },
                { campo: 'agitacion',  label: 'Agitación' }
              ].map(({ campo, label }) => {
                const tend = campo === 'agitacion'
                  ? calcTendencia(historial, campo, true)
                  : calcTendencia(historial, campo, campo === 'agitacion');
                return (
                  <div key={campo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 72, textAlign: 'right', fontSize: 11, color: '#6b7280', flexShrink: 0 }}>
                      {label}
                    </span>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {historial.map((h, i) => (
                        <div
                          key={i}
                          title={`S${h.sesion}: ${String(h[campo])}`}
                          style={{
                            width: 14, height: 8,
                            borderRadius: 2,
                            background: heatColor(campo, h[campo])
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tendenciaColor(tend, campo === 'agitacion'), marginLeft: 2 }}>
                      {tend}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Leyenda */}
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              {[
                { color: '#fca5a5', label: 'Bajo / Sí' },
                { color: '#fcd34d', label: 'Medio / Parcial' },
                { color: '#bfdbfe', label: 'Neutro' },
                { color: '#86efac', label: 'Alto / Positivo' }
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9ca3af' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Escalas clínicas */}
          <div style={cardStyle}>
            <div style={titleStyle}>Escalas clínicas validadas</div>

            <div style={{ marginTop: 8 }}>
              {ESCALAS_DEF.map((def, idx) => {
                const datos  = escalas[def.id] || [];
                const ultimo = datos[datos.length - 1];
                const penult = datos[datos.length - 2];
                const abierta = escalaAbierta === def.id;
                const esTUG   = def.id === 'tug';
                const tend    = datos.length >= 2
                  ? (ultimo.valor < penult.valor
                      ? (def.inversa ? '↑' : '↓')
                      : ultimo.valor > penult.valor
                        ? (def.inversa ? '↓' : '↑')
                        : '→')
                  : '—';

                return (
                  <div
                    key={def.id}
                    onClick={() => setEscalaAbierta(a => a === def.id ? null : def.id)}
                    style={{
                      borderBottom: idx < ESCALAS_DEF.length - 1 ? '0.5px solid #f3f4f6' : 'none',
                      padding: '8px 0',
                      cursor: 'pointer',
                      ...(esTUG ? { background: '#eff6ff', borderRadius: 6, padding: 8 } : {})
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{def.nombre}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{def.desc}</div>
                      </div>
                      {ultimo && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: def.colorFn(ultimo.valor) }}>
                            {ultimo.valor}{def.unidad}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: tendenciaColor(tend, def.inversa) }}>
                            {tend}
                          </span>
                        </div>
                      )}
                      {!ultimo && <span style={{ fontSize: 11, color: '#9ca3af' }}>Sin datos</span>}
                    </div>

                    {/* Historial expandible */}
                    {abierta && datos.length > 0 && (
                      <div style={{ marginTop: 6, paddingLeft: 4 }}>
                        {datos.map((d, i) => {
                          const prev = datos[i - 1];
                          const t = prev
                            ? d.valor < prev.valor
                              ? (def.inversa ? '↑' : '↓')
                              : d.valor > prev.valor
                                ? (def.inversa ? '↓' : '↑')
                                : '→'
                            : '—';
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '3px 0', borderTop: i > 0 ? '0.5px solid #f3f4f6' : 'none' }}>
                              <span style={{ color: '#9ca3af' }}>{fmtFecha(d.fecha)}</span>
                              <span style={{ fontWeight: 600, color: def.colorFn(d.valor) }}>{d.valor}{def.unidad}</span>
                              <span style={{ color: '#6b7280' }}>{def.interpFn(d.valor)}</span>
                              <span style={{ fontWeight: 600, color: tendenciaColor(t, def.inversa) }}>{t}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Última recomendación */}
            {sN && (
              <div style={{ background: '#f0fdf4', borderRadius: 6, padding: 8, marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#15803d', marginBottom: 3 }}>Última recomendación</div>
                <div style={{ fontSize: 10, color: '#166534', lineHeight: 1.4 }}>
                  {sN.autonomia === 'autonomo' && sN.estado === 'positivo'
                    ? 'Mantener el nivel. Excelente progresión.'
                    : sN.mediaciones > 3
                      ? 'Considerar ejercicios de negociación grupal.'
                      : 'Buena evolución. Continuar programa actual.'}
                </div>
                <div style={{ fontSize: 10, color: '#86efac', marginTop: 2 }}>{fmtFechaCorta(sN.fecha)}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Historial de sesiones ── */}
        <div style={cardStyle}>
          <div style={titleStyle}>Historial de sesiones</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 10, overflowX: 'auto' }}>
            {historial.map((h, i) => {
              const esUltima = i === historial.length - 1;
              const pct      = Math.round((h.gapsCompletados / 9) * 100);
              const gColor   = pct >= 100 ? '#16a34a' : pct >= 66 ? '#2563eb' : pct >= 33 ? '#f59e0b' : '#ef4444';
              return (
                <div key={h.sesion} style={{
                  textAlign: 'center', padding: 6,
                  background: esUltima ? '#dbeafe' : '#f9fafb',
                  borderRadius: 6, fontSize: 10,
                  border: esUltima ? '1px solid #bfdbfe' : '1px solid transparent'
                }}>
                  <div style={{ fontWeight: 600, color: esUltima ? '#1d4ed8' : '#374151' }}>S{h.sesion}</div>
                  <div style={{ color: '#9ca3af', marginTop: 1 }}>{fmtFechaCorta(h.fecha)}</div>
                  <div style={{ color: gColor, fontWeight: 600, marginTop: 2 }}>{h.gapsCompletados}/9</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Pie ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={goBack}
            style={btnBase()}
          >
            ← Volver al dashboard
          </button>
        </div>

      </div>

      {modalBorrar && (
        <ModalBorrar
          nombre={residente.nombre}
          onConfirmar={borrarDatos}
          onCancelar={() => setModalBorrar(false)}
          borrando={borrando}
        />
      )}
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

const cardStyle = {
  background: 'white',
  border: '1px solid #f3f4f6',
  borderRadius: 10,
  padding: 12
};

const titleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#374151'
};
