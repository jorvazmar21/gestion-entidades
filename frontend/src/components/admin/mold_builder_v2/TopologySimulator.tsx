import React from 'react';
import { SafeImage } from '../../SafeImage';
import { useDataStore } from '../../../store/useDataStore';

interface Props {
  tiposEntidadDb: any[];
  currentData: any;
  currentChildren: string[];
  activeMoldeId: string;
  isEditing: boolean;
  className?: string;
  onNodeClick?: (id: string) => void;
}

export const TopologySimulator: React.FC<Props> = ({
  tiposEntidadDb, currentData, currentChildren, activeMoldeId, isEditing, className = '', onNodeClick
}) => {
  const { sysNivelesDb } = useDataStore();

  // Extraer niveles directamente de sys_niveles para que cualquier nivel creado aparezca
  const dynamicLevels = sysNivelesDb.length > 0 
      ? [...sysNivelesDb].sort((a, b) => a.jerarquia - b.jerarquia).map(n => n.id_nivel)
      : ['L1'];

  // Si creamos un nuevo molde y el nivel aún no está en store global por latencia (o L1 fallback)
  if (!isEditing && currentData.id_nivel && !dynamicLevels.includes(currentData.id_nivel)) {
      dynamicLevels.push(currentData.id_nivel);
      dynamicLevels.sort(); // Fallback sort
  }

  // Generador HSL determinístico (Golden Ratio) para garantizar infinitos colores coherentes
  const getHslForLevel = (levelIndex: number) => {
      const hue = (levelIndex * 137.5) % 360;
      return {
          bg: `hsl(${hue}, 70%, 95%)`,
          border: `hsl(${hue}, 60%, 80%)`,
          text: `hsl(${hue}, 80%, 25%)`
      };
  };

  return (
    <section className={`bg-[#ffffff] rounded-sm relative overflow-hidden shadow-inner border border-[#d0dbec] flex flex-col styled-scrollbar ${className}`}>
       <h3 className="absolute top-4 left-4 text-[#5f030a] text-[9px] font-mono tracking-[0.2em] font-bold uppercase z-50 bg-white/90 px-3 py-1.5 rounded shadow-sm border border-[#dec0bd]">
         Topología Arquitectónica
       </h3>
       <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pt-16 px-6 pb-6 p-4">
          {dynamicLevels.map((nivelStr, index) => {
             const moldesNivel = tiposEntidadDb.filter(t => t.nivel === nivelStr);
             if (moldesNivel.length === 0 && (!currentData.id_molde || currentData.id_nivel !== nivelStr)) return null;

             const { bg, border, text } = getHslForLevel(index);

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
                             <div 
                                key={m.id_tipo} 
                                onClick={() => onNodeClick && onNodeClick(m.id_tipo)}
                                className={`p-2 rounded-sm border shadow-sm flex flex-col min-w-[120px] max-w-[150px] transition-all relative cursor-pointer ${isActive ? 'ring-2 ring-offset-1 scale-[1.02] z-10' : 'opacity-80 hover:opacity-100 hover:scale-[1.02]'}`} 
                                style={{ backgroundColor: bg, borderColor: isActive ? text : border }}
                             >
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
