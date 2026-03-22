import React from 'react';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { SafeImage } from './SafeImage';

export const HomeScreen: React.FC = () => {
  const { tiposEntidadDb, loading, error } = useDataStore();
  const { activeUser, userRole, logout } = useAuthStore();
  const { navigateToModule, setScreen } = useUiStore();

  const handleLogout = () => {
    logout();
    setScreen('LOGIN');
  };

  // Los Entornos Operativos (Módulos) son los niveles 'L1' del CSV de tipos
  const l1Modules = tiposEntidadDb.filter(t => t.nivel === 'L1');

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-['Inter'] relative w-full overflow-hidden">
      {/* HEADER GLOBAL DEL DASHBOARD INICIO */}
      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 relative z-10 shadow-sm">
        <div className="flex items-center gap-3">
           <SafeImage 
             src="/branding/logo-fractales.svg" 
             alt="NORTUNEL ERP" 
             wrapperClassName="w-[30px] h-[30px]"
             className="w-full h-full object-contain" 
             fallbackType="svg"
           />
           <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] hidden sm:block">
             FRACTAL CORE 1.0 <span className="text-gray-400 font-normal">| SISTEMA MAESTRO</span>
           </h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#7f1d1d] font-bold text-xs border border-gray-200">
                {activeUser?.substring(0, 2).toUpperCase()}
             </span>
             <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800">{activeUser}</span>
                <span className="text-[10px] uppercase text-gray-500 tracking-wider" title={userRole === 'ADMIN' ? 'Gestión Estructural y Configuración' : 'Modo Operacional'}>
                  {userRole}

                </span>
             </div>
           </div>
           <div className="w-[1px] h-6 bg-gray-200 hidden sm:block"></div>
           <button 
             onClick={handleLogout} 
             className="text-xs font-semibold text-gray-500 hover:text-[#7f1d1d] uppercase tracking-wider transition-colors"
           >
             Cerrar Sesión
           </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 py-10 px-4 sm:px-8 md:px-12 overflow-y-auto relative z-10 w-full">
        <div className="w-full">
          
          {loading && (
             <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-[#7f1d1d] border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Cargando Diccionarios y Configuración...</div>
             </div>
          )}
          {error && <div className="text-center py-12 text-red-600 bg-red-50 rounded-md border border-red-200">Error de Sistema: {error}</div>}

          {!loading && !error && (
             <div className="flex flex-col gap-12">
               
               {/* FICHA ENTORNOS OPERATIVOS */}
               <div className="animate-[fadeIn_0.3s_ease-out]">
                  <h3 className="text-[12px] font-bold text-[#8a716f] uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7f1d1d] rounded-sm block"></span>
                    Entornos Operativos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                     {l1Modules.map(mod => (
                        <button 
                          key={mod.id_tipo} 
                          onClick={() => navigateToModule(mod.id_tipo)}
                          className="flex flex-col items-start justify-center bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-[#7f1d1d]/40 transition-all group min-h-[130px] relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-red-50 transition-colors"></div>
                           
                           <img 
                             src={`/icons/mod_${mod.id_tipo}.svg?v=${Date.now()}`} 
                             className="w-10 h-10 mb-3 object-contain relative z-10 transition-transform group-hover:scale-110"
                             alt={mod.nombre}
                             onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                             }}
                           />
                           <span className="text-2xl mb-3 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform relative z-10 text-[#7f1d1d] hidden">
                             {mod.icono || '📁'}
                           </span>
                           
                           <span className="font-bold text-gray-800 group-hover:text-[#7f1d1d] transition-colors text-sm uppercase tracking-wide relative z-10">
                             {mod.nombre}
                           </span>
                           <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide relative z-10">
                             Módulo Central
                           </span>
                        </button>
                     ))}
                     {l1Modules.length === 0 && (
                        <div className="col-span-full p-8 text-center bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                           No hay Entornos (L1) definidos en la matriz de Tipos de Entidad del Servidor.
                        </div>
                     )}
                  </div>
               </div>

               {/* FICHA ARQUITECTURA Y SISTEMAS (Solo ADMIN) */}
               {userRole === 'ADMIN' && (
               <div className="animate-[fadeIn_0.5s_ease-out]">
                  <h3 className="text-[12px] font-bold text-[#8a716f] uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-800 rounded-sm block"></span>
                    Arquitectura y Sistemas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     
                     <button 
                       className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#3b4758]"
                     >
                        <SafeImage src="/icons/sys_tipos.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" className="w-full h-full" />
                        <span className="font-semibold text-sm uppercase tracking-wide">Gestión de Tipos</span>
                     </button>

                     <button 
                       onClick={() => setScreen('DATA_DICTIONARY')}
                       className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#3b4758]"
                     >
                        <SafeImage src="/icons/sys_diccionario.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" className="w-full h-full" />
                        <span className="font-semibold text-sm uppercase tracking-wide">Diccionario Dts.</span>
                     </button>

                     <button 
                       onClick={() => setScreen('EXCEL_VIEWER')}
                       className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#3b4758]"
                     >
                        <SafeImage src="/icons/sys_raw.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" className="w-full h-full" />
                        <span className="font-semibold text-sm uppercase tracking-wide">Visor Tablas Raw</span>
                     </button>

                     <button 
                       onClick={() => setScreen('CANVAS_SANDBOX')}
                       className="flex flex-col items-start justify-center bg-indigo-900 border border-indigo-700 text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-800 transition-all group min-h-[110px]"
                     >
                        <SafeImage src="/icons/sys_raw.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform hue-rotate-180" className="w-full h-full" />
                        <span className="font-semibold text-sm uppercase tracking-wide">Pruebas Lienzo</span>
                     </button>

                     <button 
                       onClick={() => setScreen('MEDIA_MANAGER')}
                       className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#3b4758]"
                     >
                        <SafeImage src="/icons/sys_media.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" className="w-full h-full" />
                        <span className="font-semibold text-sm uppercase tracking-wide text-white">Gestor de Media</span>
                     </button>
                     
                     <button
                       onClick={() => setScreen('PROFILE_FORGE')}
                       className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#5f030a]"
                     >
                       <SafeImage src="/icons/sys_forge.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" className="w-full h-full" />
                       <span className="font-semibold text-sm uppercase tracking-wide text-[#fe8983]">Fragua Arquetipos</span>
                     </button>

                     <button
                       onClick={() => setScreen('INVENTORY_CATALOG')}
                       className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#5f030a]"
                     >
                       <SafeImage src="/icons/sys_inventory.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" className="w-full h-full" />
                       <span className="font-semibold text-sm uppercase tracking-wide text-[#fe8983]">Catálogo Inventario</span>
                     </button>

                     <button
                       onClick={() => setScreen('PERMISSION_MATRIX')}
                       className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#5f030a]"
                     >
                       <SafeImage src="/icons/sys_matrix.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" className="w-full h-full" />
                       <span className="font-semibold text-sm uppercase tracking-wide text-[#fe8983]">Mesa de Cruce</span>
                     </button>
                     
                     <button
                       onClick={() => setScreen('LAYOUT_CONFIG')}
                       className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#3b4758]"
                     >
                       <SafeImage src="/icons/sys_wysiwyg.svg" fallbackType="svg" wrapperClassName="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" className="w-full h-full" />
                       <span className="font-semibold text-sm uppercase tracking-wide text-white">Taller WYSIWYG</span>
                     </button>
                  </div>
               </div>
               )}

             </div>
          )}
        </div>
      </main>

      {/* Marca de agua de fondo elegante para dar textura */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url('/Fondo Logueo 01.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      ></div>

    </div>
  );
};
