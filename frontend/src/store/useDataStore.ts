/**
 * @module useDataStore
 * @description Almacén central asíncrono y decodificador de datos del sistema (Maestros, PSets y Árbol de Tipología).
 * @inputs Respuestas HTTP JSON desde el proxy de Node (`/api/load`).
 * @actions Interpreta los archivos CSV crudos y los transfiere a vectores relacionales en memoria RAM para consumo UI.
 * @files src/store/useDataStore.ts
 */
import { create } from 'zustand';
import type { Entity, PSetDef, EntityType, ModuleConfig, PSetHistoryRecord } from '../types';

interface DataState {
  // Base de Datos en Memoria
  db: Entity[];
  psets_def: PSetDef[];
  psetValuesDb: Record<string, any>;
  psetHistoryDb: PSetHistoryRecord[];
  tiposEntidadDb: EntityType[];
  MODULES: Record<string, ModuleConfig>;

  // Estado de red y filtrado tabular
  filters: { active: boolean; inactive: boolean; deleted: boolean };
  sortCol: string;
  sortAsc: boolean;
  loading: boolean;
  error: string | null;

  // Acciones
  init: () => Promise<void>;
  setFilter: (filterKey: 'active' | 'inactive' | 'deleted') => void;
  saveDb: () => Promise<void>;
}

// "useDataStore": La Biblioteca (Almacén de Entidades y CSVs)
export const useDataStore = create<DataState>((set, get) => ({
  db: [],
  psets_def: [],
  psetValuesDb: {},
  psetHistoryDb: [],
  tiposEntidadDb: [],
  MODULES: {},

  filters: { active: true, inactive: false, deleted: false },
  sortCol: 'name',
  sortAsc: true,
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/load');
      
      if (!res.ok) {
        throw new Error(`El servidor Backend Node.js está apagado o no responde (Error ${res.status}). Ejecute 'node server.js' en la terminal para encenderlo.`);
      }
      
      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error('Respuesta inválida del servidor (Probablemente Vite Proxy tiró un error 504). Asegúrese de que el backend (puerto 3000) esté encendido.');
      }

      if (!result.success) {
        throw new Error(result.error || result.message || "Error al decodificar la Base de Datos del servidor.");
      }

      const { master, psets_def, psets_val, psets_dyn, tipos_entidad } = result.csvData;
      
      const { tiposEntidadDb, MODULES } = parseTiposEntidad(tipos_entidad);
      
      set({
        tiposEntidadDb,
        MODULES,
        db: parseCSV(master, MODULES),
        psets_def: parseCSVDefs(psets_def),
        psetValuesDb: parseCSVVals(psets_val),
        psetHistoryDb: parseCSVDyns(psets_dyn),
        loading: false,
      });

    } catch (e: any) {
      console.error(e);
      set({ error: e.message, loading: false });
    }
  },

  setFilter: (key) => {
    const { filters } = get();
    set({ filters: { ...filters, [key]: !filters[key] } });
  },

  saveDb: async () => {
    const state = get();
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db: state.db,
          psets_def: state.psets_def,
          psetValuesDb: state.psetValuesDb,
          psetHistoryDb: state.psetHistoryDb,
          tiposEntidadDb: state.tiposEntidadDb
        })
      });
    } catch (e) {
      console.error("Error guardando en el servidor.", e);
    }
  }
}));

// --- PARSERS ---

const safeJSONParse = (val: string, fallback: any) => {
    try {
        if (!val || val.trim() === '') return fallback;
        return JSON.parse(val);
    } catch (e) {
        console.warn('Fallo al parsear JSON de CSV:', val);
        return fallback;
    }
};

function parseTiposEntidad(lines: string[]) {
  const tiposEntidadDb = lines.map(line => {
    const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
    return {
        id_tipo: vals[0],
        nombre: vals[1],
        categoria: vals[2],
        subCategoria: vals[3] || '',
        nivel: vals[4],
        icono: vals[5] || '',
        tipos_hijo_permitidos: safeJSONParse(vals[6], []),
        max_count_per_parent: vals[7] ? parseInt(vals[7]) : null
    } as EntityType;
  });

  const MODULES: Record<string, ModuleConfig> = {};
  tiposEntidadDb.forEach(t => {
      MODULES[t.id_tipo] = {
          title: t.nombre,
          prefix: t.id_tipo,
          level: t.nivel,
          category: t.categoria,
          subCategory: t.subCategoria,
          icono: t.icono,
          tiposHijo: t.tipos_hijo_permitidos,
          maxCount: t.max_count_per_parent
      };
  });

  return { tiposEntidadDb, MODULES };
}

function parseCSV(lines: string[], MODULES: Record<string, ModuleConfig>): Entity[] {
    const parsedDb = lines.map(line => {
        const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, ''));

        if (vals.length <= 8) { // Mapeo antiguo
            const modCfg = MODULES[vals[1]] || {} as any;
            return {
                id: vals[0],
                level: modCfg.level || 'L1',
                category: modCfg.category || 'LUGAR',
                subCategory: modCfg.subCategory || '',
                type: vals[1],
                code: vals[2],
                name: vals[3],
                location: '', canal: '', parentId: null,
                isActive: vals[4] === 'true',
                deletedAt: vals[5] && vals[5] !== 'null' && vals[5] !== '""' ? vals[5] : null,
                deletedBy: '',
                createdAt: vals[6],
                createdBy: 'SYSTEM_MIGRATION',
                updatedAt: vals[7],
                updatedBy: 'SYSTEM_MIGRATION'
            };
        } else {
            return {
                id: vals[0],
                level: vals[1] || 'L1',
                category: vals[2] || 'LUGAR',
                subCategory: vals[3] || '',
                type: vals[4],
                code: vals[5],
                name: vals[6],
                location: vals[7] || '',
                canal: vals[8] || '',
                parentId: vals[9] && vals[9] !== 'null' ? vals[9] : null,
                isActive: vals[10] === 'true',
                deletedAt: vals[11] && vals[11] !== 'null' && vals[11] !== '""' ? vals[11] : null,
                deletedBy: vals[12] || '',
                createdAt: vals[13],
                createdBy: vals[14] || '',
                updatedAt: vals[15],
                updatedBy: vals[16] || ''
            };
        }
    }).filter(r => r && r.id);

    // Inferencia de parentId (Lógica original de app.js)
    parsedDb.forEach(r => {
        if (r.parentId === null && r.level === 'L2') {
            const parts = r.code.split('.');
            if (parts.length > 1) {
                const parentCode = parts[0];
                const parent = parsedDb.find(p => p.code === parentCode && p.level === 'L1');
                if (parent) {
                    r.parentId = parent.id;
                }
            }
        }
    });

    return parsedDb;
}

function parseCSVDefs(lines: string[]): PSetDef[] {
    return lines.map(line => {
        const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
        return {
            id_pset: vals[0], behavior: vals[1],
            appliesTo: safeJSONParse(vals[2], []),
            properties: safeJSONParse(vals[3], [])
        };
    });
}

function parseCSVVals(lines: string[]): Record<string, any> {
    const obj: Record<string, any> = {};
    lines.forEach(line => {
        const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
        const key = `${vals[0]}_${vals[1]}`;
        obj[key] = safeJSONParse(vals[2], {});
    });
    return obj;
}

function parseCSVDyns(lines: string[]): PSetHistoryRecord[] {
    return lines.map(line => {
        const vals = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').replace(/""/g, '"'));
        return {
            id_record: vals[0], id_entity: vals[1], id_pset: vals[2], timestamp: vals[3],
            data: safeJSONParse(vals[4], {})
        };
    });
}
