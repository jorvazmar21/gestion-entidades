import React from 'react';
import { useAppStore } from '../store/useAppStore';

interface HomeScreenProps {
  activeUser: string | null;
  userRole: 'ADMIN' | 'ZEUS' | null;
  onLogout: () => void;
  onNavigate: (screen: 'HOME' | 'MODULE_VIEW', moduleId?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ activeUser, userRole, onLogout, onNavigate }) => {
  const { tiposEntidadDb, loading, error } = useAppStore();

  // Los Entornos Operativos (Módulos) son los niveles 'L1' del CSV de tipos
  const l1Modules = tiposEntidadDb.filter(t => t.nivel === 'L1');

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-['Inter'] relative w-full overflow-hidden">
      {/* HEADER GLOBAL DEL DASHBOARD INICIO */}
      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 relative z-10 shadow-sm">
        <div className="flex items-center gap-3">
           <img src="/logo-fractales.svg" alt="NORTUNEL ERP" className="w-[30px] h-[30px] object-contain" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo-fractales.png'; }} />
           <h1 className="font-['Manrope'] font-bold text-[#7f1d1d] uppercase tracking-widest text-[16px] hidden sm:block">
             FRACTALES 1.0 <span className="text-gray-400 font-normal">| SISTEMA MAESTRO</span>
           </h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#7f1d1d] font-bold text-xs border border-gray-200">
                {activeUser?.substring(0, 2).toUpperCase()}
             </span>
             <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800">{activeUser}</span>
                <span className="text-[10px] uppercase text-gray-500 tracking-wider" title={userRole === 'ZEUS' ? 'Poderes Globales Operativos' : 'Modo Estructural'}>
                  {userRole} MODE
                </span>
             </div>
           </div>
           <div className="w-[1px] h-6 bg-gray-200 hidden sm:block"></div>
           <button 
             onClick={onLogout} 
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
                          onClick={() => onNavigate('MODULE_VIEW', mod.id_tipo)}
                          className="flex flex-col items-start justify-center bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-[#7f1d1d]/40 transition-all group min-h-[130px] relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-red-50 transition-colors"></div>
                           <span className="text-2xl mb-3 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform relative z-10 text-[#7f1d1d]">
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
                     <button className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#3b4758]">
                        <span className="text-xl mb-2 opacity-80">⚙️</span>
                        <span className="font-semibold text-sm uppercase tracking-wide">Gestión de Tipos</span>
                     </button>
                     <button className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#3b4758]">
                        <span className="text-xl mb-2 opacity-80">📖</span>
                        <span className="font-semibold text-sm uppercase tracking-wide">Diccionario Dts.</span>
                     </button>
                     <button className="flex flex-col items-start justify-center bg-[#27313f] text-white p-5 rounded-lg shadow-sm hover:shadow-md hover:bg-[#1f2937] transition-all group min-h-[110px] border border-[#3b4758]">
                        <span className="text-xl mb-2 opacity-80">📊</span>
                        <span className="font-semibold text-sm uppercase tracking-wide">Visor Tablas Raw</span>
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
