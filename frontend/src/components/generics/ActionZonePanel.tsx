import React, { useMemo, useState } from 'react';
import type { ContextPayload, SystemAction } from '../../config/actionRegistry';
import { ACTION_REGISTRY } from '../../config/actionRegistry';

// Simple Icon Resolver (Mock)
const resolveIcon = (iconName: string) => {
   switch (iconName) {
      case 'Edit': return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
      case 'Users': return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
      case 'CSV': return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
      case 'Upload': return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
      case 'Lock': return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
      case 'Unlock': return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>;
      case 'Plus': return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
      case 'MapPin': return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      default: return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
   }
};

export interface ActionZonePanelProps {
  context: ContextPayload;
  onActionExecute?: (actionId: string, payload: any) => void;
}

export const ActionZonePanel: React.FC<ActionZonePanelProps> = ({ context, onActionExecute }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filtrado Inteligente: Extraer solo los botones cuyo "Contexto" coincide con la Regla (isVisible).
  const allowedActions = useMemo(() => {
     return ACTION_REGISTRY.filter(action => {
         try {
             return action.isVisible(context);
         } catch(e) {
             console.error("Action error evaluating context: " + action.id, e);
             return false;
         }
     });
  }, [context]);

  // 2. Buscador en Vivo "Command Palette"
  const visibleActions = useMemo(() => {
     if (!searchTerm.trim()) return allowedActions;
     const term = searchTerm.toLowerCase();
     return allowedActions.filter(action => 
         action.label.toLowerCase().includes(term) || 
         action.description.toLowerCase().includes(term) ||
         action.category.toLowerCase().includes(term)
     );
  }, [allowedActions, searchTerm]);

  // Agrpación Dinámica por Categorías
  const groupedActions = useMemo(() => {
     const groups: Record<string, SystemAction[]> = {};
     visibleActions.forEach(a => {
         if (!groups[a.category]) groups[a.category] = [];
         groups[a.category].push(a);
     });
     return groups;
  }, [visibleActions]);

  return (
    <div className="flex flex-col h-full bg-[#f8f9ff]">
       {/* Z7 Header - Buscador */}
       <div className="p-3 border-b border-gray-200 bg-white z-10 sticky top-0 shrink-0">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <input
                 type="text"
                 placeholder="Buscar comando o acción..."
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-8 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#7f1d1d] focus:ring-1 focus:ring-[#7f1d1d] transition-all"
             />
             {searchTerm && (
                 <button 
                     onClick={() => setSearchTerm('')} 
                     className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-[#7f1d1d] transition-colors"
                 >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
             )}
          </div>
       </div>

       {/* Z7 Listado de Comandos */}
       <div className="flex-1 overflow-y-auto px-2 space-y-4 py-3">
          {Object.keys(groupedActions).length === 0 ? (
             <div className="text-center p-4">
                <span className="text-xs text-gray-400 italic">No hay comandos disponibles para el contexto actual.</span>
             </div>
          ) : (
             Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category} className="mb-4">
                   <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 pl-2">
                       {category}
                   </h4>
                   <div className="grid grid-cols-2 gap-2">
                      {actions.map(action => (
                         <button 
                             key={action.id}
                             onClick={() => {
                                 if (onActionExecute) onActionExecute(action.id, context);
                             }}
                             title={action.description}
                             className="text-left bg-white border border-gray-200 hover:border-[#7f1d1d] hover:bg-red-50 hover:shadow-sm rounded group flex items-center justify-start gap-2 px-3 h-9 transition-all w-full cursor-pointer overflow-hidden"
                         >
                             <div className="opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                               {resolveIcon(action.icon)}
                             </div>
                             <span className="text-[10px] font-bold text-gray-700 group-hover:text-[#7f1d1d] transition-colors uppercase truncate flex-1 leading-none pt-0.5">{action.label}</span>
                         </button>
                      ))}
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );
};
