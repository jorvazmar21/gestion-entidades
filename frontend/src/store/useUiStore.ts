/**
 * @module useUiStore
 * @description Controlador general de vistas operativas y navegación interna del frontend.
 * @inputs Solicitudes de cambio de pantalla desde botoneras de módulos o acciones de redirección central.
 * @actions Alterna componentes raíz (HOME, MEDIA, APP) y hospeda persistentemente la ID de la última entidad abierta.
 * @files src/store/useUiStore.ts
 */
import { create } from 'zustand';

export type ScreenType = 'LOGIN' | 'HOME' | 'MODULE_VIEW' | 'LAYOUT_CONFIG' | 'MEDIA_MANAGER' | 'PROFILE_FORGE' | 'INVENTORY_CATALOG' | 'PERMISSION_MATRIX' | 'DATA_DICTIONARY' | 'EXCEL_VIEWER' | 'CANVAS_SANDBOX' | 'ADN_V2' | 'SANDBOX_GRID' | 'SANDBOX_GRID_V2' | 'SANDBOX_INSPECTOR' | 'SANDBOX_Z7';

interface UiState {
  currentScreen: ScreenType;
  activeModuleId: string | null;
  searchTerm: string;
  activeFase: string | null;
  activeDepartamento: string | null;
  activePSetTab: 'ESTATICO' | 'DINAMICO';
  selectedEntityId: string | null;
  gridResetSignal: number;
  gridColumnStates: Record<string, any>;
  activeTabFilter: string | null;
  activeDetailTab: string | null;
  psetContextPayload: any[];
  
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
  setGridColumnState: (gridId: string, state: any) => void;
  setActiveTabFilter: (tab: string | null) => void;
  setActiveDetailTab: (tab: string | null) => void;
  setPSetContextPayload: (payload: any[]) => void;
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
  activeTabFilter: null,
  activeDetailTab: null,
  psetContextPayload: [],
  gridResetSignal: 0,
  gridColumnStates: {},

  setScreen: (screen) => set({ currentScreen: screen, searchTerm: '', activeFase: null, activeDepartamento: null }), // Clear search/filters on screen change
  setModule: (moduleId) => set({ activeModuleId: moduleId, searchTerm: '', activeFase: null, activeDepartamento: null, activeTabFilter: null, activeDetailTab: null, psetContextPayload: [] }), // Clear search/filters on module change
  navigateToModule: (moduleId) => set({ currentScreen: 'MODULE_VIEW', activeModuleId: moduleId, searchTerm: '', activeFase: null, activeDepartamento: null, activeTabFilter: null, activeDetailTab: null, psetContextPayload: [] }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setActiveFase: (fase) => set({ activeFase: fase }),
  setActiveDepartamento: (dept) => set({ activeDepartamento: dept }),
  setActivePSetTab: (tab) => set({ activePSetTab: tab }),
  setSelectedEntityId: (id) => set({ selectedEntityId: id }),
  setActiveTabFilter: (tab) => set({ activeTabFilter: tab }),
  setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),
  setPSetContextPayload: (payload) => set({ psetContextPayload: payload }),
  triggerGridReset: () => set(state => ({ gridResetSignal: state.gridResetSignal + 1 })),
  setGridColumnState: (gridId, state) => set(s => ({ gridColumnStates: { ...s.gridColumnStates, [gridId]: state } }))
}));
