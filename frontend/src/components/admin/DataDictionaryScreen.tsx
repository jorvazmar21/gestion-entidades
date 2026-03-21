/**
 * @module DataDictionaryScreen
 * @description Pantalla Administrador: Visor del Diccionario de Datos.
 * @inputs Ninguno (Esquema estático hardcodeado basado en la arquitectura de persistencia).
 * @actions Renderiza tarjetas documentativas para cada tabla del sistema.
 * @files src/components/admin/DataDictionaryScreen.tsx
 */
import React from 'react';
import { SafeImage } from '../SafeImage';

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
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-['Inter']">
      {/* HEADER */}
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-10 w-full">
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
             className="bg-white text-[#7f1d1d] border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white px-6 py-2 rounded font-bold text-xs uppercase tracking-widest shadow-sm transition-colors"
           >
             Volver al Inicio
           </button>
         </div>
       </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-auto p-8 relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {SCHEMA_TABLES.map((table, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                    <div className="bg-[#7f1d1d] text-white px-5 py-3 flex items-center gap-2 rounded-t-lg">
                        <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">TABLA</span>
                        <h3 className="font-bold text-[14px] tracking-wide">{table.name}</h3>
                    </div>
                    <div className="p-0 overflow-x-auto flex-1">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3 uppercase tracking-wider w-1/3">Campo</th>
                                    <th className="px-5 py-3 uppercase tracking-wider w-1/4">Tipo</th>
                                    <th className="px-5 py-3 uppercase tracking-wider w-auto">Descripción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {table.fields.map((f, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-2.5 font-semibold text-gray-800 font-mono text-[11px]">{f.name}</td>
                                        <td className="px-5 py-2.5">
                                            <span className="bg-blue-50 text-blue-700 font-mono text-[10px] px-2 py-0.5 rounded border border-blue-100">
                                                {f.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 text-gray-600">{f.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-[#fff8e1] border-l-4 border-orange-500 p-4 shrink-0 rounded-b-lg">
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-orange-800 mb-1">Restricciones de Integridad / Constraints</h4>
                        <div className="font-mono text-[11px] text-gray-700 whitespace-pre-line leading-relaxed">
                            {table.constraints}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};
