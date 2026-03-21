import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { SafeImage } from '../SafeImage';
import type { ColDef } from 'ag-grid-community';
import { SystemDataGrid } from './SystemDataGrid';

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

  const handlePrev = () => setActiveTabIdx(p => p > 0 ? p - 1 : TABLE_TABS.length - 1);
  const handleNext = () => setActiveTabIdx(p => p < TABLE_TABS.length - 1 ? p + 1 : 0);

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
    if (rowData.length === 0) return [];
    
    // Auto-detect columns from the first object
    const fields = Object.keys(rowData[0]);
    
    return fields.map(field => {
      return {
        field,
        headerName: field.toUpperCase(),
        minWidth: 10,
        cellClass: "font-mono text-xs text-gray-700"
      };
    });
  }, [rowData]);

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
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">DATAGRID DE AUDITORÃA (AG-GRID)</span>
           </div>
         </div>
         <div className="flex items-center gap-2">
           {/* GRUPO 4: NAVEGACIÓN */}
           <button 
             onClick={onBack}
             className="w-[80px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             VOLVER AL<br/>INICIO
           </button>
         </div>
       </header>

       {/* EXCEL TOOLBAR */}
       <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-10 w-full border-t-4 border-t-gray-50">
         <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors uppercase cursor-pointer">
               ◀ Anterior
            </button>
            <h3 className="font-bold text-sm w-48 text-center text-[#7f1d1d] uppercase tracking-wider">
               {TABLE_TABS[activeTabIdx].label}
            </h3>
            <button onClick={handleNext} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors uppercase cursor-pointer">
               Siguiente ▶
            </button>
         </div>
         <div className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 rounded">
             {rowData.length} registros en total
         </div>
       </div>

       {/* CONTENT DATAGRID */}
       <main className="p-4 bg-gray-200 shadow-inner flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex-1 w-full h-full shadow-lg rounded-t-lg overflow-hidden border border-[#d0dbec] flex flex-col min-w-0 min-h-0">
            <SystemDataGrid 
              moduleId={activeTab}
              rowData={rowData}
              columnDefs={columnDefs}
              toolbarTitle={TABLE_TABS[activeTabIdx].label}
            />
          </div>
       </main>
    </div>
  );
};
