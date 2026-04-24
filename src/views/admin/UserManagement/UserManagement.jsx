import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import { useApp } from '../../../context/AppContext';
import { supabase } from '../../../lib/supabase';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
import { TABLERO_COLORS_DARK } from '../../../constants/tableros';

const ORG_DEMO_ID = '00000000-0000-0000-0000-000000000001';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generarPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function btnBase(bg, color, border) {
  return {
    padding: '7px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6,
    border: `1px solid ${border || '#e5e7eb'}`,
    background: bg || 'white', color: color || '#374151',
    cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.4, whiteSpace: 'nowrap',
  };
}

function inputStyle(extra = {}) {
  return {
    width: '100%', padding: '8px 10px', borderRadius: 6,
    border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'inherit',
    color: '#111827', background: 'white', boxSizing: 'border-box', ...extra,
  };
}

const labelStyle = () => ({ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 });
const fieldWrap  = (children, style = {}) => <div style={{ marginBottom: 12, ...style }}>{children}</div>;

function BadgeTablero({ tablero }) {
  const c = TABLERO_COLORS_DARK[tablero] || { bg: '#e5e7eb', text: '#374151' };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.text, textTransform: 'capitalize' }}>
      {tablero}
    </span>
  );
}

function BadgeActivo({ activo = true }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: activo ? '#dcfce7' : '#f3f4f6', color: activo ? '#15803d' : '#9ca3af' }}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function CredencialesBox({ email, password }) {
  const [copiado, setCopiado] = useState(false);
  const texto = `Email: ${email}\nContraseña: ${password}`;
  const copiar = () => { navigator.clipboard?.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000); };
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: 12, marginTop: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>✓ Usuario creado — comparte estas credenciales:</div>
      <pre style={{ fontSize: 12, fontFamily: 'monospace', color: '#166534', background: 'white', border: '1px solid #bbf7d0', borderRadius: 4, padding: '8px 10px', margin: '0 0 8px', lineHeight: 1.6 }}>{texto}</pre>
      <button onClick={copiar} style={btnBase('#dcfce7', '#15803d', '#86efac')}>{copiado ? '✓ Copiado' : 'Copiar credenciales'}</button>
    </div>
  );
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportarPDF(residentes, orgName = '') {
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W     = 210;
  const margin = 18;
  const col   = W - margin * 2;
  let y       = 20;

  const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Cabecera ──
  doc.setFillColor(29, 78, 216);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('KINACT', margin, 13);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`${orgName || 'Centro'} · Informe de Residentes`, margin, 20);
  doc.text(fechaHoy, W - margin, 20, { align: 'right' });

  y = 38;

  // ── Resumen general ──
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('Resumen del programa', margin, y); y += 6;

  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Total de residentes: ${residentes.length}`, margin, y); y += 5;
  const totalSesiones = residentes.reduce((s, r) => s + (r.sesiones || 0), 0);
  doc.text(`Total de sesiones registradas: ${totalSesiones}`, margin, y); y += 5;
  const tableros = ['casa', 'barco', 'flor', 'cafe'];
  tableros.forEach(t => {
    const n = residentes.filter(r => r.tablero_habitual === t || r.tableroHabitual === t).length;
    if (n > 0) doc.text(`  · Tablero ${t}: ${n} residente${n > 1 ? 's' : ''}`, margin + 4, y += 4);
  });

  y += 10;

  // ── Ficha por residente ──
  residentes.forEach((r, i) => {
    // Salto de página si no cabe la ficha (~55mm por residente)
    if (y > 240) { doc.addPage(); y = 20; }

    // Fondo de tarjeta
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, col, 52, 3, 3, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, col, 52, 3, 3, 'S');

    // Avatar circular
    doc.setFillColor(219, 234, 254);
    doc.circle(margin + 12, y + 12, 8, 'F');
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    const iniciales = r.iniciales || (r.nombre || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    doc.text(iniciales, margin + 12, y + 13.5, { align: 'center' });

    // Nombre y tablero
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text(r.nombre || '—', margin + 24, y + 10);

    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const tablero = r.tablero_habitual || r.tableroHabitual || '—';
    doc.text(`Tablero: ${tablero}`, margin + 24, y + 16);

    // Línea separadora
    doc.setDrawColor(229, 231, 235);
    doc.line(margin + 8, y + 22, margin + col - 8, y + 22);

    // Datos clave en columnas
    const datos = [
      { label: 'Sesiones completadas', valor: String(r.sesiones ?? 0) },
      { label: 'Fecha de incorporación', valor: r.incorporacion || r.created_at?.split('T')[0] || '—' },
      { label: 'Estado',                 valor: (r.sesiones ?? 0) > 0 ? 'Activo en programa' : 'Sin sesiones' },
    ];

    const colW = col / 3;
    datos.forEach((d, j) => {
      const cx = margin + j * colW + colW / 2;
      doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(d.label, cx, y + 30, { align: 'center' });
      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(d.valor, cx, y + 37, { align: 'center' });
    });

    // Número de residente
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text(`Residente #${i + 1}`, margin + col - 4, y + 7, { align: 'right' });

    y += 58;
  });

  // ── Pie de página ──
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text(`KINACT · ${orgName || 'Centro'} · Generado el ${fechaHoy} · Pág. ${p}/${pages}`, W / 2, 290, { align: 'center' });
  }

  doc.save(`kinact-residentes-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─── Pestaña: Residentes ──────────────────────────────────────────────────────

function TabResidentes() {
  const { navigateTo, orgId, orgName, setResidents } = useApp();
  const orgIdEfectivo = orgId || ORG_DEMO_ID;

  const [residentes,  setResidentes]  = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [formAbierto, setFormAbierto] = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [desactivando,setDesactivando]= useState(null);
  const [error,       setError]       = useState('');
  const [exito,       setExito]       = useState('');
  const [form, setForm] = useState({
    nombre: '', iniciales: '', tablero_habitual: 'casa',
    incorporacion: new Date().toISOString().split('T')[0],
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const cargarResidentes = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('residentes')
      .select('*')
      .eq('org_id', orgIdEfectivo)
      .eq('activo', true)
      .order('created_at', { ascending: true });
    const rows = data || [];
    setResidentes(rows);
    // Sincronizar contexto global
    setResidents(rows.map(r => ({
      id:              r.ref_id || r.id,
      uuid:            r.id,
      nombre:          r.nombre,
      iniciales:       r.iniciales || r.nombre.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
      tableroHabitual: r.tablero_habitual,
      incorporacion:   r.incorporacion,
      sesiones:        r.sesiones || 0,
    })));
    setCargando(false);
  };

  useEffect(() => { cargarResidentes(); }, [orgIdEfectivo]);

  const guardar = async () => {
    if (!form.nombre.trim() || !form.iniciales.trim()) {
      setError('Nombre e iniciales son obligatorios.');
      return;
    }
    setGuardando(true);
    setError('');

    const { error: err } = await supabase.from('residentes').insert({
      nombre:           form.nombre.trim(),
      iniciales:        form.iniciales.trim().toUpperCase().slice(0, 2),
      tablero_habitual: form.tablero_habitual,
      incorporacion:    form.incorporacion,
      org_id:           orgIdEfectivo,
      activo:           true,
    });

    if (err) {
      setError('Error al guardar: ' + err.message);
    } else {
      setForm({ nombre: '', iniciales: '', tablero_habitual: 'casa', incorporacion: new Date().toISOString().split('T')[0] });
      setFormAbierto(false);
      setExito('Residente añadido correctamente ✓');
      setTimeout(() => setExito(''), 4000);
      cargarResidentes();
    }
    setGuardando(false);
  };

  const desactivar = async (id, nombre) => {
    if (!window.confirm(`¿Dar de baja a ${nombre}? Se ocultará del programa pero sus datos se conservan.`)) return;
    setDesactivando(id);
    await supabase.from('residentes').update({ activo: false }).eq('id', id);
    setDesactivando(null);
    cargarResidentes();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          {cargando ? 'Cargando…' : `${residentes.length} residente${residentes.length !== 1 ? 's' : ''} en programa`}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportarPDF(residentes, orgName)} disabled={cargando || residentes.length === 0} style={btnBase('#fef3c7', '#92400e', '#fcd34d')}>
            Exportar PDF
          </button>
          <button onClick={() => setFormAbierto(v => !v)} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
            {formAbierto ? '✕ Cancelar' : '+ Añadir residente'}
          </button>
        </div>
      </div>

      {exito && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#15803d', fontWeight: 600 }}>{exito}</div>}
      {error && <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>{error}</div>}

      {formAbierto && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Nuevo residente</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fieldWrap(<><label style={labelStyle()}>Nombre completo *</label><input style={inputStyle()} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: María Carmen López" /></>)}
            {fieldWrap(<><label style={labelStyle()}>Iniciales * (máx. 2)</label><input style={inputStyle()} value={form.iniciales} onChange={e => set('iniciales', e.target.value)} maxLength={2} placeholder="MC" /></>)}
            {fieldWrap(<>
              <label style={labelStyle()}>Tablero habitual</label>
              <select style={inputStyle()} value={form.tablero_habitual} onChange={e => set('tablero_habitual', e.target.value)}>
                <option value="casa">Casa</option>
                <option value="barco">Barco</option>
                <option value="flor">Flor</option>
                <option value="cafe">Café</option>
              </select>
            </>)}
            {fieldWrap(<><label style={labelStyle()}>Fecha de incorporación</label><input type="date" style={inputStyle()} value={form.incorporacion} onChange={e => set('incorporacion', e.target.value)} /></>)}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => setFormAbierto(false)} style={btnBase()}>Cancelar</button>
            <button onClick={guardar} disabled={guardando} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
              {guardando ? 'Guardando…' : 'Guardar residente'}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {cargando ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Cargando residentes…</div>
        ) : residentes.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No hay residentes registrados aún.</div>
        ) : residentes.map((r, i) => (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: i < residentes.length - 1 ? '1px solid #f3f4f6' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f3f4f6', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                {r.iniciales}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.nombre}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  Tablero: {r.tablero_habitual} · Desde {r.incorporacion || '—'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BadgeTablero tablero={r.tablero_habitual} />
              <button
                onClick={() => navigateTo('resident', { residentId: r.ref_id || r.id })}
                style={btnBase()}
              >
                Ver perfil
              </button>
              <button
                onClick={() => desactivar(r.id, r.nombre)}
                disabled={desactivando === r.id}
                style={btnBase('#fee2e2', '#b91c1c', '#fecaca')}
              >
                {desactivando === r.id ? '…' : 'Dar de baja'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pestaña: Facilitadores ───────────────────────────────────────────────────

function TabFacilitadores() {
  const { orgId } = useApp();
  const orgIdEfectivo = orgId || ORG_DEMO_ID;

  const [facilitadores,  setFacilitadores]  = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [formAbierto,    setFormAbierto]    = useState(false);
  const [guardando,      setGuardando]      = useState(false);
  const [desactivando,   setDesactivando]   = useState(null);
  const [credenciales,   setCredenciales]   = useState(null);
  const [mostrarPass,    setMostrarPass]    = useState(false);
  const [error,          setError]          = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const generar = () => set('password', generarPassword());

  const cargar = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('kinact_facilitadores')
      .select('*')
      .eq('org_id', orgIdEfectivo)
      .eq('activo', true)
      .order('created_at', { ascending: true });
    setFacilitadores(data || []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, [orgIdEfectivo]);

  const guardar = async () => {
    if (!form.nombre.trim() || !form.email.trim() || form.password.length < 8) {
      setError('Nombre, email y contraseña (mín. 8 caracteres) son obligatorios.');
      return;
    }
    setGuardando(true);
    setError('');

    // Crear usuario en Supabase Auth con cliente temporal (no reemplaza la sesión del director)
    const tmpClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authErr } = await tmpClient.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    });

    if (authErr) {
      setError('Error al crear usuario: ' + authErr.message);
      setGuardando(false);
      return;
    }

    const userId = authData.user?.id;

    // Asignar perfil con rol facilitador (función SECURITY DEFINER)
    if (userId) {
      await supabase.rpc('create_facilitador_profile', {
        p_user_id: userId,
        p_nombre:  form.nombre.trim(),
        p_org_id:  orgIdEfectivo,
      });
    }

    // Guardar en tabla de facilitadores del centro
    const { error: insErr } = await supabase.from('kinact_facilitadores').insert({
      org_id:       orgIdEfectivo,
      nombre:       form.nombre.trim(),
      email:        form.email.trim(),
      auth_user_id: userId || null,
      activo:       true,
    });

    if (insErr) {
      setError('Error al registrar facilitador: ' + insErr.message);
    } else {
      setCredenciales({ email: form.email.trim(), password: form.password });
      setForm({ nombre: '', email: '', password: '' });
      setFormAbierto(false);
      setMostrarPass(false);
      cargar();
    }
    setGuardando(false);
  };

  const desactivar = async (id, nombre) => {
    if (!window.confirm(`¿Desactivar a ${nombre}?`)) return;
    setDesactivando(id);
    await supabase.from('kinact_facilitadores').update({ activo: false }).eq('id', id);
    setDesactivando(null);
    cargar();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          {cargando ? 'Cargando…' : `${facilitadores.length} facilitador${facilitadores.length !== 1 ? 'es activos' : ' activo'}`}
        </div>
        <button onClick={() => { setFormAbierto(v => !v); setCredenciales(null); setError(''); }} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
          {formAbierto ? '✕ Cancelar' : '+ Añadir facilitador'}
        </button>
      </div>

      {credenciales && <CredencialesBox email={credenciales.email} password={credenciales.password} />}
      {error && <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>{error}</div>}

      {formAbierto && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 14, marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Nuevo facilitador</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fieldWrap(<><label style={labelStyle()}>Nombre completo *</label><input style={inputStyle()} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Ana Martínez" /></>)}
            {fieldWrap(<><label style={labelStyle()}>Email (será su usuario) *</label><input type="email" style={inputStyle()} value={form.email} onChange={e => set('email', e.target.value)} placeholder="ana@centro.es" /></>)}
          </div>
          {fieldWrap(<div>
            <label style={labelStyle()}>Contraseña * (mín. 8 caracteres)</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input type={mostrarPass ? 'text' : 'password'} style={inputStyle({ paddingRight: 36 })} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Contraseña" />
                <button onClick={() => setMostrarPass(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280' }}>
                  {mostrarPass ? '🙈' : '👁'}
                </button>
              </div>
              <button onClick={generar} style={btnBase('#f3f4f6', '#374151', '#e5e7eb')}>Generar</button>
            </div>
          </div>)}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => setFormAbierto(false)} style={btnBase()}>Cancelar</button>
            <button onClick={guardar} disabled={guardando} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
              {guardando ? 'Creando…' : 'Crear facilitador'}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {cargando ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Cargando facilitadores…</div>
        ) : facilitadores.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No hay facilitadores registrados aún.</div>
        ) : facilitadores.map((f, i) => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < facilitadores.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                {f.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{f.nombre}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{f.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BadgeActivo activo={true} />
              <button
                onClick={() => desactivar(f.id, f.nombre)}
                disabled={desactivando === f.id}
                style={btnBase('#fff5f5', '#991b1b', '#fecaca')}
              >
                {desactivando === f.id ? '…' : 'Desactivar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pestaña: Familiares ──────────────────────────────────────────────────────

function TabFamiliares() {
  const { residents, orgId } = useApp();
  const orgIdEfectivo = orgId || ORG_DEMO_ID;

  const [familiares,   setFamiliares]   = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [formAbierto,  setFormAbierto]  = useState(false);
  const [guardando,    setGuardando]    = useState(false);
  const [credenciales, setCredenciales] = useState(null);
  const [mostrarPass,  setMostrarPass]  = useState(false);
  const [form, setForm] = useState({
    nombre: '', email: '', password: '',
    residenteId: residents[0]?.id || 'r1'
  });

  const cargar = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('kinact_familiares')
      .select('*')
      .eq('org_id', orgIdEfectivo)
      .order('created_at', { ascending: false });
    setFamiliares(data || []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const generar = () => set('password', generarPassword());

  const guardar = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.residenteId || form.password.length < 8) return;
    setGuardando(true);
    const { error } = await supabase.from('kinact_familiares').insert({
      nombre:       form.nombre.trim(),
      email:        form.email.trim(),
      residente_id: form.residenteId,
      org_id:       orgIdEfectivo,
      activo:       true
    });
    if (!error) {
      setCredenciales({ email: form.email.trim(), password: form.password, residenteId: form.residenteId });
      setForm(f => ({ ...f, nombre: '', email: '', password: '' }));
      setFormAbierto(false);
      setMostrarPass(false);
      cargar();
    }
    setGuardando(false);
  };

  const revocar = async (id) => {
    await supabase.from('kinact_familiares').update({ activo: false }).eq('id', id);
    cargar();
  };

  const nombreResidente = (rid) => residents.find(r => r.id === rid)?.nombre || rid;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          {cargando ? 'Cargando…' : `${familiares.filter(f => f.activo).length} acceso${familiares.filter(f => f.activo).length !== 1 ? 's activos' : ' activo'}`}
        </div>
        <button onClick={() => { setFormAbierto(v => !v); setCredenciales(null); }} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
          {formAbierto ? '✕ Cancelar' : '+ Dar acceso a familiar'}
        </button>
      </div>

      {credenciales && (
        <>
          <CredencialesBox email={credenciales.email} password={credenciales.password} />
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '8px 12px', marginTop: 8, fontSize: 12, color: '#92400e' }}>
            <strong>Paso final:</strong> Crea la cuenta en <strong>Supabase → Authentication → Add user</strong> con ese email y contraseña. Luego actualiza su perfil: <code>UPDATE profiles SET residente_id = '{credenciales.residenteId}', rol = 'familiar' WHERE email = '{credenciales.email}';</code>
          </div>
        </>
      )}

      {formAbierto && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 14, marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Nuevo acceso familiar</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fieldWrap(<><label style={labelStyle()}>Nombre del familiar *</label><input style={inputStyle()} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Rosa García" /></>)}
            {fieldWrap(<><label style={labelStyle()}>Email (será su usuario) *</label><input type="email" style={inputStyle()} value={form.email} onChange={e => set('email', e.target.value)} placeholder="rosa@email.com" /></>)}
            {fieldWrap(<>
              <label style={labelStyle()}>Residente vinculado *</label>
              <select style={inputStyle()} value={form.residenteId} onChange={e => set('residenteId', e.target.value)}>
                {residents.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </>)}
            {fieldWrap(<div>
              <label style={labelStyle()}>Contraseña * (mín. 8 caracteres)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type={mostrarPass ? 'text' : 'password'} style={inputStyle({ paddingRight: 36 })} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Contraseña" />
                  <button onClick={() => setMostrarPass(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280' }}>
                    {mostrarPass ? '🙈' : '👁'}
                  </button>
                </div>
                <button onClick={generar} style={btnBase('#f3f4f6', '#374151', '#e5e7eb')}>Generar</button>
              </div>
            </div>)}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => setFormAbierto(false)} style={btnBase()}>Cancelar</button>
            <button onClick={guardar} disabled={guardando} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
              {guardando ? 'Guardando…' : 'Registrar acceso'}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {cargando ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Cargando accesos…</div>
        ) : familiares.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No hay accesos de familiares registrados.</div>
        ) : familiares.map((f, i) => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < familiares.length - 1 ? '1px solid #f3f4f6' : 'none', opacity: f.activo ? 1 : 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                {f.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{f.nombre}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  {f.email} · Accede a: <span style={{ color: '#374151', fontWeight: 600 }}>{nombreResidente(f.residente_id)}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BadgeActivo activo={f.activo} />
              {f.activo && <button onClick={() => revocar(f.id)} style={btnBase('#fff5f5', '#991b1b', '#fecaca')}>Revocar acceso</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UserManagement ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'residentes',    label: 'Residentes'    },
  { id: 'facilitadores', label: 'Facilitadores' },
  { id: 'familiares',    label: 'Familiares'    },
];

export default function UserManagement() {
  const { navigateTo, goBack, orgName } = useApp();
  const [tabActiva, setTabActiva] = useState('residentes');

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'inherit' }}>

      {/* Cabecera */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', fontFamily: 'inherit', padding: 0 }}>
            ← Volver al dashboard
          </button>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Gestión de usuarios</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{orgName || 'KINACT'}</div>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setTabActiva(tab.id)} style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tabActiva === tab.id ? '2px solid #1d4ed8' : '2px solid transparent', color: tabActiva === tab.id ? '#1d4ed8' : '#6b7280' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 24px 48px' }}>
        {tabActiva === 'residentes'    && <TabResidentes />}
        {tabActiva === 'facilitadores' && <TabFacilitadores />}
        {tabActiva === 'familiares'    && <TabFamiliares />}
      </div>
    </div>
  );
}
