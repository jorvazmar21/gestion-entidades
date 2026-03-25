import React from 'react';

interface Props {
  tiposEntidadDb: any[];
  currentData: any;
  currentChildren: string[];
  toggleChild: (id: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const PhaseBChildren: React.FC<Props> = ({
  tiposEntidadDb, currentData, currentChildren, toggleChild, handleChange
}) => {
  return (
    <div className="bg-[#ffffff] p-5 rounded-sm border-l-4 border-[#7f1d1d] shadow-sm flex-1 flex flex-col relative overflow-hidden min-h-0">
       <h3 className="text-[11px] font-bold text-[#5f030a] uppercase mb-3 tracking-widest relative z-10 shrink-0">Fase B: Hijos Admitidos</h3>
       <div className="flex flex-wrap content-start gap-2 mb-4 relative z-10 flex-1 overflow-y-auto styled-scrollbar pr-2">
          {tiposEntidadDb.filter(t => t.id_tipo !== currentData.id_molde).map(t => {
             const isActive = currentChildren.includes(t.id_tipo);
             return (
                <button 
                   key={t.id_tipo} 
                   onClick={() => toggleChild(t.id_tipo)}
                   className={`cursor-pointer px-2.5 py-1 rounded-sm text-[9px] font-bold border flex items-center gap-1.5 transition-all ${isActive ? 'bg-[#27313f] text-white border-[#121c2a] shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                >
                   <span>{t.nombre}</span>
                   {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#dec0bd]"></div>}
                </button>
             );
          })}
       </div>
       <div className="relative z-10 grid grid-cols-2 gap-4 shrink-0 pt-4 border-t border-gray-100 pb-2">
          <div>
             <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Mínimo Obligatorio</label>
             <input type="number" name="min_count" min="0" value={currentData.min_count} onChange={handleChange} placeholder="0 = Opcional" className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] focus:bg-white focus:outline-none" />
          </div>
          <div>
             <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Tope Máximo</label>
             <input type="number" name="max_count" min="0" value={currentData.max_count} onChange={handleChange} placeholder="Vacío = Infinito" className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] focus:bg-white focus:outline-none" />
          </div>
       </div>
    </div>
  );
};
