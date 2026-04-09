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
  const searchTerm = useUiStore(state => state.searchTerm);
  
  const { db } = useDataStore(); // Mock DB L4

  const [activeTab, setActiveTab] = useState<string>('');
  
  // Array de pestañas maestro
  const masterTabs = blueprint?.masterConfig?.tabs || [];
  const [activeTabFilter, setActiveTabFilter] = useState<string | null>(masterTabs.length > 0 ? masterTabs[0].id : null);

  // Cada vez que cambia el blueprint, reseteamos a la primera pestaña
  useEffect(() => {
     if (masterTabs.length > 0) {
        setActiveTabFilter(masterTabs[0].id);
     }
  }, [blueprint?.viewId]);

  // Construcción dinámica de columnas maestro
  const masterColumnDefs = useMemo(() => {
     if (!blueprint) return [];
     
     // 1. Tomamos las columnas base
     let columns = [...blueprint.masterConfig.columns];
     
     // 2. Si la pestaña actual tiene overrideColumns, las aplicamos
     const currentTab = masterTabs.find(t => t.id === activeTabFilter);
     if (currentTab?.overrideColumns) {
         // Lógica simplificada de override: Reemplazo completo (podría ser merge en un futuro)
         columns = currentTab.overrideColumns;
     }

     // 3. Mapeamos las columnas al formato AG Grid, inyectando el CellRenderer dinámico
     return columns.map(col => {
         const agGridCol: any = { ...col };
         if (col.rendererMode) {
             const renderer = getCellRenderer(col.rendererMode);
             if (renderer) {
                 agGridCol.cellRenderer = renderer;
             }
         }
         return agGridCol;
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

  useEffect(() => {
     if (allowedChildren.length > 0) {
        setActiveTab(detailViewDef?.defaultOpenTabId || allowedChildren[0].id);
     } else {
        setActiveTab('');
     }
  }, [activeTabFilter, blueprint?.viewId, detailViewDef]);

  // Filtrado de Datos
  const filteredData = useMemo(() => {
      if (!blueprint) return [];
      
      return db.filter((e: any) => {
         if (e.category !== blueprint.rootModule) return false;
         
         // Filtrado por pestaña lógica (Data-Driven 'whereClause')
         const currentTab = masterTabs.find(t => t.id === activeTabFilter);
         if (currentTab?.queryConfig?.whereClause) {
             const [field, operation, value] = currentTab.queryConfig.whereClause.split(' ');
             if (field && operation === '=' && value === '1') {
                 if (e[field] !== 1) return false;
             }
         }
         
         // Filtrado por estado (Semáforos de Zona 5)
         const isDeleted = e.DELETED_AT !== undefined && e.DELETED_AT !== null; 
         const isActive = e.IS_ACTIVE === 1;

         if (isDeleted) {
            return statusFilter.anuladas;
         } else {
            if (isActive) return statusFilter.activas;
            if (!isActive) return statusFilter.inactivas;
         }

         return false;
      });
  }, [db, blueprint, activeTabFilter, statusFilter, masterTabs]);

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
                       onClick={() => setActiveTab(child.id)}
                       className={`w-[18ch] text-center px-2 truncate py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 border-t-[3px] transition-colors rounded-t-md mx-0.5 ${activeTab === child.id ? 'bg-white border-t-[#7f1d1d] border-b-white text-[#7f1d1d] shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.1)] relative top-[2px] z-10' : 'border-t-transparent border-b-transparent text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                     >
                       {child.label}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* TABS BODY */}
            <div className="flex-1 w-full p-4 overflow-hidden relative">
               {allowedChildren.length > 0 && activeTab && (
                 <div className="w-full h-full bg-white border border-[#d0dbec] rounded-md shadow-sm overflow-hidden flex flex-col">
                    {/* EN EL FUTURO: Aquí se inyectaría otro HierarchicalEntityGrid pasando the sub-blueprint */}
                    <MasterEntityDataGrid 
                      moduleId={`DETAIL_${activeTab}`}
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
