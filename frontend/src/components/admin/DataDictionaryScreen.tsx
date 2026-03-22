import React, { useState, useEffect, useMemo } from 'react';
import { SafeImage } from '../SafeImage';
import type { ColDef } from 'ag-grid-community';
import { SystemDataGrid } from './SystemDataGrid';

interface Props {
  onBack: () => void;
}

export const DataDictionaryScreen: React.FC<Props> = ({ onBack }) => {
  const [schemaTables, setSchemaTables] = useState<any[]>([]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetch('/api/schema-db')
       .then(r => r.json())
       .then(res => {
          if (res.success && res.data) {
             setSchemaTables(res.data);
          }
          setLoading(false);
       })
       .catch(err => {
          console.error(err);
          setLoading(false);
       });
  }, []);

  const activeTable = schemaTables.length > 0 ? schemaTables[activeTabIdx] : null;

  const handlePrev = () => setActiveTabIdx(p => p > 0 ? p - 1 : schemaTables.length - 1);
  const handleNext = () => setActiveTabIdx(p => p < schemaTables.length - 1 ? p + 1 : 0);

  const rowData = activeTable ? activeTable.fields : [];

  const columnDefs = useMemo<ColDef[]>(() => {
     return [
       { field: 'name', headerName: 'NOMBRE DE COLUMNA', minWidth: 10 },
       { field: 'type', headerName: 'TIPO DE DATO (SQLite)', minWidth: 10 },
       { field: 'pk', headerName: 'CLAVE PRIMARIA (PK)', minWidth: 10 },
       { field: 'notnull', headerName: 'OBLIGATORIO (NOT NULL)', minWidth: 10 }
     ];
  }, []);

  if (loading) {
     return <div className="p-10 flex justify-center text-gray-500 font-mono">Cargando esquema de la base de datos viva...</div>;
  }

  if (!activeTable) {
     return <div className="p-10 flex justify-center text-red-500 font-mono">No se pudieron cargar las tablas.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-['Inter']">
      {/* HEADER */}
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_diccionario.svg" fallbackType="svg" wrapperClassName="w-8 h-8" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Diccionario de Datos
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">ESQUEMA SQLITE DINÁMICO</span>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <button 
             onClick={onBack}
             className="w-[80px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             VOLVER AL<br/>INICIO
           </button>
         </div>
      </header>

      {/* TOOLBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-10 w-full">
         <div className="flex items-center gap-4">
            <button onClick={handlePrev} disabled={schemaTables.length === 0} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors uppercase cursor-pointer disabled:opacity-50">
               ◀ Anterior
            </button>
            <select 
               value={activeTabIdx}
               onChange={(e) => setActiveTabIdx(Number(e.target.value))}
               disabled={schemaTables.length === 0}
               className="font-bold text-sm w-64 text-center text-[#7f1d1d] uppercase tracking-wider bg-white border border-[#d0dbec] rounded py-1 px-2 cursor-pointer focus:outline-none focus:border-[#7f1d1d] shadow-sm"
            >
               {schemaTables.length === 0 && <option value={0}>Cargando esquema...</option>}
               {schemaTables.map((t, idx) => (
                   <option key={t.name} value={idx}>{t.name.replace(/_/g, ' ')}</option>
               ))}
            </select>
            <button onClick={handleNext} disabled={schemaTables.length === 0} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors uppercase cursor-pointer disabled:opacity-50">
               Siguiente ▶
            </button>
         </div>
         <div className="text-[10px] text-gray-500 font-mono font-bold bg-[#f1f3fc] px-3 py-1 rounded border border-[#d0dbec] uppercase tracking-widest">
             {rowData.length} Columnas Detectadas
         </div>
      </div>

      {/* CONTENT DATAGRID */}
      <main className="flex-1 flex w-full p-6 bg-gray-200 overflow-hidden relative">
          <div className="max-w-[1600px] mx-auto w-full flex flex-1 gap-6 min-w-0 min-h-0">
              {/* LEFT: AG-Grid (100%) */}
              <div className="w-full flex flex-col flex-1 shadow-lg relative bg-gray-50 border border-[#d0dbec] rounded-md overflow-hidden min-w-0 min-h-0">
                <SystemDataGrid 
                  moduleId={`DIC_${activeTable.name}`}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  heightClass="flex-1 w-full"
                  toolbarTitle={`Tabla SQL: ${activeTable.name}`}
                />
              </div>
          </div>
      </main>
    </div>
  );
};
