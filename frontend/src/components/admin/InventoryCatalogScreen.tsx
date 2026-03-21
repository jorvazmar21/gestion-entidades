import { useState } from 'react';
import { usePermissionsStore } from '../../store/usePermissionsStore';
import type { ADNTags } from '../../store/usePermissionsStore';
import { Search, Save, ArrowLeft, Filter } from 'lucide-react';
import clsx from 'clsx';

const FASES = ['ESTUDIO', 'LICITACIÓN', 'EJECUCIÓN', 'GARANTÍA'];
const DPTOS = ['PRODUCCIÓN', 'COMPRAS', 'RRHH', 'TOPOGRAFÍA', 'CALIDAD', 'ADMINISTRACIÓN'];

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
      <div className="flex-none h-16 bg-[#27313f] text-[#f8f9ff] flex items-center justify-between px-6 shadow-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#3b4758] rounded-md transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-['Manrope'] tracking-wide">ADN DE INVENTARIO</h1>
            <p className="text-xs text-[#aab3c1]">Catalogación Estructural (PSets, Informes)</p>
          </div>
        </div>
        
        {/* BARRA BÚSQUEDA STITCH PROPOSAL */}
        <div className="relative w-96 hidden md:block">
          <input
            type="text"
            className="w-full bg-[#1f2937] text-sm text-white placeholder-[#727b89] rounded-md pl-10 pr-4 py-2 border border-[#3b4758] focus:border-[#aab3c1] focus:outline-none transition-colors"
            placeholder="Buscar PSets o informes por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-[#727b89]" size={16} />
        </div>

        <button className="flex items-center gap-2 bg-gradient-to-br from-[#5f030a] to-[#7f1d1d] px-6 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap hidden sm:flex">
          <Save size={16} /> GUARDAR CAMBIOS
        </button>
      </div>

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
