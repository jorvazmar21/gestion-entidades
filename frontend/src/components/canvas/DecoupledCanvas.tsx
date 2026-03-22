import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Position,
  type NodeProps,
  type Edge,
  type Connection,
  type Node as FlowNode,
  ReactFlowProvider,
  SelectionMode,
  Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Plus, X, Layers, Package, Info, Eye, EyeOff, Settings, Hand, MousePointer2, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CanvasNode, CanvasAssignment, CanvasTree } from './CanvasTypes';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const nodeWidth = 180;
const nodeHeight = 60;

export const TREE_COLORS: Record<string, any> = {
  blue: { rootBg: 'bg-blue-50/50', rootBorder: 'border-blue-200/50', rootHover: 'hover:border-blue-300/50', childBg: 'bg-white', childBorder: 'border-blue-100/50', text: 'text-blue-700/80', handle: '!bg-blue-200/50 !border-blue-300/50' },
  emerald: { rootBg: 'bg-emerald-50/50', rootBorder: 'border-emerald-200/50', rootHover: 'hover:border-emerald-300/50', childBg: 'bg-white', childBorder: 'border-emerald-100/50', text: 'text-emerald-700/80', handle: '!bg-emerald-200/50 !border-emerald-300/50' },
  rose: { rootBg: 'bg-rose-50/50', rootBorder: 'border-rose-200/50', rootHover: 'hover:border-rose-300/50', childBg: 'bg-white', childBorder: 'border-rose-100/50', text: 'text-rose-700/80', handle: '!bg-rose-200/50 !border-rose-300/50' },
  amber: { rootBg: 'bg-amber-50/50', rootBorder: 'border-amber-200/50', rootHover: 'hover:border-amber-300/50', childBg: 'bg-white', childBorder: 'border-amber-100/50', text: 'text-amber-700/80', handle: '!bg-amber-200/50 !border-amber-300/50' },
  slate: { rootBg: 'bg-slate-50/50', rootBorder: 'border-slate-200/50', rootHover: 'hover:border-slate-300/50', childBg: 'bg-white', childBorder: 'border-slate-100/50', text: 'text-slate-700/80', handle: '!bg-slate-200/50 !border-slate-300/50' },
};

