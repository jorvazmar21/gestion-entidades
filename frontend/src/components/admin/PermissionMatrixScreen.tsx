import { useState } from 'react';
import { usePermissionsStore } from '../../store/usePermissionsStore';
import { ShieldCheck, Database, LayoutTemplate } from 'lucide-react';
import clsx from 'clsx';
import { SafeImage } from '../SafeImage';

interface Props {
  onBack: () => void;
}

export function PermissionMatrixScreen({ onBack }: Props) {
  const { profiles, inventory, matrix, setPermission } = usePermissionsStore();
  const [selectedId, setSelectedId] = useState<string | null>(profiles[0]?.id || null);
  const selectedProfile = profiles.find(p => p.id === selectedId);

  // Helper function to calculate ADN match
  const isAdnMatch = (profileAdn: any, itemAdn: any) => {
    const phaseMatch = profileAdn.phases.some((p: string) => itemAdn.phases.includes(p));
    const deptMatch = profileAdn.departments.some((d: string) => itemAdn.departments.includes(d));
    return phaseMatch || deptMatch;
  };

  const getInventorySplit = () => {
    if (!selectedProfile) return { matched: [], unmatched: [] };
    
    // If admin, everything technically matches because they have full access, 
    // but visually we might still want to split based on logic. 
    // We'll split based on strict ADN regardless of admin status for clarity.
    const matched = inventory.filter(item => isAdnMatch(selectedProfile.adn, item.adn));
    const unmatched = inventory.filter(item => !isAdnMatch(selectedProfile.adn, item.adn));
    
    return { matched, unmatched };
  };

  const { matched, unmatched } = getInventorySplit();
  const activeMatrix = selectedId ? (matrix[selectedId] || {}) : {};

  return (
    <div className="flex flex-col h-full bg-[#f8f9ff] text-[#2a333f] font-sans">
      {/* HEADER */}
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-10">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_matrix.svg" fallbackType="svg" wrapperClassName="w-8 h-8" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Mesa de Cruce L/E/A
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">Asignación táctica de privilegios por Arquetipo</span>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <button className="w-[80px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] border border-[#7f1d1d] bg-white hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors">
             CONFIRMAR<br/>MATRIZ
           </button>
           <button 
             onClick={onBack}
             className="w-[80px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] border border-[#7f1d1d] bg-white hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             VOLVER AL<br/>INICIO
           </button>
         </div>
       </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - PROFILE LIST (Thin) */}
        <div className="w-72 flex-none bg-[#e9eef9] border-r border-[#d0dbec] flex flex-col">
          <div className="p-4 bg-[#f1f3fc] border-b border-[#d0dbec]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#555f6f] text-center">ARQUETIPOS (ADNs)</h2>
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
                    {p.isAdmin ? 'ZEUS / ADMIN' : 'PERFIL ESTÃNDAR'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT AREA - THE DENSE MATRIX */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9ff] p-6 lg:p-10">
          {!selectedProfile ? (
            <div className="h-full flex flex-col items-center justify-center text-[#727b89]">
              <ShieldCheck size={48} className="mb-4 opacity-50" />
              <p className="font-['Manrope'] text-lg">Selecciona un arquetipo para iniciar el cruce de ADN</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-20">
              
              {/* CURRENT PROFILE BANNER */}
              <div className="flex flex-col border-b-2 border-[#5f030a] pb-4">
                <h2 className="text-3xl font-[Manrope] font-bold text-[#121c2a]">{selectedProfile.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-[#57606d]">{selectedProfile.description || 'Sin descripciÃ³n'}</span>
                  {selectedProfile.isAdmin && (
                    <span className="bg-[#fe8983] text-[#752121] px-2 py-0.5 text-xs font-bold rounded-sm tracking-wider uppercase">
                      Admin Global (Bypass L/E/A activo)
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION 1: MATCHED ITEMS */}
              <div className="flex flex-col">
                <div className="bg-[#ffffff] shadow-sm rounded-t-sm border border-[#d0dbec] border-b-0 p-4 shrink-0">
                  <h3 className="text-sm font-bold text-[#121c2a] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    CANDIDATOS RECOMENDADOS (MATCH DE ADN)
                  </h3>
                  <p className="text-xs text-[#727b89] mt-1 ml-4">
                    Estos objetos comparten Fase o Departamento con el perfil. Suelen requerir asignaciÃ³n directa.
                  </p>
                </div>
                
                <table className="w-full text-left border-collapse bg-white border border-[#d0dbec]">
                  <thead>
                    <tr className="bg-[#f1f3fc] text-[#555f6f] text-[10px] uppercase tracking-widest font-bold">
                      <th className="py-2 px-4 border-b border-[#d0dbec] w-12"></th>
                      <th className="py-2 px-4 border-b border-[#d0dbec]">Objeto de Datos</th>
                      <th className="py-2 px-4 border-b border-[#d0dbec] w-24 text-center">TIPO</th>
                      <th className="py-2 px-4 border-b border-[#d0dbec] w-64 text-center">Permisos TÃ¡cticos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matched.map((item, index) => {
                      const grants = activeMatrix[item.id] || { read: false, edit: false, approve: false };
                      return (
                        <tr key={item.id} className={clsx(
                          "transition-colors",
                          index % 2 === 0 ? "bg-[#ffffff]" : "bg-[#f8f9ff]",
                          "hover:bg-[#e9eef9]"
                        )}>
                          <td className="py-2 px-4 text-center text-[#aab3c1]">
                            {item.type === 'PSET' ? <Database size={14} /> : <LayoutTemplate size={14} />}
                          </td>
                          <td className="py-2 px-4 font-semibold text-sm text-[#2a333f] py-4">{item.name}</td>
                          <td className="py-2 px-4 text-center">
                            <span className="text-[10px] bg-[#d0dbec] px-1.5 py-0.5 rounded-sm">{item.type}</span>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* LECTURA */}
                              <button 
                                onClick={() => setPermission(selectedId!, item.id, { read: !grants.read })}
                                className={clsx(
                                  "w-8 h-8 rounded-sm text-xs font-bold transition-all border outline-none",
                                  grants.read ? "bg-blue-600 text-white border-blue-600" : "bg-white text-[#727b89] border-[#d0dbec] hover:border-[#aab3c1]"
                                )}
                                title="Lectura (Revisor)"
                              >
                                L
                              </button>
                              {/* EDICIÃ“N */}
                              <button 
                                onClick={() => setPermission(selectedId!, item.id, { edit: !grants.edit })}
                                className={clsx(
                                  "w-8 h-8 rounded-sm text-xs font-bold transition-all border outline-none",
                                  grants.edit ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-[#727b89] border-[#d0dbec] hover:border-[#aab3c1]"
                                )}
                                title="Edición (Editor)"
                              >
                                E
                              </button>
                              {/* APROBACIÃ“N */}
                              <button 
                                onClick={() => setPermission(selectedId!, item.id, { approve: !grants.approve })}
                                className={clsx(
                                  "w-8 h-8 rounded-sm text-xs font-bold transition-all border outline-none",
                                  grants.approve ? "bg-amber-500 text-white border-amber-500" : "bg-white text-[#727b89] border-[#d0dbec] hover:border-[#aab3c1]"
                                )}
                                title="Aprobación (Debe Aprobar)"
                              >
                                A
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {matched.length === 0 && (
                      <tr><td colSpan={4} className="py-6 text-center text-xs text-[#727b89]">No hay objetos que compartan ADN con este Perfil.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* SECTION 2: UNMATCHED ITEMS */}
              <div className="flex flex-col mt-4 opacity-75 hover:opacity-100 transition-opacity">
                <div className="bg-[#f1f3fc] shadow-sm rounded-t-sm border border-[#d0dbec] border-b-0 p-4 shrink-0">
                  <h3 className="text-sm font-bold text-[#555f6f] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#d0dbec]" />
                    RESTO DEL INVENTARIO (SIN COINCIDENCIA)
                  </h3>
                  <p className="text-xs text-[#727b89] mt-1 ml-4">
                    Objetos fuera del ecosistema natural del Perfil. Asignar solo excepciones manuales.
                  </p>
                </div>
                
                <table className="w-full text-left border-collapse bg-white border border-[#d0dbec]">
                  <tbody>
                    {unmatched.map((item, index) => {
                      const grants = activeMatrix[item.id] || { read: false, edit: false, approve: false };
                      return (
                        <tr key={item.id} className={clsx(
                          "transition-colors",
                          index % 2 === 0 ? "bg-[#ffffff]" : "bg-[#f8f9ff]",
                          "hover:bg-[#e9eef9]"
                        )}>
                          <td className="py-2 px-4 border-b border-[#f1f3fc] w-12 text-center text-[#d0dbec]">
                            {item.type === 'PSET' ? <Database size={14} /> : <LayoutTemplate size={14} />}
                          </td>
                          <td className="py-2 px-4 border-b border-[#f1f3fc] font-medium text-sm text-[#555f6f] py-4">{item.name}</td>
                          <td className="py-2 px-4 border-b border-[#f1f3fc] w-24 text-center">
                            <span className="text-[10px] bg-[#f1f3fc] px-1.5 py-0.5 rounded-sm opacity-60">{item.type}</span>
                          </td>
                          <td className="py-2 px-4 border-b border-[#f1f3fc] w-64">
                            <div className="flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                              <button 
                                onClick={() => setPermission(selectedId!, item.id, { read: !grants.read })}
                                className={clsx(
                                  "w-8 h-8 rounded-sm text-xs font-bold transition-all border outline-none",
                                  grants.read ? "bg-blue-600 text-white border-blue-600" : "bg-white text-[#aab3c1] border-[#e9eef9] hover:border-[#aab3c1]"
                                )}
                              >L</button>
                              <button 
                                onClick={() => setPermission(selectedId!, item.id, { edit: !grants.edit })}
                                className={clsx(
                                  "w-8 h-8 rounded-sm text-xs font-bold transition-all border outline-none",
                                  grants.edit ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-[#aab3c1] border-[#e9eef9] hover:border-[#aab3c1]"
                                )}
                              >E</button>
                              <button 
                                onClick={() => setPermission(selectedId!, item.id, { approve: !grants.approve })}
                                className={clsx(
                                  "w-8 h-8 rounded-sm text-xs font-bold transition-all border outline-none",
                                  grants.approve ? "bg-amber-500 text-white border-amber-500" : "bg-white text-[#aab3c1] border-[#e9eef9] hover:border-[#aab3c1]"
                                )}
                              >A</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {unmatched.length === 0 && (
                      <tr><td colSpan={4} className="py-6 text-center text-xs text-[#727b89]">No hay inventario sin asignar.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
