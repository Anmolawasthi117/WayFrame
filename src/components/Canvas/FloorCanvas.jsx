import { useState, useCallback, useRef, useEffect } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import { useNodeStore } from "../../store/useNodeStore";
import { useConnectionStore } from "../../store/useConnectionStore";
import { useUiStore } from "../../store/useUiStore";
import { useHistoryStore } from "../../store/useHistoryStore";
import { Plus } from "lucide-react";
import Toolbar from "./Toolbar";
import ModeIndicator from "./ModeIndicator";
import FloorImage from "./FloorImage";
import Connections from "./Connections";
import Node from "./Node";
import Instructions from "./Instructions";
import NodeFormModal from "./NodeFormModal";

const FloorCanvas = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const { addNode, removeNode, updateNode } = useNodeStore();
  const { addConnection, removeConnection } = useConnectionStore();
  const { selectedNodeId, setSelectedNode } = useUiStore();
  const { saveState, undo, redo, canUndo, canRedo } = useHistoryStore();

  const activeFloor = project?.floors?.find((f) => f.id === activeFloorId);
  const [mode, setMode] = useState("select");
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [nodeFormData, setNodeFormData] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const canvasRef = useRef(null);

  const handleCanvasClick = useCallback((e) => {
    if (mode === "connect" || draggedNode) return;
    
    if (e.detail === 2) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(2));
      const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(2));

      const newNodeData = {
        id: crypto.randomUUID(),
        name: "",
        type: "room",
        coordinates: { x, y, floor: activeFloor.id },
        connections: [],
        meta: {}
      };

      setNodeFormData(newNodeData);
      setShowNodeForm(true);
    } else {
      setSelectedNode(null);
    }
  }, [mode, activeFloor, setSelectedNode, draggedNode]);

  const handleNodeClick = useCallback((node, e) => {
    e.stopPropagation();
    if (mode === "connect") {
      if (!selectedNodeId) {
        setSelectedNode(node.id);
      } else if (selectedNodeId === node.id) {
        setSelectedNode(null);
      } else {
        saveState();
        addConnection(selectedNodeId, node.id);
        setSelectedNode(null);
        setMode("select");
      }
    } else {
      setSelectedNode(selectedNodeId === node.id ? null : node.id);
    }
  }, [mode, selectedNodeId, setSelectedNode, addConnection, saveState]);

  const handleMouseDown = useCallback((node, e) => {
    if (mode !== "move" && mode !== "select") return;
    
    e.preventDefault();
    setDraggedNode(node);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const nodeX = (node.coordinates.x / 100) * rect.width;
    const nodeY = (node.coordinates.y / 100) * rect.height;
    
    setDragOffset({
      x: e.clientX - rect.left - nodeX,
      y: e.clientY - rect.top - nodeY
    });
  }, [mode]);

  const handleMouseMove = useCallback((e) => {
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left - dragOffset.x) / rect.width * 100)));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top - dragOffset.y) / rect.height * 100)));

    updateNode(activeFloor.id, draggedNode.id, {
      coordinates: { ...draggedNode.coordinates, x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) }
    });
  }, [draggedNode, dragOffset, activeFloor, updateNode]);

  const handleMouseUp = useCallback(() => {
    if (draggedNode) {
      saveState();
      setDraggedNode(null);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [draggedNode, saveState]);

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedNodeId && activeFloor) {
          saveState();
          removeNode(activeFloor.id, selectedNodeId);
          setSelectedNode(null);
        }
        break;
      case 'Escape':
        setSelectedNode(null);
        setMode("select");
        break;
      case 'c':
        if (e.metaKey || e.ctrlKey) return;
        setMode(mode === "connect" ? "select" : "connect");
        break;
      case 'm':
        if (e.metaKey || e.ctrlKey) return;
        setMode(mode === "move" ? "select" : "move");
        break;
      case 'z':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;
    }
  }, [selectedNodeId, activeFloor, saveState, removeNode, setSelectedNode, mode, undo, redo]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, handleMouseUp, handleKeyDown]);

  const handleSaveNode = useCallback((nodeData) => {
    if (!activeFloor) return;
    
    saveState();
    addNode(activeFloor.id, nodeData);
    setShowNodeForm(false);
    setNodeFormData(null);
    setSelectedNode(nodeData.id);
  }, [activeFloor, saveState, addNode, setSelectedNode]);

  const getNodeStyle = useCallback((node) => {
    const isSelected = selectedNodeId === node.id;
    const isHovered = hoveredNode === node.id;
    const isConnecting = mode === "connect" && selectedNodeId === node.id;
    
    let baseClasses = "absolute px-3 py-1 text-xs rounded-full shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 font-medium border-2";
    
    if (isConnecting) {
      baseClasses += " bg-yellow-500 text-white border-yellow-600 scale-110 z-20 animate-pulse";
    } else if (isSelected) {
      baseClasses += " bg-blue-500 text-white border-blue-600 scale-110 z-20";
    } else if (isHovered) {
      baseClasses += " scale-105 z-10";
    }

    switch (node.type) {
      case "room":
        baseClasses += isSelected || isConnecting ? "" : " bg-green-500 text-white border-green-600 hover:bg-green-600";
        break;
      case "hallway":
        baseClasses += isSelected || isConnecting ? "" : " bg-gray-500 text-white border-gray-600 hover:bg-gray-600";
        break;
      case "stair":
        baseClasses += isSelected || isConnecting ? "" : " bg-orange-500 text-white border-orange-600 hover:bg-orange-600";
        break;
      case "elevator":
        baseClasses += isSelected || isConnecting ? "" : " bg-purple-500 text-white border-purple-600 hover:bg-purple-600";
        break;
      default:
        baseClasses += isSelected || isConnecting ? "" : " bg-red-500 text-white border-red-600 hover:bg-red-600";
    }

    return baseClasses;
  }, [selectedNodeId, hoveredNode, mode]);

  const allNodes = project?.floors?.flatMap(f => f.nodes || []) || [];

  return (
    <div className="relative flex-1 bg-gray-50 overflow-hidden">
      <Toolbar mode={mode} setMode={setMode} canUndo={canUndo} canRedo={canRedo} undo={undo} redo={redo} />
      <ModeIndicator mode={mode} />
      {activeFloor ? (
        <div
          ref={canvasRef}
          className="relative w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          tabIndex={0}
        >
          <FloorImage activeFloor={activeFloor} />
          <Connections project={project} activeFloor={activeFloor} allNodes={allNodes} saveState={saveState} removeConnection={removeConnection} />
          {(activeFloor?.nodes ?? []).map((node) => (
            <Node
              key={node.id}
              node={node}
              mode={mode}
              selectedNodeId={selectedNodeId}
              hoveredNode={hoveredNode}
              project={project}
              handleNodeClick={handleNodeClick}
              handleMouseDown={handleMouseDown}
              setHoveredNode={setHoveredNode}
              getNodeStyle={getNodeStyle}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <Plus size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl mb-2">No floor selected</p>
            <p className="text-sm">Upload a floor image to start creating your navigation graph</p>
          </div>
        </div>
      )}
      <Instructions />
      {showNodeForm && nodeFormData && (
        <NodeFormModal
          nodeData={nodeFormData}
          onSave={handleSaveNode}
          onCancel={() => {
            setShowNodeForm(false);
            setNodeFormData(null);
          }}
        />
      )}
    </div>
  );
};

export default FloorCanvas;