const getLayoutedElements = (nodes: FlowNode[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const CustomNode = ({ id, data }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(data.label as string);

  const isTreeRoot = data.isTreeRoot as boolean;
  const colorTheme = TREE_COLORS[(data.color as string)] || TREE_COLORS.blue;

  const onDoubleClick = () => setIsEditing(true);
  
  const onBlur = () => {
    setIsEditing(false);
    if (name.trim() !== data.label && name.trim() !== '') {
      (data.onEdit as any)(id, name.trim());
    } else {
      setName(data.label as string);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onBlur();
    if (e.key === 'Escape') {
      setName(data.label as string);
      setIsEditing(false);
    }
  };

  return (
    <div className={cn(
      "px-4 py-3 shadow-lg rounded-xl border-2 flex items-center justify-center min-w-[160px] transition-colors group relative",
      isTreeRoot 
        ? `${colorTheme.rootBg} ${colorTheme.rootBorder} ${colorTheme.rootHover}` 
        : `bg-white ${colorTheme.childBorder} hover:border-gray-400`
    )}>
      {!isTreeRoot && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className={cn("!w-3 !h-3 !min-w-[12px] !min-h-[12px] !bg-white !border-2 cursor-crosshair hover:scale-150 transition-all z-10", colorTheme.childBorder)} 
          title="Arrastra una línea hasta aquí para cambiar de padre"
        />
      )}

      {data.itemCount !== undefined && (data.itemCount as number) > 0 && (
        <div 
          className="absolute -top-3 -left-3 bg-white text-gray-700 text-xs font-bold px-2 py-1 rounded-full border-2 border-gray-200 shadow-sm flex items-center gap-1 z-50"
        >
          <Package className={cn("w-3 h-3", colorTheme.text)} />
          {data.itemCount as number}
        </div>
      )}
      
      <div className="w-full text-center cursor-pointer" onDoubleClick={onDoubleClick}>
        {isEditing ? (
          <input 
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className={cn(
              "w-full text-center font-semibold text-sm outline-none border-b-2 rounded px-1 nodrag cursor-text",
              isTreeRoot ? `${colorTheme.rootBg} ${colorTheme.text} ${colorTheme.rootBorder}` : `${colorTheme.childBg} text-gray-800 ${colorTheme.childBorder}`
            )}
          />
        ) : (
          <div className={cn(
            "font-semibold text-sm break-words select-none",
            isTreeRoot ? colorTheme.text : "text-gray-800"
          )}>
            {data.label as string}
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn("!w-3 !h-3 !min-w-[12px] !min-h-[12px] !border-2 cursor-crosshair hover:scale-150 transition-all flex items-center justify-center z-10", colorTheme.handle)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          (data.onAddChild as any)(id);
        }}
        title="Arrastra para conectar, o haz click para añadir un hijo"
      >
        <Plus className="text-white pointer-events-none !w-2 !h-2" strokeWidth={4} />
      </Handle>
      
      {!isTreeRoot && (
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            (data.onDelete as any)(id); 
          }}
          className="nodrag absolute -top-3 -right-3 p-1.5 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200 hover:scale-110 z-50"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

interface DecoupledCanvasProps {
  trees: CanvasTree[];
  nodes: CanvasNode[];
  assignments: CanvasAssignment[];
  onAddTree: (name: string, color?: string) => string;
  onUpdateTree: (id: string, name: string, color?: string) => void;
  onDeleteTree: (id: string) => void;
  onAddNode: (treeId: string, parentId: string | null, name: string) => void;
  onUpdateNode: (id: string, name: string, parentId?: string | null, treeId?: string) => void;
  onDeleteNode: (id: string) => void;
  onUpdateNodePosition: (id: string, position: { x: number; y: number }, isTreeRoot: boolean) => void;
  visibleTreeIds: string[];
  onVisibleTreeIdsChange: (ids: string[]) => void;
  canvasViewport: { x: number; y: number; zoom: number };
  onCanvasViewportChange: (viewport: { x: number; y: number; zoom: number }) => void;
  treeColors: Record<string, string>;
  onTreeColorChange: (treeId: string, color: string) => void;
  treePositions: Record<string, { x: number; y: number }>;
  nodePositions: Record<string, { x: number; y: number }>;
}

export default function DecoupledCanvas({
  trees, nodes, assignments,
  onAddTree, onUpdateTree, onDeleteTree,
  onAddNode, onUpdateNode, onDeleteNode, onUpdateNodePosition,
  visibleTreeIds, onVisibleTreeIdsChange,
  canvasViewport, onCanvasViewportChange,
  treeColors, onTreeColorChange,
  treePositions, nodePositions
}: DecoupledCanvasProps) {
  
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isManagePlacesModalOpen, setIsManagePlacesModalOpen] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceColor, setNewPlaceColor] = useState('blue');
  const [nodeNameInput, setNodeNameInput] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [parentNodeId, setParentNodeId] = useState<string | null>(null);
  const [targetTreeId, setTargetTreeId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'tree' | 'node', id: string } | null>(null);
  const [panOnDrag, setPanOnDrag] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (/ResizeObserver loop completed with undelivered notifications./.test(args[0])) {
        return;
      }
      originalError.call(console, ...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: FlowNode, draggedNodes: FlowNode[]) => {
    draggedNodes.forEach(n => {
      onUpdateNodePosition(n.id, n.position, n.data.isTreeRoot as boolean);
    });
  }, [onUpdateNodePosition]);

  const getCumulativeItemCount = useCallback((nodeId: string): number => {
    const calculate = (id: string): number => {
      let count = assignments.filter(a => a.nodeId === id).reduce((sum, a) => sum + a.quantity, 0);
      const children = nodes.filter(n => n.parentId === id);
      for (const child of children) {
        count += calculate(child.id);
      }
      return count;
    };
    return calculate(nodeId);
  }, [nodes, assignments]);

  const structureString = useMemo(() => {
    const treesStr = trees.map(t => `${t.id}-${treeColors[t.id]}`).join('|');
    const nodesStr = nodes.map(n => `${n.id}-${n.parentId}-${n.treeId}`).join('|');
    const visibleStr = visibleTreeIds.join('|');
    return `${treesStr}||${nodesStr}||${visibleStr}`;
  }, [trees, nodes, visibleTreeIds, treeColors]);

  const handleDeleteNode = useCallback((nodeId: string, isTreeRoot: boolean) => {
    setConfirmDelete({ type: isTreeRoot ? 'tree' : 'node', id: nodeId });
  }, []);

  const openAddChildModal = useCallback((parentId: string, isTreeRoot: boolean) => {
    setEditingNodeId(null);
    if (isTreeRoot) {
      setParentNodeId(null);
      setTargetTreeId(parentId);
    } else {
      setParentNodeId(parentId);
      const node = nodes.find(n => n.id === parentId);
      setTargetTreeId(node ? node.treeId : null);
    }
    setNodeNameInput('');
    setIsNodeModalOpen(true);
  }, [nodes]);

  useEffect(() => {
    const initialNodes: FlowNode[] = [];
    const initialEdges: Edge[] = [];

    const visibleTrees = trees.filter(t => visibleTreeIds.includes(t.id));
    visibleTrees.forEach(tree => {
      const treeItemCount = assignments
        .filter(a => nodes.find(node => node.id === a.nodeId)?.treeId === tree.id)
        .reduce((sum, a) => sum + a.quantity, 0);

      initialNodes.push({
        id: tree.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { 
          label: tree.name,
          itemCount: treeItemCount,
          isTreeRoot: true,
          color: treeColors[tree.id] || 'indigo',
          onEdit: (id: string, newName: string) => onUpdateTree(id, newName),
          onAddChild: (id: string) => openAddChildModal(id, true),
          onDelete: (id: string) => handleDeleteNode(id, true)
        },
      });
    });

    const visibleNodesList = nodes.filter(n => visibleTreeIds.includes(n.treeId));
    visibleNodesList.forEach(n => {
      const tree = trees.find(t => t.id === n.treeId);
      const itemCount = getCumulativeItemCount(n.id);

      initialNodes.push({
        id: n.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { 
          label: n.label,
          itemCount,
          isTreeRoot: false,
          color: (tree ? treeColors[tree.id] : 'indigo') || 'indigo',
          onEdit: (id: string, newName: string) => onUpdateNode(id, newName),
          onAddChild: (id: string) => openAddChildModal(id, false),
          onDelete: (id: string) => handleDeleteNode(id, false)
        },
      });

      if (n.parentId) {
        initialEdges.push({
          id: `e-${n.parentId}-${n.id}`,
          source: n.parentId,
          target: n.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        });
      } else {
        initialEdges.push({
          id: `e-${n.treeId}-${n.id}`,
          source: n.treeId,
          target: n.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5 5' }
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    
    const newChildrenCount = new Map<string, number>();

    const finalNodes = layoutedNodes.map(node => {
      let savedPosition;
      if (node.data.isTreeRoot) {
        savedPosition = treePositions[node.id];
      } else {
        savedPosition = nodePositions[node.id];
      }

      if (savedPosition) {
        return { ...node, position: savedPosition };
      }
      
      // Para nodos nuevos (sin posición guardada)
      if (!node.data.isTreeRoot) {
        const parentEdge = initialEdges.find(e => e.target === node.id);
        if (parentEdge) {
          let parentPos;
          const parentIsTreeRoot = trees.some(t => t.id === parentEdge.source);
          if (parentIsTreeRoot) {
            parentPos = treePositions[parentEdge.source];
          } else {
            parentPos = nodePositions[parentEdge.source];
          }
          
          if (parentPos) {
            const count = newChildrenCount.get(parentEdge.source) || 0;
            newChildrenCount.set(parentEdge.source, count + 1);
            return {
              ...node,
              position: {
                x: parentPos.x + (count * 20),
                y: parentPos.y + nodeHeight + 80
              }
            };
          }
        }
      }
      
      return node;
    });

    setFlowNodes(finalNodes);
    setFlowEdges(layoutedEdges);
  }, [structureString, trees, nodes, assignments, visibleTreeIds, onUpdateTree, onUpdateNode, openAddChildModal, handleDeleteNode, setFlowNodes, setFlowEdges, getCumulativeItemCount, treePositions, nodePositions]);

  const onConnect = useCallback((params: Connection) => {
    const { source, target } = params;
    if (source && target) {
      const targetNode = nodes.find(n => n.id === target);
      
      if (targetNode) {
        const sourceTree = trees.find(t => t.id === source);
        if (sourceTree) {
          onUpdateNode(target, targetNode.label, null, sourceTree.id);
        } else {
          const newParentNode = nodes.find(n => n.id === source);
          if (newParentNode) {
            onUpdateNode(target, targetNode.label, source, newParentNode.treeId);
          }
        }
      }
    }
  }, [nodes, trees, onUpdateNode]);

  const handleCreatePlace = () => {
    if (!newPlaceName.trim()) return;
    const newTreeId = onAddTree(newPlaceName.trim(), newPlaceColor);
    onVisibleTreeIdsChange([...visibleTreeIds, newTreeId]);
    setNewPlaceName('');
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'node') {
      onDeleteNode(confirmDelete.id);
    } else if (confirmDelete.type === 'tree') {
      onDeleteTree(confirmDelete.id);
      onVisibleTreeIdsChange(visibleTreeIds.filter(id => id !== confirmDelete.id));
    }
    setConfirmDelete(null);
  };

  const handleSaveNode = () => {
    if (!nodeNameInput.trim() || !targetTreeId) return;
    
    if (editingNodeId) {
      onUpdateNode(editingNodeId, nodeNameInput.trim());
    } else {
      onAddNode(targetTreeId, parentNodeId, nodeNameInput.trim());
    }
    setIsNodeModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onMoveEnd={(event, viewport) => onCanvasViewportChange(viewport)}
          defaultViewport={canvasViewport}
          fitView={canvasViewport.x === 0 && canvasViewport.y === 0 && canvasViewport.zoom === 1}
          nodeTypes={nodeTypes}
          className="bg-gray-50"
          panOnDrag={panOnDrag}
          selectionOnDrag={!panOnDrag}
          selectionMode={SelectionMode.Partial}
          minZoom={0.1}
        >
          <Background color="#cbd5e1" gap={16} size={2} />
          <Controls className="bg-white shadow-md border-gray-200 rounded-xl overflow-hidden" />
          
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <button 
              onClick={() => setIsManagePlacesModalOpen(true)}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center"
              title="Gestión de Lugares"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="flex bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setPanOnDrag(true)}
                className={cn(
                  "p-2 rounded-full transition-colors flex items-center justify-center",
                  panOnDrag ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
                )}
                title="Mover lienzo"
              >
                <Hand className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPanOnDrag(false)}
                className={cn(
                  "p-2 rounded-full transition-colors flex items-center justify-center",
                  !panOnDrag ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
                )}
                title="Seleccionar área"
              >
                <MousePointer2 className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className={cn(
                  "bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-sm border border-gray-200 transition-colors flex items-center justify-center",
                  showInfo ? "bg-blue-50 text-blue-600 border-blue-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title="Información"
              >
                <Info className="w-5 h-5" />
              </button>
              
              <div className={cn(
                "absolute top-14 left-0 bg-white/95 backdrop-blur-md px-5 py-4 rounded-xl shadow-lg border border-gray-200 text-sm text-gray-600 w-72 transition-all duration-300 origin-top-left",
                showInfo ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
              )}>
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <p className="font-bold text-gray-800 flex items-center gap-2 text-base">
                    <Layers className="w-5 h-5 text-gray-500" />
                    Lienzo Desacoplado
                  </p>
                  <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ul className="space-y-2 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span><strong>Botón de ajustes</strong> para gestionar los Lugares.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span><strong>Doble click</strong> en cualquier tarjeta para editar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span><strong>Click en el +</strong> para añadir un nivel inferior.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span><strong>Arrastra las líneas</strong> para reorganizar.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ReactFlow>
      </div>

      {isManagePlacesModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-white">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Gestión de Lugares</h3>
                <p className="text-sm text-gray-500 mt-1">Administra los almacenes, su visibilidad y colores.</p>
              </div>
              <button onClick={() => setIsManagePlacesModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div>Nombre del Lugar</div>
                  <div className="text-center w-32">Color</div>
                  <div className="text-center w-24">Visibilidad</div>
                  <div className="text-center w-20">Acciones</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {trees.map(tree => (
                    <div key={tree.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50/80 transition-colors group">
                      <input
                        value={tree.name}
                        onChange={(e) => onUpdateTree(tree.id, e.target.value)}
                        className="bg-transparent font-medium text-gray-900 outline-none border border-transparent focus:border-gray-300 focus:bg-white px-3 py-1.5 rounded-lg transition-all w-full"
                      />
                      <div className="flex gap-2 justify-center w-32">
                        {Object.keys(TREE_COLORS).map(c => (
                          <button
                            key={c}
                            onClick={() => onTreeColorChange(tree.id, c)}
                            className={cn(
                              "w-6 h-6 rounded-full border transition-all hover:scale-110", 
                              (treeColors[tree.id] || 'blue') === c ? "border-gray-400 ring-2 ring-gray-200 shadow-sm scale-110" : "border-gray-200", 
                              TREE_COLORS[c].rootBg
                            )}
                            title={`Color ${c}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-center w-24">
                        <button
                          onClick={() => onVisibleTreeIdsChange(visibleTreeIds.includes(tree.id) ? visibleTreeIds.filter(id => id !== tree.id) : [...visibleTreeIds, tree.id])}
                          className={cn(
                            "p-2 rounded-lg transition-colors flex items-center justify-center", 
                            visibleTreeIds.includes(tree.id) ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-gray-400 hover:bg-gray-100"
                          )}
                          title={visibleTreeIds.includes(tree.id) ? "Ocultar en el lienzo" : "Mostrar en el lienzo"}
                        >
                          {visibleTreeIds.includes(tree.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex justify-center w-20">
                        <button
                          onClick={() => setConfirmDelete({ type: 'tree', id: tree.id })}
                          className="p-2 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Eliminar almacén"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {trees.length === 0 && (
                    <div className="text-gray-500 text-center py-12 text-sm">
                      No hay lugares creados. Añade uno nuevo abajo.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-white border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Añadir nuevo lugar</h4>
              <div className="flex items-center gap-4">
                <input
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="Ej: Almacén Central..."
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePlace(); }}
                />
                <div className="flex gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  {Object.keys(TREE_COLORS).map(c => (
                    <button
                      key={c}
                      onClick={() => setNewPlaceColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full border transition-all hover:scale-110", 
                        newPlaceColor === c ? "border-gray-400 ring-2 ring-gray-200 shadow-sm scale-110" : "border-gray-200", 
                        TREE_COLORS[c].rootBg
                      )}
                      title={`Color ${c}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreatePlace}
                  disabled={!newPlaceName.trim()}
                  className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Añadir Lugar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNodeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingNodeId ? 'Editar Tarjeta' : 'Añadir Nueva Tarjeta'}
            </h3>
            <input
              type="text"
              value={nodeNameInput}
              onChange={(e) => setNodeNameInput(e.target.value)}
              placeholder="Ej: Planta Baja, Pasillo A..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-6"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNode()}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsNodeModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">
                Cancelar
              </button>
              <button onClick={handleSaveNode} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¿Estás seguro?
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmDelete.type === 'node' 
                ? 'Se eliminará esta rama y todos sus descendientes. Esta acción no se puede deshacer.'
                : 'Se eliminará esta estructura completa y todas sus ramas. Esta acción no se puede deshacer.'}
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
