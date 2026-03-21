/**
 * @module ModuleTitle
 * @description Título principal de la pantalla del módulo activo (Zona 5 Inferior).
 * @inputs activeModuleId (para resolver el nombre completo).
 * @actions Renderiza el título usando el libro de estilo Crimson Ledger (Manrope, Tracking amplio).
 * @files src/components/ModuleTitle.tsx
 */
import React from 'react';
import { useUiStore } from '../store/useUiStore';

export const ModuleTitle: React.FC = () => {
  const activeModuleId = useUiStore(state => state.activeModuleId);
  // Diccionario decodificador de raíces a nombres completos limpios (sin tildes)
  const MODULE_NAMES: Record<string, string> = {
    'OBR': 'OBRAS',
    'PRV': 'PROVEEDORES',
    'SED': 'SEDES',
    'PAR': 'PARQUES',
    'CLI': 'CLIENTES'
  };

  const getModuleName = () => {
    if (!activeModuleId) return 'CARGANDO...';
    return MODULE_NAMES[activeModuleId] || activeModuleId;
  };

  return (
    <div className="w-full h-full flex items-center px-6 font-['Manrope'] select-none">
      <h1 className="text-[#121c2a] font-[800] text-[24px] tracking-wide uppercase truncate w-full">
        GESTION DE {getModuleName()}
      </h1>
    </div>
  );
};
