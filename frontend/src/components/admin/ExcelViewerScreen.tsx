import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { SafeImage } from '../SafeImage';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type { ColDef } from 'ag-grid-community';
import { AGCheckboxFilter } from './AGCheckboxFilter';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  onBack: () => void;
}

type TableId = 'MAESTRO' | 'PSET_DEF' | 'PSET_VAL' | 'PSET_DYN' | 'TIPOS';

const TABLE_TABS: { id: TableId; label: string }[] = [
  { id: 'MAESTRO', label: 'Maestro Activos' },
  { id: 'TIPOS', label: 'Tipología (ADN)' },
  { id: 'PSET_DEF', label: 'PSet Definiciones' },
  { id: 'PSET_VAL', label: 'PSet (Estáticos)' },
  { id: 'PSET_DYN', label: 'PSet (Dinámicos)' }
];

export const ExcelViewerScreen: React.FC<Props> = ({ onBack }) => {
  const { db, psets_def, psetValuesDb, psetHistoryDb, tiposEntidadDb } = useDataStore();
  
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const activeTab = TABLE_TABS[activeTabIdx].id;
  const [showColMenu, setShowColMenu] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const colMenuRef = useRef<HTMLDivElement>(null);
  
  const SYSTEM_FIELDS = useMemo(() => new Set(['id', 'id_tipo', 'id_pset', 'id_entity', 'id_record', 'timestamp', 'createdAt', 'updatedAt', 'deletedAt', 'isActive', 'parentId', 'nivel', 'canal', 'behavior', 'appliesTo']), []);
  const [showSystemFields, setShowSystemFields] = useState(false);

  useEffect(() => {
    setHiddenColumns(prev => {
      const next = new Set(prev);
      if (!showSystemFields) {
        SYSTEM_FIELDS.forEach(f => next.add(f));
      } else {
        SYSTEM_FIELDS.forEach(f => next.delete(f));
      }
      return next;
    });
  }, [activeTab, showSystemFields, SYSTEM_FIELDS]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(event.target as Node)) {
        setShowColMenu(false);
      }
    }
    if (showColMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColMenu]);

  const handlePrev = () => {
     setActiveTabIdx(prev => prev > 0 ? prev - 1 : TABLE_TABS.length - 1);
  };

  const handleNext = () => {
     setActiveTabIdx(prev => prev < TABLE_TABS.length - 1 ? prev + 1 : 0);
  };

  // Compute table data and headers based on active tab
  const { headers, rawRows } = useMemo(() => {
    let headers: string[] = [];
    let rows: any[][] = [];

    switch (activeTab) {
      case 'MAESTRO':
        headers = ['id', 'nivel', 'categoria', 'subCategoria', 'tipo', 'code', 'name', 'location', 'canal', 'parentId', 'isActive', 'deletedAt', 'createdAt', 'updatedAt'];
        rows = db.map(r => [
          r.id, r.level, r.category, r.subCategory, r.type, r.code, r.name, r.location, r.canal, r.parentId, 
          r.isActive ? '1' : '0', r.deletedAt || 'NULL', r.createdAt, r.updatedAt
        ]);
        break;
      case 'TIPOS':
        headers = ['id_tipo', 'nombre', 'categoria', 'subCategoria', 'nivel', 'icono', 'tipos_hijo_permitidos', 'max_count'];
        rows = tiposEntidadDb.map(t => [
          t.id_tipo, t.nombre, t.categoria, t.subCategoria, t.nivel, t.icono, JSON.stringify(t.tipos_hijo_permitidos), t.max_count_per_parent || 'NULL'
        ]);
        break;
      case 'PSET_DEF':
        headers = ['id_pset', 'behavior', 'appliesTo', 'properties'];
        rows = psets_def.map(p => [
          p.id_pset, p.behavior, JSON.stringify(p.appliesTo), JSON.stringify(p.properties)
        ]);
        break;
      case 'PSET_VAL':
         headers = ['id_entity', 'id_pset', 'data_json'];
         rows = Object.keys(psetValuesDb).map(key => {
            const parts = key.split('_');
            const dataStr = JSON.stringify(psetValuesDb[key]);
            return [parts[0], parts.slice(1).join('_'), dataStr];
         });
         break;
      case 'PSET_DYN':
         headers = ['id_record', 'id_entity', 'id_pset', 'timestamp', 'data_json'];
         rows = psetHistoryDb.map(h => [
            h.id_record, h.id_entity, h.id_pset, h.timestamp, JSON.stringify(h.data)
         ]);
         break;
    }

    return { headers, rawRows: rows };
  }, [activeTab, db, psets_def, psetValuesDb, psetHistoryDb, tiposEntidadDb]);

  const rowData = useMemo(() => {
      return rawRows.map(row => {
          const obj: any = {};
          headers.forEach((h, i) => {
              obj[h] = row[i];
          });
          return obj;
      });
  }, [rawRows, headers]);

  const columnDefs = useMemo<ColDef[]>(() => {
      return headers.map(h => ({
          field: h,
          headerName: h,
          filter: AGCheckboxFilter,
          sortable: true,
          resizable: true,
          floatingFilter: false, // We disable floating filters because our custom checkbox dropdown filter is more than enough
          hide: hiddenColumns.has(h)
      }));
  }, [headers, hiddenColumns]);

  const handleExportMock = () => {
    alert("Función de exportación CSV crudo temporalmente desactivada en este visor. Use las plantillas del módulo principal.");
  };

  // El autoajuste se lanza cada vez que cambian los datos, con un ligero retraso para asegurar que el DOM real de React ya está pintado y las letras se pueden medir
  const onRowDataUpdated = useCallback((params: any) => {
      setTimeout(() => {
          params.api.autoSizeAllColumns();
      }, 50);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-['Inter']">
       {/* HEADER */}
       <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_raw.svg" fallbackType="svg" wrapperClassName="w-8 h-8" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Visor de Tablas Raw
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">DATAGRID DE AUDITORÍA (AG-GRID)</span>
           </div>
         </div>
         <div className="flex items-center gap-3">
            {/* Toggle System Fields */}
            <button 
              onClick={() => setShowSystemFields(!showSystemFields)}
              className="w-[85px] h-[28px] flex items-center justify-center text-[8px] leading-[10px] text-center font-bold text-[#7f1d1d] border border-[#7f1d1d] hover:bg-slate-50 transition-colors uppercase cursor-pointer rounded-sm shadow-sm"
            >
              {showSystemFields ? <>OCULTAR C.<br/>SISTEMA</> : <>VER CAMPOS<br/>SISTEMA</>}
            </button>

            {/* Selec Campos Visibles */}
            <div className="relative" ref={colMenuRef}>
              <button 
                onClick={() => setShowColMenu(!showColMenu)}
                className="w-[85px] h-[28px] flex items-center justify-center text-[8px] leading-[10px] text-center font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors uppercase cursor-pointer rounded-sm shadow-sm"
              >
                SELEC. CAMPOS<br/>VISIBLES
              </button>
              
              {showColMenu && (
                <div className="absolute top-full right-0 mt-1 w-36 max-h-[70vh] overflow-y-auto bg-white border border-slate-200 rounded shadow-xl z-[60] p-1 flex flex-col gap-0 font-['Inter'] text-left pb-1.5">
                  <div className="font-semibold text-[8px] text-slate-400 uppercase mb-1 px-1.5 pt-1 cursor-default tracking-wider">Mostrar / Ocultar</div>
                  {columnDefs.map(col => (
                    <label key={col.field} className="flex items-center gap-1.5 py-0.5 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-[8px] text-slate-700 select-none">
                      <input 
                        type="checkbox" 
                        className="w-2.5 h-2.5 accent-slate-600 rounded-sm cursor-pointer flex-shrink-0"
                        checked={!hiddenColumns.has(col.field!)}
                        onChange={(e) => {
                          setHiddenColumns(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.delete(col.field!);
                            else next.add(col.field!);
                            return next;
                          });
                        }}
                      />
                      <span className="truncate">{col.headerName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleExportMock} className="w-[80px] h-[28px] flex items-center justify-center text-[8px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-transparent border border-[#7f1d1d] hover:bg-gray-50 rounded-sm uppercase tracking-wide shadow-sm transition-colors">
                📥 EXPORTAR<br/>CSV
            </button>
            <button onClick={handleExportMock} className="w-[80px] h-[28px] flex items-center justify-center text-[8px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-transparent border border-[#7f1d1d] hover:bg-gray-50 rounded-sm uppercase tracking-wide shadow-sm transition-colors">
                📤 IMPORTAR<br/>CSV
            </button>
           <button 
             onClick={onBack}
             className="w-[80px] h-[28px] flex items-center justify-center text-[8px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             VOLVER AL<br/>INICIO
           </button>
         </div>
       </header>

       {/* EXCEL TOOLBAR (Legacy Style) */}
       <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-10 w-full">
         <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700 transition-colors uppercase">
               ◀ Anterior
            </button>
            <h3 className="font-bold text-sm w-48 text-center text-[#7f1d1d] uppercase tracking-wider">
               {TABLE_TABS[activeTabIdx].label}
            </h3>
            <button onClick={handleNext} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700 transition-colors uppercase">
               Siguiente ▶
            </button>
         </div>
         <div className="text-xs text-gray-500 font-mono">
             {rowData.length} registros
         </div>
       </div>

       {/* CONTENT DATAGRID */}
       <main className="p-4 bg-gray-200" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="ag-theme-quartz excel-grid-style w-full h-full shadow-lg">
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={{ minWidth: 50, resizable: true, filter: AGCheckboxFilter, sortable: true }}
                autoSizeStrategy={{ type: 'fitCellContents' }}
                onRowDataUpdated={onRowDataUpdated}
                pagination={true}
                paginationPageSize={100}
                rowHeight={16}
                headerHeight={22}
            />
          </div>
       </main>
    </div>
  );
};
