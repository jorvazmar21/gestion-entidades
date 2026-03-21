import { useState, useEffect } from 'react';
import type { BaseProfile } from '../../store/usePermissionsStore';
import { usePermissionsStore } from '../../store/usePermissionsStore';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { SafeImage } from '../SafeImage';

const FASES = ['ESTUDIO', 'LICITACIÓN', 'EJECUCIÓN', 'GARANTÍA'];
const DPTOS = ['PRODUCCIÓN', 'COMPRAS', 'RRHH', 'TOPOGRAFÍA', 'CALIDAD', 'ADMINISTRACIÓN'];


interface Props {
  onBack: () => void;
}

export function ProfileForgeScreen({ onBack }: Props) {
  const { profiles, addProfile, updateProfile, deleteProfile } = usePermissionsStore();
  
  const [selectedId, setSelectedId] = useState<string | null>(profiles[0]?.id || null);
  const [localProfile, setLocalProfile] = useState<Partial<BaseProfile> | null>(null);

  useEffect(() => {
    const prof = profiles.find(p => p.id === selectedId);
    if (prof) {
      setLocalProfile(prof);
    } else if (profiles.length > 0) {
      setSelectedId(profiles[0].id);
    } else {
      setLocalProfile(null);
    }
  }, [selectedId, profiles]);

  const handleCreate = () => {
    addProfile({
      name: 'Nuevo Perfil',
      description: 'Descripción del perfil...',
      isAdmin: false,
      adn: { phases: [], departments: [], entities: [] }
    });
    // Apuntamos al último recién creado
    setTimeout(() => {
      const state = usePermissionsStore.getState();
      setSelectedId(state.profiles[state.profiles.length - 1].id);
    }, 50);
  };

  const handleSave = () => {
    if (selectedId && localProfile) {
      updateProfile(selectedId, localProfile);
    }
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteProfile(selectedId);
      setSelectedId(null);
    }
  };

  const toggleArrayItem = (list: string[], item: string) => {
    if (list.includes(item)) return list.filter(i => i !== item);
    return [...list, item];
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
            <h1 className="text-xl font-bold font-['Manrope'] tracking-wide">FRAGUA DE PERFILES</h1>
            <p className="text-xs text-[#aab3c1]">Gestor de Arquetipos y ADN Lógico</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-br from-[#5f030a] to-[#7f1d1d] px-6 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Save size={16} /> GUARDAR CAMBIOS
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - PROFILE LIST */}
        <div className="w-80 flex-none bg-[#e9eef9] border-r border-[#d0dbec] flex flex-col">
          <div className="p-4 bg-[#f1f3fc]">
            <button 
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 bg-[#ffffff] border border-[#d0dbec] px-4 py-2 hover:bg-[#f8f9ff] transition-colors shadow-sm text-sm font-semibold rounded-sm text-[#555f6f]"
            >
              <Plus size={16} /> NUEVO ARQUETIPO
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={clsx(
                  "w-full text-left p-3 rounded-sm flex items-center justify-between transition-colors",
                  selectedId === p.id 
                    ? "bg-[#ffffff] shadow-sm border-l-4 border-[#5f030a] text-[#121c2a]"
                    : "hover:bg-[#f1f3fc] text-[#465364]"
                )}
              >
                <div className="flex flex-col truncate">
                  <span className="font-semibold text-sm">{p.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#727b89]">
                    {p.isAdmin ? 'ZEUS / ADMIN' : `${p.adn.phases.length + p.adn.departments.length} ADN TAGS`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT AREA - PROFILE EDITOR */}
        <div className="flex-1 overflow-y-auto p-8">
          {localProfile ? (
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full bg-transparent text-3xl font-[Manrope] font-bold text-[#121c2a] outline-none border-b border-transparent hover:border-[#d0dbec] focus:border-[#5f030a] transition-colors pb-1"
                    value={localProfile.name || ''}
                    onChange={e => setLocalProfile({ ...localProfile, name: e.target.value })}
                    placeholder="Nombre del Arquetipo..."
                  />
                  <input
                    type="text"
                    className="w-full bg-transparent text-sm text-[#57606d] outline-none border-b border-transparent hover:border-[#d0dbec] focus:border-[#727b89] transition-colors mt-2 pb-1"
                    value={localProfile.description || ''}
                    onChange={e => setLocalProfile({ ...localProfile, description: e.target.value })}
                    placeholder="Descripción funcional..."
                  />
                </div>
                <button 
                  onClick={handleDelete}
                  className="p-3 text-[#9f403d] hover:bg-[#fe8983]/20 rounded-md transition-colors w-11 h-11 relative"
                  title="Eliminar Arquetipo"
                >
                  <SafeImage src="/icons/ui_trash.svg" fallbackType="svg" wrapperClassName="w-5 h-5 absolute inset-0 m-auto" className="w-full h-full" />
                </button>
              </div>

              {/* ADMIN TOGGLE */}
              <div className="bg-[#ffffff] p-5 shadow-sm rounded-sm flex items-center justify-between border-l-4 border-transparent hover:border-[#d0dbec] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={clsx("p-3 rounded-md relative w-12 h-12 overflow-hidden", localProfile.isAdmin ? "bg-[#fe8983]/20 text-[#752121]" : "bg-[#e9eef9] text-[#727b89]")}>
                    <SafeImage src="/icons/ui_shield.svg" fallbackType="svg" wrapperClassName="w-6 h-6 absolute inset-0 m-auto" className="w-full h-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Privilegios Globales Estructurales (Admin)</span>
                    <span className="text-xs text-[#727b89]">Otorga acceso total ignorando el árbol de permisos L/E/A. Usar con extrema precaución.</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={localProfile.isAdmin}
                    onChange={e => setLocalProfile({ ...localProfile, isAdmin: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-[#d0dbec] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5f030a]"></div>
                </label>
              </div>

              {!localProfile.isAdmin && (
                <>
                  <div className="h-px bg-[#d0dbec] my-4" />
                  <h2 className="text-lg font-bold font-['Manrope'] mb-2">ADN del Perfil (Catalogación Base)</h2>
                  
                  {/* ADN GRIDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* FASES */}
                    <div className="bg-[#ffffff] p-5 shadow-sm rounded-sm">
                      <h3 className="text-xs uppercase font-bold tracking-wider text-[#555f6f] mb-4">1. Fases Operativas</h3>
                      <div className="flex flex-col gap-2">
                        {FASES.map(fase => {
                          const isSelected = localProfile.adn?.phases.includes(fase);
                          return (
                            <label key={fase} className="flex items-center gap-3 cursor-pointer group" onClick={() => setLocalProfile({...localProfile, adn: {...localProfile.adn!, phases: toggleArrayItem(localProfile.adn!.phases, fase)}})}>
                              <div className={clsx(
                                "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors",
                                isSelected ? "bg-[#5f030a] border-[#5f030a]" : "bg-white border-[#aab3c1] group-hover:border-[#727b89]"
                              )}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                              </div>
                              <span className={clsx("text-sm transition-colors", isSelected ? "text-[#121c2a] font-medium" : "text-[#57606d]")}>{fase}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* DEPARTAMENTOS */}
                    <div className="bg-[#ffffff] p-5 shadow-sm rounded-sm">
                      <h3 className="text-xs uppercase font-bold tracking-wider text-[#555f6f] mb-4">2. Departamentos Implicados</h3>
                      <div className="flex flex-col gap-2">
                        {DPTOS.map(dpto => {
                          const isSelected = localProfile.adn?.departments.includes(dpto);
                          return (
                            <label key={dpto} className="flex items-center gap-3 cursor-pointer group" onClick={() => setLocalProfile({...localProfile, adn: {...localProfile.adn!, departments: toggleArrayItem(localProfile.adn!.departments, dpto)}})}>
                              <div className={clsx(
                                "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors",
                                isSelected ? "bg-[#5f030a] border-[#5f030a]" : "bg-white border-[#aab3c1] group-hover:border-[#727b89]"
                              )}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                              </div>
                              <span className={clsx("text-sm transition-colors", isSelected ? "text-[#121c2a] font-medium" : "text-[#57606d]")}>{dpto}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#727b89]">
              <SafeImage src="/icons/ui_user_placeholder.svg" fallbackType="png" wrapperClassName="w-16 h-16 mb-4 opacity-70" className="w-full h-full" />
              <p className="font-['Manrope'] text-lg">Selecciona o crea un Arquetipo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
