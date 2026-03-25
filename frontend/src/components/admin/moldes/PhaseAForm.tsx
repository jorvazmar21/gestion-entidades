import React from 'react';

interface Props {
  currentData: any;
  isEditing: boolean;
  safeId: string;
  refreshKey: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>, filename: string) => void;
}

export const PhaseAForm: React.FC<Props> = ({
  currentData, isEditing, safeId, refreshKey, handleChange, handleUpload
}) => {
  return (
    <div className="bg-[#ffffff] p-5 rounded-sm border-l-4 border-[#7f1d1d] shadow-sm shrink-0">
       <h3 className="text-[11px] font-bold text-[#5f030a] uppercase mb-4 tracking-widest flex items-center gap-2">
          Fase A: Configuración y Biología {isEditing && <span className="text-gray-400 font-normal text-[9px] ml-2">(ID Inmutable)</span>}
       </h3>
       <div className="flex gap-6">
          
          {/* IZQUIERDA: Formulario */}
          <div className="flex-1 flex flex-col gap-5">
             <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">ID Molde</label>
                  <input name="id_molde" value={currentData.id_molde} onChange={handleChange} disabled={isEditing} placeholder="Ej: OBR" maxLength={10} className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm font-mono text-[11px] uppercase transition-colors focus:bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-600" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Nombre Descriptivo</label>
                  <input name="nombre" value={currentData.nombre} onChange={handleChange} placeholder="Ej: Obra Civil" className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] transition-colors focus:bg-white focus:outline-none" />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-5 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Estrato Analítico L</label>
                  <select name="id_nivel" value={currentData.id_nivel} onChange={handleChange} className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] font-bold focus:bg-white focus:outline-none">
                     {['L1','L2','L3','L4','L5'].map(l => <option key={l} value={l}>Estrato {l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Descripción Corta</label>
                  <input name="descripcion" value={currentData.descripcion} onChange={handleChange} placeholder="Breve propósito..." className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] focus:bg-white focus:outline-none" />
                </div>
             </div>
          </div>

          {/* DERECHA: Avatar */}
          <div className="w-[180px] shrink-0 flex flex-col justify-start">
             <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-2">Avatar Visual (*.svg)</label>
             <div className="flex flex-col items-center justify-between bg-white p-4 rounded-sm border border-[#cbd5e1] shadow-sm relative hover:border-blue-400 hover:shadow-md transition-all flex-1 min-h-[160px]">
                <div className="h-16 w-full flex items-center justify-center bg-[#f8f9ff] rounded mb-3 overflow-hidden border border-[#cbd5e1] p-2">
                  <img 
                    key={`icons/${currentData.icono}-${refreshKey}`}
                    src={`/icons/${currentData.icono}?v=${refreshKey}`} 
                    className="max-h-full max-w-full object-contain filter grayscale"
                    alt="Icono"
                    onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                  <img src="/generics/SVG_Generico.svg" className="max-h-full max-w-full object-contain hidden opacity-30" alt="Genérico" />
                </div>
                <div className="text-center w-full mb-3 flex-1 flex flex-col justify-start">
                  <span className="text-[11px] font-bold text-gray-800 uppercase leading-tight block">Fichero SVG</span>
                  <span className="text-[9px] font-mono text-blue-500 mt-2 block bg-blue-50 px-1 py-1 rounded truncate w-full" title={currentData.icono}>{currentData.icono}</span>
                </div>
                
                {safeId.length > 0 ? (
                    <label className="cursor-pointer bg-[#edf2fc] text-[#475569] hover:bg-blue-600 hover:text-white px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest border border-[#cbd5e1] w-full text-center transition-colors shadow-sm">
                       CARGAR SVG
                       <input type="file" accept=".svg" className="hidden" onChange={(e) => handleUpload(e, `icons/mod_${safeId.toLowerCase()}.svg`)} />
                    </label>
                ) : (
                    <button disabled className="bg-gray-100 text-gray-400 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest border border-gray-200 w-full text-center cursor-not-allowed">
                       ID REQUERIDO
                    </button>
                )}
             </div>
          </div>

       </div>
    </div>
  );
};
