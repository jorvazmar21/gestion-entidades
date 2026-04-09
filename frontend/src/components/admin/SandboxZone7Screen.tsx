import React, { useState } from 'react';
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
           IS_CLIENTE: 1,
           IS_PROVEEDOR: 0,
           IS_ACTIVE: 1
       },
       activeDetailTab: 'contactos'
   });

   const [logs, setLogs] = useState<any[]>([]);

   const executeAction = (actionId: string, context: any) => {
       setLogs(prev => [ { time: new Date().toISOString().split('T')[1].substring(0,8), actionId, context }, ...prev]);
   };

   return (
       <div className="flex flex-col h-screen w-full bg-slate-100 font-['Inter']">
           
           {/* Topbar genérica Sandbox */}
           <div className="h-[40px] shrink-0 bg-[#7f1d1d] text-white flex items-center px-4 justify-between shadow-md z-10">
               <div className="flex items-center gap-3">
                   <button onClick={onBack} className="hover:bg-white/20 p-1 rounded transition-colors text-white">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                   </button>
                   <span className="font-bold tracking-widest text-[11px] uppercase">Zona 7 Sandbox - Action Engine</span>
               </div>
           </div>

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
                               className="w-full border border-gray-300 rounded p-1.5 text-xs focus:border-[#7f1d1d] outline-none"
                           >
                               <option value="">(Ninguno)</option>
                               <option value="EMP">EMP (Registro de Entidades)</option>
                               <option value="OBR">OBR (Obras)</option>
                           </select>
                       </div>

                       <div>
                           <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pestaña Activa (L1)</label>
                           <select 
                               value={mockContext.activeTabFilter || ''} 
                               onChange={e => setMockContext(prev => ({...prev, activeTabFilter: e.target.value}))}
                               className="w-full border border-gray-300 rounded p-1.5 text-xs focus:border-[#7f1d1d] outline-none"
                           >
                               <option value="">(Ninguna)</option>
                               <option value="CLIENTE">CLIENTE</option>
                               <option value="PROVEEDOR">PROVEEDOR</option>
                               <option value="SEDE">SEDE</option>
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
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_CLIENTE === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_CLIENTE: e.target.checked ? 1 : 0}}))} /> Es Cliente</label>
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_PROVEEDOR === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_PROVEEDOR: e.target.checked ? 1 : 0}}))} /> Es Proveedor</label>
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_UTE === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_UTE: e.target.checked ? 1 : 0}}))} /> Es U.T.E.</label>
                                       <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={mockContext.selectedEntityData?.IS_ACTIVE === 1} onChange={e => setMockContext(prev => ({...prev, selectedEntityData: {...prev.selectedEntityData, IS_ACTIVE: e.target.checked ? 1 : 0}}))} /> Status Activo</label>
                                   </div>
                               </div>

                               <div>
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pestaña Inferior Detalle (L2)</label>
                                   <select 
                                       value={mockContext.activeDetailTab || ''} 
                                       onChange={e => setMockContext(prev => ({...prev, activeDetailTab: e.target.value}))}
                                       className="w-full border border-gray-300 rounded p-1.5 text-xs focus:border-[#7f1d1d] outline-none"
                                   >
                                       <option value="">(Ninguna / Cerrado)</option>
                                       <option value="contactos">Contactos</option>
                                       <option value="delegaciones">Delegaciones / Sedes</option>
                                   </select>
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
