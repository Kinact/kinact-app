import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MOCK_RESIDENTS } from '../../../data/mockData';
import { TABLERO_COLORS_DARK } from '../../../constants/tableros';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generarPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function btnBase(bg, color, border) {
  return {
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    border: `1px solid ${border || '#e5e7eb'}`,
    background: bg || 'white',
    color: color || '#374151',
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
  };
}

function inputStyle(extra = {}) {
  return {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: 13,
    fontFamily: 'inherit',
    color: '#111827',
    background: 'white',
    boxSizing: 'border-box',
    ...extra,
  };
}

function labelStyle() {
  return { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };
}

function fieldWrap(children, style = {}) {
  return <div style={{ marginBottom: 12, ...style }}>{children}</div>;
}

function BadgeTablero({ tablero }) {
  const c = TABLERO_COLORS_DARK[tablero] || { bg: '#e5e7eb', text: '#374151' };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
      background: c.bg, color: c.text, textTransform: 'capitalize', letterSpacing: '.04em',
    }}>
      {tablero}
    </span>
  );
}

function BadgeActivo({ activo = true }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
      background: activo ? '#dcfce7' : '#f3f4f6',
      color: activo ? '#15803d' : '#9ca3af',
    }}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function CredencialesBox({ email, password }) {
  const [copiado, setCopiado] = useState(false);
  const texto = `Email: ${email}\nContraseña: ${password}`;

  const copiar = () => {
    navigator.clipboard?.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{
      background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6,
      padding: 12, marginTop: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>
        ✓ Usuario creado — comparte estas credenciales:
      </div>
      <pre style={{
        fontSize: 12, fontFamily: 'monospace', color: '#166534',
        background: 'white', border: '1px solid #bbf7d0', borderRadius: 4,
        padding: '8px 10px', margin: '0 0 8px', lineHeight: 1.6,
      }}>
        {texto}
      </pre>
      <button onClick={copiar} style={btnBase('#dcfce7', '#15803d', '#86efac')}>
        {copiado ? '✓ Copiado' : 'Copiar credenciales'}
      </button>
    </div>
  );
}

// ─── Pestaña: Residentes ──────────────────────────────────────────────────────

function TabResidentes() {
  const { navigateTo } = useApp();
  const [residentes, setResidentes] = useState(MOCK_RESIDENTS);
  const [formAbierto, setFormAbierto] = useState(false);
  const [exito, setExito] = useState(false);
  const [form, setForm] = useState({
    nombre: '', iniciales: '', tableroHabitual: 'casa',
    incorporacion: new Date().toISOString().split('T')[0], observaciones: '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const guardar = () => {
    if (!form.nombre.trim() || !form.iniciales.trim()) return;
    const nuevo = {
      id: 'r' + Date.now(),
      nombre: form.nombre.trim(),
      iniciales: form.iniciales.trim().toUpperCase().slice(0, 2),
      tableroHabitual: form.tableroHabitual,
      incorporacion: form.incorporacion,
      sesiones: 0,
    };
    setResidentes(prev => [...prev, nuevo]);
    setForm({ nombre: '', iniciales: '', tableroHabitual: 'casa', incorporacion: new Date().toISOString().split('T')[0], observaciones: '' });
    setFormAbierto(false);
    setExito(true);
    setTimeout(() => setExito(false), 3000);
  };

  return (
    <div>
      {/* Cabecera pestaña */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{residentes.length} residente{residentes.length !== 1 ? 's' : ''} en programa</div>
        <button onClick={() => setFormAbierto(v => !v)} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
          {formAbierto ? '✕ Cancelar' : '+ Añadir residente'}
        </button>
      </div>

      {/* Mensaje éxito */}
      {exito && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
          ✓ Residente añadido correctamente
        </div>
      )}

      {/* Formulario inline */}
      {formAbierto && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Nuevo residente</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fieldWrap(<><label style={labelStyle()}>Nombre completo *</label><input style={inputStyle()} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: María Carmen López" /></>)}
            {fieldWrap(<><label style={labelStyle()}>Iniciales * (máx. 2)</label><input style={inputStyle()} value={form.iniciales} onChange={e => set('iniciales', e.target.value)} maxLength={2} placeholder="MC" /></>)}
            {fieldWrap(<><label style={labelStyle()}>Tablero habitual</label>
              <select style={inputStyle()} value={form.tableroHabitual} onChange={e => set('tableroHabitual', e.target.value)}>
                <option value="casa">Casa</option>
                <option value="barco">Barco</option>
                <option value="flor">Flor</option>
                <option value="cafe">Café</option>
              </select></>)}
            {fieldWrap(<><label style={labelStyle()}>Fecha de incorporación</label><input type="date" style={inputStyle()} value={form.incorporacion} onChange={e => set('incorporacion', e.target.value)} /></>)}
          </div>
          {fieldWrap(<><label style={labelStyle()}>Observaciones iniciales (opcional)</label><textarea style={inputStyle({ resize: 'vertical', minHeight: 60 })} value={form.observaciones} onChange={e => set('observaciones', e.target.value)} placeholder="Notas clínicas relevantes al inicio del programa..." /></>)}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => setFormAbierto(false)} style={btnBase()}>Cancelar</button>
            <button onClick={guardar} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>Guardar residente</button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {residentes.map((r, i) => (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: i < residentes.length - 1 ? '1px solid #f3f4f6' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#f3f4f6', color: '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>
                {r.iniciales}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.nombre}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  {r.sesiones} sesione{r.sesiones !== 1 ? 's' : ''} · desde {r.incorporacion}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BadgeTablero tablero={r.tableroHabitual} />
              <button
                onClick={() => navigateTo('resident', { residentId: r.id })}
                style={btnBase()}
              >
                Ver perfil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pestaña: Facilitadores ───────────────────────────────────────────────────

const FACILITADORES_INICIAL = [
  { id: 'f1', nombre: 'Ana Martínez', email: 'ana.martinez@santaclara.es', activo: true },
  { id: 'f2', nombre: 'Carlos López', email: 'carlos.lopez@santaclara.es', activo: true },
];

function TabFacilitadores() {
  const [facilitadores, setFacilitadores] = useState(FACILITADORES_INICIAL);
  const [formAbierto, setFormAbierto] = useState(false);
  const [credenciales, setCredenciales] = useState(null);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const generar = () => set('password', generarPassword());

  const guardar = () => {
    if (!form.nombre.trim() || !form.email.trim() || form.password.length < 8) return;
    const nuevo = { id: 'f' + Date.now(), nombre: form.nombre.trim(), email: form.email.trim(), activo: true };
    setFacilitadores(prev => [...prev, nuevo]);
    setCredenciales({ email: form.email.trim(), password: form.password });
    setForm({ nombre: '', email: '', password: '' });
    setFormAbierto(false);
    setMostrarPass(false);
  };

  const desactivar = (id) => setFacilitadores(prev => prev.map(f => f.id === id ? { ...f, activo: false } : f));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{facilitadores.filter(f => f.activo).length} facilitador{facilitadores.filter(f => f.activo).length !== 1 ? 'es' : ''} activo{facilitadores.filter(f => f.activo).length !== 1 ? 's' : ''}</div>
        <button onClick={() => { setFormAbierto(v => !v); setCredenciales(null); }} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
          {formAbierto ? '✕ Cancelar' : '+ Añadir facilitador'}
        </button>
      </div>

      {credenciales && <CredencialesBox email={credenciales.email} password={credenciales.password} />}

      {formAbierto && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 14, marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Nuevo facilitador</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fieldWrap(<><label style={labelStyle()}>Nombre completo *</label><input style={inputStyle()} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Ana Martínez" /></>)}
            {fieldWrap(<><label style={labelStyle()}>Email (será su usuario) *</label><input type="email" style={inputStyle()} value={form.email} onChange={e => set('email', e.target.value)} placeholder="ana@centro.es" /></>)}
          </div>
          {fieldWrap(
            <div>
              <label style={labelStyle()}>Contraseña * (mín. 8 caracteres)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    style={inputStyle({ paddingRight: 36 })}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Contraseña"
                  />
                  <button
                    onClick={() => setMostrarPass(v => !v)}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280' }}
                  >
                    {mostrarPass ? '🙈' : '👁'}
                  </button>
                </div>
                <button onClick={generar} style={btnBase('#f3f4f6', '#374151', '#e5e7eb')}>Generar</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => setFormAbierto(false)} style={btnBase()}>Cancelar</button>
            <button onClick={guardar} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>Crear facilitador</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {facilitadores.map((f, i) => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: i < facilitadores.length - 1 ? '1px solid #f3f4f6' : 'none',
            opacity: f.activo ? 1 : 0.5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#eff6ff', color: '#1d4ed8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>
                {f.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{f.nombre}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{f.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BadgeActivo activo={f.activo} />
              {f.activo && (
                <button onClick={() => desactivar(f.id)} style={btnBase('#fff5f5', '#991b1b', '#fecaca')}>
                  Desactivar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pestaña: Familiares ──────────────────────────────────────────────────────

const FAMILIARES_INICIAL = [
  { id: 'fam1', nombre: 'Rosa García', email: 'rosa.garcia@email.com', residenteId: 'r2', activo: true },
  { id: 'fam2', nombre: 'Pilar Ruiz',  email: 'pilar.ruiz@email.com',  residenteId: 'r3', activo: true },
];

function TabFamiliares() {
  const [familiares, setFamiliares] = useState(FAMILIARES_INICIAL);
  const [residentes] = useState(MOCK_RESIDENTS);
  const [formAbierto, setFormAbierto] = useState(false);
  const [credenciales, setCredenciales] = useState(null);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', residenteId: MOCK_RESIDENTS[0]?.id || '' });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const generar = () => set('password', generarPassword());

  const guardar = () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.residenteId || form.password.length < 8) return;
    const nuevo = { id: 'fam' + Date.now(), nombre: form.nombre.trim(), email: form.email.trim(), residenteId: form.residenteId, activo: true };
    setFamiliares(prev => [...prev, nuevo]);
    setCredenciales({ email: form.email.trim(), password: form.password });
    setForm({ nombre: '', email: '', password: '', residenteId: MOCK_RESIDENTS[0]?.id || '' });
    setFormAbierto(false);
    setMostrarPass(false);
  };

  const revocar = (id) => setFamiliares(prev => prev.map(f => f.id === id ? { ...f, activo: false } : f));

  const nombreResidente = (rid) => residentes.find(r => r.id === rid)?.nombre || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{familiares.filter(f => f.activo).length} acceso{familiares.filter(f => f.activo).length !== 1 ? 's' : ''} activo{familiares.filter(f => f.activo).length !== 1 ? 's' : ''}</div>
        <button onClick={() => { setFormAbierto(v => !v); setCredenciales(null); }} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>
          {formAbierto ? '✕ Cancelar' : '+ Dar acceso a familiar'}
        </button>
      </div>

      {credenciales && <CredencialesBox email={credenciales.email} password={credenciales.password} />}

      {formAbierto && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 14, marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Nuevo acceso familiar</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fieldWrap(<><label style={labelStyle()}>Nombre del familiar *</label><input style={inputStyle()} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Rosa García" /></>)}
            {fieldWrap(<><label style={labelStyle()}>Email (será su usuario) *</label><input type="email" style={inputStyle()} value={form.email} onChange={e => set('email', e.target.value)} placeholder="rosa@email.com" /></>)}
            {fieldWrap(<>
              <label style={labelStyle()}>Residente vinculado *</label>
              <select style={inputStyle()} value={form.residenteId} onChange={e => set('residenteId', e.target.value)}>
                {residentes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </>)}
            {fieldWrap(
              <div>
                <label style={labelStyle()}>Contraseña * (mín. 8 caracteres)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      style={inputStyle({ paddingRight: 36 })}
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="Contraseña"
                    />
                    <button
                      onClick={() => setMostrarPass(v => !v)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280' }}
                    >
                      {mostrarPass ? '🙈' : '👁'}
                    </button>
                  </div>
                  <button onClick={generar} style={btnBase('#f3f4f6', '#374151', '#e5e7eb')}>Generar</button>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={() => setFormAbierto(false)} style={btnBase()}>Cancelar</button>
            <button onClick={guardar} style={btnBase('#dbeafe', '#1d4ed8', '#93c5fd')}>Crear acceso</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {familiares.map((f, i) => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: i < familiares.length - 1 ? '1px solid #f3f4f6' : 'none',
            opacity: f.activo ? 1 : 0.5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#fef3c7', color: '#92400e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>
                {f.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{f.nombre}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  {f.email} · Accede a: <span style={{ color: '#374151', fontWeight: 600 }}>{nombreResidente(f.residenteId)}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BadgeActivo activo={f.activo} />
              {f.activo && (
                <button onClick={() => revocar(f.id)} style={btnBase('#fff5f5', '#991b1b', '#fecaca')}>
                  Revocar acceso
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UserManagement ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'residentes',    label: 'Residentes' },
  { id: 'facilitadores', label: 'Facilitadores' },
  { id: 'familiares',    label: 'Familiares' },
];

export default function UserManagement() {
  const { navigateTo } = useApp();
  const [tabActiva, setTabActiva] = useState('residentes');

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'inherit' }}>

      {/* ── Cabecera ── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigateTo('center')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
          >
            ← Volver al dashboard
          </button>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Gestión de usuarios</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Residencia Santa Clara</div>
          </div>
        </div>
      </div>

      {/* ── Pestañas ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              style={{
                padding: '12px 20px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderBottom: tabActiva === tab.id ? '2px solid #1d4ed8' : '2px solid transparent',
                color: tabActiva === tab.id ? '#1d4ed8' : '#6b7280',
                transition: 'color .15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 24px 48px' }}>
        {tabActiva === 'residentes'    && <TabResidentes />}
        {tabActiva === 'facilitadores' && <TabFacilitadores />}
        {tabActiva === 'familiares'    && <TabFamiliares />}
      </div>
    </div>
  );
}
