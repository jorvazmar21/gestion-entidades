/**
 * @module useUiStore
 * @description Controlador general de vistas operativas y navegación interna del frontend.
 * @inputs Solicitudes de cambio de pantalla desde botoneras de módulos o acciones de redirección central.
 * @actions Alterna componentes raíz (HOME, MEDIA, APP) y hospeda persistentemente la ID de la última entidad abierta.
 * @files src/store/useUiStore.ts
 */
import { create } from 'zustand';

export type ScreenType = 'LOGIN' | 'HOME' | 'MODULE_VIEW' | 'LAYOUT_CONFIG' | 'MEDIA_MANAGER' | 'PROFILE_FORGE' | 'INVENTORY_CATALOG' | 'PERMISSION_MATRIX' | 'DATA_DICTIONARY' | 'EXCEL_VIEWER' | 'CANVAS_SANDBOX' | 'ADN_V2' | 'SANDBOX_GRID' | 'SANDBOX_INSPECTOR';

interface UiState {
  currentScreen: ScreenType;
  activeModuleId: string | null;
  searchTerm: string;
  activeFase: string | null;
  activeDepartamento: string | null;
  activePSetTab: 'ESTATICO' | 'DINAMICO';
  selectedEntityId: string | null;
  gridResetSignal: number;
  
  // Acciones
  setScreen: (screen: ScreenType) => void;
  setModule: (moduleId: string | null) => void;
  navigateToModule: (moduleId: string) => void;
  setSearchTerm: (term: string) => void;
  setActiveFase: (fase: string | null) => void;
  setActiveDepartamento: (dept: string | null) => void;
  setActivePSetTab: (tab: 'ESTATICO' | 'DINAMICO') => void;
  setSelectedEntityId: (id: string | null) => void;
  triggerGridReset: () => void;
}

// "useUiStore": El GPS / Navegador de la aplicación
export const useUiStore = create<UiState>((set) => ({
  currentScreen: 'LOGIN',
  activeModuleId: null,
  searchTerm: '',
  activeFase: null,
  activeDepartamento: null,
  activePSetTab: 'ESTATICO',
  selectedEntityId: null,
  gridResetSignal: 0,

  setScreen: (screen) => set({ currentScreen: screen, searchTerm: '', activeFase: null, activeDepartamento: null }), // Clear search/filters on screen change
  setModule: (moduleId) => set({ activeModuleId: moduleId, searchTerm: '', activeFase: null, activeDepartamento: null }), // Clear search/filters on module change
  navigateToModule: (moduleId) => set({ currentScreen: 'MODULE_VIEW', activeModuleId: moduleId, searchTerm: '', activeFase: null, activeDepartamento: null }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setActiveFase: (fase) => set({ activeFase: fase }),
  setActiveDepartamento: (dept) => set({ activeDepartamento: dept }),
  setActivePSetTab: (tab) => set({ activePSetTab: tab }),
  setSelectedEntityId: (id) => set({ selectedEntityId: id }),
  triggerGridReset: () => set(state => ({ gridResetSignal: state.gridResetSignal + 1 }))
}));
