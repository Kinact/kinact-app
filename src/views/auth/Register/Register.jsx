import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useApp } from '../../../context/AppContext';

export default function Register() {
  const { navigateTo } = useApp();
  const [step, setStep]         = useState('form'); // 'form' | 'success'
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [centro, setCentro]     = useState('');
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!centro.trim() || !nombre.trim() || !email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { nombre: nombre.trim(), centro: centro.trim() }
      }
    });

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email. Inicia sesión.'
        : authError.message);
      setLoading(false);
      return;
    }

    // 2. Crear perfil con rol director
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        rol: 'director',
        nombre: nombre.trim(),
        centro_nombre: centro.trim(),
      }, { onConflict: 'id' });
    }

    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div style={{
        minHeight: '100vh', background: '#f0f4f8',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        padding: 24,
      }}>
        <div style={{
          background: 'white', borderRadius: 16,
          padding: '40px 36px', maxWidth: 420, width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
            ¡Centro registrado!
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px' }}>
            Hemos enviado un email de confirmación a <strong>{email}</strong>.
            Confirma tu cuenta y después inicia sesión.
          </p>
          <button
            onClick={() => navigateTo('login')}
            style={{
              width: '100%', padding: '12px',
              background: '#1d4ed8', color: 'white',
              border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f4f8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      padding: 24,
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <button
          onClick={() => navigateTo('landing')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 13,
            background: '#1d4ed8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', boxShadow: '0 4px 14px #1d4ed840',
          }}>
            <span style={{ fontSize: 20, color: 'white', fontWeight: 900 }}>K</span>
          </div>
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '10px 0 4px', letterSpacing: '-.01em' }}>
          Registra tu centro
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontWeight: 600 }}>
          30 días gratis · Sin tarjeta de crédito
        </p>
      </div>

      {/* Tarjeta */}
      <div style={{
        background: 'white', borderRadius: 16,
        padding: '32px 36px', width: '100%', maxWidth: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Field label="Nombre del centro" value={centro} onChange={setCentro} placeholder="Ej: Residencia Santa Clara" />
          <Field label="Tu nombre" value={nombre} onChange={setNombre} placeholder="Ej: Ana López" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="ana@residencia.es" />

          {/* Contraseña */}
          <div>
            <label style={labelStyle}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ ...inputStyle, paddingRight: 40 }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#9ca3af' }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 12px',
              fontSize: 12, color: '#991b1b', fontWeight: 600, lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px', fontSize: 14, fontWeight: 700,
              borderRadius: 8, border: 'none',
              background: loading ? '#93c5fd' : '#1d4ed8',
              color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', marginTop: 4,
            }}
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 20, textAlign: 'center' }}>
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={() => navigateTo('login')}
          style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
        >
          Iniciar sesión
        </button>
      </p>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = '#3b82f6'}
        onBlur={e => e.target.style.borderColor = '#d1d5db'}
      />
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 700, color: '#374151',
  display: 'block', marginBottom: 5,
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1.5px solid #d1d5db', fontSize: 14,
  fontFamily: 'inherit', color: '#111827',
  boxSizing: 'border-box', outline: 'none',
  transition: 'border-color .15s',
};
