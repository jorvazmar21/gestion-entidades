import React from 'react';

/**
 * @module EntityCanvasContainer
 * @description Wrapper ficha macro para la ZONA 6 que alojará la Hierarchical Grid.
 * @note Destinado a "atacar" inicialmente dat_emp_company según orden de usuario.
 */
interface EntityCanvasContainerProps {
  children?: React.ReactNode;
}

export function EntityCanvasContainer({ children }: EntityCanvasContainerProps) {
  return (
    <div className="absolute inset-4 bg-white flex flex-col border border-slate-200 shadow-sm rounded-md overflow-hidden">
      {/* Cuerpo de la ficha */}
      <div className="flex-1 relative bg-white">
        {children ? (
            children
        ) : (
            <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-slate-200 m-4 rounded-lg bg-slate-50/50">
                <span className="text-sm text-slate-400 font-medium tracking-wide">
                  Contenedor de Datos Preparado. Pendiente de Inyectar Datos.
                </span>
            </div>
        )}
      </div>
    </div>
  );
}
