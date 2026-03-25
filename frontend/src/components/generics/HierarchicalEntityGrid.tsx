import React, { useState, useEffect } from 'react';
import { MasterEntityDataGrid } from './MasterEntityDataGrid';
import { useUiStore } from '../../store/useUiStore';

interface ChildMold {
  id: string;
  label: string;
}

interface HierarchicalEntityGridProps {
  moduleId: string; // The parent Mold ID (e.g. 'EMP', 'OBR')
  customFilters?: string[];
}

export const HierarchicalEntityGrid: React.FC<HierarchicalEntityGridProps> = ({ 
  moduleId,
  customFilters = moduleId === 'EMP' ? ['Contrata', 'UTE', 'Proveedor', 'Subcontrata', 'Cliente'] : []
}) => {
  const selectedEntityId = useUiStore(state => state.selectedEntityId);
  const setSelectedEntityId = useUiStore(state => state.setSelectedEntityId);

  const [allowedChildren, setAllowedChildren] = useState<ChildMold[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // ESTADOS DEL HEADER MAESTRO
  const [activeTabFilter, setActiveTabFilter] = useState<string | null>(customFilters[0] || null);
  const [statusFilter, setStatusFilter] = useState({
     activas: true,
     inactivas: false,
     borradas: false
  });

  const toggleStatus = (key: keyof typeof statusFilter) => {
     setStatusFilter(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
          <div className="w-full h-full flex flex-col">
             
             {/* ROW 1: TABS OSCURAS SOBRE FONDO TRANSPARENTE EN ANCHO TOTAL */}
             {customFilters.length > 0 && (
               <div className="bg-transparent flex pt-2 shrink-0 border-b-4 border-[#1e293b] w-full gap-[2px] px-1">
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
             )}

             {/* CONTENT GRID */}
             <div className="flex-1 w-full bg-white relative flex flex-col overflow-hidden">
                 <MasterEntityDataGrid 
                   moduleId={`MASTER_${moduleId}`}
                   rowData={
                     moduleId === 'EMP' ? [
                       { id: 'ENT-EMP-001', codigo: 'CL-001', nombre: 'Dragados S.A.', tipo: 'Cliente', estado: 'ACTIVO' },
                       { id: 'ENT-EMP-002', codigo: 'PR-452', nombre: 'Hilti España', tipo: 'Proveedor', estado: 'ACTIVO' },
                       { id: 'ENT-EMP-003', codigo: 'UT-11', nombre: 'UTE Variante', tipo: 'UTE', estado: 'INACTIVO' }
                     ] : [
                       { id: 'ENT-OBR-100', codigo: 'OB-24-01', nombre: 'Túnel AVE Variante Pajares' }
                     ]
                   }
                   columnDefs={[
                     { field: 'codigo', headerName: 'CÓDIGO', width: 120 },
                     { field: 'nombre', headerName: 'NOMBRE / (ALIAS)', flex: 1 },
                     { 
                        field: 'tipo', 
                        headerName: 'TIPO', 
                        width: 130,
                        cellRenderer: (params: any) => {
                           const t = params.value;
                           if(!t) return '';
                           let bg = 'bg-gray-100 text-gray-700';
                           if(t==='Cliente') bg = 'bg-blue-100 text-blue-800';
                           if(t==='Proveedor') bg = 'bg-amber-100 text-amber-800';
                           if(t==='UTE') bg = 'bg-purple-100 text-purple-800';
                           return <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${bg}`}>{t}</span>;
                        }
                     },
                     {
                        field: 'estado',
                        headerName: 'ESTADO',
                        width: 100,
                        cellRenderer: (params: any) => {
                           if(params.value === 'ACTIVO') return <span className="text-green-600 font-bold">✅ ACTIVA</span>;
                           if(params.value === 'INACTIVO') return <span className="text-yellow-600 font-bold">⚠️ INACTIVA</span>;
                           return params.value;
                        }
                     }
                   ]}
                   heightClass="flex-1 w-full border-0 rounded-none shadow-none"
                   toolbarTitle={`Gestión de ${activeTabFilter ? pluralizeFilter(activeTabFilter) : moduleId}`}
                   toolbarCenterHeader={
                     <div className="flex items-center gap-2 px-2">
                        <button 
                          onClick={() => toggleStatus('activas')}
                          className={`w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold uppercase tracking-wide transition-colors rounded-sm shadow-sm border ${statusFilter.activas ? 'bg-[#7f1d1d] text-white border-[#7f1d1d]' : 'text-[#7f1d1d] bg-transparent border-[#7f1d1d] hover:bg-gray-50'}`}
                        >
                           Activas
                        </button>
                        <button 
                          onClick={() => toggleStatus('inactivas')}
                          className={`w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold uppercase tracking-wide transition-colors rounded-sm shadow-sm border ${statusFilter.inactivas ? 'bg-[#7f1d1d] text-white border-[#7f1d1d]' : 'text-[#7f1d1d] bg-transparent border-[#7f1d1d] hover:bg-gray-50'}`}
                        >
                           Inactivas
                        </button>
                        <button 
                          onClick={() => toggleStatus('borradas')}
                          className={`w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold uppercase tracking-wide transition-colors rounded-sm shadow-sm border ${statusFilter.borradas ? 'bg-[#7f1d1d] text-white border-[#7f1d1d]' : 'text-[#7f1d1d] bg-transparent border-[#7f1d1d] hover:bg-gray-50'}`}
                        >
                           Borradas
                        </button>
                     </div>
                   }
                   onAddRow={() => console.log('Añadir Molde')}
                   onDeleteSelected={(nodes) => console.log('Borrar Moldes', nodes)}
                   onRowClicked={(node) => setSelectedEntityId(node.data.id)}
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
