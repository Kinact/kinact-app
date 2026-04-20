import { createContext, useContext, useState } from 'react';
import { POOL_PIEZAS, MOCK_RESIDENTS } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userRole, setUserRole] = useState(localStorage.getItem('kinactRole') || null);
  const [currentView, setCurrentView] = useState('onboarding');

  const [sessionState, setSessionState] = useState({
    activa: false,
    tiempoRestante: 1500, // 25 minutos en segundos
    turnoNumero: 0,       // campo unificado (era turnoActual + turnoNumero)
    jugadores: MOCK_RESIDENTS.slice(0, 4).map(r => ({
      ...r,
      tableroAsignado: null,
      tablero: Array(9).fill(null).map((_, i) => ({ id: i, ocupado: false, pieza: null })),
      piezasEnMano: [],
      acciones: [],
      intercambios: [],
      turnosSinColocar: 0
    })),
    pool: [...POOL_PIEZAS]
  });

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState('r1');

  // Helpers de navegación
  const navigateTo = (view, options = {}) => {
    if (options.role) {
      localStorage.setItem('kinactRole', options.role);
      setUserRole(options.role);
    }
    if (options.residentId) {
      setSelectedResidentId(options.residentId);
    }
    setCurrentView(view);
  };

  const logout = () => {
    localStorage.removeItem('kinactRole');
    setUserRole(null);
    setCurrentView('onboarding');
  };

  return (
    <AppContext.Provider value={{
      userRole, setUserRole,
      currentView, setCurrentView,
      navigateTo, logout,
      sessionState, setSessionState,
      evaluaciones, setEvaluaciones,
      selectedResidentId, setSelectedResidentId
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
