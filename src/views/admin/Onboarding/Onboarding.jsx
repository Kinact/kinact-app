import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useApp } from '../../../context/AppContext';
import { supabase } from '../../../lib/supabase';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const TABLEROS = ['casa', 'barco', 'flor', 'cafe'];

function generarPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function inp(extra = {}) {
  return {
    width: '100%', padding: '9px 11px', borderRadius: 8, border: '1px solid #d1d5db',
    fontSize: 13, fontFamily: 'inherit', color: '#111827', background: 'white',
    boxSizing: 'border-box', outline: 'none', ...extra,
  };
}

function StepDot({ n, activo, hecho }) {
  const bg  = hecho ? '#1d4ed8' : activo ? '#1d4ed8' : '#e5e7eb';
  const txt = hecho ? '✓' : String(n);
  const col = hecho || activo ? 'white' : '#9ca3af';
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: hecho ? 13 : 12, fontWeight: 700, flexShrink: 0 }}>
      {txt}
    </div>
  );
}

function StepBar({ paso }) {
  const steps = ['Bienvenida', 'Residentes', 'Facilitador', 'Listo'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '20px 32px 0', gap: 0 }}>
      {steps.map((label, i) => {
        const n      = i + 1;
        const activo = paso === n;
        const hecho  = paso > n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <StepDot n={n} activo={activo} hecho={hecho} />
              <span style={{ fontSize: 10, fontWeight: 600, color: activo ? '#1d4ed8' : hecho ? '#6b7280' : '#d1d5db', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: hecho ? '#1d4ed8' : '#e5e7eb', margin: '0 6px', marginBottom: 16 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Paso 1: Bienvenida ───────────────────────────────────────────────────────

function Paso1({ profile, onNext }) {
  const nombre = profile?.nombre || 'Director';
  return (
    <div style={{ padding: '32px 40px 40px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
        Bienvenido a KINACT
      </h2>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 8px' }}>
        Hola, <strong>{nombre}</strong>. Tu centro ya está activo en la plataforma.
      </p>
      <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, margin: '0 0 32px' }}>
        En los próximos pasos añadirás los residentes del programa y, opcionalmente, un facilitador. Solo tardará un par de minutos.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        {['🎲 King Act', '📊 Dashboards', '👨‍👩‍👧 Portal familiar', '📋 Informes PDF'].map(pill => (
          <span key={pill} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>
            {pill}
          </span>
        ))}
      </div>
      <button
        onClick={onNext}
        style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 10, padding: '12px 36px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Comenzar configuración →
      </button>
    </div>
  );
}

// ─── Paso 2: Residentes ───────────────────────────────────────────────────────

function Paso2({ orgId, onNext }) {
  const [lista,     setLista]     = useState([]);
  const [form,      setForm]      = useState({ nombre: '', iniciales: '', tablero_habitual: 'casa' });
  const [anadiendo, setAnadiendo] = useState(false);
  const [error,     setError]     = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const añadir = async () => {
    if (!form.nombre.trim() || !form.iniciales.trim()) {
      setError('Nombre e iniciales son obligatorios.');
      return;
    }
    setAnadiendo(true);
    setError('');
    const { data, error: err } = await supabase.from('residentes').insert({
      nombre:           form.nombre.trim(),
      iniciales:        form.iniciales.trim().toUpperCase().slice(0, 2),
      tablero_habitual: form.tablero_habitual,
      org_id:           orgId,
      activo:           true,
    }).select().single();
    if (!err && data) {
      setLista(prev => [...prev, data]);
      setForm({ nombre: '', iniciales: '', tablero_habitual: 'casa' });
    } else {
      setError('Error al guardar: ' + err?.message);
    }
    setAnadiendo(false);
  };

  const quitar = async (id) => {
    await supabase.from('residentes').update({ activo: false }).eq('id', id);
    setLista(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ padding: '28px 40px 40px' }}>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Añade los residentes del programa</h3>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>Necesitas al menos uno para continuar. Podrás añadir más después.</p>

      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Nombre completo *</label>
            <input style={inp()} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Rosa Ferrer García" onKeyDown={e => e.key === 'Enter' && añadir()} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Iniciales *</label>
            <input style={inp()} value={form.iniciales} onChange={e => set('iniciales', e.target.value)} maxLength={2} placeholder="RF" onKeyDown={e => e.key === 'Enter' && añadir()} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Tablero habitual</label>
            <select style={inp()} value={form.tablero_habitual} onChange={e => set('tablero_habitual', e.target.value)}>
              {TABLEROS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>
        {error && <p style={{ fontSize: 12, color: '#b91c1c', margin: '0 0 8px' }}>{error}</p>}
        <button
          onClick={añadir}
          disabled={anadiendo}
          style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd', borderRadius: 7, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {anadiendo ? 'Guardando…' : '+ Añadir residente'}
        </button>
      </div>

      {lista.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          {lista.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < lista.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {r.iniciales}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.nombre}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Tablero: {r.tablero_habitual}</div>
                </div>
              </div>
              <button onClick={() => quitar(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#d1d5db', padding: '2px 6px' }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {lista.length === 0 ? 'Añade al menos un residente para continuar' : `${lista.length} residente${lista.length !== 1 ? 's' : ''} añadido${lista.length !== 1 ? 's' : ''}`}
        </span>
        <button
          onClick={() => onNext(lista)}
          disabled={lista.length === 0}
          style={{
            background: lista.length > 0 ? '#1d4ed8' : '#e5e7eb', color: lista.length > 0 ? 'white' : '#9ca3af',
            border: 'none', borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 700,
            cursor: lista.length > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ─── Paso 3: Facilitador (opcional) ──────────────────────────────────────────

function Paso3({ orgId, onNext }) {
  const [form,      setForm]      = useState({ nombre: '', email: '', password: '' });
  const [creando,   setCreando]   = useState(false);
  const [error,     setError]     = useState('');
  const [mostrar,   setMostrar]   = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const generar = () => set('password', generarPassword());

  const crear = async () => {
    if (!form.nombre.trim() || !form.email.trim() || form.password.length < 8) {
      setError('Nombre, email y contraseña (mín. 8 caracteres) son obligatorios.');
      return;
    }
    setCreando(true);
    setError('');

    const tmpClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authErr } = await tmpClient.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    });

    if (authErr) {
      setError('Error al crear usuario: ' + authErr.message);
      setCreando(false);
      return;
    }

    const userId = authData.user?.id;
    if (userId) {
      await supabase.rpc('create_facilitador_profile', { p_user_id: userId, p_nombre: form.nombre.trim(), p_org_id: orgId });
      await supabase.from('kinact_facilitadores').insert({ org_id: orgId, nombre: form.nombre.trim(), email: form.email.trim(), auth_user_id: userId, activo: true });
    }

    setCreando(false);
    onNext({ nombre: form.nombre.trim(), email: form.email.trim(), password: form.password });
  };

  return (
    <div style={{ padding: '28px 40px 40px' }}>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Añade un facilitador</h3>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>
        Los facilitadores dirigen las sesiones de King Act. Puedes omitir este paso y añadirlos más tarde desde el panel de usuarios.
      </p>

      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Nombre completo *</label>
            <input style={inp()} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Ana Martínez" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Email (será su usuario) *</label>
            <input type="email" style={inp()} value={form.email} onChange={e => set('email', e.target.value)} placeholder="ana@centro.es" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Contraseña * (mín. 8 caracteres)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input type={mostrar ? 'text' : 'password'} style={inp({ paddingRight: 38 })} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Contraseña" />
              <button onClick={() => setMostrar(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af' }}>
                {mostrar ? '🙈' : '👁'}
              </button>
            </div>
            <button onClick={generar} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 7, padding: '0 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Generar
            </button>
          </div>
        </div>
        {error && <p style={{ fontSize: 12, color: '#b91c1c', margin: '10px 0 0' }}>{error}</p>}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={() => onNext(null)}
          style={{ background: 'none', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, padding: '11px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Omitir por ahora
        </button>
        <button
          onClick={crear}
          disabled={creando}
          style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {creando ? 'Creando cuenta…' : 'Añadir y continuar →'}
        </button>
      </div>
    </div>
  );
}

// ─── Paso 4: Listo ────────────────────────────────────────────────────────────

function Paso4({ residentes, facilitador, onFinalizar, finalizando }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    if (!facilitador) return;
    navigator.clipboard?.writeText(`Email: ${facilitador.email}\nContraseña: ${facilitador.password}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{ padding: '28px 40px 40px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>🚀</div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>¡Todo listo!</h3>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>Tu centro está configurado y listo para empezar.</p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: facilitador ? 20 : 32 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 20px', minWidth: 120 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#15803d' }}>{residentes.length}</div>
          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>Residente{residentes.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ background: facilitador ? '#eff6ff' : '#f9fafb', border: `1px solid ${facilitador ? '#93c5fd' : '#e5e7eb'}`, borderRadius: 10, padding: '14px 20px', minWidth: 120 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: facilitador ? '#1d4ed8' : '#9ca3af' }}>{facilitador ? 1 : '—'}</div>
          <div style={{ fontSize: 11, color: facilitador ? '#2563eb' : '#9ca3af', fontWeight: 600, marginTop: 2 }}>Facilitador</div>
        </div>
      </div>

      {facilitador && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 14, marginBottom: 24, textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Credenciales del facilitador — compártelas antes de cerrar esta pantalla</div>
          <pre style={{ fontSize: 12, fontFamily: 'monospace', color: '#166534', background: 'white', border: '1px solid #bbf7d0', borderRadius: 6, padding: '8px 12px', margin: '0 0 8px', lineHeight: 1.7 }}>
            {`Email: ${facilitador.email}\nContraseña: ${facilitador.password}`}
          </pre>
          <button onClick={copiar} style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {copiado ? '✓ Copiado' : 'Copiar credenciales'}
          </button>
        </div>
      )}

      <button
        onClick={onFinalizar}
        disabled={finalizando}
        style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 10, padding: '13px 40px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {finalizando ? 'Cargando…' : 'Ir al dashboard →'}
      </button>
    </div>
  );
}

// ─── Wizard principal ─────────────────────────────────────────────────────────

export default function Onboarding() {
  const { profile, orgId, setResidents, navigateTo } = useApp();

  const [paso,         setPaso]         = useState(1);
  const [residentes,   setResidentesWiz] = useState([]);
  const [facilitador,  setFacilitador]  = useState(null);
  const [finalizando,  setFinalizando]  = useState(false);

  const finalizar = async () => {
    setFinalizando(true);
    await supabase.from('profiles').update({ onboarding_done: true }).eq('id', profile?.id);
    const { data } = await supabase.from('residentes').select('*').eq('org_id', orgId).eq('activo', true);
    if (data) {
      setResidents(data.map(r => ({
        id:              r.ref_id || r.id,
        uuid:            r.id,
        nombre:          r.nombre,
        iniciales:       r.iniciales || r.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        tableroHabitual: r.tablero_habitual,
        incorporacion:   r.incorporacion,
        sesiones:        r.sesiones || 0,
      })));
    }
    navigateTo('center');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 580, background: 'white', borderRadius: 20, boxShadow: '0 8px 40px rgba(29,78,216,0.10)', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ background: '#1d4ed8', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>♟</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: 1 }}>KINACT</span>
        </div>

        <StepBar paso={paso} />

        <div style={{ height: 1, background: '#f3f4f6', margin: '16px 0 0' }} />

        {paso === 1 && (
          <Paso1 profile={profile} onNext={() => setPaso(2)} />
        )}
        {paso === 2 && (
          <Paso2 orgId={orgId} onNext={(lista) => { setResidentesWiz(lista); setPaso(3); }} />
        )}
        {paso === 3 && (
          <Paso3 orgId={orgId} onNext={(fac) => { setFacilitador(fac); setPaso(4); }} />
        )}
        {paso === 4 && (
          <Paso4
            residentes={residentes}
            facilitador={facilitador}
            onFinalizar={finalizar}
            finalizando={finalizando}
          />
        )}
      </div>
    </div>
  );
}
