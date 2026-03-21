import React from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { useUiStore } from '../store/useUiStore';
import { SafeImage } from './SafeImage';

// === COMPONENTE TABIQUE (SPLITTER FÍSICO) ===
const Tabique = ({ 
   orientation, 
   onDrag, 
   className 
}: { 
   orientation: 'vertical' | 'horizontal', 
   onDrag: (e: MouseEvent) => void, 
   className?: string 
}) => {
   const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      const handleMouseMove = (mouseEvent: MouseEvent) => onDrag(mouseEvent);
      const handleMouseUp = () => {
         window.removeEventListener('mousemove', handleMouseMove);
         window.removeEventListener('mouseup', handleMouseUp);
         document.body.style.cursor = 'default';
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
   };

   return (
      <div 
         onMouseDown={handleMouseDown}
         className={`flex items-center justify-center bg-slate-300 hover:bg-red-400 transition-colors z-30 shadow-[0_0_5px_rgba(0,0,0,0.1)] shrink-0 ${
             orientation === 'vertical' ? 'w-[6px] h-full cursor-col-resize flex-col' : 'h-[6px] w-full cursor-row-resize'
         } ${className || ''}`}
      >
         <div className={`bg-slate-500 rounded-full ${orientation === 'vertical' ? 'w-[2px] h-[30px]' : 'h-[2px] w-[30px]'}`}></div>
      </div>
   );
};

