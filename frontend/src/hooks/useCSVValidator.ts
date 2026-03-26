import type { Entity } from '../types';

export interface ValidationErrorTree {
    [rowId: string]: {
        rowContext: string;
        errors: {
            category: 'ENTIDAD' | 'PSET_ESTATICO' | 'PSET_DINAMICO';
            property: string;
            message: string;
        }[];
    }
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrorTree;
    parsedEntities: any[]; // The structured JSON ready for insertion
}

export function validateImportData(
    csvRows: any[], 
    moldeId: string, 
    existingEntities: Entity[]
): ValidationResult {
    const errorTree: ValidationErrorTree = {};
    let isValid = true;
    const parsedEntities: any[] = [];

    // Validaciones
    // 1. IDs únicos
    // 2. parent_id existe (si es obligatorio)
    // 3. Tipos de datos en PSets

    csvRows.forEach((row, index) => {
        const rowId = row['id_entidad'] || `Fila-${index + 1}`;
        const rowErrors: any[] = [];

        if (!row['codigo']) {
            rowErrors.push({ category: 'ENTIDAD', property: 'codigo', message: 'El código es obligatorio.' });
        }
        if (!row['nombre']) {
            rowErrors.push({ category: 'ENTIDAD', property: 'nombre', message: 'El nombre es obligatorio.' });
        }

        // Parent validation (dummy for now)
        if (row['id_padre']) {
            const parentExists = existingEntities.some(e => e.id === row['id_padre']);
            if (!parentExists) {
                // Warning or error depending on business logic
                rowErrors.push({ category: 'ENTIDAD', property: 'id_padre', message: `El padre referenciado (${row['id_padre']}) no existe en la BBDD.` });
            }
        }

        if (rowErrors.length > 0) {
            isValid = false;
            errorTree[rowId] = {
                rowContext: row['nombre'] || `Fila ${index + 1}`,
                errors: rowErrors
            };
        } else {
            parsedEntities.push({
                moldeId,
                data: row
            });
        }
    });

    return { isValid, errors: errorTree, parsedEntities };
}
