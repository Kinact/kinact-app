import { useApp } from '../../../context/AppContext';

const GAMES = [
  {
    id: 'king-act',
    nombre: 'King Act',
    tagline: 'Estimulación motora y cognitiva',
    descripcion: 'Juego de tablero adaptado para grupos de 4 residentes. Mejora la coordinación, el reconocimiento de formas y la interacción social.',
    icono: '♟',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    activo: true,
    vista: 'center',
  },
  {
    id: 'memo-sens',
    nombre: 'MemoSens',
    tagline: 'Memoria sensorial · Próximamente',
    descripcion: 'Secuencias de texturas y sonidos para trabajar la memoria a corto plazo y la atención sostenida.',
    icono: '🧠',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    activo: false,
  },
  {
    id: 'equilibria',
    nombre: 'Equilibria',
    tagline: 'Equilibrio y marcha · Próximamente',
    descripcion: 'Actividades guiadas de equilibrio estático y dinámico con registro automático de progresión.',
    icono: '⚖️',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    activo: false,
  },
  {
    id: 'narrativa',
    nombre: 'NarrActiva',
    tagline: 'Comunicación y lenguaje · Próximamente',
    descripcion: 'Terapia narrativa grupal con apoyo visual. Estimula la expresión verbal y la evocación de recuerdos.',
    icono: '💬',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    activo: false,
  },
];

export default function GameCatalog() {
  const { profile, orgName, residents, logout, navigateTo } = useApp();

  const totalSesiones = residents.reduce((s, r) => s + (r.sesiones || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, color: 'white', fontWeight: 900 }}>K</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>KINACT</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{orgName || 'Mi centro'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigateTo('user-management')}
            style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Gestión de usuarios
          </button>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {profile?.nombre || 'Director'}
          </div>
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', fontSize: 12, color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '36px 28px 24px', maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
          Catálogo de programas
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px' }}>
          Selecciona un programa para acceder a sus sesiones, dashboards e informes.
        </p>

        {/* Stats rápidas */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Residentes', valor: residents.length, color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Sesiones totales', valor: totalSesiones, color: '#059669', bg: '#ecfdf5' },
            { label: 'Programas activos', valor: 1, color: '#7c3aed', bg: '#f5f3ff' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 10, padding: '12px 20px', minWidth: 110 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.valor}</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Grid de juegos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {GAMES.map(g => (
            <div
              key={g.id}
              onClick={() => g.activo && navigateTo(g.vista)}
              style={{
                background: 'white',
                border: `1px solid ${g.activo ? g.border : '#e5e7eb'}`,
                borderRadius: 14,
                padding: 24,
                cursor: g.activo ? 'pointer' : 'default',
                opacity: g.activo ? 1 : 0.65,
                transition: 'box-shadow .15s, transform .15s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (g.activo) { e.currentTarget.style.boxShadow = '0 4px 20px rgba(29,78,216,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Burbuja decorativa */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: g.bg, opacity: 0.6 }} />

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{g.icono}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{g.nombre}</div>
                  {g.activo && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: g.bg, color: g.color, border: `1px solid ${g.border}`, borderRadius: 20, padding: '2px 8px' }}>
                      Activo
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: g.activo ? g.color : '#9ca3af', marginBottom: 10 }}>
                  {g.tagline}
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, margin: 0 }}>
                  {g.descripcion}
                </p>
                {g.activo && (
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: g.color }}>
                    Abrir programa →
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
