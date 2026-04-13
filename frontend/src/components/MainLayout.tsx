
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
import { ImportWizardModal } from './generics/ImportWizardModal';
import { PSetZone9, PSetZone10 } from './generics/PSetInspector';
import { EntityCanvasContainer } from './generics/EntityCanvasContainer';
import { EntityWorkspace } from './generics/EntityWorkspace';
import { ActionZonePanel } from './generics/ActionZonePanel';
import { useDataStore } from '../store/useDataStore';
import type { ContextPayload } from '../config/actionRegistry';
import { BLUEPRINTS } from '../config/viewBlueprints';
import React, { useState, useMemo } from 'react';

// Separador inteligente que reacciona a la directriz del Administrador
export const SimpleDivider = ({ vertical = false }: { vertical?: boolean }) => {
  const mostrar = useLayoutStore(state => state.mostrarTabiques);
  return (
    <div className={`shrink-0 transition-colors duration-500 ease-in-out ${vertical ? 'w-[6px] h-full' : 'h-[6px] w-full'} ${mostrar ? 'bg-slate-300' : 'bg-transparent'}`}></div>
  );
};

export function MainLayout() {
  const LAYOUT = useLayoutStore();
  const { activeModuleId, selectedEntityId, activeTabFilter, activeDetailTab, psetContextPayload } = useUiStore();
  const { db } = useDataStore();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Mapeo dinámico del módulo actual a su Blueprint (si existe)
  const getBlueprintIdForModule = (modId: string | null) => {
      switch (modId) {
          case 'AGE': return 'VIEW_AGENTES_MASTER';
          case 'SED': return 'VIEW_SEDES_MASTER';
          case 'OBR': return 'VIEW_OBRAS_MASTER';
          default: return null;
      }
  };

  const blueprintId = getBlueprintIdForModule(activeModuleId);
  const hasBlueprint = blueprintId && BLUEPRINTS[blueprintId];

  // Cálculo en vivo del context payload para alimentar la Z7 Action Engine
  const contextPayload: ContextPayload = useMemo(() => {
    let selectedEntityData = null;
    if (selectedEntityId) {
       selectedEntityData = db.find((e: any) => e.EMP_ID === selectedEntityId || e.id === selectedEntityId);
    }
    return {
      activeModuleId: hasBlueprint ? BLUEPRINTS[blueprintId].rootModule : (activeModuleId || null),
      activeTabFilter: activeTabFilter,
      selectedEntityId: selectedEntityId,
      selectedEntityData: selectedEntityData,
      activeDetailTab: activeDetailTab || undefined
    };
  }, [activeModuleId, activeTabFilter, selectedEntityId, activeDetailTab, db, blueprintId, hasBlueprint]);

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

           {/* ========================================================
               ZONA 5 Y ZONA 6: ESPACIO PRINCIPAL
               Si tenemos un Blueprint configurado para este módulo, 
               entregamos este espacio al nuevo EntityWorkspace.
               En caso contrario, se renderiza la UI antigua (Legacy).
           ======================================================== */}
           {hasBlueprint ? (
              <EntityWorkspace blueprintId={blueprintId} />
           ) : (
              <React.Fragment>
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
                      <div className={`h-full shrink-0 flex items-center justify-end pr-6 gap-2 ${LAYOUT.mostrarTabiques ? 'border border-dashed border-slate-300 bg-slate-50' : ''}`} style={{ width: `${LAYOUT.z5_toolbar_right}%` }}>
                         {LAYOUT.mostrarTabiques && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">HERRAMIENTAS (30%)</span>}
                         <button 
                              onClick={() => setIsWizardOpen(true)}
                              className="bg-white hover:bg-gray-100 text-[#1e293b] text-[10px] font-bold tracking-wider px-3 py-1.5 border border-[#1e293b] rounded-sm transition-colors uppercase shadow-sm flex items-center gap-2"
                         >
                              <span>🪄</span> CARGA MASIVA (CSV)
                         </button>
                         {isWizardOpen && (
                              <ImportWizardModal 
                                  isOpen={isWizardOpen} 
                                  onClose={() => setIsWizardOpen(false)} 
                                  initialMoldeId={activeModuleId || ''} 
                              />
                         )}
                      </div>
                   </div>
                 </div>
                 
                 <SimpleDivider />
                 
                 {/* ZONA 6: CANVAS MACRO */}
                 <div className="flex-1 p-6 relative">
                    <EntityCanvasContainer />
                 </div>
              </React.Fragment>
           )}
           
           <SimpleDivider />
           
           {/* SUB ZONAS INFERIORES */}
           <div className="w-full shrink-0 flex items-stretch bg-white" style={{ height: LAYOUT.altoZonasInferiores }}>
              {/* ZONA 7: BOTONERAS (Action Engine) */}
              <div className="shrink-0 flex items-center justify-center bg-slate-50 m-2 mr-0 shadow-inner rounded-l-md border border-slate-200 overflow-hidden" style={{ width: LAYOUT.anchoBotonera - 8 }}>
                 <ActionZonePanel 
                     context={contextPayload}
                     onActionExecute={(actionId) => console.log('Action Executed Z7:', actionId)}
                 />
              </div>

              {/* Usamos el divider inteligente porque es una zona dinámica y arrastrable */}
              <div className="px-1 py-4 flex items-center justify-center"><SimpleDivider vertical /></div>

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

           {/* ZONA 9: CABECERA INSPECTOR */}
           <div className="w-full shrink-0 flex flex-col" style={{ height: LAYOUT.altoFila2 }}>
              <PSetZone9 
                 screenId={activeModuleId || 'main'}
                 contextPayload={psetContextPayload}
                 phaseIds={[]}
                 deptIds={[]}
              />
           </div>
           
           <SimpleDivider />

           {/* ZONA 10: INSPECTOR */}
           <div className="flex-1 bg-white overflow-hidden flex flex-col relative">
              <PSetZone10 
                 screenId={activeModuleId || 'main'}
                 contextPayload={psetContextPayload}
                 phaseIds={[]}
                 deptIds={[]}
              />
           </div>
        </aside>

    </div>
  );
}
