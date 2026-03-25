import React, { useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type { ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface SystemDataGridMiniProps {
  rowData: any[];
  columnDefs: ColDef[];
  toolbarTitle?: string;
  primaryKeyField?: string;
  onCellEdit?: (pkField: string, pkValue: string, column: string, newValue: any) => Promise<boolean>;
  onAddRow?: () => void;
  onDeleteSelected?: (selectedNodes: any[]) => void;
  readOnly?: boolean;
  rowSelection?: 'single' | 'multiple';
  onSelectionChanged?: (selectedNodes: any[]) => void;
  selectedIdObj?: { field: string, value: string };
}

export const SystemDataGridMini: React.FC<SystemDataGridMiniProps> = ({
  rowData, columnDefs, toolbarTitle, primaryKeyField, onCellEdit, onAddRow, onDeleteSelected, readOnly = false,
  rowSelection = 'single', onSelectionChanged, selectedIdObj
}) => {
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
      const timer = setTimeout(() => {
          if (gridRef.current && gridRef.current.api && !gridRef.current.api.isDestroyed()) {
             const cols = gridRef.current.api.getColumns();
             if (cols && cols.length > 0) {
                 gridRef.current.api.sizeColumnsToFit();
             }
          }
      }, 50);
      return () => clearTimeout(timer);
  }, [columnDefs, rowData]);

  // Handle external selection synchronization
  useEffect(() => {
      if (selectedIdObj && rowData.length > 0 && gridRef.current && gridRef.current.api && !gridRef.current.api.isDestroyed()) {
         gridRef.current.api.forEachNode((node) => {
             if (node.data && node.data[selectedIdObj.field] === selectedIdObj.value) {
                 if (!node.isSelected()) node.setSelected(true);
             } else {
                 if (node.isSelected()) node.setSelected(false);
             }
         });
      }
  }, [selectedIdObj, rowData]);

  const contextualColumnDefs = columnDefs.map(col => ({
      ...col,
      editable: readOnly ? false : col.editable,
      cellClassRules: {
          ...col.cellClassRules,
          'bg-slate-100 text-slate-500 cursor-not-allowed': '!colDef.editable'
      }
  }));

  return (
    <div className="flex flex-col bg-white overflow-hidden w-full h-full rounded-xl relative">
      <style>{`
        .custom-mini-grid .ag-row { color: #9ca3af; transition: background-color 0.2s, color 0.2s; }
        .custom-mini-grid .ag-row-selected { font-weight: 700 !important; color: #121c2a !important; background-color: #eff6ff !important; border-left: 3px solid #7f1d1d !important; }
      `}</style>

      {/* TOOLBAR INTRA-GRID LITE */}
      {(toolbarTitle || onAddRow || onDeleteSelected) && (
      <div className="bg-gray-50 border-b border-[#cbd5e1] px-3 py-1.5 flex items-center justify-between shrink-0 w-full z-10 h-[36px]">
          {toolbarTitle ? (
              <span className="font-mono text-[11px] font-bold tracking-widest text-[#121c2a] uppercase">{toolbarTitle}</span>
          ) : <span></span>}
          <div className="flex items-center gap-2">
             {onAddRow && (
               <button 
                 onClick={readOnly ? undefined : onAddRow}
                 disabled={readOnly}
                 className={`w-[70px] h-[24px] flex items-center justify-center text-[9px] leading-[9px] text-center font-bold transition-colors uppercase rounded shadow-sm ${readOnly ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'text-emerald-700 bg-emerald-50 border-emerald-600 hover:bg-emerald-600 hover:text-white cursor-pointer'}`}
               >
                 + AÑADIR
               </button>
             )}
             {onDeleteSelected && (
               <button 
                 onClick={readOnly ? undefined : () => {
                    if (gridRef.current && gridRef.current.api) {
                        onDeleteSelected(gridRef.current.api.getSelectedNodes());
                    }
                 }}
                 disabled={readOnly}
                 className={`w-[70px] h-[24px] flex items-center justify-center text-[9px] leading-[9px] text-center font-bold transition-colors uppercase rounded shadow-sm ${readOnly ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'text-red-700 bg-red-50 border-red-600 hover:bg-red-600 hover:text-white cursor-pointer'}`}
               >
                 🗑 BORRAR
               </button>
             )}
          </div>
      </div>
      )}

      <div className="ag-theme-quartz excel-grid-style flex-1 w-full relative custom-mini-grid" style={{ '--ag-font-size': '10px' } as any}>
        <AgGridReact
            ref={gridRef}
            theme="legacy"
            rowData={rowData}
            columnDefs={contextualColumnDefs}
            defaultColDef={{ minWidth: 10, resizable: true, sortable: true }}
            autoSizeStrategy={{ type: 'fitCellContents' }}
            rowSelection={rowSelection}
            onSelectionChanged={(e) => {
                if (onSelectionChanged) {
                    onSelectionChanged(e.api.getSelectedNodes());
                }
            }}
            suppressFieldDotNotation={true}
            onCellValueChanged={async (params: any) => {
                if (params.oldValue !== params.newValue && primaryKeyField && onCellEdit) {
                    const pkValue = params.data[primaryKeyField];
                    const field = params.colDef.field;
                    if (pkValue && field) {
                        const success = await onCellEdit(primaryKeyField, pkValue, field, params.newValue);
                        if (!success) {
                            params.data[field] = params.oldValue;
                            params.api.refreshCells({ rowNodes: [params.node], force: true });
                        }
                    }
                }
            }}
        />
      </div>
    </div>
  );
};
