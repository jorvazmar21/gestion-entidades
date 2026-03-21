/**
 * @module ModulePhases
 * @description Botonera de filtrado exclusivo de fases (Zona 2).
 * @inputs useUiStore.activeFase.
 * @actions Alterna de forma excluyente el filtrado del estado 'Fase'.
 * @files src/components/ModulePhases.tsx
 */
import React from 'react';
import { useUiStore } from '../store/useUiStore';

export const ModulePhases: React.FC = () => {
  const activeModuleId = useUiStore(state => state.activeModuleId);
  const activeFase = useUiStore(state => state.activeFase);
  const setActiveFase = useUiStore(state => state.setActiveFase);

  // Solo renderizar si estamos dentro de un módulo de datos
  if (!activeModuleId) return null;

  const phases = ['ESTUDIO', 'LICITACIÓN', 'ADJUDICADAS', 'EJECUCIÓN', 'GARANTÍA', 'COMPLETADAS'];

  return (
    <div className="flex items-center justify-center gap-1.5 px-2 h-full font-['Inter'] select-none w-full max-w-5xl mx-auto overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {phases.map(fase => {
        const isActive = activeFase === fase;
        return (
          <button
            key={fase}
            onClick={() => setActiveFase(isActive ? null : fase)}
            className={`shrink-0 px-2.5 py-1.5 text-[9px] uppercase tracking-wider font-bold border rounded-[3px] transition-all outline-none
              ${isActive 
                ? 'border-[#8c1d18] text-[#8c1d18] bg-red-50/20 shadow-sm ring-1 ring-[#8c1d18]' 
                : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
              }
            `}
          >
            {fase}
          </button>
        );
      })}
    </div>
  );
};
