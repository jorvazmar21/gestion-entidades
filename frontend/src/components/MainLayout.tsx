import React from 'react';
/**
 * @module MainLayout
 * @description Estructura maestra de la aplicación de 3 columnas ajustables (Ledger Layout).
 * @inputs activeModuleId (para cargar los datos pertinentes en la zona central).
 * @actions Construye el esqueleto visual, inyecta los tabiques divisores paramétricos y hospeda el contenido central.
 * @files src/components/MainLayout.tsx
 */
import { useLayoutStore } from '../store/useLayoutStore';

interface MainLayoutProps {
  activeModuleId: string | null;
  onNavigateHome: () => void;
}

// Separador inteligente que reacciona a la directriz del Administrador
const SimpleDivider = ({ vertical = false }: { vertical?: boolean }) => {
  const mostrar = useLayoutStore(state => state.mostrarTabiques);
  return (
    <div className={`shrink-0 transition-colors duration-500 ease-in-out ${vertical ? 'w-[6px] h-full' : 'h-[6px] w-full'} ${mostrar ? 'bg-slate-300 shadow-inner' : 'bg-transparent'}`}></div>
  );
};

export function MainLayout({ activeModuleId, onNavigateHome }: MainLayoutProps) {
  const LAYOUT = useLayoutStore();

  return (
    <div className="flex bg-slate-100 font-['Inter'] absolute inset-0 w-full h-full overflow-hidden">
      
        {/* ================= COLUMNA IZQUIERDA ================= */}
        <aside className="shrink-0 bg-white flex flex-col h-full z-10" style={{ width: LAYOUT.anchoColumnaIzquierda }}>
           {/* HEADER IZQ */}
           <div className="w-full shrink-0 bg-white flex items-center border-b border-gray-200" style={{ height: LAYOUT.altoFilaSuperior }}></div>
           
           <SimpleDivider />

           {/* ZONA 2: ADN */}
           <div className="w-full shrink-0 bg-slate-50 flex items-center justify-center border-b border-gray-200" style={{ height: LAYOUT.altoFila2 }}>
             <span className="text-xs font-bold text-gray-500">Panel ADN</span>
           </div>
           
           <SimpleDivider />
           
           {/* ZONA 3: ESPACIO LIBRE */}
           <div className="flex-1 p-4 bg-white overflow-y-auto">
              <div className="text-xs text-gray-400">Espacio Libre Izquierda</div>
           </div>
           
           <SimpleDivider />
           
           {/* ZONA 4: SYSTEM NODE */}
           <div className="w-full shrink-0 bg-slate-100 flex items-center justify-center border-t border-gray-200" style={{ height: LAYOUT.altoZonaBdD }}>
              <span className="text-xs font-bold text-gray-600">System Node</span>
           </div>
        </aside>

        <SimpleDivider vertical />

        {/* ================= COLUMNA CENTRAL ================= */}
        <main className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
           {/* HEADER CENTRAL */}
           <div className="w-full shrink-0 bg-white flex items-center justify-center border-b border-gray-200 px-4" style={{ height: LAYOUT.altoFilaSuperior }}>
              <span className="text-[11px] text-gray-700 font-bold uppercase tracking-widest text-center truncate w-full">PANEL GLOBAL CENTRAL</span>
           </div>
           
           <SimpleDivider />

           {/* ZONA 5: BREADCRUMBS */}
           <div className="w-full shrink-0 bg-white shadow-sm flex items-center px-6" style={{ height: LAYOUT.altoFila2 }}>
             <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">{activeModuleId || 'CARGANDO MÓDULO'}</span>
           </div>
           
           <SimpleDivider />
           
           {/* ZONA 6: CANVAS MACRO */}
           <div className="flex-1 p-6 relative">
              <div className="absolute inset-4 border rounded shadow-sm bg-white flex items-center justify-center">
                 <span className="text-lg text-slate-300 font-bold uppercase text-center w-full">ZONA 6: Canvas (Listados Principales)<br/><span className="text-xs text-slate-400 font-normal">Pendiente de Ensamblaje</span></span>
              </div>
           </div>
           
           <SimpleDivider />
           
           {/* SUB ZONAS INFERIORES */}
           <div className="w-full shrink-0 flex items-stretch bg-slate-100" style={{ height: LAYOUT.altoZonasInferiores }}>
              {/* ZONA 7: BOTONERAS */}
              <div className="shrink-0 flex items-center justify-center bg-white border border-slate-200 shadow-sm m-2 mr-0 rounded" style={{ width: LAYOUT.anchoBotonera - 8 }}>
                 <span className="text-xs font-bold text-slate-400">ZONA 7: Botoneras</span>
              </div>

              {/* Usamos el divider inteligente porque es una zona dinámica y arrastrable */}
              <div className="px-1"><SimpleDivider vertical /></div>

              {/* ZONA 8: INFORMES */}
              <div className="flex-1 flex items-center justify-center bg-white border border-slate-200 shadow-sm m-2 ml-0 rounded">
                 <span className="text-xs font-bold text-slate-400">ZONA 8: Resúmenes e Informes Rápido</span>
              </div>
           </div>
        </main>

        <SimpleDivider vertical />

        {/* ================= COLUMNA DERECHA ================= */}
        <aside className="shrink-0 bg-white flex flex-col h-full shadow-sm z-10" style={{ width: LAYOUT.anchoColumnaDerecha }}>
           {/* HEADER DERECHO (Botón Cerrar) */}
           <div className="w-full shrink-0 bg-white flex items-center justify-end px-4 border-b border-gray-200" style={{ height: LAYOUT.altoFilaSuperior }}>
              <button onClick={onNavigateHome} className="text-[10px] font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded uppercase tracking-widest transition-colors">CERRAR MÓDULO</button>
           </div>
           
           <SimpleDivider />

           {/* ZONA 9: PESTAÑAS */}
           <div className="w-full shrink-0 bg-slate-50 flex items-center justify-center border-b border-gray-200" style={{ height: LAYOUT.altoFila2 }}>
             <span className="text-xs font-bold text-gray-500">Pestañas Inspector</span>
           </div>
           
           <SimpleDivider />
           
           {/* ZONA 10: INSPECTOR */}
           <div className="flex-1 p-4 bg-white overflow-y-auto">
              <span className="text-xs text-slate-400">ZONA 10: Inspector de PSets</span>
           </div>
        </aside>

    </div>
  );
}
