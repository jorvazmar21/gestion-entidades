import React, { useState, useEffect } from 'react';
import { SafeImage } from '../SafeImage';
import { ImportWizardModal } from '../generics/ImportWizardModal';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useUiStore } from '../../store/useUiStore';
import { EntityWorkspace } from '../generics/EntityWorkspace';

interface SandboxGridScreenProps {
  onBack: () => void;
}

export const SandboxGridScreenV2: React.FC<SandboxGridScreenProps> = ({ onBack }) => {

  const [activeMolde, setActiveMolde] = useState<string>('EMP');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const LAYOUT = useLayoutStore();
  const setModule = useUiStore(state => state.setModule);

  useEffect(() => {
    setModule(activeMolde);
  }, [activeMolde, setModule]);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8f9ff] flex flex-col font-['Inter']">
      {/* HEADER */}
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_raw.svg" fallbackType="svg" wrapperClassName="w-8 h-8 filter hue-rotate-[270deg]" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Sandbox: Hierarchical Grid V2
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">ENTORNO DE PRUEBAS AISLADO</span>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <button 
             onClick={onBack}
             className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             INICIO
           </button>
         </div>
      </header>

      {/* TOOLBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-10 w-full">
         <div className="flex items-center gap-4">
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Simular Molde:</span>
             <select 
                value={activeMolde}
                onChange={(e) => setActiveMolde(e.target.value)}
                className="font-bold text-sm w-48 text-center text-[#7f1d1d] uppercase tracking-wider bg-white border border-[#d0dbec] rounded py-1 px-2 cursor-pointer focus:outline-none focus:border-[#7f1d1d] shadow-sm"
             >
                <option value="EMP">M_EMP (Empresas)</option>
                <option value="OBR">M_OBR (Obras)</option>
             </select>
         </div>
         <div className="flex items-center gap-2">
            <button 
               onClick={() => setIsWizardOpen(true)}
               className="bg-white hover:bg-gray-100 text-[#1e293b] text-[10px] font-bold tracking-wider px-3 py-1.5 border border-[#1e293b] rounded-sm transition-colors uppercase shadow-sm flex items-center gap-2"
            >
               <span>🪄</span> CARGA MASIVA (CSV)
            </button>
            <button className="px-3 py-1.5 bg-[#7f1d1d] hover:bg-[#5f1515] text-white rounded text-[10px] font-bold transition-colors uppercase cursor-pointer shadow-sm">
               ➕ Añadir Entidad
            </button>
            {isWizardOpen && (
               <ImportWizardModal 
                   isOpen={isWizardOpen} 
                   onClose={() => setIsWizardOpen(false)} 
                   initialMoldeId={activeMolde} 
               />
            )}
         </div>
      </div>

      {/* CONTENT DATAGRID - MOCK ZONA 6 LAYOUT */}
      <main className="flex-1 flex w-full bg-slate-100 overflow-hidden relative">
          
          {/* FAKE LEFT SIDEBAR (Zona 1-3) */}
          <div className="shrink-0 bg-white border-r border-[#d0dbec] hidden md:flex flex-col items-center justify-center shadow-sm z-10" style={{ width: LAYOUT.anchoColumnaIzquierda }}>
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center px-4">
               Simulación<br/>Barra Izquierda<br/>({LAYOUT.anchoColumnaIzquierda}px)
             </span>
          </div>

          {/* FAKE CENTER (Zona 4-8) */}
          {/* CENTER ZONES (Zona 4-8) */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-white">
              
              {/* ZONA 4 FAKE (Cabecera Superior) */}
              <div className="shrink-0 bg-white border-b border-[#d0dbec] flex items-center justify-center px-4" style={{ height: LAYOUT.altoFilaSuperior }}>
                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Zona 4: Fake Fases / Nav</span>
              </div>

              {/* ZONA 5 Y 6 (Súper-Silo Data-Driven) */}
              <EntityWorkspace blueprintId={`VIEW_${activeMolde === 'EMP' ? 'PROVEDORES' : 'OBRAS'}_MASTER`} />

              {/* Fake Bottom (Zona 7/8) */}
              <div className="shrink-0 bg-white border-t border-[#d0dbec] flex items-center justify-center" style={{ height: LAYOUT.altoZonasInferiores }}>
                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Zonas 7 y 8 (Informes y Botonera)<br/>({LAYOUT.altoZonasInferiores}px)</span>
              </div>
          </div>

          {/* FAKE RIGHT SIDEBAR (Zona 9-10) */}
          <div className="shrink-0 bg-white border-l border-[#d0dbec] hidden lg:flex flex-col items-center justify-center shadow-sm z-10" style={{ width: LAYOUT.anchoColumnaDerecha }}>
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center px-4">
               Simulación<br/>Inspector PSet<br/>({LAYOUT.anchoColumnaDerecha}px)
             </span>
          </div>

      </main>
    </div>
  );
};
