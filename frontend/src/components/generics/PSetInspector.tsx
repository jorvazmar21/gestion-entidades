import React, { useState, useEffect, useRef } from 'react';
import { useDataStore } from '../../store/useDataStore';

export interface PSetContextGroup {
    label: string; 
    entityIds: string[];
    isChild: boolean;
}

export interface PSetInspectorProps {
  screenId?: string;
  contextPayload: PSetContextGroup[];
  phaseIds?: string[];
  deptIds?: string[];
  mockPsetsDef?: any[];
  mockPsetValues?: any[];
}

// =========================================================================
// EL CEREBRO COMPARTIDO: usePSetContext
// Sincroniza la "Lente" entre Zona 9 y Zona 10 usando la red de Zustand
// =========================================================================
const usePSetContext = (screenId: string, contextPayload: PSetContextGroup[]) => {
  const { activePsetFocus, setActivePsetFocus } = useDataStore();
  const focoActual = activePsetFocus[screenId] || null;

  useEffect(() => {
      if (contextPayload.length === 0) {
          setActivePsetFocus(screenId, null);
      } else {
          const stillExists = contextPayload.some(g => g.label === focoActual);
          if (!stillExists) {
              const childGroup = contextPayload.find(g => g.isChild);
              const defaultGroup = childGroup || contextPayload[0];
              setActivePsetFocus(screenId, defaultGroup.label);
          }
      }
  }, [contextPayload, focoActual, screenId, setActivePsetFocus]);

  const activeGroup = contextPayload.find(g => g.label === focoActual) || null;
  return { focoActual, activeGroup, setActivePsetFocus };
};

