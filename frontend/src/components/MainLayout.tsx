
/**
 * @module MainLayout
 * @description Estructura maestra de la aplicación de 3 columnas ajustables (Ledger Layout).
 * @inputs activeModuleId (para cargar los datos pertinentes en la zona central).
 * @actions Construye el esqueleto visual, inyecta los tabiques divisores paramétricos y hospeda el contenido central.
 * @files src/components/MainLayout.tsx
 */
import { useLayoutStore } from '../store/useLayoutStore';
import { useUiStore } from '../store/useUiStore';
import { SystemBreadcrumbs } from './SystemBreadcrumbs';
import { SystemHeaderLogo } from './SystemHeaderLogo';
import { ModuleTitle } from './ModuleTitle';
import { ModuleSearch } from './ModuleSearch';
import { SystemTopRightActions } from './SystemTopRightActions';
import { ModulePhases } from './ModulePhases';
import { ModuleDepartments } from './ModuleDepartments';
// Separador inteligente que reacciona a la directriz del Administrador
const SimpleDivider = ({ vertical = false }: { vertical?: boolean }) => {
  const mostrar = useLayoutStore(state => state.mostrarTabiques);
  return (
    <div className={`shrink-0 transition-colors duration-500 ease-in-out ${vertical ? 'w-[6px] h-full' : 'h-[6px] w-full'} ${mostrar ? 'bg-slate-300' : 'bg-transparent'}`}></div>
  );
};

