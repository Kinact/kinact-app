import { useState } from 'react';
import { useApp } from '../../../context/AppContext';

const ROLES = [
  {
    id: 'auxiliar',
    label: 'Auxiliar / Facilitador',
    sublabel: 'Accede a las sesiones del centro',
    view: 'session-selector'
  },
  {
    id: 'familiar',
    label: 'Familiar',
    sublabel: 'Consulta el progreso de tu familiar',
    view: 'family'
  },
  {
    id: 'gestion',
    label: 'Gestión / Dirección',
    sublabel: 'Dashboard completo del centro',
    view: 'center'
  }
];

export default function Onboarding() {
  const { navigateTo } = useApp();

  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigoGestion, setCodigoGestion] = useState('');

  const handleSelectRol = (rol) => {
    setRolSeleccionado(rol);
    setShowInput(true);
    setCodigo('');
    setEmail('');
    setPassword('');
    setCodigoGestion('');
  };

  const isEntrarEnabled = () => {
    if (!rolSeleccionado) return false;
    if (rolSeleccionado === 'auxiliar') return codigo.length === 6;
    if (rolSeleccionado === 'familiar') return codigo.length === 6;
    if (rolSeleccionado === 'gestion') return email.trim() !== '' && password !== '' && codigoGestion.trim() !== '';
    return false;
  };

  const handleEntrar = () => {
    if (!isEntrarEnabled()) return;
    const rol = ROLES.find(r => r.id === rolSeleccionado);
    navigateTo(rol.view, { role: rolSeleccionado });
  };

  return (
    <div style={styles.container}>
      {/* Logo */}
      <div style={styles.logoWrap}>
        <div style={styles.logo}>KINACT</div>
        <div style={styles.subtitle}>Programa terapéutico</div>
      </div>

      {/* Pregunta */}
      <div style={styles.pregunta}>¿Quién eres?</div>

      {/* Tarjetas de rol */}
      <div style={styles.cardList}>
        {ROLES.map(rol => {
          const seleccionado = rolSeleccionado === rol.id;
          return (
            <div
              key={rol.id}
              style={{
                ...styles.card,
                border: seleccionado ? '2px solid #2563eb' : '2px solid transparent',
                background: seleccionado ? '#eff6ff' : 'white'
              }}
              onClick={() => handleSelectRol(rol.id)}
              onMouseEnter={e => {
                if (!seleccionado) e.currentTarget.style.border = '2px solid #2563eb';
              }}
              onMouseLeave={e => {
                if (!seleccionado) e.currentTarget.style.border = '2px solid transparent';
              }}
            >
              <div style={styles.cardLabel}>{rol.label}</div>
              <div style={styles.cardSublabel}>{rol.sublabel}</div>
            </div>
          );
        })}
      </div>

      {/* Panel de inputs */}
      {showInput && (
        <div style={styles.inputPanel}>
          {(rolSeleccionado === 'auxiliar') && (
            <input
              style={styles.input}
              type="text"
              inputMode="numeric"
              placeholder="Código de centro (6 dígitos)"
              maxLength={6}
              value={codigo}
              onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
            />
          )}

          {rolSeleccionado === 'familiar' && (
            <input
              style={styles.input}
              type="text"
              inputMode="numeric"
              placeholder="Código de residente (6 dígitos)"
              maxLength={6}
              value={codigo}
              onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
            />
          )}

          {rolSeleccionado === 'gestion' && (
            <>
              <input
                style={styles.input}
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Código de centro"
                value={codigoGestion}
                onChange={e => setCodigoGestion(e.target.value)}
              />
            </>
          )}
        </div>
      )}

      {/* Botón Entrar */}
      {showInput && (
        <button
          style={{
            ...styles.btnEntrar,
            opacity: isEntrarEnabled() ? 1 : 0.45,
            cursor: isEntrarEnabled() ? 'pointer' : 'not-allowed'
          }}
          onClick={handleEntrar}
          disabled={!isEntrarEnabled()}
        >
          Entrar
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    padding: 32
  },
  logoWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6
  },
  logo: {
    fontSize: 48,
    fontWeight: 700,
    color: 'white',
    letterSpacing: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af'
  },
  pregunta: {
    fontSize: 20,
    color: 'white',
    marginTop: 32
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxWidth: 380
  },
  card: {
    background: 'white',
    borderRadius: 12,
    padding: '20px 24px',
    cursor: 'pointer',
    transition: 'border 0.15s, background 0.15s'
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827'
  },
  cardSublabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2
  },
  inputPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    maxWidth: 380
  },
  input: {
    width: '100%',
    height: 44,
    padding: '0 14px',
    fontSize: 15,
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: 'white',
    color: '#111827',
    outline: 'none',
    fontFamily: 'inherit'
  },
  btnEntrar: {
    height: 44,
    width: '100%',
    maxWidth: 380,
    background: '#2563eb',
    color: 'white',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 500,
    border: 'none',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s'
  }
};
