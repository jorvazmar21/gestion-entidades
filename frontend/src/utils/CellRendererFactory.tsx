

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
   const isDeleted = params.data?.DELETED_AT || params.data?.DELETED_BY || params.data?.deletedAt;
   const isActive = params.data?.IS_ACTIVE === 1 || params.data?.es_activa || false;
   
   let colorClass = "";
   let tooltip = "";
   
   if (isDeleted) {
      colorClass = "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]";
      tooltip = "Archivado / Borrado";
   } else if (isActive) {
      colorClass = "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]";
      tooltip = "Activa";
   } else {
      colorClass = "bg-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.6)]";
      tooltip = "Inactiva";
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
