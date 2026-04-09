import React, { useState, useEffect } from 'react';
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

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 overflow-hidden font-['Inter']">
       
       {/* PANEL SUPERIOR: MASTER LIST (Entidades Padre) */}
       <div className={`transition-all duration-300 ease-in-out w-full border-b border-gray-300 bg-white shadow-sm z-10 ${selectedEntityId ? 'h-[50%]' : 'h-full flex-1'}`}>
          <div className="w-full h-full flex flex-col p-2">
             
             {/* ROW 1: TABS OSCURAS SOBRE FONDO TRANSPARENTE EN ANCHO TOTAL */}
             {customFilters.length > 0 && (
               <div className="bg-transparent flex pt-2 shrink-0 border-b-4 border-[#1e293b] w-full gap-[2px] px-1 justify-between items-end">
                 <div className="flex gap-[2px] w-[70%]">
                   {customFilters.map((tab) => {
                      const isActive = activeTabFilter === tab;
                      return (
                        <button 
                           key={tab}
                           onClick={() => setActiveTabFilter(tab)}
                           className={`flex-1 py-1.5 text-[12.5px] text-center uppercase tracking-widest font-bold transition-all relative top-[4px] rounded-t-md ${isActive ? 'text-white bg-[#1e293b] border-t-4 border-t-[#7f1d1d] z-10 shadow-sm' : 'text-gray-400 bg-[#334155] hover:text-white hover:bg-[#475569] border-t-4 border-t-transparent z-0'}`}
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
                   rowData={
                      db.filter((e: any) => {
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
                      })
                   }
                   columnDefs={[
                     { field: 'EMP_ID', headerName: 'EMP_ID', width: 110, cellClass: 'bg-slate-50 text-slate-400 font-mono text-xs' },
                     { field: 'UNIQUE_HUMAN_CODE', headerName: 'UNIQUE_HUMAN_CODE', width: 170 },
                     { field: 'INSTANCE_NAME', headerName: 'INSTANCE_NAME', flex: 1, sort: 'asc' },
                     {
                        field: 'IS_ACTIVE',
                        headerName: 'IS_ACTIVE',
                        width: 100,
                        cellStyle: { textAlign: 'center' }
                     },
                     {
                        field: 'DELETED_AT',
                        headerName: 'DELETED_AT',
                        width: 120,
                        cellClass: 'bg-slate-50 text-slate-400 font-mono text-xs italic',
                        valueFormatter: (params: any) => {
                           if(!params.value) return '';
                           const d = new Date(params.value);
                           return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                        }
                     },
                     {
                        field: 'IS_PROVEEDOR', headerName: 'IS_PROVEEDOR', width: 120,
                        cellStyle: { textAlign: 'center' }
                     },
                     {
                        field: 'IS_SUBCONTRATA', headerName: 'IS_SUBCONTRATA', width: 130,
                        cellStyle: { textAlign: 'center' }
                     },
                     {
                        field: 'IS_CONTRATISTA', headerName: 'IS_CONTRATISTA', width: 130,
                        cellStyle: { textAlign: 'center' }
                     },
                     {
                        field: 'IS_CLIENTE', headerName: 'IS_CLIENTE', width: 100,
                        cellStyle: { textAlign: 'center' }
                     },
                     {
                        headerName: 'ACCIONES',
                        width: 140,
                        sortable: false,
                        filter: false,
                        // Fix padding and stop propagation on click
                        cellRenderer: (params: any) => {
                           const row = params.data;
                           return (
                              <div className="flex gap-1 items-center h-full pt-1">
                                 {!row.deletedAt && (
                                   <button
                                      onClick={(e) => { e.stopPropagation(); console.log('Toggle Activo', row.id); }}
                                      className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-700"
                                   >
                                      {row.es_activa ? 'Inactivar' : 'Activar'}
                                   </button>
                                 )}
                                 <button
                                    onClick={(e) => { e.stopPropagation(); console.log('Toggle Borrar', row.id); }}
                                    className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700"
                                 >
                                    {row.deletedAt ? 'Restaurar' : 'Borrar'}
                                 </button>
                              </div>
                           );
                        }
                     }
                   ]}
                   heightClass="flex-1 w-full border-0 rounded-none shadow-none"
                   toolbarTitle={`Gestión de ${activeTabFilter ? pluralizeFilter(activeTabFilter) : moduleId}`}
                   toolbarCenterHeader={null}
                   onAddRow={() => console.log('Añadir Molde')}
                   onDeleteSelected={(nodes) => console.log('Borrar Moldes', nodes)}
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
                       className={`px-5 py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 transition-colors rounded-t-md mx-0.5 ${activeTab === child.id ? 'bg-white border-[#7f1d1d] text-[#7f1d1d] shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.1)]' : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
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
                      heightClass="flex-1 w-full"
                      toolbarTitle={`Gestión de ${allowedChildren.find(c=>c.id===activeTab)?.label} (Padre: ${selectedEntityId})`}
                    />
                 </div>
               )}
            </div>

         </div>
       )}

    </div>
  );
};
