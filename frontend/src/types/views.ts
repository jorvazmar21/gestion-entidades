export interface ViewBlueprint {
  viewId: string;           
  rootModule: string;       
  title: string;            
  masterConfig: {
    tabs: GridTabConfig[];        
    columns: GridColumnDef[];     
  };
  detailConfig: Record<string, DetailViewDef>;
}

export interface GridTabConfig {
  id: string;               
  label: string;            
  queryConfig: {
    endpoint: string;       
    table: string;          
    whereClause?: string;   
    orderBy?: string;       
  };
  overrideColumns?: GridColumnDef[]; 
}

export type RendererModeType = 'TEXT' | 'BOOLEAN_LED' | 'STATUS_BADGE' | 'DASHBOARD_PROGRESS';

export interface GridColumnDef {
  field: string;            
  headerName: string;       
  width?: number;
  minWidth?: number;
  flex?: number;
  resizable?: boolean;
  suppressAutoSize?: boolean;
  headerClass?: string;
  cellStyle?: React.CSSProperties | ((params: any) => any);
  rendererMode?: RendererModeType;
  rendererRules?: any;      
}

export interface DetailViewDef {
  tabs: GridTabConfig[];    
  defaultOpenTabId?: string;
  columns: GridColumnDef[];
}
