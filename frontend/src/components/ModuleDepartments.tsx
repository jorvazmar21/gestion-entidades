/**
 * @module ModuleDepartments
 * @description Botonera lateral de filtrado exclusivo de departamentos (Zona 4).
 * @inputs useUiStore.activeDepartamento.
 * @actions Alterna de forma excluyente el filtrado del estado 'Departamento'.
 * @files src/components/ModuleDepartments.tsx
 */
import React from 'react';
import { useUiStore } from '../store/useUiStore';
import { SafeImage } from './SafeImage';

export const ModuleDepartments: React.FC = () => {
  const activeModuleId = useUiStore(state => state.activeModuleId);
  const activeDepartamento = useUiStore(state => state.activeDepartamento);
  const setActiveDepartamento = useUiStore(state => state.setActiveDepartamento);

  if (!activeModuleId) return null;

  const depts = [
    { id: 'ESTUDIOS', icon: 'dept_estudios' },
    { id: 'ADMINISTRACIÓN', icon: 'dept_administracion' },
    { id: 'RRHH', icon: 'dept_rrhh' },
    { id: 'PRL', icon: 'dept_prl' },
    { id: 'CALIDAD', icon: 'dept_calidad' },
    { id: 'MEDIOAMBIENTE', icon: 'dept_medioambiente' },
    { id: 'OF. TÉCNICA', icon: 'dept_of_tecnica' },
    { id: 'PRODUCCIÓN', icon: 'dept_produccion' },
    { id: 'DIRECCIÓN', icon: 'dept_direccion' }
  ];

  return (
    <div className="flex flex-col w-full px-2 py-2 gap-1 font-['Inter'] select-none">
      {depts.map(dept => {
        const isActive = activeDepartamento === dept.id;
        return (
          <button
            key={dept.id}
            onClick={() => setActiveDepartamento(isActive ? null : dept.id)}
            className={`w-full flex items-center px-2 py-1.5 border rounded-[3px] transition-all outline-none 
              ${isActive 
                ? 'border-[#8c1d18] text-[#8c1d18] bg-red-50/20 shadow-sm ring-1 ring-[#8c1d18]' 
                : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
             <SafeImage 
               src={`/icons/${dept.icon}.svg`} 
               fallbackType="svg" 
               className={`w-[13px] h-[13px] mr-2 shrink-0 transition-colors 
                 ${isActive ? 'text-[#8c1d18]' : 'text-slate-400 opacity-60'}`} 
             />
             <span className={`text-[9px] uppercase tracking-wider truncate mt-0.5
               ${isActive ? 'font-bold text-[#8c1d18]' : 'font-bold text-slate-500'}`}>
               {dept.id}
             </span>
          </button>
        );
      })}
    </div>
  );
};
