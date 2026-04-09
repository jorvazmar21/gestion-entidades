import React, { useState } from 'react';
import { SafeImage } from '../SafeImage';
import { ActionZonePanel } from '../generics/ActionZonePanel';
import type { ContextPayload } from '../../config/actionRegistry';
import { SimpleDivider } from '../MainLayout';

export const SandboxZone7Screen: React.FC<{onBack: () => void}> = ({ onBack }) => {
   
   // MOCK STATE (The "Left Panel" injects this state into the "Center Panel")
   const [mockContext, setMockContext] = useState<ContextPayload>({
       activeModuleId: 'EMP',      
       activeTabFilter: 'CLIENTE',     
       selectedEntityId: null,    
       selectedEntityData: {
           IS_CLIENTE: 0,
           IS_PROVEEDOR: 0,
           IS_CONTRATISTA: 1,
           IS_SUBCONTRATISTA: 0,
           IS_UTE: 0,
           IS_ACTIVE: 1
       },
       activeDetailTab: ''
   });

   const [logs, setLogs] = useState<any[]>([]);

   const executeAction = (actionId: string, context: any) => {
       setLogs(prev => [ { time: new Date().toISOString().split('T')[1].substring(0,8), actionId, context }, ...prev]);
   };

   return (
       <div className="flex flex-col h-screen w-full bg-slate-100 font-['Inter']">
           
           {/* HEADER ESTANDARIZADO DE ADMINISTRACIÓN */}
           <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
              <div className="flex items-center gap-3">
                <SafeImage src="/icons/sys_raw.svg" fallbackType="svg" wrapperClassName="w-8 h-8 filter hue-rotate-[180deg]" className="w-full h-full object-contain" />
                <div>
                  <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
                    Sandbox: Action Engine (Z7)
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

           <div className="flex-1 flex w-full overflow-hidden">
               
               {/* LADO IZQUIERDO: FORZADOR DE CONTEXTO */}
               <div className="w-[300px] flex flex-col bg-white border-r border-gray-200 p-4 shrink-0 overflow-y-auto">
                   <h3 className="text-[11px] uppercase font-bold text-gray-500 mb-4 tracking-wider border-b pb-2">1. Inyector de Contexto</h3>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Módulo Activo (L1)</label>
                           <select 
                               value={mockContext.activeModuleId || ''} 
                               onChange={e => setMockContext(prev => ({...prev, activeModuleId: e.target.value}))}
                               className="w-full border border-gray-300 rounded p-1.5 text-xs focus:border-[#7f1d1d] outline-none bg-gray-50"
                               disabled
                           >
                               <option value="EMP">Gestión de AGENTES</option>
                           </select>
                       </div>

                       <div>
                           <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pestaña Padre Activa</label>
                           <select 
                               value={mockContext.activeTabFilter || ''} 
                               onChange={e => setMockContext(prev => ({...prev, activeTabFilter: e.target.value}))}
                               className="w-full border border-gray-300 rounded p-1.5 text-xs focus:border-[#7f1d1d] outline-none font-bold text-[#7f1d1d]"
                           >
                               <option value="TODAS">TODAS</option>
                               <option value="CONTRATAS">CONTRATAS</option>
                               <option value="UTES">UTES</option>
                               <option value="PROVEEDORES">PROVEEDORES</option>
                               <option value="SUBCONTRATAS">SUBCONTRATAS</option>
                               <option value="CLIENTES">CLIENTES</option>
                           </select>
                       </div>

                       <div className="pt-2 border-t border-gray-100">
                           <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                               <input 
                                   type="checkbox" 
                                   checked={!!mockContext.selectedEntityId}
                                   onChange={e => setMockContext(prev => ({...prev, selectedEntityId: e.target.checked ? 'INST-COMP-123' : null}))}
                               />
                               ¿Entidad Físicamente Seleccionada? 
                           </label>
                           {mockContext.selectedEntityId && (
                               <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                                   Simulando ID: {mockContext.selectedEntityId}
                               </div>
                           )}
                       </div>

                       {!!mockContext.selectedEntityId && (
                           <>
                               <div className="pt-2 border-t border-gray-100">
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cualidades Física (DB Mock)</label>
                                   <div className="flex flex-col gap-1 pl-2">
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_CONTRATISTA === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_CONTRATISTA: e.target.checked ? 1 : 0}}))} /> Es Contratista</label>
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_SUBCONTRATISTA === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_SUBCONTRATISTA: e.target.checked ? 1 : 0}}))} /> Es Subcontratista</label>
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_UTE === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_UTE: e.target.checked ? 1 : 0}}))} /> Es U.T.E.</label>
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_PROVEEDOR === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_PROVEEDOR: e.target.checked ? 1 : 0}}))} /> Es Proveedor</label>
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_CLIENTE === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_CLIENTE: e.target.checked ? 1 : 0}}))} /> Es Cliente</label>
                                       
                                       <div className="my-1 border-t border-gray-100"></div>
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_ACTIVE === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_ACTIVE: e.target.checked ? 1 : 0}}))} /> Status Activo</label>
                                   </div>
                               </div>

                               <div>
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipología Tabla Hijo (Entidad Libre)</label>
                                   <input 
                                       type="text"
                                       placeholder="Ej: CONTACTO, OFICINA, ALMACÉN..."
                                       value={mockContext.activeDetailTab || ''} 
                                       onChange={e => setMockContext(prev => ({...prev, activeDetailTab: e.target.value.toUpperCase()}))}
                                       className="w-full border border-gray-300 rounded p-1.5 text-xs focus:border-[#7f1d1d] outline-none font-mono uppercase text-[#7f1d1d]"
                                   />
                               </div>
                           </>
                       )}

                   </div>
               </div>
               
               <SimpleDivider vertical />

               {/* CENTRO: LA ZONA 7 RENDERIZADA */}
               <div className="flex flex-col shrink-0" style={{ width: '320px' }}>
                   <div className="p-2 border-b border-gray-200 bg-white">
                       <h3 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">2. Z7 (Motor React)</h3>
                   </div>
                   <div className="flex-1 w-full bg-[#f8f9ff]">
                       <ActionZonePanel context={mockContext} onActionExecute={executeAction} />
                   </div>
               </div>

               <SimpleDivider vertical />

               {/* DERECHA: LOG DE OUTPUTS */}
               <div className="flex-1 flex flex-col bg-white">
                   <div className="p-2 border-b border-gray-200 bg-white shadow-sm z-10 flex justify-between items-center">
                       <h3 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">3. Log de Outputs (El Disparo)</h3>
                       <button onClick={() => setLogs([])} className="text-[10px] text-gray-400 hover:text-gray-600 font-bold px-2 py-1">LIMPIAR LÍNEA</button>
                   </div>
                   <div className="flex-1 p-4 overflow-y-auto bg-slate-900 font-mono text-[11px]">
                       {logs.length === 0 ? (
                           <div className="text-gray-600 mt-4 ml-4">Esperando clics en Zona 7...</div>
                       ) : (
                           logs.map((log, index) => (
                               <div key={index} className="mb-4 text-green-400 border-l-2 border-green-600 pl-3">
                                   <div className="text-blue-300">[{log.time}] EJECUCIÓN SOLICITADA</div>
                                   <div className="text-yellow-300">{`>>> ID ACtion:`} <span className="text-white font-bold">{log.actionId}</span></div>
                                   <div className="text-gray-500">Payload transmitido:</div>
                                   <pre className="text-gray-300 mt-1 whitespace-pre-wrap">
                                       {JSON.stringify(log.context, null, 2)}
                                   </pre>
                               </div>
                           ))
                       )}
                   </div>
               </div>

           </div>
       </div>
   );
};
