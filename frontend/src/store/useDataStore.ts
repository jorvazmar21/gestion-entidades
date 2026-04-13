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
  lifecycle_phases: any[];
  company_departments: any[];
  abac_matrix_rules: any[];
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
  activePsetTabs: Record<string, 'ESTATICAS' | 'DINAMICAS' | 'HIPERDINAMICAS'>;
  setActivePsetTab: (screenId: string, tab: 'ESTATICAS' | 'DINAMICAS' | 'HIPERDINAMICAS') => void;
  activePsetFocus: Record<string, string>;
  setActivePsetFocus: (screenId: string, focus: string | null) => void;
}

// "useDataStore": La Biblioteca (Almacén de Entidades y CSVs)
export const useDataStore = create<DataState>((set, get) => ({
  db: [],
  l1_categories: [],
  l2_families: [],
  l3_types: [],
  lifecycle_phases: [],
  company_departments: [],
  abac_matrix_rules: [],
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
  activePsetTabs: {},
  activePsetFocus: {},

  setActivePsetTab: (screenId, tab) => 
     set(state => ({ activePsetTabs: { ...state.activePsetTabs, [screenId]: tab } })),

  setActivePsetFocus: (screenId, focus) =>
     set(state => {
         if (focus === null) {
             const newFocus = { ...state.activePsetFocus };
             delete newFocus[screenId];
             return { activePsetFocus: newFocus };
         }
         return { activePsetFocus: { ...state.activePsetFocus, [screenId]: focus } };
     }),

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
      
      // NUEVO ESQUEMA L-MATRIX V2 + ABAC
      const { 
          l1_categories, l2_families, l3_types, l4_instances, 
          topology_graph, psets_template, psets_bridge, psets_payloads, 
          eventos_l3, desgloses_l4,
          lifecycle_phases, company_departments, abac_matrix_rules
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
              canal: (lifecycle_phases && lifecycle_phases.find((p:any) => p.id_phase === e.fk_phase)?.human_readable_name) || 'NO APLICA', 
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

      // INYECCION MOCK DE USUARIO: 6 Empresas Ejemplo para probar los botones Sandbox y los Pestañas (CLI, SED, etc)
      const mockEmpresas: any[] = [
         {
            category: 'EMP',
            INSTANCE_ID: 'INST-COMP-M1',
            BLUEPRINT_ID: 'COMP',
            UNIQUE_HUMAN_CODE: 'EMP-001',
            INSTANCE_NAME: 'ACEROS DEL NORTE S.A.',
            LIFECYCLE_PHASE: 'PRODUCCIÓN',
            IS_ACTIVE: 1,
            CREATED_AT: new Date().toISOString(),
            EMP_ID: 'INST-COMP-M1',
            EMP_FISCALCODE: 'A-39123456',
            EMP_FISCALNAME: 'ACEROS DEL NORTE SOCIEDAD QUIMI-METALURGICA S.A.',
            EMP_FISCALDIRECTION: 'Poligono Ind. Norte, Nave 4',
            EMP_FISCALCP: '39011',
            EMP_FISCALLOCAL: 'Santander',
            EMP_FISCALPROV: 'Cantabria',
            EMP_FISCALCOUNTRY: 'ESPAÑA',
            IS_PROVEEDOR: 1,
            IS_SUBCONTRATA: 0,
            IS_CONTRATISTA: 0,
            IS_CLIENTE: 0,
            IS_UTE: 0,
            IS_SEDE: 0,
            DELETED_AT: null
         },
         {
            category: 'EMP',
            INSTANCE_ID: 'INST-COMP-M2',
            BLUEPRINT_ID: 'COMP',
            UNIQUE_HUMAN_CODE: 'EMP-002',
            INSTANCE_NAME: 'SUMINISTROS GÓMEZ S.L.',
            LIFECYCLE_PHASE: 'BLOQUEADA',
            IS_ACTIVE: 0,
            CREATED_AT: new Date().toISOString(),
            EMP_ID: 'INST-COMP-M2',
            EMP_FISCALCODE: 'B-88345678',
            EMP_FISCALNAME: 'SUMINISTROS GLOBALES GOMEZ HERMANOS S.L.',
            EMP_FISCALDIRECTION: 'Calle Principal 14, Bajo B',
            EMP_FISCALCP: '28001',
            EMP_FISCALLOCAL: 'Madrid',
            EMP_FISCALPROV: 'Madrid',
            EMP_FISCALCOUNTRY: 'ESPAÑA',
            IS_PROVEEDOR: 1,
            IS_SUBCONTRATA: 1,
            IS_CONTRATISTA: 0,
            IS_CLIENTE: 0,
            IS_UTE: 0,
            IS_SEDE: 0,
            DELETED_AT: null
         },
         {
            category: 'EMP',
            INSTANCE_ID: 'INST-COMP-M3',
            BLUEPRINT_ID: 'COMP',
            UNIQUE_HUMAN_CODE: 'EMP-003',
            INSTANCE_NAME: 'EXCAVACIONES OBSOLETAS',
            LIFECYCLE_PHASE: 'ARCHIVADA',
            IS_ACTIVE: 0,
            CREATED_AT: new Date().toISOString(),
            EMP_ID: 'INST-COMP-M3',
            EMP_FISCALCODE: 'B-33100200',
            EMP_FISCALNAME: 'EXCAVACIONES Y DERRIBOS NOROESTE S.L. (EXTINTA)',
            EMP_FISCALDIRECTION: 'Avenida Asturias 99, Poligono Sur',
            EMP_FISCALCP: '33011',
            EMP_FISCALLOCAL: 'Oviedo',
            EMP_FISCALPROV: 'Asturias',
            EMP_FISCALCOUNTRY: 'ESPAÑA',
            IS_PROVEEDOR: 0,
            IS_SUBCONTRATA: 0,
            IS_CONTRATISTA: 1,
            IS_CLIENTE: 0,
            IS_UTE: 0,
            IS_SEDE: 0,
            DELETED_AT: new Date().toISOString()
         },
         {
            category: 'EMP',
            INSTANCE_ID: 'INST-COMP-M4',
            BLUEPRINT_ID: 'COMP',
            UNIQUE_HUMAN_CODE: 'CLI-001',
            INSTANCE_NAME: 'AYUNTAMIENTO DE MADRID',
            LIFECYCLE_PHASE: 'PRODUCCIÓN',
            IS_ACTIVE: 1,
            CREATED_AT: new Date().toISOString(),
            EMP_ID: 'INST-COMP-M4',
            EMP_FISCALCODE: 'P-2807900B',
            EMP_FISCALNAME: 'AYUNTAMIENTO DE MADRID CORPORACION LOCAL',
            EMP_FISCALDIRECTION: 'Plaza de Cibeles, 1',
            EMP_FISCALCP: '28014',
            EMP_FISCALLOCAL: 'Madrid',
            EMP_FISCALPROV: 'Madrid',
            EMP_FISCALCOUNTRY: 'ESPAÑA',
            IS_PROVEEDOR: 0,
            IS_SUBCONTRATA: 0,
            IS_CONTRATISTA: 0,
            IS_CLIENTE: 1,
            IS_UTE: 0,
            IS_SEDE: 0,
            DELETED_AT: null
         },
         {
            category: 'EMP',
            INSTANCE_ID: 'INST-COMP-M5',
            BLUEPRINT_ID: 'COMP',
            UNIQUE_HUMAN_CODE: 'UTE-001',
            INSTANCE_NAME: 'UTE TÚNEL NORTE-SUR',
            LIFECYCLE_PHASE: 'PRODUCCIÓN',
            IS_ACTIVE: 1,
            CREATED_AT: new Date().toISOString(),
            EMP_ID: 'INST-COMP-M5',
            EMP_FISCALCODE: 'U-12345678',
            EMP_FISCALNAME: 'UNION TEMPORAL DE EMPRESAS TUNEL NORTE-SUR LEY 18/1982',
            EMP_FISCALDIRECTION: 'Calle Orense 34, Planta 5',
            EMP_FISCALCP: '28020',
            EMP_FISCALLOCAL: 'Madrid',
            EMP_FISCALPROV: 'Madrid',
            EMP_FISCALCOUNTRY: 'ESPAÑA',
            IS_PROVEEDOR: 0,
            IS_SUBCONTRATA: 0,
            IS_CONTRATISTA: 1,
            IS_CLIENTE: 0,
            IS_UTE: 1,
            IS_SEDE: 0,
            DELETED_AT: null
         },
         {
            category: 'EMP',
            INSTANCE_ID: 'INST-COMP-M6',
            BLUEPRINT_ID: 'COMP',
            UNIQUE_HUMAN_CODE: 'SED-001',
            INSTANCE_NAME: 'OFICINA CENTRAL SANTANDER',
            LIFECYCLE_PHASE: 'PRODUCCIÓN',
            IS_ACTIVE: 1,
            CREATED_AT: new Date().toISOString(),
            EMP_ID: 'INST-COMP-M6',
            EMP_FISCALCODE: 'A-39988776',
            EMP_FISCALNAME: 'NORTUNEL S.A. SEDE CENTRAL',
            EMP_FISCALDIRECTION: 'Parque Científico y Tecnológico de Cantabria',
            EMP_FISCALCP: '39011',
            EMP_FISCALLOCAL: 'Santander',
            EMP_FISCALPROV: 'Cantabria',
            EMP_FISCALCOUNTRY: 'ESPAÑA',
            IS_PROVEEDOR: 0,
            IS_SUBCONTRATA: 0,
            IS_CONTRATISTA: 0,
            IS_CLIENTE: 0,
            IS_UTE: 0,
            IS_SEDE: 1,
            DELETED_AT: null
         }
      ];

      set({
        appConfig: appConfig || {},
        // Arrays vacíos para no romper la UI antigua hasta que se purguen
        sysNivelesDb: [],
        tiposEntidadDb: [],
        MODULES,
        db: mockEmpresas, // <--- Solo mock para depurar, la vista es purgada.
        l1_categories: l1_categories || [],
        l2_families: l2_families || [],
        l3_types: l3_types || [],
        lifecycle_phases: lifecycle_phases || [],
        company_departments: company_departments || [],
        abac_matrix_rules: abac_matrix_rules || [],
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
