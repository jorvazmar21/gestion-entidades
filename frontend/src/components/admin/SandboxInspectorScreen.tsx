import React from 'react';
import { SafeImage } from '../SafeImage';
import { useUiStore } from '../../store/useUiStore';
import { PSetInspector } from '../generics/PSetInspector';

interface SandboxInspectorScreenProps {
  onBack: () => void;
}

export const SandboxInspectorScreen: React.FC<SandboxInspectorScreenProps> = ({ onBack }) => {
  const activeTab = useUiStore(state => state.activePSetTab);
  const setActiveTab = useUiStore(state => state.setActivePSetTab);
  const selectedEntity = useUiStore(state => state.selectedEntityId);
  const setSelectedEntity = useUiStore(state => state.setSelectedEntityId);

  // MOCK DE ENTIDADES PARA SELECCIONAR
  const mockEntities = [
    { id: 'ENT-EMP-001', codigo: 'CL-001', nombre: 'Dragados S.A.' },
    { id: 'ENT-EMP-002', codigo: 'PR-452', nombre: 'Hilti España' },
    { id: 'ENT-EMP-003', codigo: 'UTE-01', nombre: 'UTE Túneles Norte' }
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8f9ff] flex flex-col font-['Inter']">
      {/* HEADER */}
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_diccionario.svg" fallbackType="svg" wrapperClassName="w-8 h-8 filter hue-rotate-[270deg]" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Sandbox: PSet Inspector
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">RENDERIZADO EAV Y FORMULARIOS VIVOS</span>
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

      {/* CONTENT DATAGRID */}
      <main className="flex-1 flex w-full p-6 bg-gray-200 overflow-hidden relative">
          <div className="max-w-[1600px] mx-auto w-full flex flex-1 gap-6 min-w-0 min-h-0">
              
              {/* LEFT PANE: MOCK GRID / LISTA */}
              <div className="w-[400px] flex flex-col shadow-lg bg-white border border-[#d0dbec] rounded-md overflow-hidden shrink-0">
                 <div className="bg-[#f1f3fc] border-b border-[#d0dbec] p-3">
                    <h3 className="text-xs font-bold text-[#7f1d1d] uppercase tracking-widest">Simulador: DataGrid (Zona 6)</h3>
                 </div>
                 <div className="p-4 flex-1 overflow-y-auto">
                    <p className="text-xs text-gray-500 mb-4">Haz click en una entidad para simular el evento de selección que activará el Inspector.</p>
                    <div className="flex flex-col gap-2">
                       {mockEntities.map(ent => (
                          <div 
                            key={ent.id}
                            onClick={() => setSelectedEntity(ent.id)}
                            className={`p-3 border rounded cursor-pointer transition-all ${selectedEntity === ent.id ? 'bg-[#fff1fa] border-[#7f1d1d] shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                          >
                             <div className="text-[10px] font-mono text-gray-400">{ent.id}</div>
                             <div className="font-bold text-sm text-gray-800">{ent.codigo} - {ent.nombre}</div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* RIGHT PANE: EL INSPECTOR (ZONA 10 + ZONA 9) */}
              <div className="w-[500px] flex flex-col shadow-lg bg-white border border-[#d0dbec] rounded-md overflow-hidden shrink-0 relative">
                 
                 {/* ZONA 9: TABS */}
                 <div className="w-full shrink-0 bg-[#f8f9ff] flex items-end justify-center px-4 pt-4 border-b border-gray-200">
                   <div className="w-full flex">
                     <button 
                       onClick={() => setActiveTab('ESTATICO')}
                       className={`flex-1 py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 transition-colors ${activeTab === 'ESTATICO' ? 'border-[#7f1d1d] text-[#7f1d1d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                     >
                       PSets Estáticas
                     </button>
                     <button 
                       onClick={() => setActiveTab('DINAMICO')}
                       className={`flex-1 py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 transition-colors ${activeTab === 'DINAMICO' ? 'border-[#7f1d1d] text-[#7f1d1d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                     >
                       PSets Dinámicas
                     </button>
                   </div>
                 </div>

                 {/* ZONA 10: CONTENIDO DEL INSPECTOR */}
                 <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 relative">
                     <PSetInspector entityId={selectedEntity} />
                 </div>
              </div>

          </div>
      </main>
    </div>
  );
};
