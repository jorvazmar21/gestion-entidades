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
  sysNivelesDb: any[];
  MODULES: Record<string, ModuleConfig>;
  appConfig: Record<string, any>;

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
  updateAppConfig: (key: string, value: any) => Promise<void>;
}

// "useDataStore": La Biblioteca (Almacén de Entidades y CSVs)
export const useDataStore = create<DataState>((set, get) => ({
  db: [],
  psets_def: [],
  psetValuesDb: {},
  psetHistoryDb: [],
  tiposEntidadDb: [],
  sysNivelesDb: [],
  MODULES: {},
  appConfig: {},

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

      const { appConfig, sqlData } = result;
      const { entidades, psets_def, psets_val, psets_dyn, sys_moldes, sys_niveles } = sqlData || {};

      if (!entidades || !sys_moldes) {
          throw new Error("El esquema de SQLite devuelto por el servidor está incompleto o la BBDD está vacía.");
      }
      
      const tiposEntidadDb: EntityType[] = sys_moldes.map((m: any) => {
          return {
              id_tipo: m.id_molde,
              id_tipo_entidad: m.id_tipo_entidad,
              nombre: m.nombre,
              categoria: m.descripcion || 'General',
              subCategoria: '',
              nivel: m.id_nivel || 'L1',
              icono: m.icono_sistema || '',
              tipos_hijo_permitidos: m.reglas_config?.admite_hijos || [],
              padres_permitidos: m.reglas_config?.padres_permitidos || [],
              max_count_per_parent: m.reglas_config?.max_hijos || null,
              min_count_per_parent: m.reglas_config?.min_hijos || 0
          };
      });

      const MODULES: Record<string, ModuleConfig> = {};
      tiposEntidadDb.forEach((t: EntityType) => {
          MODULES[t.id_tipo] = {
              title: t.nombre,
              prefix: t.id_tipo,
              level: t.nivel,
              category: t.categoria,
              subCategory: t.subCategoria,
              icono: t.icono,
              tiposHijo: t.tipos_hijo_permitidos,
              maxCount: t.max_count_per_parent,
              minCount: t.min_count_per_parent
          } as ModuleConfig;
      });

      const db: Entity[] = entidades.map((e: any) => {
          const modCfg = MODULES[e.id_molde] || {} as any;
          return {
              id: e.id_entidad,
              level: modCfg.level || 'L1',
              category: modCfg.category || 'General',
              subCategory: modCfg.subCategory || '',
              type: e.id_molde,
              code: e.codigo,
              name: e.nombre,
              location: '', 
              canal: e.fase_actual || 'ESTUDIO', 
              parentId: e.id_padre,
              isActive: e.is_active === 1,
              deletedAt: e.deleted_at,
              deletedBy: e.deleted_by,
              createdAt: e.created_at,
              createdBy: e.created_by,
              updatedAt: e.updated_at,
              updatedBy: e.updated_by
          };
      });

      const parsedValuesDb: Record<string, any> = {};
      (psets_val || []).forEach((v: any) => {
          parsedValuesDb[`${v.id_entidad}_${v.id_pset}`] = typeof v.valor_json === 'string' ? JSON.parse(v.valor_json) : v.valor_json;
      });

      const parsedHistoryDb: PSetHistoryRecord[] = (psets_dyn || []).map((d: any) => ({
          id_record: d.id_registro?.toString() || new Date().getTime().toString(),
          id_entity: d.id_entidad,
          id_pset: d.id_pset,
          timestamp: d.created_at,
          data: typeof d.valor_json === 'string' ? JSON.parse(d.valor_json) : d.valor_json
      }));

      set({
        appConfig: appConfig || {},
        sysNivelesDb: sys_niveles || [],
        tiposEntidadDb,
        MODULES,
        db,
        psets_def: psets_def || [],
        psetValuesDb: parsedValuesDb,
        psetHistoryDb: parsedHistoryDb,
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
  },

  updateAppConfig: async (key: string, value: any) => {
    const newConfig = { ...get().appConfig, [key]: value };
    set({ appConfig: newConfig });
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {
      console.error("Error guardando app config en el servidor", e);
    }
  }
}));

// --- FIN DEL STORE ---
