import React, { useState } from 'react';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useUiStore } from '../../store/useUiStore';
import { SystemBreadcrumbs } from '../SystemBreadcrumbs';
import { ModuleTitle } from '../ModuleTitle';
import { ModuleSearch } from '../ModuleSearch';
import { EntityCanvasContainer } from './EntityCanvasContainer';
import { HierarchicalEntityGrid } from './HierarchicalEntityGrid';

import { BLUEPRINTS } from '../../config/viewBlueprints';

export interface EntityWorkspaceProps {
  /**
   * El ID del manifiesto de la vista, ej: "VIEW_PROVEDORES_MASTER"
   */
  blueprintId: string;
}

export const EntityWorkspace: React.FC<EntityWorkspaceProps> = ({ blueprintId }) => {
  const blueprint = BLUEPRINTS[blueprintId];
  const { altoFila2, z5_ratio_top, z5_ratio_bottom, z5_toolbar_left, z5_toolbar_mid, z5_toolbar_right, mostrarTabiques } = useLayoutStore();
  const selectedEntityId = useUiStore(state => state.selectedEntityId);
  const setSelectedEntityId = useUiStore(state => state.setSelectedEntityId);
  const triggerGridReset = useUiStore(state => state.triggerGridReset);
  const setSearchTerm = useUiStore(state => state.setSearchTerm);

  const [statusFilter, setStatusFilter] = useState({
     activas: true,
     inactivas: false,
     anuladas: false
  });

  const toggleStatus = (key: keyof typeof statusFilter) => {
     setStatusFilter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-white w-full">
      {/* ZONA 5: WRAPPER PANEL DE COMANDO */}
      <div className="w-full shrink-0 flex flex-col bg-white border-b border-[#d0dbec]" style={{ height: altoFila2 }}>
         {/* 25% TOP: Breadcrumbs */}
         <div className="w-full shrink-0" style={{ height: `${z5_ratio_top}%` }}>
           <SystemBreadcrumbs contextTitle={blueprint?.title?.toUpperCase()} />
         </div>
         {/* 75% BOTTOM: Toolbar Modular */}
         <div className="w-full flex-1 flex items-center">
            <div className="h-full shrink-0 flex items-center" style={{ width: `${z5_toolbar_left}%` }}>
               <ModuleTitle contextTitle={blueprint?.title?.toUpperCase()} />
            </div>
            <div className={`h-full shrink-0 flex items-center justify-center ${mostrarTabiques ? 'border border-dashed border-slate-300 bg-slate-50' : ''}`} style={{ width: `${z5_toolbar_mid}%` }}>
               <ModuleSearch />
            </div>
            <div className={`h-full shrink-0 flex items-center justify-end pr-6 gap-2 ${mostrarTabiques ? 'border border-dashed border-slate-300 bg-slate-50' : ''}`} style={{ width: `${z5_toolbar_right}%` }}>
              {/* Botonera de Filtros Z5 */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200 shadow-inner">
                <button 
                  onClick={() => toggleStatus('activas')}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wide rounded-[3px] transition-all ${statusFilter.activas ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                >
                   Activos
                </button>
                <button 
                  onClick={() => toggleStatus('inactivas')}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wide rounded-[3px] transition-all ${statusFilter.inactivas ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                >
                   Inactivos
                </button>
                <button 
                  onClick={() => toggleStatus('anuladas')}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wide rounded-[3px] transition-all ${statusFilter.anuladas ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                >
                   Anulados
                </button>
              </div>
              
              {/* Mini-wrapper Restaurar / Replegar */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200 shadow-inner ml-2">
                <button 
                  onClick={() => {
                     triggerGridReset();
                     setStatusFilter({ activas: true, inactivas: false, anuladas: false });
                     if (setSearchTerm) setSearchTerm('');
                  }}
                  title="Restaurar vista por defecto"
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded transition-all flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button 
                  onClick={() => setSelectedEntityId(null)}
                  disabled={!selectedEntityId}
                  title="Replegar panel de detalle"
                  className={`px-2 py-1 rounded transition-all flex items-center justify-center ${selectedEntityId ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
         </div>
      </div>

      {/* ZONA 6 REAL CON ENTITY CANVAS CONTAINER */}
      <div className="flex-1 w-full bg-[#f8f9ff] relative min-h-0">
          <EntityCanvasContainer>
              <div className="absolute inset-4 flex flex-col drop-shadow-md rounded-lg overflow-hidden">
                  <HierarchicalEntityGrid blueprint={blueprint} statusFilter={statusFilter} />
              </div>
          </EntityCanvasContainer>
      </div>
    </div>
  );
};
