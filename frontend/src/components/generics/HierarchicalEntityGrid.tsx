import React, { useState, useEffect, useMemo } from 'react';
import { MasterEntityDataGrid } from './MasterEntityDataGrid';
import { useUiStore } from '../../store/useUiStore';
import { useDataStore } from '../../store/useDataStore';
import type { ViewBlueprint } from '../../types/views';
import { getCellRenderer } from '../../utils/CellRendererFactory';

interface HierarchicalEntityGridProps {
  blueprint?: ViewBlueprint;
  statusFilter?: {
    activas: boolean;
    inactivas: boolean;
    anuladas: boolean;
  };
}

export const HierarchicalEntityGrid: React.FC<HierarchicalEntityGridProps> = ({ 
  blueprint,
  statusFilter = { activas: true, inactivas: false, anuladas: false }
}) => {
  const selectedEntityId = useUiStore(state => state.selectedEntityId);
  const setSelectedEntityId = useUiStore(state => state.setSelectedEntityId);
  const setPSetContextPayload = useUiStore(state => state.setPSetContextPayload);
  const searchTerm = useUiStore(state => state.searchTerm);
  
  const activeDetailTab = useUiStore(state => state.activeDetailTab);
  const setActiveDetailTab = useUiStore(state => state.setActiveDetailTab);
  
  const activeTabFilter = useUiStore(state => state.activeTabFilter);
  const setActiveTabFilter = useUiStore(state => state.setActiveTabFilter);

  const masterTabs = blueprint?.masterConfig.tabs || [];
  
  const masterColumnDefs = useMemo(() => {
     if (!blueprint) return [];
     return blueprint.masterConfig.columns.map((col: any) => {
        const enhancedCol = { ...col };
        
        if (col.rendererMode) {
            enhancedCol.cellRenderer = getCellRenderer(col.rendererMode);
        }
        
        // Custom Sort Comparator para la columna calculada ESTADO_TXT en SQLite
        if (col.rendererMode === 'STATUS_BADGE') {
            enhancedCol.comparator = (valueA: string, valueB: string) => {
                const weights: Record<string, number> = { 'ACTIVA': 0, 'INACTIVA': 1, 'ANULADA': 2 };
                const weightA = weights[valueA] ?? 3;
                const weightB = weights[valueB] ?? 3;
                return weightA - weightB;
            };
        }
        
        return enhancedCol;
     });
  }, [blueprint]);

  // Pestañas Hijas Dinámicas (Detail) dependientes de la "global" o la específica de la pestaña Padre
  const detailViewDef = useMemo(() => {
      if (!blueprint?.detailConfig) return null;
      if (activeTabFilter && blueprint.detailConfig[activeTabFilter]) {
          return blueprint.detailConfig[activeTabFilter];
      }
      return blueprint.detailConfig['global'] || null;
  }, [blueprint, activeTabFilter]);

  const allowedChildren = detailViewDef?.tabs || [];

  const [serverData, setServerData] = useState<any[]>([]);

  // BFF Fetch en la inicialización del Módulo
  useEffect(() => {
     if (!blueprint) return;
     const baseConfig = masterTabs[0]?.queryConfig;
     if (baseConfig && baseConfig.endpoint) {
         fetch(baseConfig.endpoint, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ table: baseConfig.table, conditions: {} })
         })
         .then(res => res.json())
         .then(json => {
             if (json.success) {
                 setServerData(json.data);
             } else {
                 console.error("Error en BFF fetch:", json.error);
             }
         })
         .catch(err => console.error("Error red BFF fetch:", err));
     }
  }, [blueprint?.viewId]);

  useEffect(() => {
     if (masterTabs.length > 0 && !activeTabFilter) {
        setActiveTabFilter(masterTabs[0].id);
     }
  }, [masterTabs, activeTabFilter, setActiveTabFilter]);

  // Si estamos en un L2 o L3 sin hijos L4, forzamos cerrar panel
  useEffect(() => {
     if (allowedChildren.length > 0) {
        if (!activeDetailTab) {
           setActiveDetailTab(detailViewDef?.defaultOpenTabId || allowedChildren[0].id);
        }
     } else {
        setActiveDetailTab(null);
     }
  }, [activeTabFilter, blueprint?.viewId, detailViewDef]);

  // Filtrado Frontend (Pestañas, Texto, Semáforos)
  const filteredData = useMemo(() => {
      if (!serverData) return [];
      
      return serverData.filter((e: any) => {
         
         // Filtrado por pestaña lógica (Data-Driven 'whereClause') local
         const currentTab = masterTabs.find(t => t.id === activeTabFilter);
         if (currentTab?.queryConfig?.whereClause) {
             const [field, operation, value] = currentTab.queryConfig.whereClause.split(' ');
             if (field && operation === '=' && value === '1') {
                 if (e[field] !== 1) return false;
             }
             if (field && operation === '=' && value === '0') {
                 if (e[field] !== 0) return false;
             }
         }
         
         // Filtrado por búsqueda de texto
         if (searchTerm) {
             const term = searchTerm.toLowerCase();
             const codeMatch = e.UNIQUE_HUMAN_CODE && String(e.UNIQUE_HUMAN_CODE).toLowerCase().includes(term);
             const nameMatch = e.INSTANCE_NAME && String(e.INSTANCE_NAME).toLowerCase().includes(term);
             if (!codeMatch && !nameMatch) return false;
         }

         // Filtrado por estado (Semáforos de Zona 5), enganchado al nuevo ESTADO_TXT
         const estadoBase = e.ESTADO_TXT;

         if (estadoBase === 'ANULADA') {
            return statusFilter.anuladas;
         } else {
            if (estadoBase === 'ACTIVA') return statusFilter.activas;
            if (estadoBase === 'INACTIVA') return statusFilter.inactivas;
         }

         return false;
      });
  }, [serverData, activeTabFilter, statusFilter, masterTabs, searchTerm]);

  // Si la visibilidad desaparece, cerramos el panel
  useEffect(() => {
     if (selectedEntityId) {
        const stillExists = filteredData.some((r: any) => r.EMP_ID === selectedEntityId || r.id === selectedEntityId);
        if (!stillExists) {
           setSelectedEntityId(null);
        }
     }
  }, [filteredData, selectedEntityId, setSelectedEntityId]);

  if (!blueprint) return null;

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 overflow-hidden font-['Inter']">
       
       {/* PANEL SUPERIOR: MASTER LIST (Entidades Padre) */}
       <div className={`transition-all duration-300 ease-in-out w-full border-b border-gray-300 bg-white shadow-sm z-10 ${selectedEntityId ? 'h-[50%]' : 'h-full flex-1'}`}>
          <div className="w-full h-full flex flex-col p-2">
             
             {/* ROW 1: TABS ESTILO L2 (Hijo) basadas en Blueprint */}
             {masterTabs.length > 0 && (
               <div className="w-full bg-transparent flex items-end justify-start pt-2 border-b border-gray-300 shrink-0 mb-1">
                 <div className="flex gap-1 overflow-x-auto w-[80%]">
                   {masterTabs.map((tab) => {
                      const isActive = activeTabFilter === tab.id;
                      return (
                         <button 
                           key={tab.id}
                           onClick={() => {
                              setActiveTabFilter(tab.id);
                           }}
                           className={`w-[18ch] text-center px-2 truncate py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 border-t-[3px] transition-colors rounded-t-md mx-0.5 ${isActive ? 'bg-white border-t-[#7f1d1d] border-b-white text-[#7f1d1d] shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.1)] relative top-[2px] z-10' : 'border-t-transparent border-b-transparent text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                        >
                           {tab.label}
                        </button>
                      );
                   })}
                 </div>
               </div>
             )}

             {/* CONTENT GRID */}
             <div className="flex-1 w-full bg-white relative flex flex-col overflow-hidden">
                  <MasterEntityDataGrid 
                   moduleId={`MASTER_${blueprint.viewId}_${activeTabFilter}`}
                   gridStateId={`STATE_${blueprint.viewId}`} // El estado es compartido para todas las pestañas de esta vista maestra
                   quickFilterText={searchTerm}
                   rowData={filteredData}
                   columnDefs={masterColumnDefs as any}
                   heightClass="flex-1 w-full border-0 rounded-none shadow-none"
                   hideToolbar={true}
                   selectedRowId={selectedEntityId}
                   onSelectedRowFilteredOut={() => setSelectedEntityId(null)}
                   onRowClicked={(node) => setSelectedEntityId(node.data.EMP_ID || node.data.id)}
                   onSelectionChanged={(nodes) => {
                       const currentTab = masterTabs.find(t => t.id === activeTabFilter);
                       const label = currentTab?.label || blueprint.rootModule;
                       const selectedIds = nodes.map(n => n.data.EMP_ID || n.data.id);
                       
                       if (selectedIds.length > 0) {
                           setPSetContextPayload([{
                               label: label,
                               entityIds: selectedIds,
                               isChild: false
                           }]);
                       } else {
                           setPSetContextPayload([]);
                       }
                   }}
                 />
              </div>
           </div>
        </div>

       {/* PANEL INFERIOR: DETAIL TABS (Entidades Hijas) apoyadas en Blueprint */}
       {selectedEntityId && (
         <div className="w-full h-[50%] bg-[#f8f9ff] flex flex-col pt-1 animate-[fadeIn_0.5s_ease-out]">
            
            {/* TABS HEADER */}
            <div className="w-full bg-[#f8f9ff] flex items-end justify-start px-4 pt-2 border-b border-gray-300 shrink-0">
               {allowedChildren.length === 0 ? (
                  <span className="text-xs text-gray-400 py-2 italic">Esta entidad no permite descendencia.</span>
               ) : (
                 <div className="flex gap-1 overflow-x-auto">
                   {allowedChildren.map(child => (
                     <button 
                       key={child.id}
                       onClick={() => setActiveDetailTab(child.id)}
                       className={`w-[18ch] text-center px-2 truncate py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 border-t-[3px] transition-colors rounded-t-md mx-0.5 ${activeDetailTab === child.id ? 'bg-white border-t-[#7f1d1d] border-b-white text-[#7f1d1d] shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.1)] relative top-[2px] z-10' : 'border-t-transparent border-b-transparent text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                     >
                       {child.label}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* TABS BODY */}
            <div className="flex-1 w-full p-4 overflow-hidden relative">
               {allowedChildren.length > 0 && activeDetailTab && (
                 <div className="w-full h-full bg-white border border-[#d0dbec] rounded-md shadow-sm overflow-hidden flex flex-col">
                    {/* EN EL FUTURO: Aquí se inyectaría otro HierarchicalEntityGrid pasando the sub-blueprint */}
                    <MasterEntityDataGrid 
                      moduleId={`DETAIL_${activeDetailTab}`}
                      rowData={[]} // Mock vacío para L2
                      columnDefs={(detailViewDef?.columns as any) || [
                        { field: 'codigo', headerName: 'CÓDIGO' },
                        { field: 'descripcion', headerName: 'TÍTULO / DESCRIPCIÓN', flex: 1 }
                      ]}
                      heightClass="flex-1 w-full border-0 rounded-none"
                      hideToolbar={true}
                    />
                 </div>
               )}
            </div>

         </div>
       )}

    </div>
  );
};
