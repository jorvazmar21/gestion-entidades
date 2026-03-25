import React from 'react';
import { SafeImage } from '../../SafeImage';

interface Props {
  onBack: () => void;
  activeMoldeId: string;
  setActiveMoldeId: (id: string) => void;
  tiposEntidadDb: any[];
}

export const MoldBuilderHeader: React.FC<Props> = ({
  onBack, activeMoldeId, setActiveMoldeId, tiposEntidadDb
}) => {

  const handlePrev = () => {
      const idx = tiposEntidadDb.findIndex(t => t.id_tipo === activeMoldeId);
      if (idx > 0) setActiveMoldeId(tiposEntidadDb[idx - 1].id_tipo);
  };

  const handleNext = () => {
      const idx = tiposEntidadDb.findIndex(t => t.id_tipo === activeMoldeId);
      if (idx !== -1 && idx < tiposEntidadDb.length - 1) setActiveMoldeId(tiposEntidadDb[idx + 1].id_tipo);
  };

  return (
    <>
       {/* HEADER VIP CRIMSON LEDGER */}
       <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_forge.svg" fallbackType="svg" wrapperClassName="w-8 h-8 filter grayscale" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Diseñador ADN
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">ESCRITURA ESTRUCTURAL DE MOLDES (BLUEPRINT)</span>
           </div>
         </div>
         <div className="flex items-center gap-4">
           {/* SOLO 'INICIO' */}
           <button 
             onClick={onBack}
             className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             INICIO
           </button>
         </div>
       </header>

       {/* TOOLBAR SECUNDARIA ESTILO VISOR DE TABLAS */}
       <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-40 w-full">
         <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-[#121c2a] transition-colors uppercase cursor-pointer">
               ◀ Anterior
            </button>
            <select 
               value={activeMoldeId}
               onChange={(e) => setActiveMoldeId(e.target.value)}
               className={`text-sm min-w-[300px] text-center bg-white border border-[#d0dbec] rounded py-1 px-4 cursor-pointer focus:outline-none focus:border-[#7f1d1d] shadow-sm transition-colors ${activeMoldeId === '__NEW__' ? 'text-gray-500 font-normal italic' : 'text-[#7f1d1d] font-bold uppercase tracking-wider'}`}
            >
               <option value="__NEW__" className="text-gray-500 font-normal italic">Nuevo molde...</option>
               {tiposEntidadDb.map(t => (
                   <option key={t.id_tipo} value={t.id_tipo} className="text-[#121c2a] font-bold uppercase tracking-wider">{t.id_tipo} - {t.nombre.replace(/_/g, ' ')}</option>
               ))}
            </select>
            <button onClick={handleNext} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-[#121c2a] transition-colors uppercase cursor-pointer">
               Siguiente ▶
            </button>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-[10px] text-gray-500 font-mono font-bold bg-[#f1f3fc] px-4 py-1.5 rounded border border-[#d0dbec] uppercase tracking-widest">
                {tiposEntidadDb.length} Registrados
            </div>
         </div>
       </div>
    </>
  );
};
