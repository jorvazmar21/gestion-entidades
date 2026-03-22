import React, { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { SafeImage } from '../SafeImage';

interface Props {
  onBack: () => void;
}

const AVAILABLE_ICONS = ['sys_box.svg', 'sys_building.svg', 'sys_car.svg', 'sys_user.svg', 'sys_tool.svg', 'sys_folder.svg', 'app_logo.svg', 'sys_matrix.svg', 'sys_inventory.svg', 'sys_forge.svg'];
const CATEGORIES = ['ADMINISTRACION', 'LUGAR', 'OBRA', 'DELEGACION', 'MAQUINARIA', 'PERSONA', 'SISTEMA', 'HERRAMIENTA'];

const EMPTY_MOLD = { id_molde: '', nombre: '', id_nivel: 'L1', id_categoria: 'OBRA', icono: 'sys_box.svg', max_count: '' };

export const MoldBuilderScreen: React.FC<Props> = ({ onBack }) => {
  const { tiposEntidadDb, init } = useDataStore();
  
  const [activeMoldeId, setActiveMoldeId] = useState<string>('__NEW__');
  
  // Estado BORRADOR (se mantiene aunque el usuario salte a mirar otros moldes en el combo)
  const [draftData, setDraftData] = useState({ ...EMPTY_MOLD });
  const [draftChildren, setDraftChildren] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = activeMoldeId !== '__NEW__';
  const matchedMold = isEditing ? tiposEntidadDb.find(x => x.id_tipo === activeMoldeId) : null;

  // Los datos en pantalla son los del borrador (si es nuevo) o los oficiales (si es modo lectura)
  const currentData = isEditing && matchedMold ? {
      id_molde: matchedMold.id_tipo,
      nombre: matchedMold.nombre,
      id_nivel: matchedMold.nivel,
      id_categoria: matchedMold.categoria || 'GENERAL',
      icono: matchedMold.icono || 'sys_box.svg',
      max_count: matchedMold.max_count_per_parent ? matchedMold.max_count_per_parent.toString() : ''
  } : draftData;

  const currentChildren = isEditing && matchedMold 
      ? (matchedMold.tipos_hijo_permitidos || []) 
      : draftChildren;

  const safeDraftId = (draftData.id_molde || '').toUpperCase().replace(/[^A-Z0-9_]/g, '');
  const idExists = tiposEntidadDb.some(t => t.id_tipo === safeDraftId);

  // Validación robusta: todos los campos obligatorios rellenos y correctos
  const isFormValid = safeDraftId.length > 0 && draftData.nombre.length > 0 && !idExists && safeDraftId === draftData.id_molde;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isEditing) return; // Bloqueo anti-edición accidental
    if (e.target.name === 'id_molde') {
        const uppercaseClean = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        setDraftData({ ...draftData, id_molde: uppercaseClean });
    } else {
        setDraftData({ ...draftData, [e.target.name]: e.target.value });
    }
  };

  const toggleChild = (id_tipo: string) => {
    if (isEditing) return;
    if (draftChildren.includes(id_tipo)) {
      setDraftChildren(draftChildren.filter(c => c !== id_tipo));
    } else {
      setDraftChildren([...draftChildren, id_tipo]);
    }
  };

  const handleDiscard = () => {
      setDraftData({ ...EMPTY_MOLD });
      setDraftChildren([]);
  };

  const handleSave = async () => {
    if (isEditing) return;
    
    if (!isFormValid || idExists) {
        return; // Doble capa de seguridad (no debería ser clickeable)
    }

    setIsSaving(true);
    
    try {
        const payload = {
            id_molde: safeDraftId,
            nombre: draftData.nombre,
            id_nivel: draftData.id_nivel,
            id_categoria: draftData.id_categoria,
            sub_categoria: '',
            icono: draftData.icono,
            moldes_hijo_permitidos: draftChildren,
            reglas_config: draftData.max_count ? { max_count: Number(draftData.max_count) } : {}
        };

        const res = await fetch('/api/moldes/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            alert(`CDN inyectado con éxito. Molde ${safeDraftId} incorporado al núcleo.`);
            await init(); 
            handleDiscard(); // Borramos el draft una vez salvado con éxito
            setActiveMoldeId(safeDraftId); // Lo pasamos a ver en modo visualizador
        } else {
            alert('Error al guardar: ' + data.error);
        }
    } catch (e: any) {
        alert('Fallo crítico de red: ' + e.message);
    }
    setIsSaving(false);
  };

  // Navegación
  const handlePrev = () => {
      if (tiposEntidadDb.length === 0) return;
      if (activeMoldeId === '__NEW__') return setActiveMoldeId(tiposEntidadDb[tiposEntidadDb.length - 1].id_tipo);
      const idx = tiposEntidadDb.findIndex(t => t.id_tipo === activeMoldeId);
      if (idx > 0) setActiveMoldeId(tiposEntidadDb[idx - 1].id_tipo);
      else setActiveMoldeId('__NEW__');
  };

  const handleNext = () => {
      if (tiposEntidadDb.length === 0) return;
      if (activeMoldeId === '__NEW__') return setActiveMoldeId(tiposEntidadDb[0].id_tipo);
      const idx = tiposEntidadDb.findIndex(t => t.id_tipo === activeMoldeId);
      if (idx < tiposEntidadDb.length - 1) setActiveMoldeId(tiposEntidadDb[idx + 1].id_tipo);
      else setActiveMoldeId('__NEW__');
  };

  const levelNumber = parseInt(currentData.id_nivel.replace('L','')) || 1;
  const virtualParentLevel = `L${Math.max(1, levelNumber - 1)}`;

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8f9ff] flex flex-col font-['Inter']">
       {/* HEADER VIP CRIMSON LEDGER */}
       <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-50 w-full">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_forge.svg" fallbackType="svg" wrapperClassName="w-8 h-8 filter grayscale" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Diseñador ADN
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">ESCRITURA ESTRUCTURAL DE MOLDES (BLUEPRINT)</span>
           </div>
         </div>
         <div className="flex items-center gap-4">
           {/* SOLO 'INICIO' (Sacamos Guardar de aquí para meterlo en la Ficha Lógica) */}
           <button 
             onClick={onBack}
             className="w-[100px] h-[28px] flex items-center justify-center text-[10px] leading-[11px] text-center font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white rounded-sm uppercase tracking-wide shadow-sm transition-colors"
           >
             INICIO
           </button>
         </div>
       </header>

       {/* TOOLBAR SECUNDARIA ESTILO VISOR DE TABLAS */}
       <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-40 w-full">
         <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-[#121c2a] transition-colors uppercase cursor-pointer">
               ◀ Anterior
            </button>
            <select 
               value={activeMoldeId}
               onChange={(e) => setActiveMoldeId(e.target.value)}
               className={`text-sm min-w-[300px] text-center bg-white border border-[#d0dbec] rounded py-1 px-4 cursor-pointer focus:outline-none focus:border-[#7f1d1d] shadow-sm transition-colors ${activeMoldeId === '__NEW__' ? 'text-gray-500 font-normal italic' : 'text-[#7f1d1d] font-bold uppercase tracking-wider'}`}
            >
               <option value="__NEW__" className="text-gray-500 font-normal italic">Nuevo molde...</option>
               {tiposEntidadDb.map(t => (
                   <option key={t.id_tipo} value={t.id_tipo} className="text-[#121c2a] font-bold uppercase tracking-wider">{t.id_tipo} - {t.nombre.replace(/_/g, ' ')}</option>
               ))}
            </select>
            <button onClick={handleNext} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-[#121c2a] transition-colors uppercase cursor-pointer">
               Siguiente ▶
            </button>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-[10px] text-gray-500 font-mono font-bold bg-[#f1f3fc] px-4 py-1.5 rounded border border-[#d0dbec] uppercase tracking-widest">
                {tiposEntidadDb.length} Registrados
            </div>
         </div>
       </div>

       {/* MACRO-FICHA ENCAPSULADA ESTILO DATAGRID (VISOR EXCEL) */}
       <main className="p-4 bg-gray-200 shadow-inner flex flex-col flex-1 relative overflow-hidden">
          <div className="flex-1 w-full h-full shadow-lg rounded-t-lg overflow-hidden border border-[#d0dbec] bg-[#f8f9ff] flex flex-col min-w-0 min-h-0 p-6 relative">
             
             {/* CABECERA INTERNA DE LA FICHA APLICATIVA (BOTONERAS DE MÓDULO) */}
             <div className="w-full flex items-center justify-between mb-4 border-b border-gray-200 pb-3 shrink-0">
                 <div className="flex items-center gap-4">
                     <span className="font-mono text-[10px] text-[#121c2a] font-bold tracking-widest shadow-sm bg-white px-3 py-1.5 rounded border border-[#d0dbec]">
                         {isEditing ? `VISOR DE MOLDES > ${currentData.id_molde}` : 'TABLA DESTINO: sys_moldes'}
                     </span>
                     {!isEditing && (
                         <>
                             <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                             <button 
                                onClick={handleSave} 
                                disabled={isSaving || !isFormValid} 
                                className="px-5 py-1.5 min-w-[120px] flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-[#5f030a] to-[#7f1d1d] hover:opacity-90 rounded-sm uppercase tracking-wider shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                             >
                                {isSaving ? 'GUARDANDO...' : 'GUARDAR MOLDE'}
                             </button>
                             <button 
                                onClick={handleDiscard} 
                                disabled={isSaving}
                                className="px-5 py-1.5 min-w-[120px] flex items-center justify-center text-[10px] font-bold text-[#7f1d1d] bg-white border border-[#7f1d1d] hover:bg-red-50 rounded-sm uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                             >
                                DESCARTAR
                             </button>
                         </>
                     )}
                     {isEditing && (
                         <div className="flex items-center gap-2">
                             <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                             <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-sm font-mono shadow-sm tracking-widest font-bold">
                                 [ CRISTAL DE LECTURA ACTIVO ]
                             </span>
                             <span className="text-[10px] text-gray-500 italic ml-2">La alteración de la genética en caliente está restringida en producción.</span>
                         </div>
                     )}
                 </div>
                 
                 {/* Alertas de relleno Formulario en caliente */}
                 {!isEditing && (
                     <div className="flex items-center gap-2">
                         {idExists ? (
                            <span className="text-[10px] text-white font-bold bg-[#7f1d1d] px-3 py-1.5 rounded-sm shadow-sm flex items-center gap-2 uppercase tracking-wide">
                                ⚠️ EL ID SELECCIONADO YA EXISTE
                            </span>
                         ) : !isFormValid ? (
                            <span className="text-[9px] text-[#5f030a] bg-red-50 px-3 py-1.5 rounded-sm border border-red-100 uppercase tracking-widest">
                                RELLENA ID Y NOMBRE PARA GUARDAR
                            </span>
                         ) : (
                            <span className="text-[9px] text-[#00313e] font-bold bg-[#e6eeff] px-3 py-1.5 rounded-sm border border-[#00313e]/20 uppercase tracking-widest">
                                ✓ EL MOLDE ES VÁLIDO PARA INYECCIÓN
                            </span>
                         )}
                     </div>
                 )}
             </div>

             <div className="flex-1 flex w-full gap-6 overflow-hidden">
                
                {/* PANEL IZQ: FORMULARIO INGENIERÍA */}
                <section className="w-[55%] flex flex-col gap-4 overflow-y-auto pr-2 styled-scrollbar relative">
                   {/* Capa Bloqueadora Fantasma si está en lectura */}
                   {isEditing && <div className="absolute inset-0 z-50 cursor-not-allowed"></div>}
                   
                   {/* Bloque A */}
                   <div className={`bg-[#ffffff] p-5 rounded-sm border-l-4 ${isEditing ? 'border-gray-200 opacity-70' : 'border-[#7f1d1d] shadow-sm'}`}>
                      <h3 className="text-[11px] font-bold text-[#5f030a] uppercase mb-4 tracking-widest flex items-center gap-2">
                         Fase A: Identidad Biológica {isEditing && '(Solo Lectura)'}
                      </h3>
                      <div className="grid grid-cols-2 gap-5">
                         <div>
                           <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">ID Molde (Prefijo BD)</label>
                           <input name="id_molde" value={currentData.id_molde} onChange={handleChange} disabled={isEditing} placeholder="Ej: OBR, MAQ" maxLength={10} className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm font-mono text-[11px] uppercase transition-colors focus:bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 disabled:border-gray-300" />
                         </div>
                         <div>
                           <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Nombre Descriptivo</label>
                           <input name="nombre" value={currentData.nombre} onChange={handleChange} disabled={isEditing} placeholder="Ej: Obra Civil, Trabajador..." className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] transition-colors focus:bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 disabled:border-gray-300" />
                         </div>
                      </div>

                      <div className="mt-4">
                         <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-2">Avatar Visual (Icono Prediseñado)</label>
                         <div className="flex gap-2 flex-wrap">
                            {AVAILABLE_ICONS.map(i => (
                               <div key={i} onClick={() => !isEditing && setDraftData({...draftData, icono: i})} className={`w-8 h-8 p-1.5 rounded-sm transition-colors ${!isEditing ? 'cursor-pointer' : ''} ${currentData.icono === i ? 'bg-[#ffffff] border-b-2 border-[#5f030a] shadow-sm' : 'bg-[#eff4ff] border-b-2 border-transparent hover:min-bg-gray-100'}`}>
                                  <SafeImage src={`/icons/${i}`} fallbackType="svg" wrapperClassName={`w-full h-full ${isEditing ? 'opacity-50' : ''}`} className="w-full h-full object-contain" />
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Bloque B */}
                   <div className={`bg-[#ffffff] p-5 rounded-sm border-l-4 ${isEditing ? 'border-gray-200 opacity-70' : 'border-gray-300 shadow-sm'}`}>
                      <h3 className="text-[11px] font-bold text-gray-500 uppercase mb-4 tracking-widest">Fase B: Posicionamiento</h3>
                      <div className="grid grid-cols-2 gap-5">
                         <div>
                           <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Estrato Analítico L</label>
                           <select name="id_nivel" value={currentData.id_nivel} onChange={handleChange} disabled={isEditing} className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] font-bold focus:bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 disabled:border-gray-300">
                              {['L1','L2','L3','L4','L5'].map(l => <option key={l} value={l}>Estrato {l}</option>)}
                           </select>
                         </div>
                         <div>
                           <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Categoría Macro</label>
                           <select name="id_categoria" value={currentData.id_categoria} onChange={handleChange} disabled={isEditing} className="w-full p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] uppercase focus:bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 disabled:border-gray-300">
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                         </div>
                      </div>
                   </div>

                   {/* Bloque C */}
                   <div className={`bg-[#ffffff] p-5 rounded-sm border-l-4 flex-1 flex flex-col relative overflow-hidden ${isEditing ? 'border-gray-200 opacity-70' : 'border-gray-300 shadow-sm'}`}>
                      <h3 className="text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-widest relative z-10">Fase C: Hijos Admitidos</h3>
                      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                         {tiposEntidadDb.filter(t => t.id_tipo !== currentData.id_molde).map(t => {
                            const isActive = currentChildren.includes(t.id_tipo);
                            return (
                               <button 
                                  key={t.id_tipo} 
                                  onClick={() => toggleChild(t.id_tipo)}
                                  disabled={isEditing}
                                  className={`px-2.5 py-1 rounded-sm text-[9px] font-bold border flex items-center gap-1.5 transition-all ${isActive ? 'bg-[#27313f] text-white border-[#121c2a] shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'} ${isEditing? 'cursor-default': 'cursor-pointer'}`}
                               >
                                  <span>{t.nombre}</span>
                                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#dec0bd]"></div>}
                               </button>
                            );
                         })}
                      </div>
                      <div className="relative z-10">
                         <label className="block text-[10px] font-bold text-[#121c2a] uppercase mb-1">Multiplicidad Máxima (Opcional)</label>
                         <input type="number" name="max_count" value={currentData.max_count} onChange={handleChange} disabled={isEditing} placeholder="Vacío = Infinito" className="w-[150px] p-2 bg-[#eff4ff] border-t-0 border-r-0 border-l-0 border-b-2 border-transparent focus:border-[#7f1d1d] rounded-t-sm text-[11px] focus:bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 disabled:border-gray-300" />
                      </div>
                   </div>
                </section>

                {/* PANEL DER: SIMULADOR HOLOGRÁFICO */}
                <section className="w-[45%] bg-[#e6eeff] rounded-sm p-6 relative flex flex-col items-center justify-start overflow-y-auto border border-[#dec0bd] shadow-inner styled-scrollbar">
                   <h3 className="absolute top-4 left-4 text-[#5f030a] text-[9px] font-mono tracking-[0.2em] font-bold uppercase">Simulador Arquitectónico Vivo</h3>
                   <div className="mt-12 flex flex-col items-center w-full relative z-10">
                      {levelNumber > 1 && (
                        <div className="flex flex-col items-center opacity-70">
                           <div className="w-32 py-1.5 border border-[#7f1d1d]/30 rounded-sm bg-white text-[#5f030a] text-center font-bold text-[9px] shadow-sm uppercase tracking-widest">
                              Ramas {virtualParentLevel} Padre
                           </div>
                           <div className="w-[2px] h-8 bg-gradient-to-b from-[#7f1d1d]/30 to-[#5f030a]"></div>
                        </div>
                      )}
                      <div className="relative z-20 mt-1">
                         <div className="px-6 py-4 bg-gradient-to-br from-[#5f030a] to-[#7f1d1d] rounded-sm shadow-md flex flex-col items-center relative z-10 w-56 border border-[#dec0bd]/20 transition-transform">
                             <span className="text-[8px] uppercase tracking-widest font-bold text-[#dec0bd] bg-black/20 px-2 py-0.5 rounded-sm mb-2">
                                 ESTRATO {currentData.id_nivel}
                             </span>
                             <div className="bg-white p-2 rounded-full mb-2 shadow-[0_2px_5px_rgba(0,0,0,0.2)]">
                                <SafeImage src={`/icons/${currentData.icono}`} fallbackType="svg" wrapperClassName="w-6 h-6" className="w-full h-full object-contain filter grayscale" />
                             </div>
                             <h2 className="text-white font-bold font-['Manrope'] text-sm text-center leading-tight tracking-wide">
                                 {currentData.nombre || 'NUEVO MOLDE'}
                             </h2>
                         </div>
                      </div>
                      {currentChildren.length > 0 && (
                         <div className="flex flex-col items-center w-full z-10 mt-1">
                            <div className="w-[2px] h-8 bg-[#7f1d1d]"></div>
                            <div className="relative w-[75%] flex justify-center">
                               <div className="absolute top-0 w-full h-[2px] bg-[#27313f]"></div>
                            </div>
                            <div className="flex justify-center w-full pt-6 flex-wrap gap-4 relative">
                               {currentChildren.map(childId => {
                                  const childData = tiposEntidadDb.find(t => t.id_tipo === childId);
                                  return (
                                     <div key={childId} className="flex-1 min-w-[80px] max-w-[100px] flex flex-col items-center">
                                        <div className="w-[2px] h-6 bg-[#27313f] absolute -mt-6"></div>
                                        <div className="px-2 py-2 bg-[#ffffff] border border-gray-200 rounded-sm shadow-sm border-b-4 border-b-[#27313f] w-full flex flex-col items-center text-center">
                                           <SafeImage src={`/icons/${childData?.icono || 'sys_box.svg'}`} fallbackType="svg" wrapperClassName="w-4 h-4 mb-1 opacity-60 filter grayscale" className="w-full h-full object-contain" />
                                           <span className="text-[#121c2a] font-bold text-[8px] leading-tight w-full uppercase tracking-widest line-clamp-2">{childData?.nombre}</span>
                                        </div>
                                     </div>
                                  )
                               })}
                            </div>
                         </div>
                      )}
                   </div>
                </section>

             </div>
          </div>
       </main>
    </div>
  );
};
