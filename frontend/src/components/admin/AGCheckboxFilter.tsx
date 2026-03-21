import React, { useState, useEffect, useCallback } from 'react';
import type { IRowNode, IDoesFilterPassParams } from 'ag-grid-community';
import { useGridFilter } from 'ag-grid-react';
import type { CustomFilterProps } from 'ag-grid-react';

export const AGCheckboxFilter = ({ model, onModelChange, api, column }: CustomFilterProps) => {
    const [options, setOptions] = useState<string[]>([]);

    // Load available unique values for the checkboxes
    useEffect(() => {
        const uniqueValues = new Set<string>();
        api.forEachNode((node: IRowNode) => {
            const val = api.getCellValue({ rowNode: node, colKey: column.getColId() });
            uniqueValues.add(String(val ?? '(vacío)'));
        });
        const sorted = Array.from(uniqueValues).sort();
        setOptions(sorted);
    }, [api, column]);

    // Model defines what is checked. Null means "no filter" (everything is checked)
    const selected = new Set(model ? model.values : options);

    const doesFilterPass = useCallback((params: IDoesFilterPassParams) => {
        // Read directly from the row data object to avoid undefined value lookups on virtualized rows
        const val = params.data ? params.data[column.getColId()] : undefined;
        return selected.has(String(val ?? '(vacío)'));
    }, [column, selected]);

    // Register our logic mathematically with AG-Grid
    useGridFilter({ doesFilterPass });

    const toggle = (opt: string) => {
        const next = new Set(selected);
        if (next.has(opt)) next.delete(opt);
        else next.add(opt);

        if (next.size === options.length) {
            onModelChange(null); // Clear filter
        } else {
            onModelChange({ values: Array.from(next) });
        }
    };

    const selectAll = () => onModelChange(null);
    const clearAll = () => onModelChange({ values: [] });

    return (
        <div className="p-1.5 w-40 max-h-[250px] flex flex-col font-sans text-[10px] bg-white text-gray-800 border-t-[3px] border-[#7f1d1d] shadow-2xl rounded-b-sm">
           <div className="flex justify-between border-b border-gray-200 pb-1 mb-1 font-semibold">
              <button onClick={selectAll} className="text-blue-600 hover:text-blue-800 transition-colors text-[10px] uppercase tracking-wide">
                Sel. Todo
              </button>
              <button onClick={clearAll} className="text-red-600 hover:text-red-800 transition-colors text-[10px] uppercase tracking-wide">
                Limpiar
              </button>
           </div>
           {/* SCROLLABLE CHECKBOX LIST */}
           <div className="overflow-y-auto flex-1 flex flex-col gap-[2px] pr-0.5">
             {options.map(opt => (
                <label key={opt} className="flex items-center gap-1.5 hover:bg-gray-100 p-0.5 cursor-pointer rounded transition-colors group">
                   <input 
                      type="checkbox" 
                      className="w-2.5 h-2.5 cursor-pointer accent-[#7f1d1d] focus:ring-[#7f1d1d]"
                      checked={selected.has(opt)} 
                      onChange={() => toggle(opt)} 
                   />
                   <span className="truncate group-hover:text-[#7f1d1d] transition-colors leading-[10px]" title={opt}>{opt}</span>
                </label>
             ))}
           </div>
        </div>
    );
};
