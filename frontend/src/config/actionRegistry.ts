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
  // --- MASIVAS E INFORMES ---
  {
    id: 'CMD_EXPORT_CSV',
    label: 'Exportar Listado a CSV',
    category: 'MASIVAS',
    icon: 'CSV',
    description: 'Exporta los resultados actuales mostrados en pantalla a un CSV.',
    isVisible: () => true 
  },
  
  // IMPORTACIONES CSV ESPECÍFICAS (visibles cuando no hay entidad seleccionada y estamos en la pestaña correspondiente)
  {
    id: 'CMD_BULK_CONTRATAS',
    label: 'Cargar CSV: Contratas',
    category: 'MASIVAS',
    icon: 'Upload',
    description: 'Wizard de carga masiva específico para Contratas.',
    isVisible: (ctx) => !ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.activeTabFilter === 'CONTRATAS'
  },
  {
    id: 'CMD_BULK_SUBCONTRATAS',
    label: 'Cargar CSV: Subcontr.',
    category: 'MASIVAS',
    icon: 'Upload',
    description: 'Wizard de carga masiva específico para Subcontratas.',
    isVisible: (ctx) => !ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.activeTabFilter === 'SUBCONTRATAS'
  },
  {
    id: 'CMD_BULK_PROVEEDORES',
    label: 'Cargar CSV: Proveedores',
    category: 'MASIVAS',
    icon: 'Upload',
    description: 'Wizard de carga masiva específico para Proveedores.',
    isVisible: (ctx) => !ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.activeTabFilter === 'PROVEEDORES'
  },
  {
    id: 'CMD_BULK_CLIENTES',
    label: 'Cargar CSV: Clientes',
    category: 'MASIVAS',
    icon: 'Upload',
    description: 'Wizard de carga masiva específico para Clientes.',
    isVisible: (ctx) => !ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.activeTabFilter === 'CLIENTES'
  },

  // --- CRUD BÁSICO DE ENTIDAD (Aparecen solo al SELECCIONAR entidad en su Modulo especifico) ---
  {
    id: 'CMD_EDIT_CONTRAT',
    label: 'Editar Contrata',
    category: 'CRUD',
    icon: 'Edit',
    description: 'Abre la ficha de edición para la Contrata.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.selectedEntityData?.IS_CONTRATISTA === 1
  },
  {
    id: 'CMD_EDIT_SUBCON',
    label: 'Editar Subcontrata',
    category: 'CRUD',
    icon: 'Edit',
    description: 'Abre la ficha de edición para la Subcontrata.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.selectedEntityData?.IS_SUBCONTRATISTA === 1
  },
  {
    id: 'CMD_EDIT_PROV',
    label: 'Editar Proveedor',
    category: 'CRUD',
    icon: 'Edit',
    description: 'Abre la ficha de edición para el Proveedor.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.selectedEntityData?.IS_PROVEEDOR === 1
  },
  {
    id: 'CMD_EDIT_CLI',
    label: 'Editar Cliente',
    category: 'CRUD',
    icon: 'Edit',
    description: 'Abre la ficha de edición para el Cliente.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeModuleId === 'EMP' && ctx.selectedEntityData?.IS_CLIENTE === 1
  },
  {
    id: 'CMD_EDIT_UTE',
    label: 'Configurar UTE / Socios',
    category: 'CRUD',
    icon: 'Users',
    description: 'Abre el constructor de consorcios y participaciones referidas a esta Entidad.',
    isVisible: (ctx) => !!ctx.selectedEntityId && ctx.activeModuleId === 'EMP'
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
