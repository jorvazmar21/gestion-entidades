import { LoginScreen } from './components/LoginScreen'
import { HomeScreen } from './components/HomeScreen'
import { MainLayout } from './components/MainLayout'
import { LayoutConfigScreen } from './components/LayoutConfigScreen'
import { useAuthStore } from './store/useAuthStore'
import { useUiStore } from './store/useUiStore'

import { MediaManagerScreen } from './components/MediaManagerScreen'
import { ProfileForgeScreen } from './components/admin/ProfileForgeScreen'
import { InventoryCatalogScreen } from './components/admin/InventoryCatalogScreen'
import { PermissionMatrixScreen } from './components/admin/PermissionMatrixScreen'
import { DataDictionaryScreen } from './components/admin/DataDictionaryScreen'
import { ExcelViewerScreen } from './components/admin/ExcelViewerScreen'

function App() {
  // El "Mundo" Visual / Navegación (Pilar 2)
  const { currentScreen, setScreen } = useUiStore();
  
  // El "Mundo" de la Seguridad (Pilar 1)
  const { login, loginError } = useAuthStore();

  const handleLogin = async (username: string, pass: string) => {
    const success = await login(username, pass);
    if (success) {
      setScreen('HOME');
    }
  };

  // 1. Pantalla de Acceso
  if (currentScreen === 'LOGIN') {
    return <LoginScreen onLogin={handleLogin} errorMsg={loginError} />
  }

  // 2. Pantalla de Menú de Lanzamiento (Home)
  if (currentScreen === 'HOME') {
    return <HomeScreen />
  }

  // 3. Pantalla Modular (El Layout Ledger de Trabajo 3-Columnas)
  if (currentScreen === 'MODULE_VIEW') {
    return (
      <MainLayout />
    );
  }

  // 4. Pantalla de Configuración Maestra (WYSIWYG Layout)
  if (currentScreen === 'LAYOUT_CONFIG') {
    return <LayoutConfigScreen />;
  }

  // 5. Pantalla de Gestión Visual (Media Manager)
  if (currentScreen === 'MEDIA_MANAGER') {
    return <MediaManagerScreen />;
  }

  // Rutas Módulo Permisos L/E/A
  if (currentScreen === 'PROFILE_FORGE') return <ProfileForgeScreen onBack={() => setScreen('HOME')} />;
  if (currentScreen === 'INVENTORY_CATALOG') return <InventoryCatalogScreen onBack={() => setScreen('HOME')} />;
  if (currentScreen === 'PERMISSION_MATRIX') return <PermissionMatrixScreen onBack={() => setScreen('HOME')} />;
  if (currentScreen === 'DATA_DICTIONARY') return <DataDictionaryScreen onBack={() => setScreen('HOME')} />;
  if (currentScreen === 'EXCEL_VIEWER') return <ExcelViewerScreen onBack={() => setScreen('HOME')} />;

  return null;
}

export default App
