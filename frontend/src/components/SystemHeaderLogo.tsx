/**
 * @module SystemHeaderLogo
 * @description Módulo de Branding Corporativo (Logo + Nombre) para la esquina superior izquierda (Zona 1).
 * @inputs Logo cargado desde el MediaManager (/media/logo-fractales.svg).
 * @actions Renderiza la identidad corporativa "ERP - NTN".
 * @files src/components/SystemHeaderLogo.tsx
 */
import { SafeImage } from './SafeImage';
import { APP_CONFIG } from '../config/constants';

export const SystemHeaderLogo = () => {
  return (
    <div className="w-full h-full flex items-center px-6 font-['Inter'] select-none">
      <SafeImage 
        src="/media/logo-fractales.svg" 
        fallbackType="svg"
        className="w-full h-full object-contain"
        wrapperClassName="w-7 h-7 shrink-0 mr-3"
      />
      <span className="text-[#8c1d18] font-[700] text-[16px] tracking-tight whitespace-nowrap">
        {APP_CONFIG.TITLE}
      </span>
    </div>
  );
};
