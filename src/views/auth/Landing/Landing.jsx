import { useApp } from '../../../context/AppContext';

const PILLS = [
  { icon: '🎲', label: 'King Act' },
  { icon: '📊', label: 'Dashboards clínicos' },
  { icon: '👨‍👩‍👧', label: 'Portal de familias' },
  { icon: '📋', label: 'Informes PDF' },
];

export default function Landing() {
  const { navigateTo } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #eff6ff 0%, #f8fafc 50%, #f0fdf4 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      padding: 24,
    }}>

      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: '#1d4ed8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 28px #1d4ed840',
        }}>
          <span style={{ fontSize: 28, color: 'white', fontWeight: 900 }}>K</span>
        </div>

        {/* Nombre */}
        <h1 style={{
          fontSize: 36, fontWeight: 900, color: '#0f172a',
          margin: '0 0 8px', letterSpacing: '-.02em',
        }}>
          KINACT
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 16, color: '#475569', fontWeight: 600,
          margin: '0 0 28px', lineHeight: 1.5,
        }}>
          Plataforma de estimulación terapéutica para residencias geriátricas
        </p>

        {/* Pills de funcionalidades */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          justifyContent: 'center', marginBottom: 36,
        }}>
          {PILLS.map(p => (
            <div key={p.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'white', borderRadius: 20,
              padding: '6px 14px', fontSize: 13, fontWeight: 600,
              color: '#374151', border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Descripción */}
        <p style={{
          fontSize: 14, color: '#64748b', lineHeight: 1.7,
          margin: '0 0 36px',
        }}>
          Kinact digitaliza las sesiones de estimulación cognitiva y motora,
          registra el progreso de cada residente y conecta al equipo clínico
          con las familias en tiempo real.
        </p>

        {/* Botón principal */}
        <button
          onClick={() => navigateTo('login')}
          style={{
            width: '100%', padding: '14px',
            background: '#1d4ed8', color: 'white',
            border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 800, fontFamily: 'inherit',
            cursor: 'pointer',
            boxShadow: '0 4px 16px #1d4ed840',
            letterSpacing: '.01em',
          }}
        >
          Iniciar sesión en mi centro
        </button>

      </div>

      {/* Footer */}
      <p style={{
        position: 'absolute', bottom: 20,
        fontSize: 11, color: '#94a3b8', fontWeight: 600,
      }}>
        © {new Date().getFullYear()} Kinact · Todos los derechos reservados
      </p>

    </div>
  );
}
