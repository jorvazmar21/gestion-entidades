export interface ContextPayload {
  activeModuleId: string | null;      // Which root module we are in (e.g. 'EMP', 'OBR', 'SED')
  activeTabFilter: string | null;     // Which tab in the Master view (e.g. 'CLIENTE', 'todos')
  selectedEntityId: string | null;    // Is a parent row selected?
  selectedEntityData?: any;           // The physical payload of the selected entity, to check IS_ACTIVE, IS_CLIENTE, etc.
  activeDetailTab?: string;           // IF the detail panel is open, which tab is active (e.g. 'CONTRATOS')
}

export interface SystemAction {
  id: string;
  label: string;
  category: 'CRUD' | 'ESTADO' | 'MASIVAS' | 'REPORTING' | 'SISTEMA';
  icon: string;
  description: string;
  /**
   * The rules engine predicate to determine if the action is currently visible/applicable based on screen output.
   */
  isVisible: (ctx: ContextPayload) => boolean;
}

// ----------------------------------------------------------------------------------------------------
// THE DICTIONARY (Mirroring the SQLite AI-Semantics: def_system_actions + rel_action_context_triggers)
// ----------------------------------------------------------------------------------------------------
export const ACTION_REGISTRY: SystemAction[] = [
  // --- MASIVAS E INFORMES (Solo visibles cuando NO hay nada seleccionado) ---
  {
    id: 'CMD_EXPORT_CSV',
    label: 'Exportar a CSV',
    category: 'MASIVAS',
    icon: 'CSV',
    description: 'Exporta los resultados actuales de la tabla a formato CSV.',
    isVisible: (ctx) => !ctx.selectedEntityId 
  },
  {
    id: 'CMD_BULK_CLIENTES',
    label: 'Carga Masiva de Clientes',
    category: 'MASIVAS',
    icon: 'Upload',
    description: 'Inicializa el wizard de importación masiva de Excel para altas.',
    isVisible: (ctx) => !ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.activeTabFilter === 'CLIENTE'
  },

  // --- CRUD BÁSICO DE ENTIDAD (Aparecen solo al SELECCIONAR entidad en su Modulo especifico) ---
  {
    id: 'CMD_EDIT_CLI',
    label: 'Editar Ficha Cliente',
    category: 'CRUD',
    icon: 'Edit',
    description: 'Abre la "Superficha" de edición completa para el Cliente.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.activeTabFilter === 'CLIENTE' && ctx.selectedEntityData?.IS_CLIENTE === 1
  },
  {
    id: 'CMD_EDIT_PROV',
    label: 'Editar Ficha Proveedor',
    category: 'CRUD',
    icon: 'Edit',
    description: 'Abre la "Superficha" de edición completa para el Proveedor.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.activeTabFilter === 'PROVEEDOR' && ctx.selectedEntityData?.IS_PROVEEDOR === 1
  },
  {
    id: 'CMD_EDIT_UTE',
    label: 'Configurar UTE / Socios',
    category: 'CRUD',
    icon: 'Users',
    description: 'Abre el constructor de consorcios y participaciones.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.selectedEntityData?.IS_UTE === 1
  },

  // --- OPERACIONES DE ESTADO (Flujo de Ciclo de Vida: BLOQUEADA, ARCHIVADA...) ---
  {
    id: 'CMD_BLOCK_ENTITY',
    label: 'Bloquear Entidad Lógicamente',
    category: 'ESTADO',
    icon: 'Lock',
    description: 'Impide que esta entidad se use en nuevos proyectos o contratos.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.selectedEntityData?.IS_ACTIVE === 1
  },
  {
    id: 'CMD_RESTORE_ENTITY',
    label: 'Restaurar Entidad',
    category: 'ESTADO',
    icon: 'Unlock',
    description: 'Reactiva una entidad inactiva para retornar a Fase de Producción.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.selectedEntityData?.IS_ACTIVE === 0 && !ctx.selectedEntityData?.DELETED_AT
  },

  // --- ACCIONES SECUNDARIAS (L2 / DEPENDENCIES) ---
  {
    id: 'CMD_NEW_CONTACT',
    label: 'Añadir Nuevo Contacto',
    category: 'CRUD',
    icon: 'Plus',
    description: 'Agrega una persona de contacto a la entidad seleccionada.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeDetailTab === 'contactos'
  },
  {
    id: 'CMD_NEW_ADDRESS',
    label: 'Registrar Nueva Delegación',
    category: 'CRUD',
    icon: 'MapPin',
    description: 'Añade una sede fiscal o almacén logístico extra a la compañía.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeDetailTab === 'delegaciones'
  }
];
