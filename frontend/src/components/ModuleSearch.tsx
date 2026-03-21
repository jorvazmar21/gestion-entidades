/**
 * @module ModuleSearch
 * @description Buscador central del módulo (Zona 5 Media).
 * @inputs Estado global useUiStore (activeModuleId, searchTerm).
 * @actions Actualiza la string de búsqueda global para que la tabla canvas inferior la intercepte y filtre el campo Nombre.
 * @files src/components/ModuleSearch.tsx
 */
import React from 'react';
import { useUiStore } from '../store/useUiStore';
import { SafeImage } from './SafeImage';

export const ModuleSearch: React.FC = () => {
  const activeModuleId = useUiStore(state => state.activeModuleId);
  const searchTerm = useUiStore(state => state.searchTerm);
  const setSearchTerm = useUiStore(state => state.setSearchTerm);

  const getPlaceholder = () => {
    switch(activeModuleId) {
      case 'OBR': return 'Buscar obra...';
      case 'PRV': return 'Buscar proveedor...';
      case 'SED': return 'Buscar sede...';
      case 'PAR': return 'Buscar parque...';
      case 'CLI': return 'Buscar cliente...';
      default: return 'Buscar...';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-4 font-['Inter']">
      <div className="flex items-center w-full max-w-[280px] bg-white border border-slate-300 rounded-[3px] px-2.5 py-[5px] focus-within:border-[#8c1d18] focus-within:ring-1 focus-within:ring-[#8c1d18] transition-all">
        <SafeImage 
          src="/icons/ui_search.svg" 
          fallbackType="svg" 
          className="w-[14px] h-[14px] opacity-50 mr-2 shrink-0 object-contain" 
        />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent text-[11px] font-medium tracking-wide text-[#334155] outline-none placeholder-[#94a3b8]"
        />
      </div>
    </div>
  );
};
