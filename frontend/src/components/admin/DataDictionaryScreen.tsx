/**
 * @module DataDictionaryScreen
 * @description Pantalla Administrador: Visor del Diccionario de Datos.
 * @inputs Ninguno (Esquema estático hardcodeado basado en la arquitectura de persistencia).
 * @actions Renderiza tarjetas documentativas para cada tabla del sistema.
 * @files src/components/admin/DataDictionaryScreen.tsx
 */
import React, { useState, useMemo } from 'react';
import { SafeImage } from '../SafeImage';
import type { ColDef } from 'ag-grid-community';
import { SystemDataGrid } from './SystemDataGrid';

interface Props {
  onBack: () => void;
}

const SCHEMA_TABLES = [
    {
        name: 'Directorio_Master_Activos',
        fields: [
            { name: 'id', type: 'VARCHAR(50)', desc: 'PK - Identificador Unico UUID' },
            { name: 'level', type: 'VARCHAR(10)', desc: 'Nivel Jerárquico (L1-L5, L1B, L2B)' },
            { name: 'category', type: 'VARCHAR(50)', desc: 'Categoría (LUGAR, DELEGACION...)' },
            { name: 'subCategory', type: 'VARCHAR(50)', desc: 'Subcategoría (ALMACEN, MAQUINARIA...)' },
            { name: 'type', type: 'VARCHAR(10)', desc: 'Tipo de Entidad' },
            { name: 'code', type: 'VARCHAR(12)', desc: 'Código de Usuario' },
            { name: 'name', type: 'VARCHAR(255)', desc: 'Nombre descriptivo' },
            { name: 'location', type: 'VARCHAR(255)', desc: 'Ubicación física' },
            { name: 'canal', type: 'VARCHAR(8)', desc: 'Código imputación contable' },
            { name: 'parentId', type: 'VARCHAR(50)', desc: 'FK -> Master_Activos(id) del Padre' },
            { name: 'isActive', type: 'BIT', desc: 'Bandera Activo/Inactivo (1/0)' },
            { name: 'deletedAt', type: 'DATETIME', desc: 'Fecha borrado lógico (NULL=OK)' },
            { name: 'deletedBy', type: 'VARCHAR(50)', desc: 'Usuario que archivó' },
            { name: 'createdAt', type: 'DATETIME', desc: 'Fecha alta' },
            { name: 'createdBy', type: 'VARCHAR(50)', desc: 'Usuario creador' },
            { name: 'updatedAt', type: 'DATETIME', desc: 'Fecha última modificación' },
            { name: 'updatedBy', type: 'VARCHAR(50)', desc: 'Usuario que modificó' }
        ],
        constraints: 'PK_Directorio_Master(id).\nUK_Master_Code(code) WHERE deletedAt IS NULL.'
    },
    {
        name: 'PSet_Definitions',
        fields: [
            { name: 'id_pset', type: 'VARCHAR(50)', desc: 'PK/FK -> Master_Activos(id) tipo PST' },
            { name: 'behavior', type: 'VARCHAR(20)', desc: 'ESTATICO | DINAMICO' },
            { name: 'appliesTo', type: 'JSON', desc: 'Array Entidades Ej: ["OBR","PRV"]' },
            { name: 'properties', type: 'JSON', desc: 'Array de {name, type, config}' }
        ],
        constraints: 'PK_PSet_Defs(id_pset).'
    },
    {
        name: 'PSet_Values_Static',
        fields: [
            { name: 'id_entity', type: 'VARCHAR(50)', desc: 'PK/FK -> Master_Activos(id)' },
            { name: 'id_pset', type: 'VARCHAR(50)', desc: 'PK/FK -> Master_Activos(id) tipo PST' },
            { name: 'data', type: 'JSON', desc: 'KvP Values Ej: {"Direccion": "Calle 1"}' }
        ],
        constraints: 'PK_Composite(id_entity, id_pset).'
    },
    {
        name: 'PSet_Values_Dynamic',
        fields: [
            { name: 'id_record', type: 'VARCHAR(50)', desc: 'PK Autogenerado' },
            { name: 'id_entity', type: 'VARCHAR(50)', desc: 'FK -> Master_Activos(id)' },
            { name: 'id_pset', type: 'VARCHAR(50)', desc: 'FK -> Master_Activos(id) tipo PST' },
            { name: 'timestamp', type: 'DATETIME', desc: 'Fecha de captura' },
            { name: 'data', type: 'JSON', desc: 'KvP Values Ej: {"Horas Uso": 450}' }
        ],
        constraints: 'PK(id_record).'
    },
    {
        name: 'Tipos_Entidad',
        fields: [
            { name: 'id_tipo', type: 'VARCHAR(3)', desc: 'PK - Identificador/Prefijo' },
            { name: 'nombre', type: 'VARCHAR(100)', desc: 'Nombre del Módulo o Tipo' },
            { name: 'categoria', type: 'VARCHAR(20)', desc: 'LUGAR | DELEGACION | PSET' },
            { name: 'subCategoria', type: 'VARCHAR(50)', desc: 'Clasificación secundaria' },
            { name: 'nivel', type: 'VARCHAR(5)', desc: 'Nivel Jerárquico (L1, L2...)' },
            { name: 'icono', type: 'VARCHAR(50)', desc: 'Icono SVG/Emoji' },
            { name: 'tipos_hijo_permitidos', type: 'JSON', desc: 'Array de prefijos hijos admitidos' },
            { name: 'max_count_per_parent', type: 'INT', desc: 'Límite maximo por nivel superior' }
        ],
        constraints: 'PK_Tipos_Entidad(id_tipo).'
    }
];

