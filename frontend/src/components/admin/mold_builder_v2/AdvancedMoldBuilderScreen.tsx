import React, { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '../../../store/useDataStore';
import { MoldBuilderHeader } from './MoldBuilderHeader';
import { PhaseAForm } from './PhaseAForm';
import { TopologySimulator } from './TopologySimulator';
import { SystemDataGrid } from '../SystemDataGrid';

interface Props {
  onBack: () => void;
}

const EMPTY_MOLD = { 
  id_molde: '', 
  id_tipo_entidad: '',
  nombre: '', 
  id_nivel: 'L1', 
  descripcion: '', 
  icono: 'sys_box.svg', 
  padres_permitidos: [] as string[]
};

export const AdvancedMoldBuilderScreen: React.FC<Props> = ({ onBack }) => {
  const { tiposEntidadDb, init } = useDataStore();
  
  const initialMolde = tiposEntidadDb.length > 0 ? tiposEntidadDb[0].id_tipo : '__NEW__';
  const [activeMoldeId, setActiveMoldeId] = useState<string>(initialMolde);
  const [lastActiveMoldeId, setLastActiveMoldeId] = useState<string>(initialMolde);
  const isEditing = activeMoldeId !== '__NEW__';
  
  // ESTADO MODULAR: BORRADOR (NUEVO)
  const [draftData, setDraftData] = useState({ ...EMPTY_MOLD });
  // Removed: const [draftChildren, setDraftChildren] = useState<string[]>([]);
  
  // ESTADO MODULAR: EDICIÓN (EXISTENTE)
  const [editData, setEditData] = useState({ ...EMPTY_MOLD });
  // Removed: const [editChildren, setEditChildren] = useState<string[]>([]);

  // ESTADO FASE B (Jerarquías - DataGrid)
  const [hierarchyData, setHierarchyData] = useState<any[]>([]);
  const [isGridLoading, setIsGridLoading] = useState(false);

  // PREVENCIÓN DE CIERRE (Router Guard manual)
  useEffect(() => {
     if (isEditing) {
        setLastActiveMoldeId(activeMoldeId);
     }
  }, [activeMoldeId, isEditing]);

  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentData = isEditing ? editData : draftData;

  // FETCH JERARQUÍAS CADA VEZ QUE CAMBIA EL ID O SE GUARDA
  useEffect(() => {
      const fetchHierarchy = async () => {
          if (activeMoldeId === '__NEW__') {
              setHierarchyData([]);
              return;
          }
          setIsGridLoading(true);
          try {
              if (!currentData.id_tipo_entidad) {
                  setHierarchyData([]);
                  setIsGridLoading(false);
                  return;
              }
              const res = await fetch('/api/raw-db/read', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ table: 'sys_reglas_jerarquia', conditions: { id_molde_padre: currentData.id_tipo_entidad } })
              });
              const data = await res.json();
              if (data.success) setHierarchyData(data.data);
          } catch (e) {
              console.error("Error loading hierarchies:", e);
          }
          setIsGridLoading(false);
      };
      fetchHierarchy();
  }, [activeMoldeId, currentData.id_tipo_entidad, refreshKey]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, filename: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetInput = e.target;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const res = await fetch('/api/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, base64Data })
        });
        const data = await res.json();
        if (data.success) {
          setRefreshKey(prev => prev + 1);
          const justName = filename.replace('icons/', '');
          if (isEditing) {
             setEditData({ ...editData, icono: justName });
          } else {
             setDraftData({ ...draftData, icono: justName });
          }
        } else {
          alert('Error de servidor: ' + data.error);
        }
      } catch (err) {
        alert('Error conectando al servidor.');
      } finally {
        targetInput.value = ''; 
      }
    };
    reader.readAsDataURL(file);
  };

  // EFECTO: Sincronizar el estado de edición cada vez que se seleccione un molde existente
  useEffect(() => {
     if (isEditing) {
         const t = tiposEntidadDb.find(x => x.id_tipo === activeMoldeId);
         if (t) {
             const tAny = t as any;
             setEditData({
                 id_molde: tAny.id_tipo,
                 id_tipo_entidad: tAny.id_tipo_entidad || '',
                 nombre: tAny.nombre,
                 id_nivel: tAny.nivel,
                 descripcion: tAny.categoria || '',
                 icono: tAny.icono || 'sys_box.svg',
                 padres_permitidos: tAny.padres_permitidos || []
             });
         }
     }
  }, [activeMoldeId, tiposEntidadDb, isEditing]);

  // Removed: const currentChildren = isEditing ? editChildren : draftChildren;

  // LÓGICA DE DIRTINESS Y VALIDACIÓN
  const originalMold = isEditing ? tiposEntidadDb.find(x => x.id_tipo === activeMoldeId) : null;
  const originalMoldAny = originalMold as any;
  const isDirty = originalMoldAny && (
      editData.nombre !== originalMoldAny.nombre ||
      editData.id_tipo_entidad !== (originalMoldAny.id_tipo_entidad || '') ||
      editData.id_nivel !== originalMoldAny.nivel ||
      editData.descripcion !== (originalMoldAny.categoria || '') ||
      editData.icono !== (originalMoldAny.icono || 'sys_box.svg') ||
      JSON.stringify([...editData.padres_permitidos].sort()) !== JSON.stringify([...(originalMoldAny.padres_permitidos || [])].sort())
  );

  const safeId = currentData.id_molde.toUpperCase().replace(/[^A-Z0-9_]/g, '');
  const idExistsForNew = !isEditing && tiposEntidadDb.some(t => t.id_tipo === safeId);
  const isFormValid = safeId.length > 0 && currentData.nombre.length > 0 && (!isEditing ? !idExistsForNew : true);

  // MANEJADORES DE INPUTS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const setFn = isEditing ? setEditData : setDraftData;
    const data = isEditing ? editData : draftData;
    
    if (e.target.name === 'id_molde' && isEditing) return; // ID inmutable en edición

    if (e.target.name === 'id_molde') {
        const uppercaseClean = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        setFn({ ...data, id_molde: uppercaseClean });
    } else {
        setFn({ ...data, [e.target.name]: e.target.value });
    }
  };



  const togglePadre = (id_padre: string) => {
    const data = isEditing ? editData : draftData;
    const setFn = isEditing ? setEditData : setDraftData;
    const padres = [...data.padres_permitidos];
    if (padres.includes(id_padre)) {
      setFn({ ...data, padres_permitidos: padres.filter(p => p !== id_padre) });
    } else {
      setFn({ ...data, padres_permitidos: [...padres, id_padre] });
    }
  };

  // MANEJADORES DE BOTONES CRUD
  const handleDiscard = () => {
      if (isEditing && originalMold) {
          // Revertir edición a su estado original
          const originalMoldAny = originalMold as any;
          setEditData({
             id_molde: originalMoldAny.id_tipo,
             id_tipo_entidad: originalMoldAny.id_tipo_entidad || '',
             nombre: originalMoldAny.nombre,
             id_nivel: originalMoldAny.nivel,
             descripcion: originalMoldAny.categoria || '',
             icono: originalMoldAny.icono || 'sys_box.svg',
             padres_permitidos: originalMoldAny.padres_permitidos || []
          });
      } else {
          // Si estamos en un NUEVO y descartamos, volvemos al último activo existente
          setDraftData({ ...EMPTY_MOLD });
          if (lastActiveMoldeId !== '__NEW__' && tiposEntidadDb.some(t => t.id_tipo === lastActiveMoldeId)) {
             setActiveMoldeId(lastActiveMoldeId);
          } else if (tiposEntidadDb.length > 0) {
             setActiveMoldeId(tiposEntidadDb[0].id_tipo);
          }
      }
  };

  const handleSave = async () => {
    if (!isFormValid) return;
    if (isEditing && !isDirty) return;

    setIsSaving(true);
    
    try {
        const isCreating = !isEditing;
        let res;

        if (isCreating || isEditing) {
            // Utilizamos el endpoint especializado que hace INSERT OR REPLACE nativo en SQLite
            res = await fetch('/api/moldes/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_molde: isEditing ? activeMoldeId : safeId,
                    id_tipo_entidad: currentData.id_tipo_entidad,
                    id_nivel: currentData.id_nivel,
                    nombre: currentData.nombre,
                    descripcion: currentData.descripcion,
                    icono_sistema: currentData.icono,
                    reglas_config: { padres_permitidos: currentData.padres_permitidos }
                })
            });
        }
        
        const data = await res?.json();
        const savedId = isEditing ? activeMoldeId : safeId;
        if (data.success) {
            alert(`Molde ${savedId} ${isEditing ? 'actualizado' : 'creado'} correctamente.`);
            await init(); 
            if (!isEditing) {
                setActiveMoldeId(savedId); // Lo enfocamos
            }
        } else {
            alert('Error al guardar: ' + data.error);
        }
    } catch (e: any) {
        alert('Fallo crítico de red: ' + e.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
      if (!isEditing) return;
      if (!window.confirm(`PELIGRO: ¿Estás totalmente seguro de borrar el molde ${activeMoldeId}? Se borrará de la tabla sys_moldes permanentemente.`)) return;
      
      setIsSaving(true);
      try {
          const res = await fetch('/api/raw-db/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ table: 'sys_moldes', pkColumn: 'id_molde', pkValue: activeMoldeId })
          });
          const data = await res.json();
          if (data.success) {
              alert(`Molde ${activeMoldeId} borrado.`);
              // Registro activo será el anterior si existe
              const currIdx = tiposEntidadDb.findIndex(t => t.id_tipo === activeMoldeId);
              let nextId = '__NEW__';
              if (tiposEntidadDb.length > 1) {
                  if (currIdx > 0) nextId = tiposEntidadDb[currIdx - 1].id_tipo;
                  else nextId = tiposEntidadDb[1].id_tipo;
              }
              setActiveMoldeId(nextId);
              await init();
          } else {
              alert('Fallo al borrar: ' + data.error);
          }
      } catch (e: any) {
          alert('Fallo de red al borrar: ' + e.message);
      }
      setIsSaving(false);
  };

  const handleNew = () => {
      if ((isEditing && isDirty) || (!isEditing && activeMoldeId === '__NEW__' && safeId.length > 0)) {
         if (!window.confirm("Tienes cambios sin guardar que se perderán. ¿Continuar y crear nuevo?")) return;
      }
      setActiveMoldeId('__NEW__');
      setDraftData({ ...EMPTY_MOLD });
  };

  const handleNavigateToMolde = (id: string) => {
      if ((isEditing && isDirty) || (!isEditing && safeId.length > 0)) {
          if (!window.confirm("Se perderán los cambios sin guardar. ¿Deseas navegar?")) return;
          if (!isEditing) handleDiscard();
      }
      setActiveMoldeId(id);
  };

  const guardedOnBack = () => {
      if ((isEditing && isDirty) || (!isEditing && activeMoldeId === '__NEW__' && safeId.length > 0)) {
          if (!window.confirm("Vas a abandonar esta pantalla. Se descartarán los cambios no guardados.")) {
              return;
          }
      }
      onBack();
  };

  // DATAGRID COLUMN DEFS (Phase B)
  const hierarchyColDefs = useMemo(() => [
      { field: 'id_molde_hijo', headerName: 'MOLDE HIJO (NUEVO PSET/MOLDE)', flex: 1, editable: true },
      { field: 'hijos_min', headerName: 'HIJOS MIN', width: 90, editable: true },
      { field: 'hijos_max', headerName: 'HIJOS MAX (-1 = INFINITO)', width: 180, editable: true }
  ], []);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8f9ff] flex flex-col font-['Inter']">
       <MoldBuilderHeader
          onBack={guardedOnBack}
          activeMoldeId={activeMoldeId}
          setActiveMoldeId={handleNavigateToMolde}
          tiposEntidadDb={tiposEntidadDb as any}
       />

       <main className="p-4 bg-gray-200 shadow-inner flex flex-col flex-1 relative overflow-hidden">
          <div className="flex-1 w-full h-full shadow-lg rounded-t-lg overflow-hidden border border-[#d0dbec] bg-[#f8f9ff] flex gap-4 min-w-0 min-h-0 p-4 relative">
             
             {/* PANEL IZQUIERDO 60% */}
             <section className="w-[60%] flex flex-col gap-4 h-full shrink-0 overflow-hidden">
                
                {/* MACROFICHA A: SYS_MOLDES */}
                <div className="flex flex-col bg-white border border-[#d0dbec] rounded shadow-sm shrink-0">
                    <div className="w-full flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3 shrink-0 rounded-t">
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-[14px] text-[#121c2a] font-bold tracking-widest uppercase">
                                sys_moldes {isDirty && <span className="text-amber-600 ml-2 font-normal text-[10px]">*EDITANDO*</span>}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleNew} 
                                disabled={!isEditing && !isDirty && activeMoldeId === '__NEW__'}
                                className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-emerald-700 bg-emerald-50 border border-emerald-600 hover:bg-emerald-600 hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                + NUEVO
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving || (!isEditing && !isFormValid) || (isEditing && (!isDirty || !isFormValid))} 
                                className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                GUARDAR
                            </button>
                            <button 
                                onClick={handleDiscard} 
                                disabled={isSaving || (!isEditing && safeId.length === 0) || (isEditing && !isDirty)}
                                className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-slate-50 rounded-sm uppercase tracking-wide shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                DESCARTAR
                            </button>
                            <button 
                                onClick={handleDelete} 
                                disabled={isSaving || !isEditing}
                                className="w-[85px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-red-700 bg-red-50 border border-red-600 hover:bg-red-600 hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                BORRAR
                            </button>
                        </div>
                    </div>
                    <div className="p-3">
                        <PhaseAForm
                            currentData={currentData}
                            isEditing={isEditing}
                            safeId={safeId}
                            refreshKey={refreshKey}
                            handleChange={handleChange}
                            handleUpload={handleUpload}
                            tiposEntidadDb={tiposEntidadDb as any}
                            togglePadre={togglePadre}
                        />
                    </div>
                </div>

                {/* MACROFICHA B: SYS_REGLAS_JERARQUIA DATAGRID */}
                <div className="flex-1 w-full h-full shadow-lg rounded-t-lg overflow-hidden border border-[#d0dbec] flex flex-col min-w-0 min-h-0 bg-white relative">
                    {isGridLoading ? (
                         <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                            <p className="animate-pulse text-xs font-bold text-gray-500 tracking-wider">CARGANDO REGLAS...</p>
                         </div>
                    ) : null}
                    <SystemDataGrid
                        rowData={hierarchyData}
                        columnDefs={hierarchyColDefs}
                        primaryKeyField="id_regla"
                        moduleId="MOLD_BUILDER_V2"
                        toolbarTitle="sys_reglas_jerarquia"
                        readOnly={activeMoldeId === '__NEW__' || isDirty}
                        onAddRow={async () => {
                            if (!currentData.id_tipo_entidad) {
                                alert("El Molde necesita tener un ID Entidad (Relación) guardado para añadir reglas.");
                                return;
                            }
                            if (!window.confirm("¿Añadir nueva regla en blanco para editarla en la tabla?")) return;
                            try {
                                const response = await fetch('/api/raw-db/create', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ table: 'sys_reglas_jerarquia', pkColumn: 'id_molde_padre', pkValue: currentData.id_tipo_entidad, id_molde_hijo: 'NUEVO_HIJO' })
                                });
                                const res = await response.json();
                                if (res.success) {
                                    setRefreshKey(k => k + 1);
                                    await useDataStore.getState().init(); 
                                }
                            } catch (e: any) { alert("Error: " + e.message); }
                        }}
                        onDeleteSelected={async (nodes) => {
                            if (nodes.length === 0) return;
                            if (!window.confirm(`¿Borrar ${nodes.length} reglas seleccionadas?`)) return;
                            try {
                                let successCount = 0;
                                for (const n of nodes) {
                                    const pk = n.data.id_regla;
                                    const response = await fetch('/api/raw-db/delete', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ table: 'sys_reglas_jerarquia', pkColumn: 'id_regla', pkValue: pk })
                                    });
                                    if ((await response.json()).success) successCount++;
                                }
                                setRefreshKey(k => k + 1);
                                await useDataStore.getState().init(); 
                            } catch (e: any) { alert("Error resolviendo borrados."); }
                        }}
                    />
                </div>
             </section>

             {/* PANEL DERECHO 40% (CANVAS) */}
             <TopologySimulator
                tiposEntidadDb={tiposEntidadDb as any}
                currentData={currentData}
                currentChildren={hierarchyData.map(h => h.id_molde_hijo)}
                activeMoldeId={activeMoldeId}
                isEditing={isEditing}
                className="w-[40%] h-full shrink-0" 
                onNodeClick={handleNavigateToMolde}
             />
          </div>
       </main>
    </div>
  );
};
