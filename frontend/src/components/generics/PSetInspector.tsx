import React, { useState, useEffect } from 'react';
import { useDataStore } from '../../store/useDataStore';

interface PSetInspectorProps {
  entityId: string | null;
}

export const PSetInspector: React.FC<PSetInspectorProps> = ({ entityId }) => {
  const [loading, setLoading] = useState(false);
  const [savingPset, setSavingPset] = useState<string | null>(null);
  
  const { psets_def, psetValuesDb, db } = useDataStore();
  
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>({});
  
  // El acordeón ahora expande grupos lógicos visuales (ui_group_name), no fragmentos aislados de BBDD.
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!entityId) {
      setFormData({});
      return;
    }
    setLoading(true);
    
    // Obtenemos los valores físicos del L4 Instance desde el estado local (psetValuesDb)
    // psetValuesDb es un array que viene de dat_pset_live_payloads, el backend ya aplicó Poda de Seguridad
    let entityPayloads: any[] = [];
    if (Array.isArray(psetValuesDb)) {
        entityPayloads = psetValuesDb.filter((p: any) => p.l4_instance_id === entityId);
    }
    
    const initialFormData: Record<string, Record<string, any>> = {};
    entityPayloads.forEach((payload: any) => {
        initialFormData[payload.fk_pset] = payload.json_payload || {};
    });

    setFormData(initialFormData);

    // Agrupación y despliegue por defecto
    const uniqueGroups = Array.from(new Set(psets_def.map((p: any) => p.ui_group_name))).filter(Boolean);
    if (uniqueGroups.length > 0) {
        setExpandedGroups({ [(uniqueGroups as string[])[0]]: true });
    }

    setLoading(false);
  }, [entityId, psetValuesDb, psets_def]);

  const toggleGroup = (groupName: string) => {
     setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleFieldChange = (psetId: string, field: string, value: any) => {
     setFormData(prev => ({
       ...prev,
       [psetId]: {
         ...prev[psetId],
         [field]: value
       }
     }));
  };

  const handleSavePSet = async (psetId: string) => {
      setSavingPset(psetId);
      try {
          const originalPayloadRow = Array.isArray(psetValuesDb) ? psetValuesDb.find((p:any) => p.fk_pset === psetId && p.l4_instance_id === entityId) : null;
          const originalVersion = originalPayloadRow?.json_payload?.__v || 0;
          
          const payloadToSave = { ...formData[psetId], __v: originalVersion };

          const res = await fetch('/api/instances/put', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  l4_instance_id: entityId,
                  fk_pset: psetId,
                  json_payload: payloadToSave,
                  __v: originalVersion
              })
          });

          if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Error de sincronización con SQLite');
          }
          
          alert('Valores CQRS actualizados correctamente en base de datos L-Matrix.');
      } catch (err: any) {
          alert('Fallo al guardar: ' + err.message);
      } finally {
          setSavingPset(null);
      }
  };

  const currentEntity = db.find(e => e.id === entityId);

  // AGRUPACIÓN LÓGICA (La Ilusión del Administrador)
  // Fusionamos los PSets matemáticos basándonos en 'ui_group_name'
  const groupedPsets: Record<string, any[]> = {};
  psets_def.forEach((pset: any) => {
      const group = pset.ui_group_name || 'Otros Atributos';
      if (!groupedPsets[group]) groupedPsets[group] = [];
      groupedPsets[group].push(pset);
  });

  if (!entityId) {
    return (
      <div className="flex-1 flex flex-col pt-12 items-center h-full text-center p-6 bg-slate-50">
         <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <span className="text-2xl font-black">?</span>
         </div>
         <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sin Instancia (L4) Activa</span>
         <span className="text-xs text-slate-400 mt-2">Seleccione una fila en el datagrid para cargar sus vectores PSet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9ff] font-['Inter'] animate-[fadeIn_0.3s_ease-out]">
      
      {/* CABECERA INSPECTOR */}
      <div className="p-4 bg-white border-b border-gray-200 shrink-0">
         <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">
            INSPECCIONANDO INSTANCIA L4
         </h3>
         <div className="font-mono text-[13px] font-bold text-[#7f1d1d] truncate">
           {entityId}
         </div>
         <div className="text-[11px] font-semibold text-gray-600 truncate mt-1">
           {currentEntity?.name || '---'}
         </div>
         {loading && <div className="text-[10px] text-blue-500 uppercase font-bold mt-2 animate-pulse">Deserializando Vectores JSON...</div>}
      </div>

      {/* CONTENIDO SCROLL (Acordeones por ui_group_name) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
         
         {!loading && Object.keys(groupedPsets).length === 0 && (
            <div className="text-center p-6 bg-white border border-gray-200 rounded shadow-sm">
               <span className="text-xs text-gray-400 italic">No hay Diccionarios Paramétricos L-Matrix configurados.</span>
            </div>
         )}

         {!loading && Object.entries(groupedPsets).map(([groupName, psetsInGroup]) => {
            const isExpanded = expandedGroups[groupName];

            return (
              <div key={groupName} className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm transition-all">
                  
                  {/* HEADER ACORDEÓN DEL GRUPO VISUAL */}
                  <div 
                    onClick={() => toggleGroup(groupName)}
                    className={`p-3 flex items-center justify-between cursor-pointer border-b transition-colors ${isExpanded ? 'bg-[#fff1fa] border-[#fbcfe8]' : 'bg-gray-50 hover:bg-gray-100 border-transparent'}`}
                  >
                     <div className="flex flex-col">
                       <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">{groupName}</span>
                       <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                          {psetsInGroup.length} PSet{psetsInGroup.length !== 1 ? 's' : ''} Físicos Fusionados
                       </span>
                     </div>
                     <span className={`text-[10px] font-bold text-gray-400 transition-transform ${isExpanded ? 'rotate-180 text-[#7f1d1d]' : ''}`}>▼</span>
                  </div>

                  {/* BODY ACORDEÓN */}
                  {isExpanded && (
                     <div className="p-4 flex flex-col gap-6 bg-white">
                         {psetsInGroup.map(pset => {
                            const schema = pset.json_shape_definition?.DataSchema || {};
                            const values = formData[pset.id_pset] || {};

                            return (
                                <div key={pset.id_pset} className="flex flex-col gap-3 relative border border-slate-100 rounded p-3 bg-slate-50/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-[9px] uppercase font-bold text-indigo-400 tracking-widest">{pset.schema_alias}</h4>
                                        <button 
                                            onClick={() => handleSavePSet(pset.id_pset)}
                                            disabled={savingPset === pset.id_pset}
                                            className="px-2 py-1 bg-[#7f1d1d] text-white text-[9px] font-bold uppercase rounded hover:bg-red-800 transition-colors disabled:opacity-50"
                                        >
                                            {savingPset === pset.id_pset ? 'Procesando...' : 'Aplicar CQRS Put'}
                                        </button>
                                    </div>

                                    {Object.entries(schema).map(([key, propDef]: [string, any]) => {
                                        const isBool = propDef.type === 'boolean';
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
                                                    <span className="text-xs font-semibold text-gray-700 group-hover:text-[#7f1d1d] transition-colors">{key}</span>
                                                </label>
                                            );
                                        }

                                        return (
                                            <div key={key}>
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 flex justify-between">
                                                    <span>{key}</span>
                                                </label>
                                                <input 
                                                    type={propDef.format === 'date' ? 'date' : 'text'} 
                                                    value={value}
                                                    onChange={(e) => handleFieldChange(pset.id_pset, key, e.target.value)}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-[11px] font-medium text-gray-800 focus:outline-none focus:border-[#7f1d1d] focus:ring-1 focus:ring-[#7f1d1d] shadow-sm transition-all" 
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                     </div>
                  )}

              </div>
            );
         })}
      </div>
    </div>
  );
};
