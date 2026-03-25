import React, { useState, useEffect } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { MoldBuilderHeader } from './moldes/MoldBuilderHeader';
import { PhaseAForm } from './moldes/PhaseAForm';
import { PhaseBChildren } from './moldes/PhaseBChildren';
import { TopologySimulator } from './moldes/TopologySimulator';

interface Props {
  onBack: () => void;
}

const EMPTY_MOLD = { id_molde: '', nombre: '', id_nivel: 'L1', descripcion: '', icono: 'sys_box.svg', max_count: '', min_count: '' };

export const MoldBuilderScreen: React.FC<Props> = ({ onBack }) => {
  const { tiposEntidadDb, init } = useDataStore();
  
  const [activeMoldeId, setActiveMoldeId] = useState<string>('__NEW__');
  const isEditing = activeMoldeId !== '__NEW__';
  
  // ESTADO MODULAR: BORRADOR (NUEVO)
  const [draftData, setDraftData] = useState({ ...EMPTY_MOLD });
  const [draftChildren, setDraftChildren] = useState<string[]>([]);
  
  // ESTADO MODULAR: EDICIÓN (EXISTENTE)
  const [editData, setEditData] = useState({ ...EMPTY_MOLD });
  const [editChildren, setEditChildren] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
             setEditData({
                 id_molde: t.id_tipo,
                 nombre: t.nombre,
                 id_nivel: t.nivel,
                 descripcion: t.categoria || '', // El store envía la descripción por este key legacy
                 icono: t.icono || 'sys_box.svg',
                 max_count: t.max_count_per_parent ? t.max_count_per_parent.toString() : '',
                 min_count: t.min_count_per_parent ? t.min_count_per_parent.toString() : ''
             });
             setEditChildren(t.tipos_hijo_permitidos || []);
         }
     }
  }, [activeMoldeId, tiposEntidadDb, isEditing]);

  const currentData = isEditing ? editData : draftData;
  const currentChildren = isEditing ? editChildren : draftChildren;

  // LÓGICA DE DIRTINESS Y VALIDACIÓN
  const originalMold = isEditing ? tiposEntidadDb.find(x => x.id_tipo === activeMoldeId) : null;
  const isDirty = originalMold && (
      editData.nombre !== originalMold.nombre ||
      editData.id_nivel !== originalMold.nivel ||
      editData.descripcion !== (originalMold.categoria || '') ||
      editData.icono !== (originalMold.icono || 'sys_box.svg') ||
      editData.max_count !== (originalMold.max_count_per_parent ? originalMold.max_count_per_parent.toString() : '') ||
      editData.min_count !== (originalMold.min_count_per_parent ? originalMold.min_count_per_parent.toString() : '') ||
      JSON.stringify([...editChildren].sort()) !== JSON.stringify([...(originalMold.tipos_hijo_permitidos || [])].sort())
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

  const toggleChild = (id_tipo: string) => {
    const children = isEditing ? editChildren : draftChildren;
    const setFn = isEditing ? setEditChildren : setDraftChildren;
    
    if (children.includes(id_tipo)) {
      setFn(children.filter(c => c !== id_tipo));
    } else {
      setFn([...children, id_tipo]);
    }
  };

  // MANEJADORES DE BOTONES CRUD
  const handleDiscard = () => {
      if (isEditing && originalMold) {
          // Revertir edición a su estado original
          setEditData({
             id_molde: originalMold.id_tipo,
             nombre: originalMold.nombre,
             id_nivel: originalMold.nivel,
             descripcion: originalMold.categoria || '',
             icono: originalMold.icono || 'sys_box.svg',
             max_count: originalMold.max_count_per_parent ? originalMold.max_count_per_parent.toString() : '',
             min_count: originalMold.min_count_per_parent ? originalMold.min_count_per_parent.toString() : ''
          });
          setEditChildren(originalMold.tipos_hijo_permitidos || []);
      } else {
          // Vaciar borrador
          setDraftData({ ...EMPTY_MOLD });
          setDraftChildren([]);
      }
  };

  const handleSave = async () => {
    if (!isFormValid) return;
    if (isEditing && !isDirty) return;

    setIsSaving(true);
    
    try {
        const payload = {
            id_molde: isEditing ? activeMoldeId : safeId, // Forzar ID original si es edición
            nombre: currentData.nombre,
            id_nivel: currentData.id_nivel,
            descripcion: currentData.descripcion,
            icono_sistema: currentData.icono,
            reglas_config: { admite_hijos: currentChildren, max_hijos: currentData.max_count ? Number(currentData.max_count) : null, min_hijos: currentData.min_count ? Number(currentData.min_count) : 0 }
        };

        const res = await fetch('/api/moldes/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            alert(`Molde ${payload.id_molde} ${isEditing ? 'actualizado' : 'creado'} correctamente.`);
            await init(); 
            if (!isEditing) {
                handleDiscard(); // Borramos el borrador
                setActiveMoldeId(payload.id_molde); // Lo enfocamos
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
          const res = await fetch('/api/moldes/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_molde: activeMoldeId })
          });
          const data = await res.json();
          if (data.success) {
              alert(`Molde ${activeMoldeId} borrado.`);
              setActiveMoldeId('__NEW__');
              await init();
          } else {
              alert('Fallo al borrar: ' + data.error);
          }
      } catch (e: any) {
          alert('Fallo de red al borrar: ' + e.message);
      }
      setIsSaving(false);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8f9ff] flex flex-col font-['Inter']">
       <MoldBuilderHeader
          onBack={onBack}
          activeMoldeId={activeMoldeId}
          setActiveMoldeId={setActiveMoldeId}
          tiposEntidadDb={tiposEntidadDb as any}
       />

       <main className="p-4 bg-gray-200 shadow-inner flex flex-col flex-1 relative overflow-hidden">
          <div className="flex-1 w-full h-full shadow-lg rounded-t-lg overflow-hidden border border-[#d0dbec] bg-[#f8f9ff] flex flex-col min-w-0 min-h-0 p-6 relative">
             
             {/* CABECERA INTERNA DE LA FICHA APLICATIVA (BOTONERAS DE MÓDULO) */}
             <div className="w-full flex items-center justify-between mb-4 border-b border-gray-200 pb-3 shrink-0">
                 <div className="flex items-center gap-4">
                     <span className="font-mono text-[14px] text-[#121c2a] font-bold tracking-widest uppercase">
                         sys_moldes
                     </span>
                 </div>
                 
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={handleSave} 
                        disabled={isSaving || (!isEditing && !isFormValid) || (isEditing && (!isDirty || !isFormValid))} 
                        className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                     >
                        GUARDAR
                     </button>
                     <button 
                        onClick={handleDiscard} 
                        disabled={isSaving || (isEditing && !isDirty)}
                        className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                     >
                        DESCARTAR
                     </button>
                     <button 
                         onClick={handleDelete} 
                         disabled={isSaving || !isEditing}
                         className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                     >
                         BORRAR
                     </button>
                 </div>
             </div>

             <div className="flex-1 flex w-full gap-6 overflow-hidden">
                <section className="w-[55%] flex flex-col gap-4 h-full pr-2 pb-2">
                   <PhaseAForm
                      currentData={currentData}
                      isEditing={isEditing}
                      safeId={safeId}
                      refreshKey={refreshKey}
                      handleChange={handleChange}
                      handleUpload={handleUpload}
                   />
                   <PhaseBChildren
                      tiposEntidadDb={tiposEntidadDb as any}
                      currentData={currentData}
                      currentChildren={currentChildren}
                      toggleChild={toggleChild}
                      handleChange={handleChange}
                   />
                </section>
                <TopologySimulator
                   tiposEntidadDb={tiposEntidadDb as any}
                   currentData={currentData}
                   currentChildren={currentChildren}
                   activeMoldeId={activeMoldeId}
                   isEditing={isEditing}
                />
             </div>
          </div>
       </main>
    </div>
  );
};
