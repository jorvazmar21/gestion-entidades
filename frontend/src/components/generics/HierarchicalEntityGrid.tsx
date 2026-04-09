import React, { useState, useEffect, useMemo } from 'react';
import { MasterEntityDataGrid } from './MasterEntityDataGrid';
import { useUiStore } from '../../store/useUiStore';
import { useDataStore } from '../../store/useDataStore';

interface ChildMold {
  id: string;
  label: string;
}

interface HierarchicalEntityGridProps {
  moduleId: string; // The parent Mold ID (e.g. 'EMP', 'OBR')
  customFilters?: string[];
  statusFilter?: {
    activas: boolean;
    inactivas: boolean;
    anuladas: boolean;
  };
}

export const HierarchicalEntityGrid: React.FC<HierarchicalEntityGridProps> = ({ 
  moduleId,
  customFilters = moduleId === 'EMP' ? ['Todas', 'Proveedores'] : [],
  statusFilter = { activas: true, inactivas: false, anuladas: false }
}) => {
  const selectedEntityId = useUiStore(state => state.selectedEntityId);
  const setSelectedEntityId = useUiStore(state => state.setSelectedEntityId);
  const searchTerm = useUiStore(state => state.searchTerm);
  
  const { db } = useDataStore(); // <--- OBTENEMOS LA BASE DE DATOS L4 REAL EN VIVO

  const [allowedChildren, setAllowedChildren] = useState<ChildMold[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // ESTADOS DEL HEADER MAESTRO
  const [activeTabFilter, setActiveTabFilter] = useState<string | null>(customFilters[0] || null);

  const pluralizeFilter = (filter: string) => {
     const f = filter.toUpperCase();
     if (f === 'CONTRATA') return 'CONTRATAS';
     if (f === 'UTE') return 'UTES';
     if (f === 'PROVEEDOR') return 'PROVEEDORES';
     if (f === 'SUBCONTRATA') return 'SUBCONTRATAS';
     if (f === 'CLIENTE') return 'CLIENTES';
     return f;
  };

  // 1. Fetch allowed children when moduleId changes
  useEffect(() => {
    // Clear selection on module change
    setSelectedEntityId(null);
    setLoading(true);

    // MOCK: This simulates fetching from /api/raw-db/read?table=sys_reglas_jerarquia
    // Real implementation will hit the API
    setTimeout(() => {
      let mocks: ChildMold[] = [];
      if (moduleId === 'EMP') {
        mocks = [
          { id: 'DEL', label: 'DELEGACIONES' },
          { id: 'CON', label: 'CONTACTOS' }
        ];
      } else if (moduleId === 'OBR') {
        mocks = [
          { id: 'PRE', label: 'PRESUPUESTOS' },
          { id: 'CER', label: 'CERTIFICACIONES' },
          { id: 'PAR', label: 'PARTES' }
        ];
      }
      setAllowedChildren(mocks);
      if (mocks.length > 0) {
        setActiveTab(mocks[0].id);
      } else {
        setActiveTab('');
      }
      setLoading(false);
    }, 400);

  }, [moduleId, setSelectedEntityId]);

  const filteredData = useMemo(() => {
      return db.filter((e: any) => {
         if (e.category !== moduleId) return false;
         
         // Filtrado por pestaña lógica
         if (activeTabFilter && activeTabFilter.toUpperCase() === 'PROVEEDORES') {
            if (e.IS_PROVEEDOR !== 1) return false;
         }
         
         // Filtrado por estado (Criterios del usuario)
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
  }, [db, moduleId, activeTabFilter, statusFilter]);

  // Si cambia la vista (filtro o pestaña) y la entidad seleccionada ya no es visible, cerramos el panel
  useEffect(() => {
     if (selectedEntityId) {
        const stillExists = filteredData.some((r: any) => r.EMP_ID === selectedEntityId || r.id === selectedEntityId);
        if (!stillExists) {
           setSelectedEntityId(null);
        }
     }
  }, [filteredData, selectedEntityId, setSelectedEntityId]);

  const masterColumnDefs = useMemo(() => [
     { field: 'EMP_ID', headerName: 'ID', cellStyle: { textAlign: 'left' } },
     { field: 'UNIQUE_HUMAN_CODE', headerName: 'CODIGO', cellStyle: { textAlign: 'left' } },
     { field: 'INSTANCE_NAME', headerName: 'NOMBRE', flex: 1, sort: 'asc' as const, cellStyle: { textAlign: 'left' }, suppressAutoSize: true },
     {
        field: 'IS_ACTIVE',
        headerName: 'ESTADO',
        headerClass: 'text-center',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params: any) => {
           const isDeleted = params.data.DELETED_AT || params.data.DELETED_BY || params.data.deletedAt;
           const isActive = params.data.IS_ACTIVE === 1 || params.data.es_activa;
           let colorClass = "";
           let tooltip = "";
           if (isDeleted) {
              colorClass = "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]";
              tooltip = "Archivado / Borrado";
           } else if (isActive) {
              colorClass = "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]";
              tooltip = "Activa";
           } else {
              colorClass = "bg-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.6)]";
              tooltip = "Inactiva";
           }
           return (
              <div className="flex items-center justify-center h-full w-full" title={tooltip}>
                 <div className={`w-[10px] h-[10px] rounded-full ${colorClass}`}></div>
              </div>
           );
        }
     },
     {
        field: 'IS_PROVEEDOR', headerName: 'PROV',
        headerClass: 'text-center',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params: any) => {
           if (params.value === 1) return <div className="flex items-center justify-center h-full w-full"><div className="w-[10px] h-[10px] rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" title="Sí"></div></div>;
           return null;
        }
     },
     {
        field: 'IS_SUBCONTRATA', headerName: 'SUBC',
        headerClass: 'text-center',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params: any) => {
           if (params.value === 1) return <div className="flex items-center justify-center h-full w-full"><div className="w-[10px] h-[10px] rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" title="Sí"></div></div>;
           return null;
        }
     },
     {
        field: 'IS_CLIENTE', headerName: 'CLIE',
        headerClass: 'text-center',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params: any) => {
           if (params.value === 1) return <div className="flex items-center justify-center h-full w-full"><div className="w-[10px] h-[10px] rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" title="Sí"></div></div>;
           return null;
        }
     },
     {
        field: 'IS_CONTRATISTA', headerName: 'CONT',
        headerClass: 'text-center',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params: any) => {
           if (params.value === 1) return <div className="flex items-center justify-center h-full w-full"><div className="w-[10px] h-[10px] rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" title="Sí"></div></div>;
           return null;
        }
     },
     {
        field: 'IS_UTE', headerName: 'UTE',
        headerClass: 'text-center',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params: any) => {
           if (params.value === 1) return <div className="flex items-center justify-center h-full w-full"><div className="w-[10px] h-[10px] rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" title="Sí"></div></div>;
           return null;
        }
     }
  ], []);

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 overflow-hidden font-['Inter']">
       
       {/* PANEL SUPERIOR: MASTER LIST (Entidades Padre) */}
       <div className={`transition-all duration-300 ease-in-out w-full border-b border-gray-300 bg-white shadow-sm z-10 ${selectedEntityId ? 'h-[50%]' : 'h-full flex-1'}`}>
          <div className="w-full h-full flex flex-col p-2">
             
             {/* ROW 1: TABS ESTILO L2 (Hijo) */}
             {customFilters.length > 0 && (
               <div className="w-full bg-transparent flex items-end justify-start pt-2 border-b border-gray-300 shrink-0 mb-1">
                 <div className="flex gap-1 overflow-x-auto w-[80%]">
                   {customFilters.map((tab) => {
                      const isActive = activeTabFilter === tab;
                      return (
                         <button 
                           key={tab}
                           onClick={() => setActiveTabFilter(tab)}
                           className={`w-[18ch] text-center px-2 truncate py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 border-t-[3px] transition-colors rounded-t-md mx-0.5 ${isActive ? 'bg-white border-t-[#7f1d1d] border-b-white text-[#7f1d1d] shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.1)] relative top-[2px] z-10' : 'border-t-transparent border-b-transparent text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                        >
                           {pluralizeFilter(tab)}
                        </button>
                      );
                   })}
                 </div>
               </div>
             )}

             {/* CONTENT GRID */}
             <div className="flex-1 w-full bg-white relative flex flex-col overflow-hidden">
                  <MasterEntityDataGrid 
                   moduleId={`MASTER_${moduleId}`}
                   quickFilterText={searchTerm}
                   rowData={filteredData}
                   columnDefs={masterColumnDefs}
                   heightClass="flex-1 w-full border-0 rounded-none shadow-none"
                   hideToolbar={true}
                   selectedRowId={selectedEntityId}
                   onSelectedRowFilteredOut={() => setSelectedEntityId(null)}
                   onRowClicked={(node) => setSelectedEntityId(node.data.EMP_ID || node.data.id)}
                 />
              </div>
           </div>
        </div>

       {/* PANEL INFERIOR: DETAIL TABS (Entidades Hijas) */}
       {selectedEntityId && (
         <div className="w-full h-[50%] bg-[#f8f9ff] flex flex-col pt-1 animate-[fadeIn_0.5s_ease-out]">
            
            {/* TABS HEADER */}
            <div className="w-full bg-[#f8f9ff] flex items-end justify-start px-4 pt-2 border-b border-gray-300 shrink-0">
               {loading ? (
                  <span className="text-xs text-gray-400 py-2">Consultando reglas de jerarquía L2...</span>
               ) : allowedChildren.length === 0 ? (
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
               {!loading && allowedChildren.length > 0 && activeTab && (
                 <div className="w-full h-full bg-white border border-[#d0dbec] rounded-md shadow-sm overflow-hidden flex flex-col">
                    {/* AQUÍ INYECTAREMOS EL UNIVERSAL VIEW RENDERER DEL HIJO */}
                    {/* Por defecto inyectamos un SystemDataGrid filtrado por ParentId */}
                    <MasterEntityDataGrid 
                      moduleId={`DETAIL_${activeTab}`}
                      rowData={[]} // Mock vacío para L2
                      columnDefs={[
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
