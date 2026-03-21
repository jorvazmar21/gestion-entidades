import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type { ColDef } from 'ag-grid-community';
import { useDataStore } from '../../store/useDataStore';
import { AGCheckboxFilter } from './AGCheckboxFilter';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface SystemDataGridProps {
  moduleId: string;
  rowData: any[];
  columnDefs: ColDef[];
  toolbarTitle?: string;
  toolbarLeftHeader?: React.ReactNode;
  toolbarRightHeader?: React.ReactNode;
  heightClass?: string;
}

export const SystemDataGrid: React.FC<SystemDataGridProps> = ({
  moduleId,
  rowData,
  columnDefs,
  toolbarTitle,
  toolbarLeftHeader,
  toolbarRightHeader,
  heightClass = "flex-1 h-full"
}) => {
  const { appConfig, updateAppConfig } = useDataStore();
  
  const [showColMenu, setShowColMenu] = useState(false);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [userHiddenColumns, setUserHiddenColumns] = useState<Set<string>>(new Set());
  const colMenuRef = useRef<HTMLDivElement>(null);
  const configMenuRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<AgGridReact>(null);
  const [showSystemFields, setShowSystemFields] = useState(false);

  // Dynamic system fields configuration via application state per tab
  const getSystemFieldsForModule = useCallback((modId: string) => {
      const saved = appConfig[`v-sys-fields-${modId}`];
      if (saved && Array.isArray(saved)) return new Set<string>(saved);
      // Fallback defaults if no config exists:
      return new Set(['id', 'id_tipo', 'id_pset', 'id_entity', 'id_record', 'timestamp', 'createdAt', 'updatedAt', 'deletedAt', 'isActive', 'parentId', 'nivel', 'canal', 'behavior', 'appliesTo']);
  }, [appConfig]);

  const [systemFieldsData, setSystemFieldsData] = useState<Set<string>>(() => getSystemFieldsForModule(moduleId));

  useEffect(() => {
     setSystemFieldsData(getSystemFieldsForModule(moduleId));
     setUserHiddenColumns(new Set());
  }, [moduleId, getSystemFieldsForModule]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(event.target as Node)) setShowColMenu(false);
      if (configMenuRef.current && !configMenuRef.current.contains(event.target as Node)) setShowConfigMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSystemFieldDef = (col: string) => {
    setSystemFieldsData(prev => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const handleSaveSystemConfig = async () => {
     await updateAppConfig(`v-sys-fields-${moduleId}`, Array.from(systemFieldsData));
     setShowConfigMenu(false);
  };

  const handleExportCSV = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `${moduleId}_export_${new Date().toISOString().split('T')[0]}.csv`,
        columnSeparator: ';'
      });
    }
  }, [moduleId]);

  // Inject hide logic into column bindings
  const contextualColumnDefs = useMemo<ColDef[]>(() => {
      return columnDefs.map(col => {
         const field = col.field;
         if (!field) return col;
         
         const isUserHidden = userHiddenColumns.has(field);
         const isSystemRestricted = !showSystemFields && systemFieldsData.has(field);
         
         return {
            ...col,
            hide: isUserHidden || isSystemRestricted
         };
      });
  }, [columnDefs, userHiddenColumns, showSystemFields, systemFieldsData]);

  useEffect(() => {
      // Small timeout to yield to React's render phase
      const timer = setTimeout(() => {
          if (gridRef.current && gridRef.current.api && !gridRef.current.api.isDestroyed()) {
             const cols = gridRef.current.api.getColumns();
             if (cols && cols.length > 0) {
                 gridRef.current.api.autoSizeColumns(cols.map((c: any) => c.getColId()));
             }
          }
      }, 50);
      return () => clearTimeout(timer);
  }, [contextualColumnDefs]);

  const headers = useMemo(() => columnDefs.map(c => c.field!).filter(Boolean), [columnDefs]);

  return (
    <div className={`flex flex-col bg-white overflow-hidden ${heightClass}`}>
      {/* TOOLBAR INTRA-GRID */}
      <div className="bg-white border-b border-[#d0dbec] px-4 py-2 flex items-center justify-between shrink-0 shadow-sm z-10 w-full rounded-t-lg">
         <div className="flex items-center gap-4">
            {toolbarTitle && (
              <h3 className="font-bold text-[12px] text-[#7f1d1d] uppercase tracking-wider border-r border-[#d0dbec] pr-4">
                 {toolbarTitle}
              </h3>
            )}
            {toolbarLeftHeader && <div className="flex items-center gap-2">{toolbarLeftHeader}</div>}
         </div>

         <div className="flex items-center gap-2">
            {/* GRUPO 1: VISIBILIDAD */}
            {/* Toggle System Fields */}
            <button 
              onClick={() => setShowSystemFields(!showSystemFields)}
              className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[10px] text-center font-bold text-[#7f1d1d] border border-[#7f1d1d] hover:bg-slate-50 transition-colors uppercase cursor-pointer rounded-sm shadow-sm"
            >
              {showSystemFields ? <>OCULTAR C.<br/>SISTEMA</> : <>VER CAMPOS<br/>SISTEMA</>}
            </button>

            {/* Selec Campos Visibles */}
            <div className="relative" ref={colMenuRef}>
              <button 
                onClick={() => setShowColMenu(!showColMenu)}
                className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[10px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-slate-50 transition-colors uppercase cursor-pointer rounded-sm shadow-sm"
              >
                SELEC. CAMPOS<br/>VISIBLES
              </button>
              
              {showColMenu && (
                <div className="absolute top-full right-0 mt-1 w-36 max-h-[400px] overflow-y-auto bg-white border border-[#7f1d1d] rounded shadow-xl z-[60] p-1 flex flex-col gap-0 font-['Inter'] text-left pb-1.5 border-t-4 border-t-[#7f1d1d]">
                  <div className="font-semibold text-[10px] text-[#7f1d1d] uppercase mb-1 px-1.5 pt-1 cursor-default tracking-wider border-b border-[#fca5a5] pb-1">Mostrar / Ocultar</div>
                  {columnDefs.map(col => {
                    const isSystemSuppressed = !showSystemFields && systemFieldsData.has(col.field!);
                    return (
                    <label key={col.field} className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded text-[10px] text-slate-700 select-none ${isSystemSuppressed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}>
                      <input 
                        type="checkbox" 
                        disabled={isSystemSuppressed}
                        className="w-2.5 h-2.5 accent-[#7f1d1d] rounded-sm cursor-pointer flex-shrink-0 disabled:cursor-not-allowed"
                        checked={!(userHiddenColumns.has(col.field!) || isSystemSuppressed)}
                        onChange={(e) => {
                          setUserHiddenColumns(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.delete(col.field!);
                            else next.add(col.field!);
                            return next;
                          });
                        }}
                      />
                      <span className="truncate">{col.headerName || col.field}</span>
                    </label>
                  )})}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            {/* GRUPO 2: CONFIGURACIÓN */}
            {/* Configurar Campos Sistema */}
            <div className="relative" ref={configMenuRef}>
              <button 
                onClick={() => setShowConfigMenu(!showConfigMenu)}
                className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[10px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-slate-50 transition-colors uppercase cursor-pointer rounded-sm shadow-sm"
              >
                CONFIG. C.<br/>SISTEMA
              </button>
              
              {showConfigMenu && (
                <div className="absolute top-full right-0 mt-1 w-36 max-h-[400px] overflow-y-auto bg-white border border-[#7f1d1d] rounded shadow-xl z-[60] p-1 flex flex-col gap-0 font-['Inter'] text-left pb-1.5">
                  <div className="font-semibold text-[10px] text-[#7f1d1d] uppercase mb-1 px-1.5 pt-1 cursor-default tracking-wider border-b border-[#fca5a5] pb-1">Â¿Es Sistema?</div>
                  {headers.map(col => (
                    <label key={col} className="flex items-center gap-1.5 py-0.5 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-[10px] text-slate-700 select-none">
                      <input 
                        type="checkbox" 
                        className="w-2.5 h-2.5 accent-[#7f1d1d] rounded-sm cursor-pointer flex-shrink-0"
                        checked={systemFieldsData.has(col)}
                        onChange={() => toggleSystemFieldDef(col)}
                      />
                      <span className="truncate">{col}</span>
                    </label>
                  ))}
                  <button 
                    onClick={handleSaveSystemConfig} 
                    className="mt-1 w-full flex items-center justify-center py-1.5 bg-[#7f1d1d] text-white text-[10px] font-bold uppercase rounded-sm hover:bg-[#991b1b] transition-colors shadow-sm tracking-widest border border-[#7f1d1d]"
                  >
                    GUARDAR CONFIG.
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            {/* GRUPO 3: DATOS */}
            <button onClick={handleExportCSV} className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-transparent border border-[#7f1d1d] hover:bg-gray-50 rounded-sm uppercase tracking-wide shadow-sm transition-colors">
                📥 EXPORTAR<br/>CSV
            </button>
            <button disabled className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-gray-400 bg-gray-100 border border-gray-300 rounded-sm uppercase tracking-wide shadow-sm cursor-not-allowed">
                📤 IMPORTAR<br/>CSV
            </button>
            
            {toolbarRightHeader && (
               <>
                 <div className="w-px h-6 bg-slate-200 mx-1"></div>
                 {toolbarRightHeader}
               </>
            )}
         </div>
      </div>

      <div className="ag-theme-quartz excel-grid-style flex-1 w-full relative" style={{ '--ag-font-size': '10px' } as any}>
        <AgGridReact
            ref={gridRef}
            theme="legacy"
            rowData={rowData}
            columnDefs={contextualColumnDefs}
            defaultColDef={{ minWidth: 10, resizable: true, filter: AGCheckboxFilter, sortable: true }}
            autoSizeStrategy={{ type: 'fitCellContents' }}
            pagination={true}
            paginationPageSize={100}
            suppressFieldDotNotation={true}
        />
      </div>
    </div>
  );
};
