/**
 * @module MediaManagerScreen
 * @description Centro de Control Visual de la aplicación (Branding e Iconografía).
 * @inputs Archivos seleccionados localmente en formato multimedia (.svg, .png, .jpg).
 * @actions Convierte imágenes a Base64, las envía al backend proxy, dispara recarga de variables y consolida UI.
 * @files src/components/MediaManagerScreen.tsx
 */
import React, { useState } from 'react';
import { useUiStore } from '../store/useUiStore';
import { useDataStore } from '../store/useDataStore';
import { SafeImage } from './SafeImage';

export function MediaManagerScreen() {
  const setScreen = useUiStore(state => state.setScreen);
  const { tiposEntidadDb } = useDataStore();
  const orderL1 = ['OBR', 'SED', 'PRQ', 'PRO', 'CLI'];
  const l1Modules = tiposEntidadDb.filter(t => t.nivel === 'L1').sort((a, b) => {
      const indexA = orderL1.indexOf(a.id_tipo);
      const indexB = orderL1.indexOf(b.id_tipo);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
  });
  const l2Modules = tiposEntidadDb.filter(t => t.nivel === 'L2');
  const l3Modules = tiposEntidadDb.filter(t => t.nivel === 'L3');
  const lmModules = tiposEntidadDb.filter(t => t.nivel === 'Lm');
  const lnModules = tiposEntidadDb.filter(t => t.nivel === 'Ln');
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
        } else {
          alert('Error de servidor: ' + data.error);
        }
      } catch (err) {
        alert('Error conectando al servidor.');
      } finally {
        targetInput.value = ''; // Limpiar el input para permitir elegir el mismo archivo otra vez
      }
    };
    reader.readAsDataURL(file);
  };

  const MediaCard = ({ title, filename, accept, desc }: { title: string, filename: string, accept: string, desc?: string }) => (
    <div className="flex flex-col items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative hover:border-blue-400 hover:shadow-md transition-all h-full">
       <div className="h-20 w-full flex items-center justify-center bg-[#f8f9ff] rounded mb-3 overflow-hidden border border-[#cbd5e1] p-2">
         <img 
           key={`${filename}-${refreshKey}`}
           src={`/${filename}?v=${refreshKey}`} 
           className="max-h-full max-w-full object-contain"
           alt={title}
           onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
         />
         <span className="text-3xl opacity-20 hidden">❌</span>
       </div>
       <div className="text-center w-full mb-3 flex-1 flex flex-col justify-start">
         <span className="text-[11px] font-bold text-gray-800 uppercase leading-tight block">{title}</span>
         {desc && <span className="text-[9px] text-gray-400 mt-1 block leading-tight">{desc}</span>}
         <span className="text-[9px] font-mono text-blue-500 mt-2 block bg-blue-50 px-1 py-1 rounded truncate w-full" title={filename}>{filename}</span>
       </div>
       <label className="cursor-pointer bg-[#edf2fc] text-[#475569] hover:bg-blue-600 hover:text-white px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest border border-[#cbd5e1] w-full text-center transition-colors shadow-sm">
          Cargar {accept.replace(/\./g, '').toUpperCase()}
          <input type="file" accept={accept} className="hidden" onChange={(e) => handleUpload(e, filename)} />
       </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-['Inter'] relative w-full overflow-hidden">
       {/* CABECERA */}
       <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-10">
         <div className="flex items-center gap-3">
           <SafeImage src="/icons/sys_media.svg" fallbackType="svg" wrapperClassName="w-8 h-8" className="w-full h-full object-contain" />
           <div>
             <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] leading-none mb-1">
               Gestor de Media Global
             </h1>
             <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.15em] border-t border-gray-100 pt-1">Centro de Control Visual Avanzado</span>
           </div>
         </div>
         <button 
           onClick={() => setScreen('HOME')}
           className="bg-white text-[#7f1d1d] border border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white px-6 py-2 rounded font-bold text-xs uppercase tracking-widest shadow-sm transition-colors"
         >
           Volver al Inicio
         </button>
       </header>

       <main className="flex-1 p-8 overflow-y-auto w-full max-w-[1400px] mx-auto space-y-12 relative z-10">
          
          {/* SECCIÓN 1 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-600 rounded-sm block shadow-sm"></span>
                Branding Global & Fondos
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                <MediaCard title="Favicon (Pestaña navegador)" filename="media/favicon.svg" accept=".svg,.png" desc="Icono vectorial del navegador" />
                <MediaCard title="Logo Principal App" filename="media/logo-fractales.svg" accept=".svg" desc="Logo visible en Login y menús superiores" />
                <MediaCard title="Fondo Pantalla Login" filename="media/Fondo Logueo 01.jpg" accept=".jpg,.jpeg" desc="Imagen fotográfica a pantalla completa" />
             </div>
          </section>

          {/* SECCIÓN 2 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-sm block shadow-sm"></span>
                Iconos Útiles de Interfaz (UI)
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                <MediaCard title="Candado Contraseña" filename="icons/ui_candado.svg" accept=".svg" />
                <MediaCard title="Email Usuario" filename="icons/ui_email.svg" accept=".svg" />
                <MediaCard title="Borrar (Papelera)" filename="icons/ui_trash.svg" accept=".svg" desc="Acciones eliminar" />
                <MediaCard title="Alerta Admin (Escudo)" filename="icons/ui_shield.svg" accept=".svg" desc="Modo Bypass Permisos" />
                <MediaCard title="Buscador (Lupa)" filename="icons/ui_search.svg" accept=".svg" desc="Lupa de texto" />
                <MediaCard title="Centro de Alertas" filename="icons/ui_alert.svg" accept=".svg" desc="Campana de notificaciones (Botonera Usuario)" />
                <MediaCard title="Centro de Ayuda" filename="icons/ui_info.svg" accept=".svg" desc="Circulo de ayuda / documentación" />
                <MediaCard title="Configuración Usuario" filename="icons/ui_settings.svg" accept=".svg" desc="Tuerca de ajustes (Botonera Usuario)" />
              </div>
          </section>

          <section className="mb-12">
             <div className="flex items-center gap-3 mb-6">
               <h3 className="text-[#121c2a] font-bold text-[16px] tracking-wide font-['Manrope']">Iconografía de Departamentos</h3>
               <div className="h-[1px] bg-slate-200 flex-1"></div>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                <MediaCard title="Departamento Estudios" filename="icons/dept_estudios.svg" accept=".svg" />
                <MediaCard title="Departamento Administración" filename="icons/dept_administracion.svg" accept=".svg" />
                <MediaCard title="Departamento RRHH" filename="icons/dept_rrhh.svg" accept=".svg" />
                <MediaCard title="Departamento PRL" filename="icons/dept_prl.svg" accept=".svg" />
                <MediaCard title="Departamento Calidad" filename="icons/dept_calidad.svg" accept=".svg" />
                <MediaCard title="Departamento Medioambiente" filename="icons/dept_medioambiente.svg" accept=".svg" />
                <MediaCard title="Departamento Oficina Técnica" filename="icons/dept_of_tecnica.svg" accept=".svg" />
                <MediaCard title="Departamento Producción" filename="icons/dept_produccion.svg" accept=".svg" />
                <MediaCard title="Departamento Dirección" filename="icons/dept_direccion.svg" accept=".svg" />
             </div>
          </section>

          {/* SECCIÓN 2.5 ARQUITECTURA Y SISTEMA */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-[#7f1d1d] rounded-sm block shadow-sm"></span>
                Iconos Arquitectura y Sistemas
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                <MediaCard title="Gestión Tipos" filename="icons/sys_tipos.svg" accept=".svg" />
                <MediaCard title="Diccionario Dts" filename="icons/sys_diccionario.svg" accept=".svg" />
                <MediaCard title="Tablas Raw" filename="icons/sys_raw.svg" accept=".svg" />
                <MediaCard title="Gestor Media" filename="icons/sys_media.svg" accept=".svg" />
                <MediaCard title="WYSIWYG Layout" filename="icons/sys_wysiwyg.svg" accept=".svg" />
                <MediaCard title="Mostrar Tabiques" filename="icons/sys_tabiques.svg" accept=".svg" />
                <MediaCard title="Fragua Arquetipos" filename="icons/sys_forge.svg" accept=".svg" />
                <MediaCard title="Catálogo Inv." filename="icons/sys_inventory.svg" accept=".svg" />
                <MediaCard title="Mesa de Cruce" filename="icons/sys_matrix.svg" accept=".svg" />
             </div>
          </section>

          {/* SECCIÓN 3 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-600 rounded-sm block shadow-sm"></span>
                Entornos Operativos (Módulos L1 a Ln)
             </h2>

             {/* Nivel L1 */}
             <div className="mb-8">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">L1 - Lugares (Hubs)</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {l1Modules.map(mod => (
                    <MediaCard key={mod.id_tipo} title={mod.nombre} filename={mod.icono ? (mod.icono.includes('.svg') ? `icons/${mod.icono}` : `icons/${mod.icono}.svg`) : `icons/mod_${mod.id_tipo}.svg`} accept=".svg" />
                  ))}
                  {!l1Modules.some(m => m.id_tipo === 'AGE') && (
                    <MediaCard title="Gestión de Agentes" filename="icons/mod_AGE.svg" accept=".svg" />
                  )}
               </div>
             </div>

             {/* Nivel L2 */}
             {l2Modules.length > 0 && (
             <div className="mb-8 border-t border-gray-100 pt-6">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">L2 - Delegaciones</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {l2Modules.map(mod => (
                    <MediaCard key={mod.id_tipo} title={mod.nombre} filename={mod.icono ? (mod.icono.includes('.svg') ? `icons/${mod.icono}` : `icons/${mod.icono}.svg`) : `icons/mod_${mod.id_tipo}.svg`} accept=".svg" />
                  ))}
               </div>
             </div>
             )}

             {/* Nivel L3 */}
             {l3Modules.length > 0 && (
             <div className="mb-8 border-t border-gray-100 pt-6">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">L3 - Eventos</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {l3Modules.map(mod => (
                    <MediaCard key={mod.id_tipo} title={mod.nombre} filename={mod.icono ? (mod.icono.includes('.svg') ? `icons/${mod.icono}` : `icons/${mod.icono}.svg`) : `icons/mod_${mod.id_tipo}.svg`} accept=".svg" />
                  ))}
               </div>
             </div>
             )}

             {/* Nivel Lm */}
             {lmModules.length > 0 && (
             <div className="mb-8 border-t border-gray-100 pt-6">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Lm - Desgloses</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {lmModules.map(mod => (
                    <MediaCard key={mod.id_tipo} title={mod.nombre} filename={mod.icono ? (mod.icono.includes('.svg') ? `icons/${mod.icono}` : `icons/${mod.icono}.svg`) : `icons/mod_${mod.id_tipo}.svg`} accept=".svg" />
                  ))}
               </div>
             </div>
             )}

             {/* Nivel Ln */}
             {lnModules.length > 0 && (
             <div className="mb-8 border-t border-gray-100 pt-6">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Ln - Medios</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {lnModules.map(mod => (
                    <MediaCard key={mod.id_tipo} title={mod.nombre} filename={mod.icono ? (mod.icono.includes('.svg') ? `icons/${mod.icono}` : `icons/${mod.icono}.svg`) : `icons/mod_${mod.id_tipo}.svg`} accept=".svg" />
                  ))}
               </div>
             </div>
             )}
          </section>

          {/* SECCIÓN 4: RESPALDO GENÉRICOS */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-[#1e293b] rounded-sm block shadow-sm"></span>
                Válvulas de Seguridad y Respaldo (Generics)
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                <MediaCard title="SVG Genérico" filename="generics/SVG_Generico.svg" accept=".svg" desc="Escudo/Respaldo ante iconos borrados" />
                <MediaCard title="JPG Genérico" filename="generics/JPG_Generico.jpg" accept=".jpg,.jpeg" desc="Respaldo fotográfico plano" />
                <MediaCard title="PNG Genérico" filename="generics/PNG_Generico.png" accept=".png" desc="Respaldo de avatares/transparencias" />
             </div>
          </section>

       </main>
    </div>
  );
}