export function MainLayout() {
  const LAYOUT = useLayoutStore();
  const { activePSetTab, setActivePSetTab } = useUiStore();

  return (
    <div className="flex bg-white font-['Inter'] absolute inset-0 w-full h-full overflow-hidden">
      
        {/* ================= COLUMNA IZQUIERDA ================= */}
        <aside className="shrink-0 bg-white flex flex-col h-full z-10" style={{ width: LAYOUT.anchoColumnaIzquierda }}>
           {/* HEADER IZQ */}
           <div className="w-full shrink-0 bg-white flex items-center" style={{ height: LAYOUT.altoFilaSuperior }}>
             <SystemHeaderLogo />
           </div>
           
           <SimpleDivider />

           {/* ZONA 2: ADN */}
           <div className="w-full shrink-0 bg-white flex items-center justify-center" style={{ height: LAYOUT.altoFila2 }}>
             <span className="text-xs font-bold text-gray-500">Panel ADN</span>
           </div>
           
           <SimpleDivider />
           
           {/* ZONA 3: PANEL LATERAL DE DEPARTAMENTOS */}
           <div className="flex-1 bg-white overflow-y-auto w-full relative">
              <ModuleDepartments />
           </div>
           
           <SimpleDivider />
           
           {/* ZONA 4: SYSTEM NODE */}
           <div className="w-full shrink-0 bg-white flex items-center justify-center" style={{ height: LAYOUT.altoZonaBdD }}>
              <span className="text-xs font-bold text-gray-600">System Node</span>
           </div>
        </aside>

        <SimpleDivider vertical />

        {/* ================= COLUMNA CENTRAL ================= */}
        <main className="flex-1 flex flex-col bg-white h-full overflow-hidden">
           {/* HEADER CENTRAL (Filtros Excluyentes de Fase) */}
           <div className="w-full shrink-0 bg-white flex items-center justify-center" style={{ height: LAYOUT.altoFilaSuperior }}>
              <ModulePhases />
           </div>
           
           <SimpleDivider />

           {/* ZONA 5: PANEL DE COMANDO (Breadcrumbs + Toolbar) */}
           <div className="w-full shrink-0 flex flex-col bg-white" style={{ height: LAYOUT.altoFila2 }}>
             {/* 25% TOP: Ariadna */}
             <div className="w-full shrink-0" style={{ height: `${LAYOUT.z5_ratio_top}%` }}>
               <SystemBreadcrumbs />
             </div>
             
             {/* 75% BOTTOM: Toolbar Modular */}
             <div className="w-full flex-1 flex items-center">
                {/* IZQUIERDA: 35% (Título) */}
                <div className="h-full shrink-0 flex items-center" style={{ width: `${LAYOUT.z5_toolbar_left}%` }}>
                   <ModuleTitle />
                </div>
                
                {/* CENTRO: 30% (Buscador Global) */}
                <div className={`h-full shrink-0 flex items-center justify-center ${LAYOUT.mostrarTabiques ? 'border border-dashed border-slate-300 bg-slate-50' : ''}`} style={{ width: `${LAYOUT.z5_toolbar_mid}%` }}>
                   <ModuleSearch />
                </div>
                
                {/* DERECHA: 30% (Reservado Botonera) */}
                <div className={`h-full shrink-0 flex items-center justify-center ${LAYOUT.mostrarTabiques ? 'border border-dashed border-slate-300 bg-slate-50' : ''}`} style={{ width: `${LAYOUT.z5_toolbar_right}%` }}>
                   {LAYOUT.mostrarTabiques && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">HERRAMIENTAS (30%)</span>}
                </div>
             </div>
           </div>
           
           <SimpleDivider />
           
           {/* ZONA 6: CANVAS MACRO */}
           <div className="flex-1 p-6 relative">
              <div className="absolute inset-4 bg-white flex items-center justify-center">
                 <span className="text-lg text-slate-300 font-bold uppercase text-center w-full">ZONA 6: Canvas (Listados Principales)<br/><span className="text-xs text-slate-400 font-normal">Pendiente de Ensamblaje</span></span>
              </div>
           </div>
           
           <SimpleDivider />
           
           {/* SUB ZONAS INFERIORES */}
           <div className="w-full shrink-0 flex items-stretch bg-white" style={{ height: LAYOUT.altoZonasInferiores }}>
              {/* ZONA 7: BOTONERAS */}
              <div className="shrink-0 flex items-center justify-center bg-white m-2 mr-0" style={{ width: LAYOUT.anchoBotonera - 8 }}>
                 <span className="text-xs font-bold text-slate-400">ZONA 7: Botoneras</span>
              </div>

              {/* Usamos el divider inteligente porque es una zona dinámica y arrastrable */}
              <div className="px-1"><SimpleDivider vertical /></div>

              {/* ZONA 8: INFORMES */}
              <div className="flex-1 flex items-center justify-center bg-white m-2 ml-0">
                 <span className="text-xs font-bold text-slate-400">ZONA 8: Resúmenes e Informes Rápido</span>
              </div>
           </div>
        </main>

        <SimpleDivider vertical />

        {/* ================= COLUMNA DERECHA ================= */}
        <aside className="shrink-0 bg-white flex flex-col h-full z-10" style={{ width: LAYOUT.anchoColumnaDerecha }}>
           {/* HEADER DERECHO (Acciones de Sesión) */}
           <div className="w-full shrink-0 bg-white flex items-center justify-end" style={{ height: LAYOUT.altoFilaSuperior }}>
              <SystemTopRightActions />
           </div>
           
           <SimpleDivider />

           {/* ZONA 9: PESTAÑAS PSET */}
           <div className="w-full shrink-0 bg-[#f8f9ff] flex items-end justify-center px-4 pt-4 border-b border-gray-200" style={{ height: LAYOUT.altoFila2 }}>
             <div className="w-full flex">
               <button 
                 onClick={() => setActivePSetTab?.('ESTATICO')}
                 className={`flex-1 py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 transition-colors ${activePSetTab === 'ESTATICO' ? 'border-[#7f1d1d] text-[#7f1d1d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                 Estáticas
               </button>
               <button 
                 onClick={() => setActivePSetTab?.('DINAMICO')}
                 className={`flex-1 py-2 text-[11px] uppercase tracking-widest font-bold border-b-2 transition-colors ${activePSetTab === 'DINAMICO' ? 'border-[#7f1d1d] text-[#7f1d1d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                 Dinámicas
               </button>
             </div>
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
