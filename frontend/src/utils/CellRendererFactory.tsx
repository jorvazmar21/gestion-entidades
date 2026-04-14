

// Renderizador para un indicador Booleano (Ej: checkbox verde)
export const renderBooleanLed = (params: any) => {
   if (params.value === 1 || params.value === true || params.value === '1') {
      return (
         <div className="flex items-center justify-center h-full w-full">
            <div className="w-[10px] h-[10px] rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" title="Sí"></div>
         </div>
      );
   }
   return null;
};

// Renderizador para el badge de Estado (Activo, Inactivo, Borrado)
export const renderStatusBadge = (params: any) => {
   const estado = params.value; // Lee directamente ACTIVA, INACTIVA o ANULADA
   
   let colorClass = "";
   let tooltip = estado || "Desconocido";
   
   if (estado === 'ANULADA') {
      colorClass = "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]";
   } else if (estado === 'ACTIVA') {
      colorClass = "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]";
   } else if (estado === 'INACTIVA') {
      colorClass = "bg-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.6)]";
   } else {
      colorClass = "bg-gray-400";
   }
   
   return (
      <div className="flex items-center justify-center h-full w-full" title={tooltip}>
         <div className={`w-[10px] h-[10px] rounded-full ${colorClass}`}></div>
      </div>
   );
};

// Mapea los modos de string a funciones Reales de renderizado
export const getCellRenderer = (mode?: string) => {
   switch (mode) {
      case 'BOOLEAN_LED':
         return renderBooleanLed;
      case 'STATUS_BADGE':
         return renderStatusBadge;
      case 'TEXT':
      default:
         return undefined; // AG Grid usa su fallback por defecto
   }
};
