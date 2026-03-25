import React from 'react';
import { SafeImage } from '../../SafeImage';

interface Props {
  tiposEntidadDb: any[];
  currentData: any;
  currentChildren: string[];
  activeMoldeId: string;
  isEditing: boolean;
}

export const TopologySimulator: React.FC<Props> = ({
  tiposEntidadDb, currentData, currentChildren, activeMoldeId, isEditing
}) => {
  return (
    <section className="w-[45%] bg-[#ffffff] rounded-sm relative overflow-hidden shadow-inner border border-[#d0dbec] flex flex-col styled-scrollbar">
       <h3 className="absolute top-4 left-4 text-[#5f030a] text-[9px] font-mono tracking-[0.2em] font-bold uppercase z-50 bg-white/90 px-3 py-1.5 rounded shadow-sm border border-[#dec0bd]">
         Topología Arquitectónica
       </h3>
       <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pt-16 px-6 pb-6 p-4">
          {['L1','L2','L3','L4','L5'].map(nivelStr => {
             const moldesNivel = tiposEntidadDb.filter(t => t.nivel === nivelStr);
             if (moldesNivel.length === 0 && (!currentData.id_molde || currentData.id_nivel !== nivelStr)) return null;

             let bg = '#ffffff'; let border = '#cbd5e1'; let text = '#121c2a';
             if (nivelStr === 'L1') { bg = '#ffe4e6'; border = '#e11d48'; text = '#881337'; }
             if (nivelStr === 'L2') { bg = '#fef3c7'; border = '#d97706'; text = '#78350f'; }
             if (nivelStr === 'L3') { bg = '#dcfce7'; border = '#16a34a'; text = '#14532d'; }
             if (nivelStr === 'L4') { bg = '#dbeafe'; border = '#2563eb'; text = '#1e3a8a'; }
             if (nivelStr === 'L5') { bg = '#f3e8ff'; border = '#9333ea'; text = '#581c87'; }

             return (
                <div key={nivelStr} className="w-full flex flex-col gap-2">
                   <div className="text-[10px] font-bold uppercase tracking-widest border-b pb-1" style={{ color: text, borderColor: border }}>
                      Estrato {nivelStr}
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {moldesNivel.map(m => {
                         const isActive = activeMoldeId === m.id_tipo || currentData.id_molde === m.id_tipo;
                         const actualChildren = isActive ? currentChildren : m.tipos_hijo_permitidos || [];

                         return (
                            <div key={m.id_tipo} className={`p-2 rounded-sm border shadow-sm flex flex-col min-w-[120px] max-w-[150px] transition-all relative ${isActive ? 'ring-2 ring-offset-1 scale-[1.02] z-10' : 'opacity-80 hover:opacity-100 hover:scale-[1.02]'}`} style={{ backgroundColor: bg, borderColor: isActive ? text : border }}>
                               <div className="flex items-center gap-2 mb-1">
                                  <SafeImage src={`/icons/${m.icono || 'sys_box.svg'}`} fallbackType="svg" wrapperClassName="w-4 h-4 flex-shrink-0" className="w-full h-full object-contain filter grayscale" />
                                  <div className="flex flex-col overflow-hidden leading-tight">
                                     <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: text }}>{m.id_tipo}</span>
                                     <span className="text-[8px] font-bold truncate leading-tight" style={{ color: text }} title={m.nombre}>{m.nombre}</span>
                                  </div>
                               </div>
                               {actualChildren.length > 0 && (
                                  <div className="mt-1 pt-1 border-t border-black/10 flex flex-col">
                                     <span className="text-[6px] uppercase font-bold text-black/40 tracking-wider">Admite:</span>
                                     <div className="flex flex-wrap gap-[2px] mt-0.5">
                                        {actualChildren.map((hn: string, i: number) => (
                                           <span key={i} className="text-[7px] px-1 py-[1px] bg-white/50 rounded-sm leading-none border border-black/10 text-black/70 truncate max-w-full" title={hn}>{hn}</span>
                                        ))}
                                     </div>
                                  </div>
                               )}
                            </div>
                         )
                      })}
                      
                      {(!isEditing && currentData.id_molde && currentData.id_nivel === nivelStr) && (
                          <div className={`p-2 rounded-sm border-2 border-dashed shadow-sm flex flex-col min-w-[120px] max-w-[150px] transition-all ring-2 ring-offset-1 scale-[1.02] z-10`} style={{ backgroundColor: bg, borderColor: text }}>
                             <div className="flex items-center gap-2 mb-1">
                                <SafeImage src={`/icons/${currentData.icono || 'sys_box.svg'}`} fallbackType="svg" wrapperClassName="w-4 h-4 flex-shrink-0" className="w-full h-full object-contain filter grayscale" />
                                <div className="flex flex-col overflow-hidden leading-tight">
                                   <span className="text-[7px] font-bold uppercase tracking-widest text-[#5f030a]">NUEVO</span>
                                   <span className="text-[8px] font-bold truncate leading-tight" style={{ color: text }} title={currentData.nombre}>{currentData.nombre || 'Sin Nombre'}</span>
                                </div>
                             </div>
                             {currentChildren.length > 0 && (
                                <div className="mt-1 pt-1 border-t border-black/10 flex flex-col">
                                   <span className="text-[6px] uppercase font-bold text-black/40 tracking-wider">Admite:</span>
                                   <div className="flex flex-wrap gap-[2px] mt-0.5">
                                      {currentChildren.map((hn: string, i: number) => (
                                         <span key={i} className="text-[7px] px-1 py-[1px] bg-white/50 rounded-sm leading-none border border-black/10 text-black/70 truncate max-w-full" title={hn}>{hn}</span>
                                      ))}
                                   </div>
                                </div>
                             )}
                          </div>
                      )}
                   </div>
                </div>
             )
          })}
       </div>
    </section>
  );
};
