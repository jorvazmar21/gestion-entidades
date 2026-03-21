/**
 * @module usePermissionsStore
 * @description Evaluador de matrices de acceso, roles (ADMIN/ZEUS) y delegaciones (Niveles C y superior).
 * @inputs Rol activo dictado por `useAuthStore` y nivel jerárquico del nodo seleccionado en la UI.
 * @actions Calcula compuertas lógicas (Lectura, Edición, Aprobación) determinando visibilidad de herramientas e iconos.
 * @files src/store/usePermissionsStore.ts
 */
import { create } from 'zustand';

export type ADNTags = {
  phases: string[];
  departments: string[];
  entities?: string[];
};

export interface BaseProfile {
  id: string;
  name: string;
  description: string;
  isAdmin: boolean;
  adn: ADNTags;
}

export type InventoryType = 'PSET' | 'REPORT' | 'LIST';

export interface InventoryItem {
  id: string;
  type: InventoryType;
  name: string;
  adn: ADNTags;
}

export interface PermissionGrant {
  read: boolean;
  edit: boolean;
  approve: boolean;
}

interface PermissionsState {
  profiles: BaseProfile[];
  inventory: InventoryItem[];
  matrix: Record<string, Record<string, PermissionGrant>>;
  
  // Acciones
  addProfile: (profile: Omit<BaseProfile, 'id'>) => void;
  updateProfile: (id: string, profile: Partial<BaseProfile>) => void;
  deleteProfile: (id: string) => void;
  
  updateInventoryItem: (id: string, adn: ADNTags) => void;
  
  setPermission: (profileId: string, inventoryId: string, grant: Partial<PermissionGrant>) => void;
}

// Datos iniciales de prueba para visualizar el ABAC inmediatamente
const MOCK_PROFILES: BaseProfile[] = [
  {
    id: 'prof_1',
    name: 'Jefe de Producción',
    description: 'Responsable táctico a pie de obra.',
    isAdmin: false,
    adn: { phases: ['EJECUCIÓN'], departments: ['PRODUCCIÓN'], entities: ['OBRAS', 'PARQUE'] }
  },
  {
    id: 'prof_2',
    name: 'Auditor de Calidad',
    description: 'Verificación de normativas y ensayos.',
    isAdmin: false,
    adn: { phases: ['ESTUDIO', 'EJECUCIÓN', 'GARANTÍA'], departments: ['CALIDAD', 'TOPOGRAFÍA'] }
  },
  {
    id: 'prof_admin',
    name: 'Director (Admin)',
    description: 'Zeus temporal. Acceso total.',
    isAdmin: true,
    adn: { phases: [], departments: [] }
  }
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv_1', type: 'PSET', name: 'PSet_ControlHormigones', adn: { phases: ['EJECUCIÓN'], departments: ['PRODUCCIÓN', 'CALIDAD'] } },
  { id: 'inv_2', type: 'PSET', name: 'PSet_DatosContables', adn: { phases: ['ESTUDIO', 'EJECUCIÓN'], departments: ['ADMINISTRACIÓN'] } },
  { id: 'inv_3', type: 'REPORT', name: 'Informe_CurvaAvance', adn: { phases: ['EJECUCIÓN'], departments: ['PRODUCCIÓN'] } },
  { id: 'inv_4', type: 'LIST', name: 'Listado_Proveedores_Locales', adn: { phases: ['ESTUDIO'], departments: ['COMPRAS'] } },
  { id: 'inv_5', type: 'PSET', name: 'PSet_ActaReplanteo', adn: { phases: ['ESTUDIO', 'EJECUCIÓN'], departments: ['TOPOGRAFÍA'] } },
];

export const usePermissionsStore = create<PermissionsState>((set) => ({
  profiles: MOCK_PROFILES,
  inventory: MOCK_INVENTORY,
  matrix: {
    'prof_1': {
      'inv_1': { read: true, edit: true, approve: false },
      'inv_3': { read: true, edit: true, approve: true }
    }
  },

  addProfile: (profileBase) => set((state) => ({
    profiles: [...state.profiles, { ...profileBase, id: `prof_${Date.now()}` }]
  })),

  updateProfile: (id, updatedFields) => set((state) => ({
    profiles: state.profiles.map(p => p.id === id ? { ...p, ...updatedFields } : p)
  })),

  deleteProfile: (id) => set((state) => {
    // También limpiamos la matriz
    const newMatrix = { ...state.matrix };
    delete newMatrix[id];
    return {
      profiles: state.profiles.filter(p => p.id !== id),
      matrix: newMatrix
    };
  }),

  updateInventoryItem: (id, adn) => set((state) => ({
    inventory: state.inventory.map(item => item.id === id ? { ...item, adn } : item)
  })),

  setPermission: (profileId, inventoryId, grant) => set((state) => {
    const profileMatrix = state.matrix[profileId] || {};
    const existingGrant = profileMatrix[inventoryId] || { read: false, edit: false, approve: false };
    
    return {
      matrix: {
        ...state.matrix,
        [profileId]: {
          ...profileMatrix,
          [inventoryId]: { ...existingGrant, ...grant }
        }
      }
    };
  })
}));
