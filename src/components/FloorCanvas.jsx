import { useState, useCallback, useRef, useEffect } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useNodeStore } from "../store/useNodeStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { useUiStore } from "../store/useUiStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { Move, Link, Plus, Trash2, Copy } from "lucide-react";

const FloorCanvas = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);

  const { addNode, removeNode, updateNode } = useNodeStore();
  const { addConnection, removeConnection } = useConnectionStore();
  const { selectedNodeId, setSelectedNode, zoom, setZoom, pan, setPan } = useUiStore();
  const { saveState, undo, redo, canUndo, canRedo } = useHistoryStore();

  const activeFloor = project?.floors?.find((f) => f.id === activeFloorId);

  const [mode, setMode] = useState("select"); // select, connect, move
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [nodeFormData, setNodeFormData] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  const canvasRef = useRef(null);

  // Handle canvas interactions
  const handleCanvasClick = useCallback((e) => {
    if (mode === "connect" || draggedNode) return;
    
    if (e.detail === 2) { // Double click
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

  // Handle node interactions
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

  // Handle node dragging
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

  // Keyboard shortcuts
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

  // Event listeners
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

  // Save node from form
  const handleSaveNode = useCallback((nodeData) => {
    if (!activeFloor) return;
    
    saveState();
    addNode(activeFloor.id, nodeData);
    setShowNodeForm(false);
    setNodeFormData(null);
    setSelectedNode(nodeData.id);
  }, [activeFloor, saveState, addNode, setSelectedNode]);

  // Get node style based on state
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

    // Type-based styling
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

  // Get all nodes for connection rendering
  const allNodes = project?.floors?.flatMap(f => f.nodes || []) || [];

  return (
    <div className="relative flex-1 bg-gray-50 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex gap-2 z-30">
        <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
          <button
            onClick={() => setMode("select")}
            className={`p-2 rounded-md text-sm font-medium transition-all ${
              mode === "select" 
                ? "bg-blue-500 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Select Mode (Default)"
          >
            <Move size={16} />
          </button>
          <button
            onClick={() => setMode("connect")}
            className={`p-2 rounded-md text-sm font-medium transition-all ${
              mode === "connect" 
                ? "bg-yellow-500 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Connect Mode (C)"
          >
            <Link size={16} />
          </button>
          <button
            onClick={() => setMode("move")}
            className={`p-2 rounded-md text-sm font-medium transition-all ${
              mode === "move" 
                ? "bg-green-500 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Move Mode (M)"
          >
            <Move size={16} />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Mode indicator */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm z-30">
        <span className="font-medium text-gray-700">
          Mode: <span className="capitalize text-blue-600">{mode}</span>
        </span>
      </div>

      {/* Canvas */}
      {activeFloor ? (
        <div
          ref={canvasRef}
          className="relative w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          tabIndex={0}
        >
          {/* Floor image */}
          {activeFloor.imageUrl ? (
            <img
              src={activeFloor.imageUrl}
              alt={activeFloor.name}
              className="w-full h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-white">
              <div className="text-center">
                <Plus size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No floor image uploaded</p>
                <p className="text-sm mt-2">Double-click to add nodes</p>
              </div>
            </div>
          )}

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
            {project?.connections
              ?.filter((c) => {
                const fromNode = allNodes.find((n) => n.id === c.from);
                const toNode = allNodes.find((n) => n.id === c.to);
                return fromNode?.coordinates?.floor === activeFloor.id && 
                       toNode?.coordinates?.floor === activeFloor.id;
              })
              .map((c) => {
                const from = allNodes.find((n) => n.id === c.from);
                const to = allNodes.find((n) => n.id === c.to);
                if (!from || !to) return null;

                return (
                  <g key={`${c.from}-${c.to}`}>
                    <line
                      x1={`${from.coordinates.x}%`}
                      y1={`${from.coordinates.y}%`}
                      x2={`${to.coordinates.x}%`}
                      y2={`${to.coordinates.y}%`}
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      opacity="0.7"
                      className="animate-pulse"
                    />
                    {/* Connection midpoint for deletion */}
                    <circle
                      cx={`${(from.coordinates.x + to.coordinates.x) / 2}%`}
                      cy={`${(from.coordinates.y + to.coordinates.y) / 2}%`}
                      r="6"
                      fill="#ef4444"
                      className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveState();
                        removeConnection(c.from, c.to);
                      }}
                    />
                  </g>
                );
              })}
          </svg>

          {/* Nodes */}
          {(activeFloor?.nodes ?? []).map((node) => (
            <div
              key={node.id}
              className={getNodeStyle(node)}
              style={{
                left: `${node.coordinates.x}%`,
                top: `${node.coordinates.y}%`,
                cursor: mode === "move" ? "move" : "pointer"
              }}
              onClick={(e) => handleNodeClick(node, e)}
              onMouseDown={(e) => handleMouseDown(node, e)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              title={`${node.name || 'Unnamed'} (${node.type})`}
            >
              {node.name || `${node.type}`}
              {/* Connection count indicator */}
              {project?.connections?.filter(c => c.from === node.id || c.to === node.id).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {project.connections.filter(c => c.from === node.id || c.to === node.id).length}
                </span>
              )}
            </div>
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

      {/* Instructions panel */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg text-sm text-gray-600 max-w-sm">
        <h4 className="font-semibold mb-2">Quick Guide</h4>
        <div className="space-y-1 text-xs">
          <p><kbd className="bg-gray-100 px-1 rounded">Double-click</kbd> Add node</p>
          <p><kbd className="bg-gray-100 px-1 rounded">Click</kbd> Select node</p>
          <p><kbd className="bg-gray-100 px-1 rounded">C</kbd> Toggle connect mode</p>
          <p><kbd className="bg-gray-100 px-1 rounded">M</kbd> Toggle move mode</p>
          <p><kbd className="bg-gray-100 px-1 rounded">Del</kbd> Remove selected</p>
          <p><kbd className="bg-gray-100 px-1 rounded">Ctrl+Z</kbd> Undo</p>
        </div>
      </div>

      {/* Node Form Modal */}
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

// Enhanced Node Form Modal
const NodeFormModal = ({ nodeData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(nodeData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a node name");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Create New Node</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a descriptive name"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="room">Room</option>
              <option value="hallway">Hallway</option>
              <option value="stair">Staircase</option>
              <option value="elevator">Elevator</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X Position (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.coordinates.x}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coordinates: { ...prev.coordinates, x: parseFloat(e.target.value) }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y Position (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.coordinates.y}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coordinates: { ...prev.coordinates, y: parseFloat(e.target.value) }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              Create Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloorCanvas;