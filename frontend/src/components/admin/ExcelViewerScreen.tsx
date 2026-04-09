import React, { useState, useMemo, useEffect } from 'react';
import { SafeImage } from '../SafeImage';
import type { ColDef } from 'ag-grid-community';
import { SystemDataGrid } from './SystemDataGrid';
import { useDataStore } from '../../store/useDataStore';

const FkSelectEditor = React.forwardRef((props: any, ref) => {
    const { lookupMap } = props;
    const firstOptionKey = Object.keys(lookupMap)[0] || '';
    
    const [value, setValue] = useState(props.value != null && props.value !== '' ? String(props.value) : firstOptionKey);

    React.useImperativeHandle(ref, () => {
        return {
            getValue() {
                return value !== '' ? Number(value) : null;
            }
        };
    });

    return (
        <select 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-full border-none bg-white focus:outline-none focus:ring-2 focus:ring-[#7f1d1d] text-xs px-1 text-gray-800 font-medium"
            autoFocus
        >
            {Object.entries(lookupMap).map(([id, label]) => (
                <option key={id} value={id}>{String(label)}</option>
            ))}
        </select>
    );
});

interface Props {
  onBack: () => void;
}

export const ExcelViewerScreen: React.FC<Props> = ({ onBack }) => {
  const [tables, setTables] = useState<any[]>([]);
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const { l1_categories, l2_families, l3_types, psets_def, lifecycle_phases, company_departments } = useDataStore();

  const dicts = useMemo(() => {
     // --- HEURÍSTICA UNIVERSAL TIER-1 DE EXTRACCIÓN ALIAS ---
     // Esta micro-IA interna se come CUALQUIER fila de la Base de Datos, sea la tabla que sea,
     // y auto-descubre su 'Código' y su 'Alias' buscando patrones de Arquitectura L-Matrix.
     const extractUniversalLabel = (obj: any): string => {
         if (!obj) return '--';
         // 1. Caza de Códigos Técnicos (cualquier columna que acabe en '_code')
         const codeKey = Object.keys(obj).find(k => k.toLowerCase().endsWith('_code'));
         const code = codeKey ? obj[codeKey] : (obj.code || 'SYS');
         // 2. Caza de Nombres Humanos (prioridad Tier-1)
         const alias = obj.human_readable_name || obj.nombre || obj.schema_alias || obj.name || obj.descripcion || 'Sin Alias';
         return `${code} | ${alias}`;
     };

     const l1Map: Record<number, string> = {};
     l1_categories.forEach((c: any) => l1Map[c.id_l1] = extractUniversalLabel(c));
  
     const l2Map: Record<number, string> = {};
     l2_families.forEach((c: any) => l2Map[c.id_l2] = extractUniversalLabel(c));
     
     const l3Map: Record<number, string> = {};
     l3_types.forEach((c: any) => l3Map[c.id_l3] = extractUniversalLabel(c));
     
     const psetMap: Record<number, string> = {};
     psets_def.forEach((c: any) => psetMap[c.id_pset] = extractUniversalLabel(c));
  
     const phaseMap: Record<number, string> = {};
     lifecycle_phases.forEach((c: any) => phaseMap[c.id_phase] = extractUniversalLabel(c));

     const departmentMap: Record<number, string> = {};
     company_departments.forEach((c: any) => departmentMap[c.id_department] = extractUniversalLabel(c));

     return { l1Map, l2Map, l3Map, psetMap, phaseMap, departmentMap };
  }, [l1_categories, l2_families, l3_types, psets_def, lifecycle_phases, company_departments]);

  // 1. Cargar el esquema completo al inicio
  useEffect(() => {
     fetch('/api/schema-db')
       .then(r => r.json())
       .then(res => {
          if (res.success && res.data && res.data.length > 0) {
             const sortedData = [...res.data].sort((a: any, b: any) => a.name.localeCompare(b.name));
             setTables(sortedData);
          }
       })
       .catch(console.error);
  }, []);

  const activeTableInfo = tables.length > 0 ? tables[activeTabIdx] : null;
  const activeTableName = activeTableInfo ? activeTableInfo.name : '';

  // 2. Cargar los datos crudos cuando cambia la tabla o se fuerza refresco
  useEffect(() => {
     if (!activeTableName) return;
     setLoading(true);
     fetch(`/api/raw-db?table=${activeTableName}&v=${refreshKey}`)
       .then(r => r.json())
       .then(res => {
          if (res.success && res.data) {
             // Parsear JSONs si vienen como objeto para que no salga [object Object]
             const parsedData = res.data.map((row: any) => {
                 const newRow = { ...row };
                 for (const key in newRow) {
                     if (typeof newRow[key] === 'object' && newRow[key] !== null) {
                         newRow[key] = JSON.stringify(newRow[key]);
                     }
                 }
                 return newRow;
             });
             setRowData(parsedData);
          }
          setLoading(false);
       })
       .catch(err => {
          console.error(err);
          setLoading(false);
       });
  }, [activeTableName, refreshKey]);

  const handlePrev = () => setActiveTabIdx(p => p > 0 ? p - 1 : tables.length - 1);
  const handleNext = () => setActiveTabIdx(p => p < tables.length - 1 ? p + 1 : 0);

  // 3. Obtener la Clave Primaria matemáticamente
  const primaryKeyField = useMemo(() => {
      if (!activeTableInfo) return undefined;
      const pkField = activeTableInfo.fields.find((f: any) => f.pk === 1);
      return pkField ? pkField.name : undefined;
  }, [activeTableInfo]);

  // 4. Calcular reglas de columnas (Editables vs Protegidas)
  const columnDefs = useMemo<ColDef[]>(() => {
    if (rowData.length === 0 && (!activeTableInfo || activeTableInfo.fields.length === 0)) return [];
    
    // Auto-detect columns from schema fields if available, otherwise from rowData
    const fieldsNames = activeTableInfo 
        ? activeTableInfo.fields.map((f: any) => f.name) 
        : Object.keys(rowData[0] || {});
        
    const forbiddenTails = ['at', 'by'];
    const forbiddenExact = ['id', 'id_entidad', 'id_molde', 'id_pset', 'id_tipo', 'id_record'];
    
    return fieldsNames.map((field: string) => {
      const lowerField = field.toLowerCase();
      // Protección: Es PK?
      const isPk = primaryKeyField === field;
      // Protección: Es de auditoría o un ID genérico protegido?
      const isProtected = forbiddenExact.includes(lowerField) || 
                          forbiddenTails.some(tail => lowerField.endsWith(tail));
      
      // Protección: Celdas JSON propensas a corrupción manual (DataSchema or live payloads)
      const isJsonBlob = lowerField.includes('json') || lowerField.includes('payload');

      let customEditor = undefined;
      let cellEditorParams = undefined;
      let valueFormatter = undefined;

      if (lowerField.includes('fk_l1')) {
          customEditor = FkSelectEditor;
          cellEditorParams = { lookupMap: dicts.l1Map };
          valueFormatter = (p: any) => p.value ? (dicts.l1Map[p.value] || p.value) : p.value;
      } else if (lowerField.includes('fk_l2')) {
          customEditor = FkSelectEditor;
          cellEditorParams = { lookupMap: dicts.l2Map };
          valueFormatter = (p: any) => p.value ? (dicts.l2Map[p.value] || p.value) : p.value;
      } else if (lowerField.includes('fk_l3')) {
          customEditor = FkSelectEditor;
          cellEditorParams = { lookupMap: dicts.l3Map };
          valueFormatter = (p: any) => p.value ? (dicts.l3Map[p.value] || p.value) : p.value;
      } else if (lowerField.includes('fk_pset')) {
          customEditor = FkSelectEditor;
          cellEditorParams = { lookupMap: dicts.psetMap };
          valueFormatter = (p: any) => p.value ? (dicts.psetMap[p.value] || p.value) : p.value;
      } else if (lowerField.includes('fk_phase')) {
          customEditor = FkSelectEditor;
          cellEditorParams = { lookupMap: dicts.phaseMap };
          valueFormatter = (p: any) => p.value ? (dicts.phaseMap[p.value] || p.value) : p.value;
      } else if (lowerField.includes('fk_department') || lowerField.includes('fk_dep')) {
          customEditor = FkSelectEditor;
          cellEditorParams = { lookupMap: dicts.departmentMap };
          valueFormatter = (p: any) => p.value ? (dicts.departmentMap[p.value] || p.value) : p.value;
      }
      
      const isFkColumn = !!customEditor;
                          
      return {
        field,
        headerName: field.toUpperCase(),
        minWidth: 10,
        editable: !(isPk || isProtected || isJsonBlob),
        cellClass: `font-mono text-xs flex items-center ${isFkColumn ? 'bg-yellow-50 text-amber-900 shadow-[inset_0_0_0_1px_rgba(253,230,138,0.5)]' : 'text-gray-700'}`,
        cellEditor: customEditor,
        cellEditorParams: cellEditorParams,
        valueFormatter: valueFormatter
      };
    });
  }, [rowData, activeTableInfo, primaryKeyField, dicts]);

  // 5. Callback de edición segura
  const handleCellEdit = async (tableIdFromGrid: string, pkField: string, pkValue: string, column: string, newValue: any): Promise<boolean> => {
      try {
          const response = await fetch('/api/raw-db/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ table: activeTableName, pkColumn: pkField, pkValue, updateColumn: column, newValue })
          });
          const res = await response.json();
          if (!res.success) {
              alert(`Error al guardar: ${res.error}`);
              return false;
          }
          return true; // Éxito
      } catch (e: any) {
          alert(`Error de red: ${e.message}`);
          return false;
      }
  };

  // 6. CRUD Operations
  const allowedMasterTables = ['sys_moldes', 'sys_niveles', 'sys_psets_def', 'sys_abac_matrix', 'sys_psets_audit_log', 'sys_reglas_jerarquia'];
  const isMasterTable = allowedMasterTables.includes(activeTableName);

  const handleAddRow = async () => {
      if (!activeTableName || !primaryKeyField) return;
      const isAuto = ['sys_abac_matrix', 'sys_psets_audit_log', 'sys_reglas_jerarquia'].includes(activeTableName);
      let pkValue = null;
      if (!isAuto) {
         pkValue = prompt(`ATENCIÓN: Cuidado al añadir datos estructurales.\n\nNuevo registro para: ${activeTableName}\nIntroduzca un valor único MODO TEXTO para la clave primaria (${primaryKeyField}):\n(Sin espacios ni tildes)`);
         if (!pkValue) return; // User cancelled
      }
      
      try {
          const response = await fetch('/api/raw-db/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ table: activeTableName, pkColumn: primaryKeyField, pkValue })
          });
          const res = await response.json();
          if (res.success) {
              setRefreshKey(k => k + 1); // Trigger reload
          } else {
              alert(`Error del Servidor: ${res.error}`);
          }
      } catch (e: any) {
          alert(`Error de red: ${e.message}`);
      }
  };

  const handleDeleteSelected = async (selectedNodes: any[]) => {
      if (!selectedNodes || selectedNodes.length === 0) return;
      if (!confirm(`¿Está seguro de borrar ${selectedNodes.length} registro(s) ESTRUCTURAL(ES)?\nEsta acción es física en la Base de Datos y no se puede deshacer.`)) return;
      
      if (!activeTableName || !primaryKeyField) return;

      let successCount = 0;
      for (const node of selectedNodes) {
          const pkValue = node.data[primaryKeyField];
          try {
              const response = await fetch('/api/raw-db/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ table: activeTableName, pkColumn: primaryKeyField, pkValue })
              });
              const res = await response.json();
              if (res.success) successCount++;
          } catch(e) {}
      }
      if (successCount < selectedNodes.length) {
         alert(`Se borraron ${successCount} de ${selectedNodes.length}. Los demás pueden tener dependencias restrictivas (Foreign Keys).`);
      }
      setRefreshKey(k => k + 1); // Trigger reload
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8f9ff] flex flex-col font-['Inter']">
       {/* HEADER */}
       <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_raw.svg" fallbackType="svg" wrapperClassName="w-8 h-8" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Visor de Tablas
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">DATAGRID EDITABLE (MODO DIOS)</span>
           </div>
         </div>
         <div className="flex items-center gap-2">
           <button 
             onClick={onBack}
             className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             INICIO
           </button>
         </div>
       </header>

       {/* EXCEL TOOLBAR */}
       <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-10 w-full border-t-4 border-t-gray-50">
         <div className="flex items-center gap-4">
            <button onClick={handlePrev} disabled={tables.length === 0} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors uppercase cursor-pointer disabled:opacity-50">
               ◀ Anterior
            </button>
            
            <select 
               value={activeTabIdx}
               onChange={(e) => setActiveTabIdx(Number(e.target.value))}
               disabled={tables.length === 0}
               className="text-sm w-64 text-center text-[#7f1d1d] uppercase tracking-wider bg-white border border-[#d0dbec] rounded py-1 px-2 cursor-pointer focus:outline-none focus:border-[#7f1d1d] shadow-sm"
               style={{ fontFamily: '"Inter", sans-serif', fontWeight: 'bold' }}
            >
               {tables.length === 0 && <option value={0} style={{ fontFamily: '"Inter", sans-serif', fontWeight: 'bold' }} className="text-[#7f1d1d] uppercase tracking-wider">Cargando tablas...</option>}
               {tables.map((t, idx) => (
                   <option key={t.name} value={idx} style={{ fontFamily: '"Inter", sans-serif', fontWeight: 'bold' }} className="text-[#7f1d1d] uppercase tracking-wider">{t.name}</option>
               ))}
            </select>

            <button onClick={handleNext} disabled={tables.length === 0} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors uppercase cursor-pointer disabled:opacity-50">
               Siguiente ▶
            </button>
         </div>
         <div className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 rounded">
             {loading ? 'Cargando...' : `${rowData.length} registros en total`}
         </div>
       </div>

       {/* CONTENT DATAGRID */}
       <main className="p-4 bg-gray-200 shadow-inner flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex-1 w-full h-full shadow-lg rounded-t-lg overflow-hidden border border-[#d0dbec] flex flex-col min-w-0 min-h-0">
            {activeTableName && (
              <SystemDataGrid 
                moduleId={`RAW_${activeTableName}`}
                rowData={rowData}
                columnDefs={columnDefs}
                toolbarTitle={`MESA: ${activeTableName.toUpperCase()}`}
                primaryKeyField={primaryKeyField}
                onCellEdit={handleCellEdit}
                onAddRow={isMasterTable ? handleAddRow : undefined}
                onDeleteSelected={isMasterTable ? handleDeleteSelected : undefined}
              />
            )}
          </div>
       </main>
    </div>
  );
};
