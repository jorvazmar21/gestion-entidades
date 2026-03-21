/**
 * @module useUiStore
 * @description Controlador general de vistas operativas y navegación interna del frontend.
 * @inputs Solicitudes de cambio de pantalla desde botoneras de módulos o acciones de redirección central.
 * @actions Alterna componentes raíz (HOME, MEDIA, APP) y hospeda persistentemente la ID de la última entidad abierta.
 * @files src/store/useUiStore.ts
 */
import { create } from 'zustand';

export type ScreenType = 'LOGIN' | 'HOME' | 'MODULE_VIEW' | 'LAYOUT_CONFIG' | 'MEDIA_MANAGER' | 'PROFILE_FORGE' | 'INVENTORY_CATALOG' | 'PERMISSION_MATRIX';

interface UiState {
  currentScreen: ScreenType;
  activeModuleId: string | null;
  
  // Acciones
  setScreen: (screen: ScreenType) => void;
  setModule: (moduleId: string | null) => void;
  navigateToModule: (moduleId: string) => void;
}

// "useUiStore": El GPS / Navegador de la aplicación
export const useUiStore = create<UiState>((set) => ({
  currentScreen: 'LOGIN',
  activeModuleId: null,

  setScreen: (screen) => set({ currentScreen: screen }),
  setModule: (moduleId) => set({ activeModuleId: moduleId }),
  navigateToModule: (moduleId) => set({ currentScreen: 'MODULE_VIEW', activeModuleId: moduleId })
}));
