export interface CanvasNode {
  id: string;
  label: string;
  parentId: string | null;
  treeId: string;
  isRoot: boolean;
  color: string;
}

export interface CanvasAssignment {
  id: string;
  nodeId: string;
  itemId: string;
  quantity: number;
}

export interface CanvasTree {
  id: string;
  name: string;
  color: string;
}