export function LayoutConfigScreen() {
  const LAYOUT = useLayoutStore();
  const updateLayoutParam = useLayoutStore(state => state.updateLayoutParam);
  const setScreen = useUiStore(state => state.setScreen);

  return (
    <div className="flex flex-col bg-[#242424] font-['Inter'] absolute inset-0 w-full h-full overflow-hidden">
      
      {/* HEADER MODO EDICIÓN (No manipulable) */}
      <div className="w-full h-[60px] shrink-0 bg-yellow-400 z-50 flex items-center justify-between px-6 shadow-xl border-b-[4px] border-yellow-600">
        <div className="flex items-center gap-4">
          <SafeImage src="/icons/sys_wysiwyg.svg" fallbackType="svg" wrapperClassName="w-8 h-8 animate-pulse" className="w-full h-full object-contain" />
          <div>
            <h1 className="text-yellow-900 font-bold text-lg tracking-widest uppercase">Modo Edición Geométrica</h1>
            <p className="text-yellow-800 text-xs font-semibold">Taller WYSIWYG - Arrastra los Tabiques grises para redimensionar las 10 zonas</p>
          </div>
        </div>
        <button 
          onClick={() => setScreen('HOME')}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold text-xs uppercase tracking-widest shadow-md transition-colors border border-red-800"
        >
          Guardar y Salir
        </button>
      </div>

      {/* CLON VISUAL DEL LAYOUT FUNCIONAL CON TABIQUES FÍSICOS (TECHO A SUELO) */}
      <div className="flex-1 flex w-full h-full bg-slate-100 overflow-hidden relative">
          
          {/* ======================= COLUMNA IZQUIERDA ======================= */}
          <aside className="shrink-0 bg-red-50 flex flex-col h-full" style={{ width: LAYOUT.anchoColumnaIzquierda }}>
             {/* ZONA 1 (Izquierda): CABECERA */}
             <div className="w-full shrink-0 flex items-center bg-blue-50 px-4" style={{ height: LAYOUT.altoFilaSuperior }}>
               <span className="text-[11px] text-blue-700 font-bold uppercase truncate">Z1: CABECERA IZQ</span>
             </div>
             
             {/* TABIQUE HORIZONTAL (Controla altoFilaSuperior global) */}
             <Tabique orientation="horizontal" onDrag={(e) => updateLayoutParam('altoFilaSuperior', Math.max(30, e.clientY - 60))} />

             {/* ZONA 2: FILA 2 ADN */}
             <div className="w-full shrink-0 flex flex-col justify-center items-center bg-red-100" style={{ height: LAYOUT.altoFila2 }}>
               <span className="text-[10px] text-red-800 font-bold uppercase">Z2: ADN Administrador</span>
             </div>
             
             {/* TABIQUE HORIZONTAL (Controla altoFila2 global) */}
             <Tabique orientation="horizontal" onDrag={(e) => updateLayoutParam('altoFila2', Math.max(30, e.clientY - 60 - LAYOUT.altoFilaSuperior - 6))} />
             
             {/* ZONA 3: ESPACIO LIBRE IZQ */}
             <div className="flex-1 p-4 bg-white/40 flex items-center justify-center">
                <span className="text-[10px] text-red-500 font-bold uppercase text-center">Z3: Espacio Libre Izq</span>
             </div>
             
             {/* TABIQUE HORIZONTAL (Controla altoZonaBdD) */}
             <Tabique orientation="horizontal" onDrag={(e) => updateLayoutParam('altoZonaBdD', Math.max(30, window.innerHeight - e.clientY))} />
             
             {/* ZONA 4: SYSTEM NODE */}
             <div className="w-full shrink-0 bg-red-200 shadow-inner flex items-center justify-center" style={{ height: LAYOUT.altoZonaBdD }}>
                <span className="text-[10px] text-red-900 font-bold uppercase">Z4: System Node</span>
             </div>
          </aside>

          {/* TABIQUE VERTICAL: ANCHO COLUMNA IZQUIERDA (AHORA ATRAVIESA TODO DE TECHO A SUELO) */}
          <Tabique orientation="vertical" onDrag={(e) => updateLayoutParam('anchoColumnaIzquierda', Math.max(100, Math.min(e.clientX, window.innerWidth - 300)))} />


          {/* ======================= COLUMNA CENTRAL ======================= */}
          <main className="flex-1 flex flex-col bg-yellow-50 h-full overflow-hidden">
             {/* ZONA 1 (Central): CABECERA */}
             <div className="w-full shrink-0 flex items-center justify-center bg-green-50 px-4" style={{ height: LAYOUT.altoFilaSuperior }}>
               <span className="text-[11px] text-green-700 font-bold uppercase truncate">Z1: CABECERA CENTRAL</span>
             </div>
             
             <Tabique orientation="horizontal" onDrag={(e) => updateLayoutParam('altoFilaSuperior', Math.max(30, e.clientY - 60))} />

             {/* ZONA 5: FILA 2 RUTAS */}
             <div className="w-full shrink-0 flex flex-col justify-center items-center bg-yellow-100" style={{ height: LAYOUT.altoFila2 }}>
               <span className="text-[10px] text-yellow-800 font-bold uppercase">Z5: Panel de Rutas / Buscador</span>
             </div>
             
             <Tabique orientation="horizontal" onDrag={(e) => updateLayoutParam('altoFila2', Math.max(30, e.clientY - 60 - LAYOUT.altoFilaSuperior - 6))} />
             
             {/* ZONA 6: CANVAS MACRO */}
             <div className="flex-1 p-4 bg-white/60 shadow-inner flex items-center justify-center">
                <span className="text-xl text-yellow-700/50 font-black uppercase tracking-[0.2em]">Z6: Macro Canvas Principal</span>
             </div>
             
             <Tabique orientation="horizontal" onDrag={(e) => updateLayoutParam('altoZonasInferiores', Math.max(30, window.innerHeight - e.clientY))} />
             
             {/* SUB ZONAS INFERIORES */}
             <div className="w-full shrink-0 flex items-stretch bg-white" style={{ height: LAYOUT.altoZonasInferiores }}>
                {/* ZONA 7: BOTONERAS */}
                <div className="shrink-0 flex items-center justify-center bg-orange-50" style={{ width: LAYOUT.anchoBotonera }}>
                   <span className="text-[10px] text-orange-800 font-bold uppercase">Z7: Panel Botoneras</span>
                </div>

                <Tabique orientation="vertical" className="!bg-slate-400" onDrag={(e) => updateLayoutParam('anchoBotonera', Math.max(50, e.clientX - LAYOUT.anchoColumnaIzquierda - 6))} />

                {/* ZONA 8: INFORMES */}
                <div className="flex-1 flex items-center justify-center bg-amber-50">
                   <span className="text-[10px] text-amber-800 font-bold uppercase">Z8: Panel Informes</span>
                </div>
             </div>
          </main>


          {/* TABIQUE VERTICAL: ANCHO COLUMNA DERECHA */}
          <Tabique orientation="vertical" onDrag={(e) => updateLayoutParam('anchoColumnaDerecha', Math.max(100, window.innerWidth - e.clientX))} />


          {/* ======================= COLUMNA DERECHA ======================= */}
          <aside className="shrink-0 bg-indigo-50 flex flex-col h-full" style={{ width: LAYOUT.anchoColumnaDerecha }}>
             {/* ZONA 1 (Derecha): CABECERA */}
             <div className="w-full shrink-0 flex items-center justify-end bg-purple-50 px-4" style={{ height: LAYOUT.altoFilaSuperior }}>
               <span className="text-[11px] text-purple-700 font-bold uppercase truncate">Z1: CABECERA DER</span>
             </div>
             
             <Tabique orientation="horizontal" onDrag={(e) => updateLayoutParam('altoFilaSuperior', Math.max(30, e.clientY - 60))} />

             {/* ZONA 9: FILA 2 PESTAÑAS */}
             <div className="w-full shrink-0 flex flex-col justify-center items-center bg-indigo-100" style={{ height: LAYOUT.altoFila2 }}>
               <span className="text-[10px] text-indigo-800 font-bold uppercase">Z9: Pestañas Dinámicas</span>
             </div>
             
             <Tabique orientation="horizontal" onDrag={(e) => updateLayoutParam('altoFila2', Math.max(30, e.clientY - 60 - LAYOUT.altoFilaSuperior - 6))} />
             
             {/* ZONA 10: INSPECTOR */}
             <div className="flex-1 p-4 bg-white/40 flex items-center justify-center shadow-inner">
                <span className="text-[10px] text-indigo-500 font-bold uppercase text-center">Z10: Inspector PSets Vertical</span>
             </div>
          </aside>

      </div>
    </div>
  );
}
