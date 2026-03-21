/**
 * @module useLayoutStore
 * @description Gestor matemático paramétrico de las cotas y dimensiones estructurales de la aplicación.
 * @inputs Acciones de usuario disparando `updateLayoutParam` (anchos, altos).
 * @actions Orquesta en tiempo real las variables CSS inyectadas en el `MainLayout`, forzando el repintado dimensional global.
 * @files src/store/useLayoutStore.ts
 */
import { create } from 'zustand';

interface LayoutState {
  altoTotal: string;
  anchoTotal: string;
  altoFilaSuperior: number;
  altoFila2: number;
  altoZonaBdD: number;
  anchoColumnaIzquierda: number;
  anchoColumnaDerecha: number;
  altoZonasInferiores: number;
  anchoBotonera: number;
  mostrarTabiques: boolean;

  // Función maestra para alterar cualquier medida en el futuro (desde el WYSIWYG)
  updateLayoutParam: (key: keyof Omit<LayoutState, 'updateLayoutParam' | 'toggleTabiques'>, value: string | number | boolean) => void;
  toggleTabiques: () => void;
}

// "useLayoutStore": El Dios de la Geometría
export const useLayoutStore = create<LayoutState>((set) => ({
  // Cotas matemáticas por defecto (las que acordamos)
  altoTotal: '100vh',
  anchoTotal: '100%',
  altoFilaSuperior: 60,
  altoFila2: 80,
  altoZonaBdD: 80,
  anchoColumnaIzquierda: 260,
  anchoColumnaDerecha: 320,
  altoZonasInferiores: 150,
  anchoBotonera: 350,
  mostrarTabiques: false,

  // Setter universal
  updateLayoutParam: (key, value) => 
    set((state) => ({ ...state, [key]: value })),

  // Toggle de visibilidad de tabiques en producción
  toggleTabiques: () => set((state) => ({ mostrarTabiques: !state.mostrarTabiques })),
}));
