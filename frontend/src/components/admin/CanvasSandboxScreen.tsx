import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DecoupledCanvas from '../canvas/DecoupledCanvas';
import type { CanvasTree, CanvasNode, CanvasAssignment } from '../canvas/CanvasTypes';

interface Props {
  onBack: () => void;
}

// Datos iniciales de prueba (Mapeo Simulado de L1-L5)
const initialTrees: CanvasTree[] = [
  { id: 'L1-VITORIA', name: 'Parque Vitoria', color: 'blue' },
  { id: 'L1-MADRID', name: 'Sede Central Madrid', color: 'emerald' }
];

const initialNodes: CanvasNode[] = [
  // Hijos del Parque Vitoria
  { id: 'L2-ALM-SUR', label: 'Almacén Sur', parentId: null, treeId: 'L1-VITORIA', isRoot: false, color: 'blue' },
  { id: 'L3-MANT-Q3', label: 'Mantenimiento Q3', parentId: 'L2-ALM-SUR', treeId: 'L1-VITORIA', isRoot: false, color: 'blue' },
  { id: 'L4-REVISION', label: 'Revisión Hidráulica', parentId: 'L3-MANT-Q3', treeId: 'L1-VITORIA', isRoot: false, color: 'blue' },
  // Hijos de la Sede Madrid
  { id: 'L2-OFICINA', label: 'Oficina Técnica', parentId: null, treeId: 'L1-MADRID', isRoot: false, color: 'emerald' },
  { id: 'L3-PEDIDO', label: 'Pedido Compras #88', parentId: 'L2-OFICINA', treeId: 'L1-MADRID', isRoot: false, color: 'emerald' }
];

const initialAssignments: CanvasAssignment[] = [
  // L5s simulados enganchados a L4 y L2
  { id: 'A1', nodeId: 'L4-REVISION', itemId: 'Checklist-001', quantity: 1 },
  { id: 'A2', nodeId: 'L2-ALM-SUR', itemId: 'Tornillos-M8', quantity: 25 },
];

export const CanvasSandboxScreen: React.FC<Props> = ({ onBack }) => {
  const [trees, setTrees] = useState<CanvasTree[]>(initialTrees);
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [assignments] = useState<CanvasAssignment[]>(initialAssignments);
  
  const [visibleTreeIds, setVisibleTreeIds] = useState<string[]>(['L1-VITORIA', 'L1-MADRID']);
  const [treeColors, setTreeColors] = useState<Record<string, string>>({
    'L1-VITORIA': 'blue',
    'L1-MADRID': 'emerald'
  });
  
  const [canvasViewport, setCanvasViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [treePositions, setTreePositions] = useState<Record<string, {x: number, y: number}>>({});
  const [nodePositions, setNodePositions] = useState<Record<string, {x: number, y: number}>>({});

  // CRUD Árboles (L1)
  const handleAddTree = (name: string, color: string = 'blue') => {
    const id = `L1-NEW-${Date.now()}`;
    setTrees(prev => [...prev, { id, name, color }]);
    setTreeColors(prev => ({ ...prev, [id]: color }));
    return id;
  };

  const handleUpdateTree = (id: string, name: string, color?: string) => {
    setTrees(prev => prev.map(t => t.id === id ? { ...t, name, color: color || t.color } : t));
    if (color) setTreeColors(prev => ({ ...prev, [id]: color }));
  };

  const handleDeleteTree = (id: string) => {
    setTrees(prev => prev.filter(t => t.id !== id));
    setNodes(prev => prev.filter(n => n.treeId !== id)); // Borrado en cascada
    setVisibleTreeIds(prev => prev.filter(vId => vId !== id));
  };

  // CRUD Nodos (L2-L4)
  const handleAddNode = (treeId: string, parentId: string | null, label: string) => {
    const id = `L-NEW-${Date.now()}`;
    setNodes(prev => [...prev, { id, label, parentId, treeId, isRoot: false, color: treeColors[treeId] || 'blue' }]);
  };

  const handleUpdateNode = (id: string, label: string, parentId?: string | null, treeId?: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== id) return n;
      return {
        ...n,
        label,
        parentId: parentId !== undefined ? parentId : n.parentId,
        treeId: treeId || n.treeId,
        color: treeId ? (treeColors[treeId] || 'blue') : n.color
      };
    }));
  };

  const handleDeleteNode = (id: string) => {
    // Borrado recursivo simulado
    const idsToDelete = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      nodes.forEach(n => {
        if (n.parentId && idsToDelete.has(n.parentId) && !idsToDelete.has(n.id)) {
          idsToDelete.add(n.id);
          added = true;
        }
      });
    }
    setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)));
  };

  const handleUpdateNodePosition = (id: string, position: { x: number, y: number }, isTreeRoot: boolean) => {
    if (isTreeRoot) {
      setTreePositions(prev => ({ ...prev, [id]: position }));
    } else {
      setNodePositions(prev => ({ ...prev, [id]: position }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* HEADER */}
      <div className="flex-none bg-[#111827] text-white p-4 shadow-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-[#1f2937] rounded-full transition-colors flex items-center justify-center border border-transparent hover:border-gray-600"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Decoupled Canvas (SandBox)</h1>
            <h2 className="text-xs text-gray-400 font-medium tracking-wide">
              Entorno de pruebas visuales para el árbol L1-L5
            </h2>
          </div>
        </div>
      </div>

      {/* RENDERIZADOR CANVAS */}
      <div className="flex-1 w-full bg-gray-50 border-t border-gray-200">
        <DecoupledCanvas
          trees={trees}
          nodes={nodes}
          assignments={assignments}
          onAddTree={handleAddTree}
          onUpdateTree={handleUpdateTree}
          onDeleteTree={handleDeleteTree}
          onAddNode={handleAddNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onUpdateNodePosition={handleUpdateNodePosition}
          visibleTreeIds={visibleTreeIds}
          onVisibleTreeIdsChange={setVisibleTreeIds}
          canvasViewport={canvasViewport}
          onCanvasViewportChange={setCanvasViewport}
          treeColors={treeColors}
          onTreeColorChange={(id, c) => {
            setTreeColors(prev => ({ ...prev, [id]: c }));
            handleUpdateTree(id, trees.find(t=>t.id===id)?.name || '', c);
          }}
          treePositions={treePositions}
          nodePositions={nodePositions}
        />
      </div>
    </div>
  );
};
