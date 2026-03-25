import React, { useState, useEffect, useMemo } from 'react';
import { SystemDataGridMini } from '../SystemDataGridMini';

interface Props {
  currentData: any;
  isEditing: boolean;
  safeId: string;
  refreshKey: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>, filename: string) => void;
  tiposEntidadDb: any[];
  togglePadre: (id: string) => void;
}

export const PhaseAForm: React.FC<Props> = ({
  currentData, isEditing, safeId, refreshKey, handleChange, handleUpload, tiposEntidadDb, togglePadre
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [nivelesData, setNivelesData] = useState<any[]>([]);
  const [nivelesRefresh, setNivelesRefresh] = useState(0);

  useEffect(() => {
     let isMounted = true;
     fetch(`/api/raw-db?table=sys_niveles&v=${nivelesRefresh}`)
       .then(r => r.json())
       .then(res => {
          if (res.success && isMounted) setNivelesData(res.data);
       })
       .catch(console.error);
     return () => { isMounted = false; };
  }, [nivelesRefresh]);

  const nivelesColDefs = useMemo(() => [
     { field: 'id_nivel', headerName: 'ID', width: 70, editable: false },
     { field: 'jerarquia', headerName: 'ORD', width: 70, editable: true, sort: 'asc' as const },
     { field: 'nombre', headerName: 'NOMBRE', flex: 1, editable: true }
  ], []);

  const nivelesDisponibles = nivelesData.length > 0 ? nivelesData.map(n => n.id_nivel).sort() : ['L1'];
  if (!nivelesDisponibles.includes(currentData.id_nivel)) nivelesDisponibles.push(currentData.id_nivel);
  return (
    <div className="flex gap-6 w-full">
          
          {/* IZQUIERDA: Formulario */}
          <div className="flex-1 flex flex-col gap-5">
             <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">ID Molde</label>
                  <input name="id_molde" value={currentData.id_molde} onChange={handleChange} disabled={isEditing} placeholder="Ej: OBR" maxLength={15} className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm font-mono text-[11px] uppercase transition-colors focus:bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-600" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Nombre Descriptivo</label>
                  <input name="nombre" value={currentData.nombre} onChange={handleChange} placeholder="Ej: Obra Civil" className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] transition-colors focus:bg-white focus:outline-none" />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-5 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">ID Entidad (Relación)</label>
                  <input name="id_tipo_entidad" value={currentData.id_tipo_entidad} onChange={handleChange} placeholder="Ej: ENTIDAD_OBRAS" className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[10px] font-mono uppercase transition-colors focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Descripción Corta</label>
                  <input name="descripcion" value={currentData.descripcion} onChange={handleChange} placeholder="Breve propósito..." className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] focus:bg-white focus:outline-none" />
                </div>
             </div>
             <div className="col-span-2 pt-3 border-t border-gray-100 flex flex-col min-h-0 relative">
                 <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">
                     Padres Permitidos <span className="text-gray-400 font-normal normal-case">(Combobox Múltiple)</span>
                 </label>
                 <div className="relative">
                    <div 
                       onClick={() => { if (isEditing || safeId !== '') setDropdownOpen(!dropdownOpen); }}
                       className={`w-full p-2 min-h-[34px] bg-[#eff4ff] border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[10px] font-bold text-[#121c2a] uppercase cursor-pointer flex items-center transition-colors truncate ${(!isEditing && safeId === '') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e6eeff]'}`}
                    >
                       {currentData.padres_permitidos.length === 0 ? (
                           <span className="text-gray-400 font-normal">Seleccionar Múltiples Padres...</span>
                       ) : (
                           <span>{currentData.padres_permitidos.join(', ')}</span>
                       )}
                    </div>
                    {dropdownOpen && (
                 <div className="absolute top-full left-0 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-2xl z-50 rounded-b flex flex-col styled-scrollbar">
                     {tiposEntidadDb.filter(t => t.id_tipo !== currentData.id_molde).map(t => {
                         const relValue = t.id_tipo_entidad || `ENTIDAD_${t.id_tipo}`;
                         const isSelected = currentData.padres_permitidos.includes(relValue);
                         return (
                             <label key={t.id_tipo} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                                 <input type="checkbox" checked={isSelected} onChange={() => togglePadre(relValue)} className="w-3 h-3 accent-indigo-600 cursor-pointer flex-shrink-0" />
                                 <span className="text-[11px] font-bold text-gray-700 uppercase truncate flex-1 min-w-0">{relValue} <span className="font-normal text-gray-500 normal-case ml-1 truncate">({t.nombre})</span></span>
                             </label>
                         );
                     })}
                     {tiposEntidadDb.length <= (isEditing ? 1 : 0) && (
                         <div className="p-3 text-[10px] text-gray-400 italic text-center border border-dashed border-gray-300 m-2 rounded">No hay otros moldes creados para actuar como padres.</div>
                     )}
                 </div>
                    )}
                 </div>
             </div>
             {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>}
          </div>

          {/* CENTRO: SYS_NIVELES */}
          <div className="w-[360px] shrink-0 flex flex-col justify-end relative z-0">
             <div className="flex flex-col items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm relative h-[230px] w-full overflow-hidden">
                <SystemDataGridMini
                   rowData={nivelesData}
                   columnDefs={nivelesColDefs}
                   primaryKeyField="id_nivel"
                   readOnly={false}
                   toolbarTitle="SYS_NIVELES"
                   rowSelection="single"
                   selectedIdObj={{ field: 'id_nivel', value: currentData.id_nivel }}
                   onSelectionChanged={(nodes: any[]) => {
                       if (nodes.length > 0 && nodes[0].data.id_nivel !== currentData.id_nivel) {
                           handleChange({ target: { name: 'id_nivel', value: nodes[0].data.id_nivel } } as any);
                       }
                   }}
                   onAddRow={async () => {
                       const pk = prompt("Identificador del nuevo Nivel (ej. L6):");
                       if (!pk) return;
                       try {
                           const res = await fetch('/api/raw-db/create', {
                               method: 'POST', headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ table: 'sys_niveles', pkColumn: 'id_nivel', pkValue: pk.toUpperCase() })
                           });
                           if ((await res.json()).success) setNivelesRefresh(k => k + 1);
                       } catch(e) {}
                   }}
                   onDeleteSelected={async (nodes: any[]) => {
                       if (nodes.length === 0) return;
                       if (!window.confirm(`¿Borrar físicamente ${nodes.length} nivel(es)?`)) return;
                       for (const n of nodes) {
                           await fetch('/api/raw-db/delete', {
                               method: 'POST', headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ table: 'sys_niveles', pkColumn: 'id_nivel', pkValue: n.data.id_nivel })
                           });
                       }
                       setNivelesRefresh(k => k + 1);
                   }}
                   onCellEdit={async (_pkField: string, _pkVal: string, col: string, val: any) => {
                       try {
                           const response = await fetch('/api/raw-db/update', {
                               method: 'POST', headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ table: 'sys_niveles', pkColumn: _pkField, pkValue: _pkVal, updateColumn: col, newValue: val })
                           });
                           return (await response.json()).success;
                       } catch { return false; }
                   }}
                />
             </div>
          </div>

          {/* DERECHA: Avatar */}
          <div className="w-[180px] shrink-0 flex flex-col justify-start relative z-0">
             <div className="flex flex-col items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative hover:border-blue-400 hover:shadow-md transition-all h-[230px]">
                <div className="h-20 w-full flex items-center justify-center bg-[#f8f9ff] rounded mb-3 overflow-hidden border border-[#cbd5e1] p-2">
                  <img 
                    key={`icons/${currentData.icono}-${refreshKey}`}
                    src={`/icons/${currentData.icono}?v=${refreshKey}`} 
                    className="max-h-full max-w-full object-contain filter grayscale"
                    alt="Icono visual"
                    onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                  <img src="/generics/SVG_Generico.svg" className="max-h-full max-w-full object-contain hidden opacity-30" alt="Genérico" />
                </div>
                <div className="text-center w-full mb-3 flex-1 flex flex-col justify-start">
                  <span className="text-[11px] font-bold text-gray-800 uppercase leading-tight block">Avatar Visual</span>
                  <span className="text-[9px] text-gray-400 mt-1 block leading-tight">Icono vectorial del Molde</span>
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
  );
};
