import type { ViewBlueprint } from '../types/views';

export const BLUEPRINTS: Record<string, ViewBlueprint> = {
  'VIEW_PROVEDORES_MASTER': {
    viewId: 'VIEW_PROVEDORES_MASTER',
    rootModule: 'EMP',
    title: 'Proveedores',
    masterConfig: {
      tabs: [
        { id: 'todos', label: 'TODAS', queryConfig: { endpoint: '/api/raw-db/read', table: 'entidades_master' } },
        { id: 'PROVEEDOR', label: 'PROVEEDORES', queryConfig: { endpoint: '/api/raw-db/read', table: 'entidades_master', whereClause: 'IS_PROVEEDOR = 1' } }
      ],
      columns: [
        { field: 'EMP_ID', headerName: 'ID', cellStyle: { textAlign: 'left' } },
        { field: 'UNIQUE_HUMAN_CODE', headerName: 'CODIGO', cellStyle: { textAlign: 'left' } },
        { field: 'INSTANCE_NAME', headerName: 'NOMBRE', flex: 1, cellStyle: { textAlign: 'left' }, suppressAutoSize: true },
        { field: 'IS_ACTIVE', headerName: 'ESTADO', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'STATUS_BADGE' },
        { field: 'IS_PROVEEDOR', headerName: 'PROV', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' },
        { field: 'IS_SUBCONTRATA', headerName: 'SUBC', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' },
        { field: 'IS_CLIENTE', headerName: 'CLIE', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' },
        { field: 'IS_CONTRATISTA', headerName: 'CONT', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' },
        { field: 'IS_UTE', headerName: 'UTE', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' }
      ]
    },
    detailConfig: {
      global: {
        tabs: [
          { id: 'DEL', label: 'DELEGACIONES', queryConfig: { endpoint: '/api/raw-db/read', table: 'delegaciones' } },
          { id: 'CON', label: 'CONTACTOS', queryConfig: { endpoint: '/api/raw-db/read', table: 'contactos' } }
        ],
        columns: []
      }
    }
  },

  'VIEW_OBRAS_MASTER': {
    viewId: 'VIEW_OBRAS_MASTER',
    rootModule: 'OBR',
    title: 'Obras',
    masterConfig: {
      tabs: [
        { id: 'todos', label: 'TODAS', queryConfig: { endpoint: '/api/raw-db/read', table: 'obras_master' } }
      ],
      columns: [
        { field: 'EMP_ID', headerName: 'ID', cellStyle: { textAlign: 'left' } },
        { field: 'UNIQUE_HUMAN_CODE', headerName: 'CODIGO', cellStyle: { textAlign: 'left' } },
        { field: 'INSTANCE_NAME', headerName: 'NOMBRE_OBRA', flex: 1, cellStyle: { textAlign: 'left' }, suppressAutoSize: true },
        { field: 'IS_ACTIVE', headerName: 'ESTADO', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'STATUS_BADGE' }
      ]
    },
    detailConfig: {
      global: {
        tabs: [
          { id: 'PRE', label: 'PRESUPUESTOS', queryConfig: { endpoint: '/api/raw-db/read', table: 'presupuestos' } },
          { id: 'CER', label: 'CERTIFICACIONES', queryConfig: { endpoint: '/api/raw-db/read', table: 'certificaciones' } },
          { id: 'PAR', label: 'PARTES', queryConfig: { endpoint: '/api/raw-db/read', table: 'partes' } }
        ],
        columns: []
      }
    }
  },

  'VIEW_CLIENTES_MASTER': {
    viewId: 'VIEW_CLIENTES_MASTER',
    rootModule: 'EMP',
    title: 'Clientes',
    masterConfig: {
      tabs: [
        { id: 'todos', label: 'TODAS', queryConfig: { endpoint: '/api/raw-db/read', table: 'entidades_master' } },
        { id: 'CLIENTE', label: 'CLIENTES', queryConfig: { endpoint: '/api/raw-db/read', table: 'entidades_master', whereClause: 'IS_CLIENTE = 1' } }
      ],
      columns: [
        { field: 'EMP_ID', headerName: 'ID', cellStyle: { textAlign: 'left' } },
        { field: 'UNIQUE_HUMAN_CODE', headerName: 'CODIGO', cellStyle: { textAlign: 'left' } },
        { field: 'INSTANCE_NAME', headerName: 'NOMBRE', flex: 1, cellStyle: { textAlign: 'left' }, suppressAutoSize: true },
        { field: 'IS_ACTIVE', headerName: 'ESTADO', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'STATUS_BADGE' },
        { field: 'IS_PROVEEDOR', headerName: 'PROV', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' },
        { field: 'IS_SUBCONTRATA', headerName: 'SUBC', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' },
        { field: 'IS_CLIENTE', headerName: 'CLIE', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' },
        { field: 'IS_CONTRATISTA', headerName: 'CONT', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' },
        { field: 'IS_UTE', headerName: 'UTE', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' }
      ]
    },
    detailConfig: {
      global: {
        tabs: [
          { id: 'DEL', label: 'DELEGACIONES', queryConfig: { endpoint: '/api/raw-db/read', table: 'delegaciones' } },
          { id: 'CON', label: 'CONTACTOS', queryConfig: { endpoint: '/api/raw-db/read', table: 'contactos' } }
        ],
        columns: []
      }
    }
  },

  'VIEW_SEDES_MASTER': {
    viewId: 'VIEW_SEDES_MASTER',
    rootModule: 'EMP',
    title: 'Sedes',
    masterConfig: {
      tabs: [
        { id: 'todos', label: 'TODAS', queryConfig: { endpoint: '/api/raw-db/read', table: 'entidades_master' } },
        { id: 'SEDE', label: 'SEDES', queryConfig: { endpoint: '/api/raw-db/read', table: 'entidades_master', whereClause: 'IS_SEDE = 1' } }
      ],
      columns: [
        { field: 'EMP_ID', headerName: 'ID', cellStyle: { textAlign: 'left' } },
        { field: 'UNIQUE_HUMAN_CODE', headerName: 'CODIGO', cellStyle: { textAlign: 'left' } },
        { field: 'INSTANCE_NAME', headerName: 'NOMBRE', flex: 1, cellStyle: { textAlign: 'left' }, suppressAutoSize: true },
        { field: 'IS_ACTIVE', headerName: 'ESTADO', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'STATUS_BADGE' },
        { field: 'IS_SEDE', headerName: 'SEDE', headerClass: 'text-center', cellStyle: { textAlign: 'center' }, rendererMode: 'BOOLEAN_LED' }
      ]
    },
    detailConfig: {
      global: {
        tabs: [
          { id: 'DEL', label: 'DELEGACIONES', queryConfig: { endpoint: '/api/raw-db/read', table: 'delegaciones' } },
          { id: 'CON', label: 'CONTACTOS', queryConfig: { endpoint: '/api/raw-db/read', table: 'contactos' } }
        ],
        columns: []
      }
    }
  }
};
