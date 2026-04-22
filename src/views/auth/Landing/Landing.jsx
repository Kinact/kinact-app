import { useApp } from '../../../context/AppContext';

const FEATURES = [
  {
    icon: '🎲',
    title: 'King Act',
    desc: 'Juego terapéutico de piezas en grupo que estimula la cognición, la autonomía y la interacción social.'
  },
  {
    icon: '📊',
    title: 'Dashboards en tiempo real',
    desc: 'Seguimiento por residente: asistencia, escalas clínicas validadas (MEC, GDS, Barthel, TUG) y evolución.'
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Portal de familias',
    desc: 'Las familias acceden a los progresos de su familiar de forma clara, sin jerga clínica.'
  },
  {
    icon: '📋',
    title: 'Informes PDF',
    desc: 'Exporta informes individuales con un clic para reuniones clínicas, auditorías o familiares.'
  },
];

const PASOS = [
  { num: '1', title: 'Registra tu centro', desc: 'Crea tu cuenta en menos de 2 minutos. Sin tarjeta de crédito.' },
  { num: '2', title: 'Añade tu equipo', desc: 'Invita a facilitadores, clínicos y vincula a los familiares.' },
  { num: '3', title: 'Empieza a jugar', desc: 'Lanza tu primera sesión de King Act y los datos se registran automáticamente.' },
];

export default function Landing() {
  const { navigateTo } = useApp();

  return (
    <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif", minHeight: '100vh', background: 'white', color: '#111827' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #f3f4f6',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: '#1d4ed8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px #1d4ed840',
          }}>
            <span style={{ fontSize: 16, color: 'white', fontWeight: 900 }}>K</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: '#111827', letterSpacing: '-.01em' }}>KINACT</span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigateTo('login')}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 700,
              borderRadius: 8, border: '1.5px solid #e5e7eb',
              background: 'white', color: '#374151',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigateTo('register')}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 700,
              borderRadius: 8, border: 'none',
              background: '#1d4ed8', color: 'white',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px #1d4ed840',
            }}
          >
            Registrar mi centro
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #f0fdf4 100%)',
        padding: '80px 24px 72px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#dbeafe', borderRadius: 20,
            padding: '5px 14px', marginBottom: 24,
            fontSize: 12, fontWeight: 700, color: '#1d4ed8',
          }}>
            <span>✦</span>
            <span>Plataforma de estimulación terapéutica para residencias</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 900, lineHeight: 1.1,
            color: '#0f172a', margin: '0 0 20px',
            letterSpacing: '-.02em',
          }}>
            Terapia grupal que{' '}
            <span style={{ color: '#1d4ed8' }}>se mide</span>{' '}
            y se comparte
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: '#475569', lineHeight: 1.65,
            margin: '0 auto 36px', maxWidth: 520,
          }}>
            Kinact digitaliza las sesiones de estimulación cognitiva y motora, registra el progreso de cada residente y conecta al equipo clínico con las familias.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigateTo('register')}
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 800,
                borderRadius: 10, border: 'none',
                background: '#1d4ed8', color: 'white',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 20px #1d4ed850',
              }}
            >
              Empieza gratis →
            </button>
            <button
              onClick={() => navigateTo('login')}
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 700,
                borderRadius: 10, border: '1.5px solid #cbd5e1',
                background: 'white', color: '#334155',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Ya tengo cuenta
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16, fontWeight: 600 }}>
            Sin tarjeta de crédito · Configuración en 2 minutos
          </p>
        </div>

        {/* Mock UI card */}
        <div style={{
          maxWidth: 780, margin: '56px auto 0',
          background: 'white', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}>
          {/* Fake browser bar */}
          <div style={{
            background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {['#f87171','#fbbf24','#34d399'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{
              flex: 1, background: '#e2e8f0', borderRadius: 6,
              height: 22, display: 'flex', alignItems: 'center',
              paddingLeft: 10, fontSize: 11, color: '#94a3b8', fontWeight: 600
            }}>
              kinact-app.vercel.app
            </div>
          </div>

          {/* Fake dashboard */}
          <div style={{ padding: 20, background: '#f9fafb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Residentes activos', val: '8' },
                { label: 'Sesiones este mes', val: '24' },
                { label: 'Asistencia media', val: '91%' },
                { label: 'Progreso TUG', val: '↑ +12%' },
              ].map(m => (
                <div key={m.label} style={{ background: 'white', borderRadius: 10, padding: '12px 14px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1d4ed8' }}>{m.val}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3, fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Evolución por sesión</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Estado', 'Engagement', 'Autonomía'].map(label => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: '#9ca3af', width: 68, textAlign: 'right' }}>{label}</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {Array.from({length: 10}, (_, i) => (
                          <div key={i} style={{ width: 14, height: 8, borderRadius: 2, background: ['#fca5a5','#bfdbfe','#86efac','#86efac','#86efac','#bfdbfe','#86efac','#86efac','#86efac','#86efac'][i] }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 10, padding: 14, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Escalas clínicas</div>
                {[{n:'MEC',v:'27pts',c:'#16a34a'},{n:'GDS-15',v:'4pts',c:'#16a34a'},{n:'Barthel',v:'85pts',c:'#d97706'},{n:'TUG',v:'11.2s',c:'#16a34a'}].map(e => (
                  <div key={e.n} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 11 }}>
                    <span style={{ color: '#6b7280' }}>{e.n}</span>
                    <span style={{ fontWeight: 700, color: e.c }}>{e.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '72px 24px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-.01em' }}>
              Todo lo que necesita tu centro
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', margin: 0, maxWidth: 480, marginInline: 'auto' }}>
              Una plataforma diseñada con y para profesionales de residencias geriátricas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: '#f8fafc', borderRadius: 14,
                padding: '24px 20px', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section style={{ padding: '72px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '0 0 48px', letterSpacing: '-.01em' }}>
            En marcha en 3 pasos
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PASOS.map((p, i) => (
              <div key={p.num} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', textAlign: 'left', position: 'relative', paddingBottom: i < PASOS.length - 1 ? 32 : 0 }}>
                {i < PASOS.length - 1 && (
                  <div style={{ position: 'absolute', left: 19, top: 44, width: 2, height: 'calc(100% - 12px)', background: '#dbeafe' }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: '#1d4ed8', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 900, position: 'relative', zIndex: 1,
                  boxShadow: '0 2px 12px #1d4ed840',
                }}>
                  {p.num}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.55 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{
        padding: '72px 24px',
        background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: 'white', margin: '0 0 16px', letterSpacing: '-.01em' }}>
            ¿Listo para empezar?
          </h2>
          <p style={{ fontSize: 16, color: '#bfdbfe', margin: '0 0 32px', lineHeight: 1.55 }}>
            Registra tu centro hoy. Los primeros 30 días son gratuitos, sin compromiso.
          </p>
          <button
            onClick={() => navigateTo('register')}
            style={{
              padding: '15px 36px', fontSize: 16, fontWeight: 800,
              borderRadius: 10, border: 'none',
              background: 'white', color: '#1d4ed8',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            Registrar mi centro gratis →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '28px 24px',
        background: '#0f172a',
        textAlign: 'center',
        fontSize: 12, color: '#475569', fontWeight: 600,
      }}>
        © {new Date().getFullYear()} Kinact · Plataforma de estimulación terapéutica · Todos los derechos reservados
      </footer>

    </div>
  );
}
