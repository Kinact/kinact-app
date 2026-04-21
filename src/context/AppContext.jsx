import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { POOL_PIEZAS, MOCK_RESIDENTS } from '../data/mockData';

const AppContext = createContext(null);

// Vista inicial por rol
const VISTA_POR_ROL = {
  director:    'center',
  facilitador: 'session-selector',
  familiar:    'family',
  clinico:     'clinical-scales',
};

export function AppProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState('login');

  const [sessionState, setSessionState] = useState({
    activa: false,
    tiempoRestante: 1500,
    turnoNumero: 0,
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

  // ── Cargar perfil desde Supabase ──────────────────────────────────────────
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(data);
      setUserRole(data.rol);
      setCurrentView(VISTA_POR_ROL[data.rol] || 'center');
    }
  };

  // ── Auth listener al montar ───────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setUserRole(null);
          setCurrentView('login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setUserRole(null);
    setCurrentView('login');
    localStorage.removeItem('kinactRole');
  };

  // ── Navegación ────────────────────────────────────────────────────────────
  const navigateTo = (view, options = {}) => {
    if (options.role) {
      setUserRole(options.role);
      localStorage.setItem('kinactRole', options.role);
    }
    if (options.residentId) setSelectedResidentId(options.residentId);
    setCurrentView(view);
  };

  return (
    <AppContext.Provider value={{
      user, profile,
      userRole, setUserRole,
      authLoading,
      currentView, setCurrentView,
      navigateTo, login, logout,
      sessionState, setSessionState,
      evaluaciones, setEvaluaciones,
      selectedResidentId, setSelectedResidentId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
