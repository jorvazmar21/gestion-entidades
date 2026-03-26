import React from 'react';
import type { ValidationErrorTree } from '../../hooks/useCSVValidator';

export const ErrorTreeViewer: React.FC<{ errors: ValidationErrorTree }> = ({ errors }) => {
    const errorKeys = Object.keys(errors);

    if (errorKeys.length === 0) {
        return (
            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
                <h3 className="font-bold">✅ Datos Válidos</h3>
                <p className="text-sm">El archivo CSV ha superado todas las validaciones estructurales.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md sticky top-0 bg-opacity-95 z-10">
                <h3 className="font-bold flex items-center gap-2">
                    <span className="text-lg">❌</span> 
                    Errores de Validación ({errorKeys.length} filas afectadas)
                </h3>
                <p className="text-xs mt-1">
                    La importación ha sido bloqueada. Por favor, corrige los siguientes problemas en tu .csv original y vuelve a cargarlo.
                </p>
            </div>

            <div className="space-y-4 px-1">
                {errorKeys.map(rowId => {
                    const rowData = errors[rowId];
                    // Agrupar por categoría
                    const grouped = rowData.errors.reduce((acc, err) => {
                        if (!acc[err.category]) acc[err.category] = [];
                        acc[err.category].push(err);
                        return acc;
                    }, {} as Record<string, typeof rowData.errors>);

                    return (
                        <div key={rowId} className="border border-gray-200 rounded-md overflow-hidden text-sm shadow-sm bg-white">
                            <div className="bg-gray-100 px-3 py-2 font-bold text-gray-800 border-b border-gray-200 flex justify-between items-center">
                                <span>{rowData.rowContext}</span>
                                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded-full">{rowId}</span>
                            </div>
                            <div className="p-3">
                                {Object.keys(grouped).map(cat => (
                                    <div key={cat} className="mb-3 last:mb-0 ml-2">
                                        <div className="font-semibold text-gray-600 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
                                            {cat.replace('_', ' ')}
                                        </div>
                                        <ul className="list-none border-l-2 border-orange-200 ml-1.5 pl-3 space-y-1">
                                            {grouped[cat].map((err, idx) => (
                                                <li key={idx} className="text-gray-700 flex flex-col">
                                                    <span className="font-medium text-orange-700">{err.property}:</span>
                                                    <span className="text-gray-500 text-xs">{err.message}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
