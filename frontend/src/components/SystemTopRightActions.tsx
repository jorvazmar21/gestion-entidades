/**
 * @module SystemTopRightActions
 * @description Botonera superior derecha para acciones globales del usuario y metadatos de sesión.
 * @inputs Ninguno directo (futuro: useAuthStore para iniciales del usuario).
 * @actions Despliega menús de alertas, ayuda, configuración y perfil.
 * @files src/components/SystemTopRightActions.tsx
 */
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { SafeImage } from './SafeImage';
import { GenericModal } from './generics/GenericModal';

export const SystemTopRightActions: React.FC = () => {
  const activeUser = useAuthStore(state => state.activeUser);
  const [modalTitle, setModalTitle] = useState<string | null>(null);

  // Algoritmo extractivo de iniciales robusto con fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'AN';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="flex items-center gap-5 px-6 h-full select-none">
      
      {/* Alertas */}
      <button 
        onClick={() => setModalTitle('Centro de Alertas')}
        className="relative group outline-none"
        title="Alertas de Usuario"
      >
        <SafeImage src="/icons/ui_alert.svg" fallbackType="svg" className="w-[14px] h-[14px] opacity-60 group-hover:opacity-100 transition-opacity" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
      </button>

      {/* Ayuda */}
      <button 
        onClick={() => setModalTitle('Ayuda y Documentación')}
        className="group outline-none"
        title="Centro de Ayuda"
      >
        <SafeImage src="/icons/ui_info.svg" fallbackType="svg" className="w-[14px] h-[14px] opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Configuración */}
      <button 
        onClick={() => setModalTitle('Configuración de Aplicación')}
        className="group outline-none"
        title="Configuración de Aplicación"
      >
        <SafeImage src="/icons/ui_settings.svg" fallbackType="svg" className="w-[14px] h-[14px] opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Separador sutil */}
      <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

      {/* Avatar Sesión */}
      <button 
        onClick={() => setModalTitle('Ficha de Empleado (Perfil)')}
        className="w-6 h-6 rounded-[6px] bg-[#8c1d18] text-white flex items-center justify-center font-['Inter'] font-bold text-[10px] tracking-wider uppercase hover:bg-[#5f030a] transition-colors shadow-sm ml-1 outline-none"
        title={`Sesión activa: ${activeUser || 'Anónimo'}`}
      >
        {getInitials(activeUser)}
      </button>
      
      </div>

      <GenericModal 
        isOpen={modalTitle !== null} 
        onClose={() => setModalTitle(null)} 
        title={modalTitle || ''} 
      />
    </>
  );
};
