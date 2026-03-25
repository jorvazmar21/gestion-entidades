/**
 * @module useUiStore
 * @description Controlador general de vistas operativas y navegación interna del frontend.
 * @inputs Solicitudes de cambio de pantalla desde botoneras de módulos o acciones de redirección central.
 * @actions Alterna componentes raíz (HOME, MEDIA, APP) y hospeda persistentemente la ID de la última entidad abierta.
 * @files src/store/useUiStore.ts
 */
import { create } from 'zustand';

export type ScreenType = 'LOGIN' | 'HOME' | 'MODULE_VIEW' | 'LAYOUT_CONFIG' | 'MEDIA_MANAGER' | 'PROFILE_FORGE' | 'INVENTORY_CATALOG' | 'PERMISSION_MATRIX' | 'DATA_DICTIONARY' | 'EXCEL_VIEWER' | 'CANVAS_SANDBOX' | 'MOLD_BUILDER' | 'ADN_V2';

interface UiState {
  currentScreen: ScreenType;
  activeModuleId: string | null;
  searchTerm: string;
  activeFase: string | null;
  activeDepartamento: string | null;
  
  // Acciones
  setScreen: (screen: ScreenType) => void;
  setModule: (moduleId: string | null) => void;
  navigateToModule: (moduleId: string) => void;
  setSearchTerm: (term: string) => void;
  setActiveFase: (fase: string | null) => void;
  setActiveDepartamento: (dept: string | null) => void;
}

// "useUiStore": El GPS / Navegador de la aplicación
export const useUiStore = create<UiState>((set) => ({
  currentScreen: 'LOGIN',
  activeModuleId: null,
  searchTerm: '',
  activeFase: null,
  activeDepartamento: null,

  setScreen: (screen) => set({ currentScreen: screen, searchTerm: '', activeFase: null, activeDepartamento: null }), // Clear search/filters on screen change
  setModule: (moduleId) => set({ activeModuleId: moduleId, searchTerm: '', activeFase: null, activeDepartamento: null }), // Clear search/filters on module change
  navigateToModule: (moduleId) => set({ currentScreen: 'MODULE_VIEW', activeModuleId: moduleId, searchTerm: '', activeFase: null, activeDepartamento: null }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setActiveFase: (fase) => set({ activeFase: fase }),
  setActiveDepartamento: (dept) => set({ activeDepartamento: dept })
}));
