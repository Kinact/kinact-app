import { AppProvider, useApp } from './context/AppContext';
import Login from './views/auth/Login/Login';
import Onboarding from './views/auth/Onboarding/Onboarding';
import SessionSelector from './views/facilitator/SessionSelector/SessionSelector';
import ResidentManager from './views/facilitator/ResidentManager/ResidentManager';
import SessionActive from './views/facilitator/SessionActive/SessionActive';
import Survey from './views/facilitator/Survey/Survey';
import Summary from './views/facilitator/Summary/Summary';
import ResidentDashboard from './views/dashboards/ResidentDashboard/ResidentDashboard';
import CenterDashboard from './views/dashboards/CenterDashboard/CenterDashboard';
import FamilyPortal from './views/family/FamilyPortal/FamilyPortal';
import ClinicalScales from './views/clinical/ClinicalScales/ClinicalScales';
import UserManagement from './views/admin/UserManagement/UserManagement';
import './index.css';

// ── Pantalla de carga mientras Supabase verifica la sesión ────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: '#f0f4f8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Nunito', sans-serif", gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: '#1d4ed8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px #1d4ed840',
      }}>
        <span style={{ fontSize: 22, color: 'white', fontWeight: 900 }}>K</span>
      </div>
      <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>Cargando…</div>
    </div>
  );
}

// ── Router principal ──────────────────────────────────────────────────────────
function AppRouter() {
  const { currentView, navigateTo, goBack, setSessionState, authLoading } = useApp();

  if (authLoading) return <LoadingScreen />;

  const handleIniciarSesion = (jugadores, tableros) => {
    setSessionState(prev => ({
      ...prev,
      activa: true,
      turnoNumero: 0,
      jugadores: jugadores.filter(Boolean).map((j, i) => ({
        ...j,
        tableroAsignado: tableros[i] || 'casa',
        tablero: Array(9).fill(null).map((_, idx) => ({ id: idx, ocupado: false, pieza: null })),
        piezasEnMano: [],
        acciones: [],
        intercambios: [],
        turnosSinColocar: 0
      }))
    }));
    navigateTo('session-active');
  };

  switch (currentView) {
    case 'login':             return <Login />;
    case 'onboarding':        return <Onboarding />;
    case 'session-selector':  return <SessionSelector
                                onIniciarSesion={handleIniciarSesion}
                                onVerResidentes={() => navigateTo('residents')}
                              />;
    case 'residents':         return <ResidentManager
                                onBack={goBack}
                                onVerDashboard={id => navigateTo('resident', { residentId: id })}
                              />;
    case 'session-active':    return <SessionActive />;
    case 'survey':            return <Survey />;
    case 'summary':           return <Summary />;
    case 'resident':          return <ResidentDashboard />;
    case 'center':            return <CenterDashboard />;
    case 'family':            return <FamilyPortal />;
    case 'clinical-scales':   return <ClinicalScales />;
    case 'user-management':   return <UserManagement />;
    default:                  return <Login />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
