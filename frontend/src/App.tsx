import { useState } from 'react'
import Papa from 'papaparse'
import { LoginScreen } from './components/LoginScreen'
import { HomeScreen } from './components/HomeScreen'
import { useAppStore } from './store/useAppStore'

type AppMode = 'ADMIN' | 'ZEUS';
type ScreenType = 'LOGIN' | 'HOME' | 'MODULE_VIEW';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('LOGIN');
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<AppMode | null>(null);
  const [loginError, setLoginError] = useState<string | undefined>();
  
  // Acciones globales del Store central
  const initDb = useAppStore(state => state.init);
  const setModule = useAppStore(state => state.setModule);

  const handleLogin = async (username: string, pass: string) => {
    try {
      const response = await fetch('/data/usuarios.csv');
      if (!response.ok) throw new Error('No se pudo cargar la tabla de usuarios.');
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        complete: async (results: any) => {
          const rows = results.data as any[];
          const userRow = rows.find((r: any) => r.usuario === username && r.password === pass);
          
          if (userRow) {
            setActiveUser(userRow.usuario);
            
            // Leemos el 'rol' legítimo que viene de tu CSV original de usuarios
            const role: AppMode = userRow.rol === 'admin' ? 'ADMIN' : 'ZEUS';
            setUserRole(role);
            setLoginError(undefined);
            
            // Disparamos la carga inicial masiva a través del Proxy
            await initDb();
            
            // Transición a la pantalla de mando
            setCurrentScreen('HOME');
          } else {
            setLoginError('Usuario o contraseña no válidos.');
          }
        }
      });
    } catch (e: any) {
       console.error(e);
       setLoginError('Error de red al intentar validar la credencial.');
    }
  };

  const handleLogout = () => {
    setCurrentScreen('LOGIN');
    setActiveUser(null);
    setUserRole(null);
    setLoginError(undefined);
  };

  const handleNavigate = (screen: ScreenType, moduleId?: string) => {
    setCurrentScreen(screen);
    if (moduleId) {
      setModule(moduleId);
    }
  };

  // 1. Pantalla de Acceso
  if (currentScreen === 'LOGIN') {
    return <LoginScreen onLogin={handleLogin} errorMsg={loginError} />
  }

  // 2. Pantalla de Menú de Lanzamiento (Home)
  if (currentScreen === 'HOME') {
    return <HomeScreen 
             activeUser={activeUser} 
             userRole={userRole} 
             onLogout={handleLogout} 
             onNavigate={handleNavigate} 
           />
  }

  // 3. Pantalla Modular (El Layout Ledger de Trabajo 3-Columnas)
  // Dejamos el Placeholder preparado para inyectar este Macro-Layout próximamente
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-['Inter'] text-[#121c2a]">
       <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => handleNavigate('HOME')} 
                className="text-[#8a716f] hover:text-[#7f1d1d] font-bold text-[11px] tracking-widest uppercase flex items-center gap-2 transition-colors"
                title="Volver al Menú Principal"
              >
                  <span>Mosaico Módulos</span>
              </button>
              <div className="w-[1px] h-4 bg-gray-300"></div>
              <h2 className="font-['Manrope'] font-bold text-sm uppercase tracking-widest">
                INICIO &gt; MÓDULO ACTIVO
              </h2>
          </div>
       </header>
       
       <main className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white shadow-[0_4px_12px_rgba(18,28,42,0.03)] p-8 min-h-[400px] border-[1px] border-gray-200 rounded-[4px]">
             <h3 className="text-xl font-bold mb-4 font-['Manrope'] uppercase tracking-wide text-[#7f1d1d]">El Área de Datos</h3>
             <p className="text-[#574240] leading-relaxed text-sm">
               El módulo se ha cargado con éxito. Pronto inyectaremos aquí el MainLayout con la barra lateral izquierda (Filtros), el lienzo central y el panel derecho informativo.
             </p>
          </div>
       </main>
    </div>
  )
}

export default App
