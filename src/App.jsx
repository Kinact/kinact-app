import { AppProvider, useApp } from './context/AppContext';
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
import './index.css';

function AppRouter() {
  const { currentView, navigateTo, setSessionState } = useApp();

  const handleIniciarSesion = (jugadores, tableros) => {
    // Construye el estado inicial de sesión con los jugadores seleccionados
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
    case 'onboarding':        return <Onboarding />;
    case 'session-selector':  return <SessionSelector
                                onIniciarSesion={handleIniciarSesion}
                                onVerResidentes={() => navigateTo('residents')}
                              />;
    case 'residents':         return <ResidentManager
                                onBack={() => navigateTo('session-selector')}
                                onVerDashboard={id => navigateTo('resident', { residentId: id })}
                              />;
    case 'session-active':    return <SessionActive />;
    case 'survey':            return <Survey />;
    case 'summary':           return <Summary />;
    case 'resident':          return <ResidentDashboard />;
    case 'center':            return <CenterDashboard />;
    case 'family':            return <FamilyPortal />;
    case 'clinical-scales':   return <ClinicalScales />;
    default:                  return <Onboarding />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
