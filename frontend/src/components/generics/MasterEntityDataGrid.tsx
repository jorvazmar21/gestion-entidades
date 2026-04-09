import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type { ColDef } from 'ag-grid-community';
import { useUiStore } from '../../store/useUiStore';
import { AGCheckboxFilter } from '../admin/AGCheckboxFilter';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface MasterEntityDataGridProps {
  moduleId: string;
  gridStateId?: string;
  rowData: any[];
  columnDefs: ColDef[];
  toolbarTitle?: string;
  toolbarLeftHeader?: React.ReactNode;
  toolbarCenterHeader?: React.ReactNode;
  toolbarRightHeader?: React.ReactNode;
  heightClass?: string;
  primaryKeyField?: string;
  onCellEdit?: (table: string, pkField: string, pkValue: string, column: string, newValue: any) => Promise<boolean>;
  onAddRow?: () => void;
  onDeleteSelected?: (selectedNodes: any[]) => void;
  onRowDoubleClicked?: (node: any) => void;
  onRowClicked?: (node: any) => void;
  selectedRowId?: string | null;
  onSelectedRowFilteredOut?: () => void;
  readOnly?: boolean;
  quickFilterText?: string;
  hideToolbar?: boolean;
}

export const MasterEntityDataGrid: React.FC<MasterEntityDataGridProps> = ({
  moduleId,
  gridStateId,
  rowData,
  columnDefs,
  toolbarTitle,
  toolbarLeftHeader,
  toolbarCenterHeader,
  toolbarRightHeader,
  heightClass = "flex-1 h-full",
  primaryKeyField,
  onCellEdit,
  onAddRow,
  onDeleteSelected,
  onRowDoubleClicked,
  onRowClicked,
  selectedRowId,
  onSelectedRowFilteredOut,
  readOnly = false,
  quickFilterText,
  hideToolbar = false
}) => {
  const gridRef = useRef<AgGridReact>(null);

  const handleExportCSV = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `${moduleId}_export_${new Date().toISOString().split('T')[0]}.csv`,
        columnSeparator: ';'
      });
    }
  }, [moduleId]);

  // Estabilizar las props para que react no destruya el estado interno del ag-grid en cada render
  const defaultColDefProps = useMemo(() => ({ minWidth: 40, resizable: true, filter: AGCheckboxFilter, sortable: true }), []);


  const gridResetSignal = useUiStore(state => state.gridResetSignal);
  const setGridColumnState = useUiStore(state => state.setGridColumnState);
  
  // Candado estricto para evitar que los reajustes del propio sistema sobreescriban la foto del usuario
  const isApplyingState = useRef(true); // Empieza en TRUE para proteger el montaje inicial de eventos fantasmas

  const saveGridState = useCallback(() => {
     if (isApplyingState.current) {
         return; // Bloqueado: AG-grid está manipulando las columnas internamente
     }

     if (gridStateId && gridRef.current && gridRef.current.api) {
         setGridColumnState(gridStateId, gridRef.current.api.getColumnState());
     }
  }, [gridStateId, setGridColumnState]);

  // Manejador centralizado cuando el estado o columnas están listas
  const onGridReadyOrColumnsChanged = useCallback(() => {
      if (gridRef.current && gridRef.current.api && !gridRef.current.api.isDestroyed()) {
          // Lectura NO reactiva para evitar bucles infinitos de renderizado al mover/redimensionar
          const currentStates = useUiStore.getState().gridColumnStates;
          const savedState = gridStateId ? currentStates[gridStateId] : null;

          isApplyingState.current = true; // CERRAMOS CANDADO PARA LA CÁMARA

          if (savedState) {
              // Si tenemos estado guardado, lo restauramos (anchos, orden, filtros)
              gridRef.current.api.applyColumnState({ state: savedState, applyOrder: true });
          } else {
              // Si no hay estado guardado, aplicamos el ajuste automático por defecto
              const cols = gridRef.current.api.getColumns();
              if (cols && cols.length > 0) {
                  gridRef.current.api.autoSizeColumns(cols.map((c: any) => c.getColId()));
              }
          }
          
          // Abrimos el candado 200 milisegundos después para asegurar que las animaciones de AG-Grid terminaron
          setTimeout(() => {
             isApplyingState.current = false;
          }, 200);
      }
  }, [gridStateId]);

  // Forzar re-pintado de la memoria cada vez que cambie de módulo/pestaña
  useEffect(() => {
      const tm = setTimeout(() => {
          onGridReadyOrColumnsChanged();
      }, 50);
      return () => clearTimeout(tm);
  }, [moduleId, onGridReadyOrColumnsChanged]);
  
  useEffect(() => {
      if (gridResetSignal > 0 && gridRef.current && gridRef.current.api && !gridRef.current.api.isDestroyed()) {
          isApplyingState.current = true;
          gridRef.current.api.resetColumnState();
          
          // Si estamos trackeando el estado, borramos el state persistente en la tienda guardando el reseteado
          if (gridStateId) {
              setGridColumnState(gridStateId, gridRef.current.api.getColumnState());
          }

          // Forzar que el auto-ajuste original vuelva a aplicar tras el reseteo
          setTimeout(() => {
             if (gridRef.current?.api && !gridRef.current.api.isDestroyed()) {
                const cols = gridRef.current.api.getColumns();
                if (cols && cols.length > 0) {
                    gridRef.current.api.autoSizeColumns(cols.map((c: any) => c.getColId()));
                }
             }
             isApplyingState.current = false;
          }, 50);
      }
  }, [gridResetSignal, gridStateId, setGridColumnState]);

  // Asegurar que AG-Grid recupere la highlight de la fila seleccionada si rowData se repuebla
  useEffect(() => {
     if (gridRef.current && gridRef.current.api && !gridRef.current.api.isDestroyed()) {
        if (selectedRowId) {
            // Un pequeño timeout para asegurar que domData está montado si rowData acaba de cambiar
            setTimeout(() => {
               if (gridRef.current && gridRef.current.api && !gridRef.current.api.isDestroyed()) {
                  gridRef.current.api.forEachNode((node) => {
                      const nid = primaryKeyField ? node.data[primaryKeyField] : (node.data.EMP_ID || node.data.id);
                      if (String(nid) === String(selectedRowId)) {
                          node.setSelected(true);
                      }
                  });
               }
            }, 50);
        } else {
            gridRef.current.api.deselectAll();
        }
     }
  }, [rowData, selectedRowId, primaryKeyField]);

  const btnSty = "w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-transparent border border-[#7f1d1d] hover:bg-gray-50 rounded-sm uppercase tracking-wide shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`flex flex-col bg-white overflow-hidden rounded-md border border-slate-300 shadow-md ${heightClass}`}>
      {/* TOOLBAR INTRA-GRID */}
      {!hideToolbar && (
        <div className="bg-white border-b border-[#d0dbec] px-4 py-2 flex items-center justify-between shrink-0 shadow-sm z-10 w-full rounded-t-lg">
           
           {/* 1/3 IZQUIERDA: TÍTULO Y HERRAMIENTAS IZQ */}
           <div className="flex-1 flex items-center justify-start gap-4">
              {toolbarTitle && (
                <h3 className="font-bold text-[12px] text-[#7f1d1d] uppercase tracking-wider border-r border-[#d0dbec] pr-4">
                   {toolbarTitle}
                </h3>
              )}
              {toolbarLeftHeader && <div className="flex items-center gap-2">{toolbarLeftHeader}</div>}
           </div>

           {/* 1/3 CENTRO: FILTROS (Ej: Activas/Inactivas) */}
           <div className="flex-1 flex items-center justify-center gap-2">
              {toolbarCenterHeader && toolbarCenterHeader}
           </div>

           {/* 1/3 DERECHA: BOTONERA DE ACCIÓN */}
           <div className="flex-1 flex items-center justify-end gap-2 text-right">
              {(onAddRow || onDeleteSelected) && (
                 <>
                   {onAddRow && (
                     <button 
                       onClick={readOnly ? undefined : onAddRow}
                       disabled={readOnly}
                       className={btnSty}
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
                       className={btnSty}
                     >
                       BORRAR
                     </button>
                   )}
                 </>
              )}

              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              <button onClick={handleExportCSV} className={btnSty}>
                  EXPORTAR<br/>CSV
              </button>
              <button disabled className={btnSty}>
                  IMPORTAR<br/>CSV
              </button>
              
              {toolbarRightHeader && (
                 <>
                   <div className="w-px h-6 bg-slate-200 mx-1"></div>
                   {toolbarRightHeader}
                 </>
              )}
           </div>
        </div>
      )}

      <div className="ag-theme-quartz excel-grid-style flex-1 w-full relative" style={{ '--ag-font-size': '11px', fontSize: '11px' } as any}>
        <AgGridReact
            ref={gridRef}
            theme="legacy"
            rowData={rowData}
            columnDefs={columnDefs}
            quickFilterText={quickFilterText}
            defaultColDef={defaultColDefProps}
            suppressDragLeaveHidesColumns={true}
            // getRowId={(params: any) => {
            //    const pk = primaryKeyField ? params.data[primaryKeyField] : null;
            //    return String(pk || params.data.EMP_ID || params.data.id);
            // }}
            onGridReady={onGridReadyOrColumnsChanged}
            // Importante: Volver a evaluar el estado cuando cambien las columnas dinámicas (ej: Cambio de Pestaña)
            onFirstDataRendered={onGridReadyOrColumnsChanged}
            onColumnResized={saveGridState}
            onColumnMoved={saveGridState}
            onColumnVisible={saveGridState}
            onSortChanged={saveGridState}
            onFilterChanged={useCallback((params: any) => {
                saveGridState();
                if (selectedRowId && onSelectedRowFilteredOut) {
                    let isVisible = false;
                    params.api.forEachNodeAfterFilter((node: any) => {
                        const nid = primaryKeyField ? node.data[primaryKeyField] : (node.data.EMP_ID || node.data.id);
                        if (String(nid) === String(selectedRowId)) {
                            isVisible = true;
                        }
                    });
                    // Si aplicamos un filtro de búsqueda y el registro activo desapareció, avisamos al padre para replegar
                    if (!isVisible) {
                        onSelectedRowFilteredOut();
                    }
                }
            }, [selectedRowId, onSelectedRowFilteredOut, primaryKeyField])}
            rowSelection="multiple"
            pagination={true}
            paginationPageSize={100}
            suppressFieldDotNotation={true}
            onRowDoubleClicked={onRowDoubleClicked}
            onRowClicked={onRowClicked}
            onCellValueChanged={async (params: any) => {
                if (params.oldValue !== params.newValue && primaryKeyField && onCellEdit) {
                    const pkValue = params.data[primaryKeyField];
                    const field = params.colDef.field;
                    if (pkValue && field) {
                        const success = await onCellEdit(moduleId, primaryKeyField, pkValue, field, params.newValue);
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
