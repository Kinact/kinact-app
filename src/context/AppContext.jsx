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
  const [currentView, setCurrentView] = useState('landing');
  const [navigationHistory, setNavigationHistory] = useState([]);

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

  const [orgId, setOrgId] = useState(null);
  const [residents, setResidents] = useState(MOCK_RESIDENTS);
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
      setOrgId(data.org_id || null);
      if (data.rol === 'familiar' && data.residente_id) {
        setSelectedResidentId(data.residente_id);
      }
      if (data.rol === 'director' && !data.onboarding_done) {
        setCurrentView('onboarding');
      } else {
        setCurrentView(VISTA_POR_ROL[data.rol] || 'center');
      }
      // Cargar residentes de la organización
      if (data.org_id) {
        supabase
          .from('residentes')
          .select('*')
          .eq('org_id', data.org_id)
          .eq('activo', true)
          .order('ref_id')
          .then(({ data: rows }) => {
            if (rows && rows.length > 0) {
              setResidents(rows.map(r => ({
                id:              r.ref_id || r.id,
                uuid:            r.id,
                nombre:          r.nombre,
                iniciales:       r.iniciales || r.nombre.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
                tableroHabitual: r.tablero_habitual,
                incorporacion:   r.incorporacion,
                sesiones:        r.sesiones || 0,
              })));
            }
          });
      }
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
          setOrgId(null);
          setCurrentView('landing');
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
    setCurrentView('landing');
    setNavigationHistory([]);
    localStorage.removeItem('kinactRole');
  };

  // ── Navegación ────────────────────────────────────────────────────────────
  const navigateTo = (view, options = {}) => {
    if (options.role) {
      setUserRole(options.role);
      localStorage.setItem('kinactRole', options.role);
    }
    if (options.residentId) setSelectedResidentId(options.residentId);

    // Guardar vista actual en el historial (excepto login y vistas de inicio de sesión)
    setNavigationHistory(prev =>
      currentView !== 'login' && view !== 'login' ? [...prev, currentView] : []
    );
    setCurrentView(view);
  };

  // ── Volver atrás ──────────────────────────────────────────────────────────
  const goBack = () => {
    setNavigationHistory(prev => {
      if (prev.length === 0) {
        // Sin historial: ir a la pantalla de inicio del rol
        const home = VISTA_POR_ROL[userRole] || 'login';
        setCurrentView(home);
        return [];
      }
      const newHistory = [...prev];
      const previousView = newHistory.pop();
      setCurrentView(previousView);
      return newHistory;
    });
  };

  return (
    <AppContext.Provider value={{
      user, profile,
      userRole, setUserRole,
      orgId, residents, setResidents,
      authLoading,
      currentView, setCurrentView,
      navigateTo, goBack, login, logout,
      sessionState, setSessionState,
      evaluaciones, setEvaluaciones,
      selectedResidentId, setSelectedResidentId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