// =========================================================================
// ZONA 9: CABECERA Y LENTE DE ENFOQUE MULTI-TIPO
// =========================================================================
export const PSetZone9: React.FC<PSetInspectorProps> = ({ screenId = 'default', contextPayload = [] }) => {
    const [comboboxOpen, setComboboxOpen] = useState(false);
    const { activePsetTabs, setActivePsetTab } = useDataStore();
    const activePsetTab = activePsetTabs[screenId] || 'ESTATICAS';
    
    const { focoActual, activeGroup, setActivePsetFocus } = usePSetContext(screenId, contextPayload);

    let titleText = 'No hay selección';
    if (activeGroup) {
        titleText = `${activeGroup.label} (${activeGroup.entityIds.length})`;
    }

    const handleRefineClick = (label: string) => {
        setActivePsetFocus(screenId, label);
        setComboboxOpen(false);
    };

    useEffect(() => {
        if (!comboboxOpen) return;
        const handleClick = () => setComboboxOpen(false);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [comboboxOpen]);

    return (
      <div className="w-full flex-1 flex flex-col bg-[#f8f9ff] font-['Inter'] relative z-10">
         <div className="px-3 pt-3 flex items-stretch gap-3 w-full pb-2 border-b border-gray-100 shrink-0">
             <div className="flex-1 flex items-center justify-center border border-transparent">
                 <h3 className="text-[15px] font-bold text-[#7f1d1d] uppercase tracking-widest text-center truncate">
                     PROPIEDADES
                 </h3>
             </div>
             
             <div className="flex-1 relative flex" onClick={e => e.stopPropagation()}>
                 <button 
                     onClick={() => contextPayload.length > 0 && setComboboxOpen(!comboboxOpen)}
                     className={`w-full flex items-center justify-between gap-2 text-[10px] font-bold px-3 py-1.5 rounded shadow-sm border transition-all ${
                         contextPayload.length === 0 ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-default' : 
                         'bg-red-50 border-red-100 text-[#7f1d1d] hover:bg-[#fffcfd] cursor-pointer'
                     }`}
                 >
                     <span className="truncate mx-auto pl-2">{titleText}</span>
                     {contextPayload.length > 0 && <span className={`text-[8px] shrink-0 transition-transform ${comboboxOpen ? 'rotate-180' : ''}`}>▼</span>}
                 </button>

                 {comboboxOpen && contextPayload.length > 0 && (
                     <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 shadow-xl rounded overflow-hidden z-50 transform origin-top animate-[fadeIn_0.15s_ease-out]">
                         <div className="px-3 pt-2 pb-1 bg-gray-50 border-b border-gray-100">
                             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Enfocar Propiedades</span>
                         </div>
                         <div className="flex flex-col">
                             {contextPayload.map(group => (
                                 <button 
                                     key={group.label}
                                     onClick={() => handleRefineClick(group.label)}
                                     className={`px-3 py-2 text-left text-[11px] font-semibold border-l-2 transition-colors ${
                                        focoActual === group.label ? 'bg-[#fffcfd] text-[#7f1d1d] border-[#7f1d1d]' : 'text-gray-700 border-transparent hover:bg-gray-50 hover:text-gray-900'
                                     }`}
                                 >
                                     {group.label} ({group.entityIds.length})
                                 </button>
                             ))}
                         </div>
                     </div>
                 )}
             </div>
         </div>

         <div className="w-full flex flex-1 items-end px-2 pt-2 pb-0">
           <button 
             onClick={() => setActivePsetTab(screenId, 'ESTATICAS')}
             className={`flex-1 py-1.5 text-[9px] uppercase tracking-widest font-bold border-b-2 transition-colors ${activePsetTab === 'ESTATICAS' ? 'border-[#7f1d1d] text-[#7f1d1d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
           >
             Estáticas
           </button>
           <button 
             onClick={() => setActivePsetTab(screenId, 'DINAMICAS')}
             className={`flex-1 py-1.5 text-[9px] uppercase tracking-widest font-bold border-b-2 transition-colors ${activePsetTab === 'DINAMICAS' ? 'border-[#7f1d1d] text-[#7f1d1d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
           >
             Dinámicas
           </button>
           <button 
             onClick={() => setActivePsetTab(screenId, 'HIPERDINAMICAS')}
             className={`flex-1 py-1.5 text-[9px] uppercase tracking-widest font-bold border-b-2 transition-colors ${activePsetTab === 'HIPERDINAMICAS' ? 'border-[#7f1d1d] text-[#7f1d1d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
           >
             Hiperdinámicas
           </button>
         </div>
      </div>
    );
};

// =========================================================================
// ZONA 10: MOTOR DE INTERSECCIONES Y RENDER DE PROPIEDADES L-MATRIX
// =========================================================================
export const PSetZone10: React.FC<PSetInspectorProps> = ({ screenId = 'default', contextPayload = [], mockPsetsDef, mockPsetValues }) => {
  const [expandedPsets, setExpandedPsets] = useState<Record<string, boolean>>({});
  const { psets_def, psetValuesDb } = useDataStore();
  const { activeGroup } = usePSetContext(screenId, contextPayload);
  
  const activeDef = mockPsetsDef || psets_def || [];
  const activeValues = mockPsetValues || psetValuesDb || [];

  useEffect(() => {
    if (activeDef && activeDef.length > 0) {
        const defaultExpanded = activeDef.reduce((acc: Record<string, boolean>, pset: any) => {
            acc[pset.id_pset] = true;
            return acc;
        }, {});
        setExpandedPsets(defaultExpanded);
    }
  }, [activeDef]);

  const togglePset = (id: string) => setExpandedPsets(prev => ({ ...prev, [id]: !prev[id] }));

  return (
      <div className="flex-1 w-full bg-white overflow-y-auto p-4 flex flex-col gap-3 font-['Inter'] relative z-0">
          {contextPayload.length === 0 || !activeGroup ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full">
                 <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3 text-slate-400">
                    <span className="text-xl font-black">?</span>
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Sin Entidades Seleccionadas en Zona 6</span>
              </div>
          ) : (
             <>
                 {activeDef.map((pset: any) => {
                    const isExpanded = expandedPsets[pset.id_pset];
                    const schema = pset.json_shape_definition?.DataSchema || {};
                    
                    const intersectedValues: Record<string, string> = {};
                    
                    Object.keys(schema).forEach(key => {
                        const collectedValues = new Set<string>();
                        
                        activeGroup.entityIds.forEach(id => {
                            const rowValue = Array.isArray(activeValues) ? activeValues.find((p:any) => p.fk_pset === pset.id_pset && p.l4_instance_id === id) : null;
                            const val = rowValue?.json_payload?.[key];
                            if (val !== undefined && val !== null) {
                                collectedValues.add(String(val));
                            } else {
                                collectedValues.add('-');
                            }
                        });

                        if (collectedValues.size === 1) {
                            intersectedValues[key] = Array.from(collectedValues)[0];
                        } else if (collectedValues.size > 1) {
                            intersectedValues[key] = '';
                        } else {
                            intersectedValues[key] = '-';
                        }
                    });

                    return (
                      <div key={pset.id_pset} className="bg-white border border-gray-200 shadow flex flex-col rounded overflow-hidden shrink-0">
                          <div 
                            onClick={() => togglePset(pset.id_pset)}
                            className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#fffcfd] transition-colors border-l-2 border-transparent hover:border-l-[#7f1d1d]"
                          >
                             <span className="text-[11px] font-bold text-[#334155] uppercase tracking-wide">
                                {pset.schema_alias}
                             </span>
                             <span className={`text-[10px] font-bold text-gray-400 transition-transform ${isExpanded ? 'rotate-180 text-[#7f1d1d]' : ''}`}>▼</span>
                          </div>

                          {isExpanded && (
                             <div className="w-full flex flex-col border-t border-gray-200 bg-white">
                                 {Object.keys(schema).length === 0 && (
                                    <div className="p-3 text-[10px] text-gray-400 italic">No hay propiedades en el esquema.</div>
                                 )}
                                 {Object.keys(schema).length > 0 && (
                                    <ResizablePropertyGrid schema={schema} values={intersectedValues} />
                                 )}
                             </div>
                          )}
                      </div>
                    );
                 })}
             </>
          )}
      </div>
  );
};

// =========================================================================
// CUSTOM NATIVE CSS-RESIZABLE PROPERTY GRID
// =========================================================================
const ResizablePropertyGrid: React.FC<{schema: any, values: any}> = ({ schema, values }) => {
    const [leftWidth, setLeftWidth] = useState<number | 'auto'>('auto');
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault(); 
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; 
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let newWidth = e.clientX - containerRect.left;
        
        if (newWidth < 60) newWidth = 60;
        if (newWidth > containerRect.width - 60) newWidth = containerRect.width - 60;
        
        setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const isPixels = typeof leftWidth === 'number';
    const colAutoStyle = { width: '1%', whiteSpace: 'nowrap' as any };

    return (
        <div ref={containerRef} className="w-full text-[11px] select-text flex flex-col pt-0.5 pb-1">
            <table className="w-full text-left border-collapse" style={{ tableLayout: isPixels ? 'fixed' : 'auto' }}>
                {isPixels && (
                    <colgroup>
                        <col style={{ width: `${leftWidth}px` }} />
                        <col style={{ width: 'auto' }} />
                    </colgroup>
                )}
                <tbody>
                    {Object.entries(schema).map(([key, propDef]: [string, any], index) => {
                        const val = values[key];

                        return (
                            <tr key={key} className="group border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                <td 
                                    className="relative py-1.5 pr-4 pl-3 text-gray-600 font-semibold tracking-wide overflow-hidden text-ellipsis align-middle border-r border-[#e2e8f0]"
                                    style={isPixels ? {} : colAutoStyle}
                                >
                                    {key}
                                    <div 
                                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 hover:bg-[#7f1d1d] group-hover:bg-[#cbd5e1] opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ transform: 'translateX(50%)' }}
                                        onMouseDown={handleMouseDown}
                                    />
                                </td>
                                
                                <td className="py-1.5 px-3 text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap align-middle" title={val}>
                                    {val}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
