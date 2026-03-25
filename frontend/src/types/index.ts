export interface Entity {
  id: string;
  level: string;
  category: string;
  subCategory: string;
  type: string;
  code: string;
  name: string;
  location: string;
  canal: string;
  parentId: string | null;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PSetProperty {
  name: string;
  type: string;
  config?: any;
}

export interface PSetDef {
  id_pset: string;
  behavior: string;
  appliesTo: string[];
  properties: PSetProperty[];
}

export interface EntityType {
  id_tipo: string;
  nombre: string;
  categoria: string;
  subCategoria: string;
  nivel: string;
  icono: string;
  tipos_hijo_permitidos: string[];
  max_count_per_parent: number | null;
  min_count_per_parent: number | null;
}

export interface ModuleConfig {
  title: string;
  prefix: string;
  level: string;
  category: string;
  subCategory: string;
  icono: string;
  tiposHijo: string[];
  maxCount: number | null;
  minCount: number | null;
}

export interface PSetHistoryRecord {
  id_record: string;
  id_entity: string;
  id_pset: string;
  timestamp: string;
  data: Record<string, any>;
}
