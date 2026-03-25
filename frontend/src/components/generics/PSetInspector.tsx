import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../store/useUiStore';

interface PSetDef {
  id_pset: string;
  nombre: string;
  descripcion: string;
  tipo: 'ESTATICO' | 'DINAMICO';
  json_schema: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        title: string;
        required?: boolean;
        format?: string;
        enum?: string[];
      }
    };
  };
}

interface PSetInspectorProps {
  entityId: string | null;
}

export const PSetInspector: React.FC<PSetInspectorProps> = ({ entityId }) => {
  const activeTab = useUiStore(state => state.activePSetTab);

  const [loading, setLoading] = useState(false);
  const [entityMolde, setEntityMolde] = useState<string | null>(null);
  const [psets, setPsets] = useState<PSetDef[]>([]);
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>({});
  const [expandedPsets, setExpandedPsets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!entityId) {
      setEntityMolde(null);
      setPsets([]);
      setFormData({});
      return;
    }

    setLoading(true);
    
    // MOCK DEL BACKEND: Resolver la Entidad Dto. y sus PSets Obligatorios
    // Endpoint Final: /api/eav/entity-psets/:entityId
    setTimeout(() => {
      // 1. Determinar Molde (Simulamos que sabemos que ENT-EMP es M_EMP)
      const molde = entityId.includes('EMP') ? 'EMP' : 'OBR';
      setEntityMolde(molde);

      // 2. Traer definiciones teóricas de la BBDD (sys_psets_def)
      let mockPsets: PSetDef[] = [];
      let mockData: any = {};

      if (molde === 'EMP') {
        mockPsets = [
          {
            id_pset: 'PSET_FISCAL_EMP',
            nombre: 'Datos Fiscales Base',
            descripcion: 'Registro mercantil y NIF',
            tipo: 'ESTATICO',
            json_schema: {
              type: 'object',
              properties: {
                razonSocial: { type: 'string', title: 'Razón Social', required: true },
                nif: { type: 'string', title: 'NIF/CIF' },
                fechaConstitucion: { type: 'string', format: 'date', title: 'Fecha Constitución' }
              }
            }
          },
          {
            id_pset: 'PSET_ROLES_EMP',
            nombre: 'Roles en el Sistema',
            descripcion: 'Atributos booleanos EAV',
            tipo: 'ESTATICO',
            json_schema: {
              type: 'object',
              properties: {
                esPropia: { type: 'boolean', title: 'Es Empresa Propia' },
                esCliente: { type: 'boolean', title: 'Es Cliente' },
                esProveedor: { type: 'boolean', title: 'Es Proveedor' }
              }
            }
          },
          {
            id_pset: 'PSET_EVALUACIONES_PRV',
            nombre: 'Evaluaciones Históricas',
            descripcion: 'Histórico de L3',
            tipo: 'DINAMICO',
            json_schema: { type: 'object', properties: {} } // Dinámico usa Grid, no Form
          }
        ];

        // MOCK DE VALORES EXISTENTES (pset_estatico_valores)
        mockData = {
          'PSET_FISCAL_EMP': {
            razonSocial: entityId === 'ENT-EMP-001' ? 'Dragados S.A.' : 'Hilti España',
            nif: entityId === 'ENT-EMP-001' ? 'A28000000' : 'B82000000',
            fechaConstitucion: '1980-01-01'
          },
          'PSET_ROLES_EMP': {
            esCliente: entityId === 'ENT-EMP-001',
            esProveedor: entityId === 'ENT-EMP-002'
          }
        };
      }

      setPsets(mockPsets);
      setFormData(mockData);
      
      // Auto-expandir el primer PSet por defecto
      const firstStatic = mockPsets.find(p => p.tipo === 'ESTATICO');
      if (firstStatic) {
         setExpandedPsets({ [firstStatic.id_pset]: true });
      }

      setLoading(false);
    }, 400);

  }, [entityId]);

  const toggleAccordion = (id: string) => {
     setExpandedPsets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = (psetId: string, field: string, value: any) => {
     setFormData(prev => ({
       ...prev,
       [psetId]: {
         ...prev[psetId],
         [field]: value
       }
     }));
     // Aquí dispararíamos la PROMESA DE GUARDADO SILENTE A BBDD
     console.log(`[Autosave EAV] ${psetId}.${field} = ${value} para ${entityId}`);
  };

  if (!entityId) {
    return (
      <div className="flex-1 flex flex-col pt-12 items-center h-full text-center p-6 bg-slate-50">
         <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
            {/* Vacío */}
            <span className="text-2xl font-black">?</span>
         </div>
         <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sin Entidad Activa</span>
         <span className="text-xs text-slate-400 mt-2">Seleccione una fila en el datagrid para cargar sus Property Sets</span>
      </div>
    );
  }

  const psetsToRender = psets.filter(p => p.tipo === activeTab);

  return (
    <div className="flex flex-col h-full bg-[#f8f9ff] font-['Inter'] animate-[fadeIn_0.3s_ease-out]">
      
      {/* CABECERA INSPECTOR */}
      <div className="p-4 bg-white border-b border-gray-200 shrink-0">
         <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">INSPECCIONANDO ({entityMolde})</h3>
         <div className="font-mono text-[13px] font-bold text-[#7f1d1d] truncate">
           {entityId}
         </div>
         {loading && <div className="text-[10px] text-blue-500 uppercase font-bold mt-2 animate-pulse">Cargando EAV...</div>}
      </div>

      {/* CONTENIDO SCROLL */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
         
         {!loading && psetsToRender.length === 0 && (
            <div className="text-center p-6 bg-white border border-gray-200 rounded shadow-sm">
               <span className="text-xs text-gray-400 italic">La entidad no tiene configurados PSets de tipo {activeTab}</span>
            </div>
         )}

         {!loading && psetsToRender.map(pset => {
            const isExpanded = expandedPsets[pset.id_pset];
            const schemaProps = pset.json_schema?.properties || {};
            const values = formData[pset.id_pset] || {};

            return (
              <div key={pset.id_pset} className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm transition-all">
                  
                  {/* HEADER ACORDEÓN */}
                  <div 
                    onClick={() => toggleAccordion(pset.id_pset)}
                    className={`p-3 flex items-center justify-between cursor-pointer border-b transition-colors ${isExpanded ? 'bg-[#fff1fa] border-[#fbcfe8]' : 'bg-gray-50 hover:bg-gray-100 border-transparent'}`}
                  >
                     <div className="flex flex-col">
                       <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">{pset.id_pset.replace('PSET_', '')}</span>
                       <span className="text-[9px] text-gray-400 uppercase hidden">{pset.nombre}</span>
                     </div>
                     <span className={`text-[10px] font-bold text-gray-400 transition-transform ${isExpanded ? 'rotate-180 text-[#7f1d1d]' : ''}`}>▼</span>
                  </div>

                  {/* BODY ACORDEÓN (ESTATICO) */}
                  {isExpanded && activeTab === 'ESTATICO' && (
                     <div className="p-4 flex flex-col gap-4 bg-white">
                        {Object.entries(schemaProps).map(([key, propDef]) => {
                           const type = propDef.type;
                           const isBool = type === 'boolean';
                           const isDate = propDef.format === 'date';
                           const value = values[key] ?? (isBool ? false : '');

                           if (isBool) {
                             return (
                               <label key={key} className="flex items-center gap-2 cursor-pointer group">
                                 <input 
                                   type="checkbox" 
                                   checked={value}
                                   onChange={(e) => handleFieldChange(pset.id_pset, key, e.target.checked)}
                                   className="w-3.5 h-3.5 accent-[#7f1d1d] rounded-sm cursor-pointer border-gray-300" 
                                 />
                                 <span className="text-xs font-semibold text-gray-700 group-hover:text-[#7f1d1d] transition-colors">{propDef.title}</span>
                               </label>
                             );
                           }

                           return (
                             <div key={key}>
                               <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5 flex justify-between">
                                 <span>{propDef.title} {propDef.required && <span className="text-red-400">*</span>}</span>
                                 <span className="text-[8px] font-mono text-gray-300 lowercase">{key}</span>
                               </label>
                               <input 
                                 type={isDate ? 'date' : 'text'} 
                                 value={value}
                                 onChange={(e) => handleFieldChange(pset.id_pset, key, e.target.value)}
                                 className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-[11px] font-medium text-gray-800 focus:outline-none focus:border-[#7f1d1d] focus:ring-1 focus:ring-[#7f1d1d] shadow-sm transition-all" 
                               />
                             </div>
                           );
                        })}
                     </div>
                  )}

                  {/* BODY ACORDEÓN (DINAMICO) */}
                  {isExpanded && activeTab === 'DINAMICO' && (
                     <div className="p-0 flex flex-col bg-slate-50">
                        <div className="p-2 border-b border-gray-200 flex justify-end">
                           <button className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded text-[10px] font-bold text-[#7f1d1d] shadow-sm uppercase transition-colors">
                              + Añadir Registro (L3)
                           </button>
                        </div>
                        <div className="p-4 text-center">
                           <span className="text-[10px] text-gray-400 italic">AQUÍ SE INYECTARÁ SYSTEM_DATA_GRID_MINI</span>
                        </div>
                     </div>
                  )}

              </div>
            );
         })}
      </div>
    </div>
  );
};
