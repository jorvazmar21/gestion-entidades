import { useState } from 'react';
import { usePermissionsStore } from '../../store/usePermissionsStore';
import type { ADNTags } from '../../store/usePermissionsStore';
import { Search, Filter } from 'lucide-react';
import clsx from 'clsx';
import { SafeImage } from '../SafeImage';

const FASES = ['ESTUDIO', 'LICITACIÓN', 'EJECUCIÃ“N', 'GARANTÃA'];
const DPTOS = ['PRODUCCIÓN', 'COMPRAS', 'RRHH', 'TOPOGRAFÃA', 'CALIDAD', 'ADMINISTRACIÓN'];

interface Props {
  onBack: () => void;
}

export function InventoryCatalogScreen({ onBack }: Props) {
  const { inventory, updateInventoryItem } = usePermissionsStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state to track changes before saving, for better performance if needed, 
  // but Zustand handles rapid updates fine. We'll edit directly to the store for now.

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleArrayItem = (list: string[], item: string) => {
    if (list.includes(item)) return list.filter(i => i !== item);
    return [...list, item];
  };

  const handleUpdate = (id: string, adn: ADNTags) => {
    updateInventoryItem(id, adn);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9ff] text-[#2a333f] font-sans">
      {/* HEADER */}
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-10">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_inventory.svg" fallbackType="svg" wrapperClassName="w-8 h-8" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Catálogo Inventario
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">Catalogación Estructural (PSets, Informes)</span>
           </div>
         </div>
         <div className="flex items-center gap-6">
           {/* BARRA BÚSQUEDA STITCH PROPOSAL */}
           <div className="relative w-96 hidden md:block">
             <input
               type="text"
               className="w-full bg-gray-50 text-sm text-gray-800 placeholder-gray-400 rounded-md pl-10 pr-4 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors"
               placeholder="Buscar PSets o informes por nombre..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
           </div>
           
           <button className="w-[80px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] border border-[#7f1d1d] bg-white hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors">
             GUARDAR<br/>CAMBIOS
           </button>
           <button 
             onClick={onBack}
             className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             INICIO
           </button>
         </div>
       </header>

      {/* CORE TABLE */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto bg-white shadow-sm border border-[#d0dbec] rounded-sm">
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e9eef9] text-[#555f6f] text-[11px] uppercase tracking-widest font-bold">
                <th className="py-4 px-6 border-b border-[#d0dbec] w-1/4">Tipo Objeto</th>
                <th className="py-4 px-6 border-b border-[#d0dbec] w-1/3">Nombre del Activo</th>
                <th className="py-4 px-6 border-b border-[#d0dbec] text-center">Fases (Vínculo ADN)</th>
                <th className="py-4 px-6 border-b border-[#d0dbec] text-center">Departamentos (Vínculo ADN)</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={clsx(
                    "group transition-colors space-y-5",
                    index % 2 === 0 ? "bg-[#ffffff]" : "bg-[#f8f9ff]",
                    "hover:bg-[#f1f3fc]"
                  )}
                >
                  <td className="py-5 px-6">
                    <span className={clsx(
                      "px-2 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wider",
                      item.type === 'PSET' ? "bg-indigo-100 text-indigo-800" :
                      item.type === 'REPORT' ? "bg-emerald-100 text-emerald-800" :
                      "bg-amber-100 text-amber-800"
                    )}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-semibold text-sm text-[#121c2a]">{item.name}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {FASES.map(fase => {
                        const isSelected = item.adn.phases.includes(fase);
                        return (
                          <button
                            key={fase}
                            onClick={() => handleUpdate(item.id, { ...item.adn, phases: toggleArrayItem(item.adn.phases, fase) })}
                            className={clsx(
                              "text-[10px] font-medium px-2 py-1 border transition-colors cursor-pointer",
                              isSelected 
                                ? "bg-[#5f030a] text-white border-[#5f030a]" 
                                : "bg-white text-[#727b89] border-[#d0dbec] hover:border-[#727b89] opacity-60 hover:opacity-100"
                            )}
                          >
                            {fase.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {DPTOS.map(dpto => {
                        const isSelected = item.adn.departments.includes(dpto);
                        return (
                          <button
                            key={dpto}
                            onClick={() => handleUpdate(item.id, { ...item.adn, departments: toggleArrayItem(item.adn.departments, dpto) })}
                            className={clsx(
                              "text-[10px] font-medium px-2 py-1 border transition-colors cursor-pointer",
                              isSelected 
                                ? "bg-[#5f030a] text-white border-[#5f030a]" 
                                : "bg-white text-[#727b89] border-[#d0dbec] hover:border-[#727b89] opacity-60 hover:opacity-100"
                            )}
                          >
                            {dpto.substring(0, 4)}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#727b89]">
                    <Filter size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-['Manrope']">No se encontraron activos para catalogar</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