export const DataDictionaryScreen: React.FC<Props> = ({ onBack }) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const activeTable = SCHEMA_TABLES[activeTabIdx];

  const handlePrev = () => setActiveTabIdx(p => p > 0 ? p - 1 : SCHEMA_TABLES.length - 1);
  const handleNext = () => setActiveTabIdx(p => p < SCHEMA_TABLES.length - 1 ? p + 1 : 0);

  const rowData = activeTable.fields;

  const columnDefs = useMemo<ColDef[]>(() => {
     return [
       { 
         field: 'name', headerName: 'CAMPO', minWidth: 10, 
         cellRenderer: (params: any) => <span className="font-mono text-gray-800 font-semibold text-[11px] leading-3">{params.value}</span>
       },
       { 
         field: 'type', headerName: 'TIPO DE DATO', minWidth: 10,
         cellRenderer: (params: any) => <span className="bg-blue-50 text-blue-700 font-mono text-[10px] px-2 py-0.5 rounded border border-blue-100">{params.value}</span>
       },
       { 
         field: 'desc', headerName: 'DESCRIPCIÓN', minWidth: 10,
         cellClass: "text-gray-600 text-xs"
       }
     ];
  }, []);

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
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">ARQUITECTURA CORE</span>
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
            <button onClick={handlePrev} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors uppercase cursor-pointer">
               ◀ Anterior
            </button>
            <h3 className="font-bold text-sm w-48 text-center text-[#7f1d1d] uppercase tracking-wider">
               {activeTable.name.replace(/_/g, ' ')}
            </h3>
            <button onClick={handleNext} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors uppercase cursor-pointer">
               Siguiente ▶
            </button>
         </div>
         <div className="text-[10px] text-gray-500 font-mono font-bold bg-[#f1f3fc] px-3 py-1 rounded border border-[#d0dbec] uppercase tracking-widest">
             {rowData.length} Campos Registrados
         </div>
      </div>

      {/* CONTENT DATAGRID */}
      <main className="flex-1 flex w-full p-6 bg-gray-200 overflow-hidden relative">
          <div className="max-w-[1600px] mx-auto w-full flex flex-1 gap-6 min-w-0 min-h-0">
              {/* LEFT: AG-Grid (60%) */}
              <div className="w-[60%] flex flex-col flex-1 shadow-lg relative bg-gray-50 border border-[#d0dbec] rounded-md overflow-hidden min-w-0 min-h-0">
                <SystemDataGrid 
                  moduleId={`DIC_${activeTable.name}`}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  heightClass="flex-1 w-full"
                  toolbarTitle={activeTable.name.replace(/_/g, ' ')}
                />
              </div>

              {/* RIGHT: Constraints Panel (40%) */}
              <div className="w-[40%] h-full bg-[#fff8e1] border-l-4 border-l-orange-500 border border-[#d0dbec] p-6 rounded-md shadow-lg relative overflow-y-auto">
                  <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-[#7f1d1d] mb-4 flex items-center gap-2 border-b border-orange-200 pb-3">
                     <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     Restricciones de Integridad (Constraints)
                  </h4>
                  <div className="font-mono text-xs text-orange-950 whitespace-pre-line leading-relaxed pl-3 font-semibold border-l-2 border-orange-400">
                      {activeTable.constraints}
                  </div>
              </div>
          </div>
      </main>
    </div>
  );
};
