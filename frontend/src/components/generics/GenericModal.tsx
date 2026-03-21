/**
 * @module GenericModal
 * @description Cascarón base reutilizable para fichas modales de configuración o datos.
 * @inputs isOpen (booleano), onClose (callback), title (string).
 * @actions Renderiza un recuadro blanco sobre un fondo oscurecido bloqueante con botones típicos.
 * @files src/components/generics/GenericModal.tsx
 */
import React from 'react';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const GenericModal: React.FC<GenericModalProps> = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#121c2a]/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-gray-200">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-[#121c2a] font-['Manrope'] font-[800] text-[18px] uppercase tracking-wide">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-[#8c1d18] transition-colors text-xl font-bold px-2"
            title="Cerrar Ficha"
          >
             ✕
          </button>
        </div>
        
        {/* Cuerpo del Modal (Blank slate por defecto) */}
        <div className="p-8 min-h-[300px] flex items-center justify-center bg-[#f8f9ff]">
           <p className="text-[#64748b] text-[13px] font-['Inter'] text-center">
             La estructura y cruce de datos de esta ficha está <br/>pendiente de ensamblaje en fases posteriores.
           </p>
        </div>
        
        {/* Pie del Modal (Botonera típica Aceptar/Cancelar) */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2 text-[12px] font-bold text-[#64748b] hover:bg-slate-100 bg-transparent rounded uppercase tracking-widest transition-colors outline-none"
          >
            Cancelar
          </button>
          <button 
            onClick={onClose} 
            className="px-5 py-2 text-[12px] font-bold text-white bg-[#8c1d18] hover:bg-[#5f030a] shadow-sm rounded uppercase tracking-widest transition-colors outline-none"
          >
            Guardar Cambios
          </button>
        </div>
        
      </div>
    </div>
  );
};
