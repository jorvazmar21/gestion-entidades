/**
 * @module SystemBreadcrumbs
 * @description Navegador jerarquico (hilo de Ariadna) para escape o ubicación del módulo actual. Modularizado paso 2.
 * @inputs Estado global useUiStore (activeModuleId).
 * @actions Permite volver a INICIO reseteando la pantalla principal operativa.
 * @files src/components/SystemBreadcrumbs.tsx
 */
import React from 'react';
import { useUiStore } from '../store/useUiStore';

export const SystemBreadcrumbs: React.FC = () => {
  const activeModuleId = useUiStore(state => state.activeModuleId);
  const setScreen = useUiStore(state => state.setScreen);

  const MODULE_NAMES: Record<string, string> = {
    'OBR': 'OBRAS',
    'PRV': 'PROVEEDORES',
    'SED': 'SEDES',
    'PAR': 'PARQUES',
    'CLI': 'CLIENTES'
  };

  const handleGoHome = () => {
    setScreen('HOME');
  };

  return (
    <div className="w-full h-full flex items-center px-6 font-['Inter'] select-none">
      <nav className="flex items-center flex-nowrap whitespace-nowrap text-[10px] uppercase w-full" aria-label="Breadcrumb">
        <button 
          onClick={handleGoHome}
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer font-medium tracking-[0.15em] outline-none shrink-0"
          title="Volver al entorno operativo base"
        >
          INICIO
        </button>
        
        {activeModuleId && (
          <>
            <span className="mx-3 text-slate-300 font-light text-[12px] shrink-0">›</span>
            <span className="font-bold tracking-[0.1em] shrink-0" style={{ color: '#8c1d18' }}>
              GESTION DE {MODULE_NAMES[activeModuleId] || activeModuleId}
            </span>
          </>
        )}
      </nav>
    </div>
  );
};
