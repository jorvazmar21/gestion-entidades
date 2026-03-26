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
  l1_categories: any[];
  l2_families: any[];
  l3_types: any[];
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
  addEntities: (newEntities: Entity[]) => void;
}

// "useDataStore": La Biblioteca (Almacén de Entidades y CSVs)
export const useDataStore = create<DataState>((set, get) => ({
  db: [],
  l1_categories: [],
  l2_families: [],
  l3_types: [],
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
      
      // NUEVO ESQUEMA L-MATRIX V2
      const { 
          l1_categories, l2_families, l3_types, l4_instances, 
          topology_graph, psets_template, psets_bridge, psets_payloads, 
          eventos_l3, desgloses_l4 
      } = sqlData || {};

      if (!l1_categories || !l2_families) {
          throw new Error("El esquema de la BBDD devuelto no contiene L1/L2 L-Matrix. ¿Has reconstruido SQLite?");
      }

      // TODO (Fase 3 Completa): Reestructurar los Types. Por ahora evitamos el crasheo mapeando por encima.
      const MODULES: Record<string, ModuleConfig> = {};
      l1_categories.forEach((cat: any) => {
          const catId = cat.l1_code.replace('L1_', ''); // Ej: L1_OBR -> OBR
          MODULES[catId] = {
              title: cat.human_readable_name,
              prefix: catId,
              level: 'L1',
              category: catId, // <--- Guardamos la categoría física
              subCategory: '',
              icono: cat.ui_icon_identifier,
              tiposHijo: [],
              maxCount: null,
              minCount: null
          } as ModuleConfig;
      });

      // Mapeo Inteligente (Árbol Transversal Inverso L4 -> L3 -> L2 -> L1)
      const db: Entity[] = l4_instances.map((e: any) => {
          const l3 = l3_types.find((t:any) => t.id_l3 === e.fk_l3);
          const l2 = l3 ? l2_families.find((f:any) => f.id_l2 === l3.fk_l2) : null;
          const l1 = l2 ? l1_categories.find((c:any) => c.id_l1 === l2.fk_l1) : null;
          const assignedCategory = l1 ? l1.l1_code.replace('L1_', '') : 'General';

          return {
              id: e.l4_id,
              level: 'L4',
              category: assignedCategory,
              subCategory: l2?.human_readable_name || '',
              type: e.fk_l3, // Nivel 3 FK (ID Auto numérico)
              code: e.l4_id,
              name: e.instance_name || e.human_readable_name,
              location: '', 
              canal: e.lifecycle_phase || 'ESTUDIO', 
              parentId: e.fk_l3, 
              isActive: e.is_active === 1, 
              deletedAt: null,
              deletedBy: null,
              createdAt: e.created_at,
              createdBy: e.created_by,
              updatedAt: e.updated_at,
              updatedBy: e.updated_by
          };
      });

      set({
        appConfig: appConfig || {},
        // Arrays vacíos para no romper la UI antigua hasta que se purguen
        sysNivelesDb: [],
        tiposEntidadDb: [],
        MODULES,
        db,
        l1_categories: l1_categories || [],
        l2_families: l2_families || [],
        l3_types: l3_types || [],
        psets_def: psets_template || [],
        psetValuesDb: psets_payloads || {},
        psetHistoryDb: [],
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
  },

  addEntities: (newEntities: Entity[]) => {
      const current = get().db;
      set({ db: [...newEntities, ...current] }); // Nuevos arriba para UX
  }
}));

// --- FIN DEL STORE ---
