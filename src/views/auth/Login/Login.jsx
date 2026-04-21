import { useState } from 'react';
import { useApp } from '../../../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    const err = await login(email.trim(), password);
    if (err) {
      setError('Email o contraseña incorrectos. Contacta con el director del centro.');
      setLoading(false);
    }
    // Si no hay error, AppContext redirige automáticamente según el rol
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f4f8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      padding: 24,
    }}>

      {/* Logo / cabecera */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: '#1d4ed8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: '0 4px 14px #1d4ed840',
        }}>
          <span style={{ fontSize: 22, color: 'white', fontWeight: 900 }}>K</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-.01em' }}>
          KINACT
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0', fontWeight: 600 }}>
          Plataforma de estimulación terapéutica
        </p>
      </div>

      {/* Tarjeta */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '32px 36px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>
          Acceder a tu cuenta
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@centro.es"
              autoComplete="email"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1.5px solid #d1d5db', fontSize: 14,
                fontFamily: 'inherit', color: '#111827',
                boxSizing: 'border-box', outline: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8,
                  border: '1.5px solid #d1d5db', fontSize: 14,
                  fontFamily: 'inherit', color: '#111827',
                  boxSizing: 'border-box', outline: 'none',
                  transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 15, color: '#9ca3af', padding: 2,
                }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 12px', marginBottom: 14,
              fontSize: 12, color: '#991b1b', fontWeight: 600, lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#93c5fd' : '#1d4ed8',
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .15s',
              letterSpacing: '.01em',
            }}
          >
            {loading ? 'Accediendo…' : 'Entrar'}
          </button>
        </form>
      </div>

      {/* Pie */}
      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 20, textAlign: 'center' }}>
        ¿Problemas para acceder? Contacta con el director de tu centro.
      </p>
    </div>
  );
}
