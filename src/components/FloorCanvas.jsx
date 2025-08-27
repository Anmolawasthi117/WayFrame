import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useNodeStore } from "../store/useNodeStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { useUiStore } from "../store/useUiStore";

const FloorCanvas = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);

  const { addNode, removeNode } = useNodeStore();
  const { addConnection } = useConnectionStore();
  const { selectedNodeId, setSelectedNode } = useUiStore();

  const activeFloor = project?.floors?.find((f) => f.id === activeFloorId);

  const [connectMode, setConnectMode] = useState(false);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [nodeFormData, setNodeFormData] = useState(null);

  // Double click to create new node
  const handleDoubleClick = (e) => {
    if (!activeFloor || connectMode) return;
    
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
  };

  // Handle node click for selection/connection
  const handleNodeClick = (node, e) => {
    e.stopPropagation();

    if (connectMode) {
      if (!selectedNodeId) {
        setSelectedNode(node.id);
      } else if (selectedNodeId === node.id) {
        setSelectedNode(null);
      } else {
        // Create connection between selected node and clicked node
        addConnection(selectedNodeId, node.id);
        setSelectedNode(null);
        setConnectMode(false);
      }
    } else {
      // Regular selection
      setSelectedNode(selectedNodeId === node.id ? null : node.id);
    }
  };

  // Handle keyboard events for delete
  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedNodeId && activeFloor) {
      removeNode(activeFloor.id, selectedNodeId);
      setSelectedNode(null);
    }
    if (e.key === 'Escape') {
      setSelectedNode(null);
      setConnectMode(false);
    }
  };

  // Save node from form
  const handleSaveNode = (nodeData) => {
    if (!activeFloor) return;
    
    addNode(activeFloor.id, nodeData);
    setShowNodeForm(false);
    setNodeFormData(null);
    setSelectedNode(nodeData.id);
  };

  // Cancel node creation
  const handleCancelNode = () => {
    setShowNodeForm(false);
    setNodeFormData(null);
  };

  // Get all nodes from all floors for connection rendering
  const allNodes = project?.floors?.flatMap(f => f.nodes || []) || [];

  return (
    <div
      className="relative flex-1 bg-gray-50 overflow-hidden"
      onDoubleClick={handleDoubleClick}
      onClick={() => !connectMode && setSelectedNode(null)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {activeFloor ? (
        <>
          {/* Floor image */}
          {activeFloor.imageUrl ? (
            <img
              src={activeFloor.imageUrl}
              alt={activeFloor.name}
              className="w-full h-full object-contain select-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p>No floor image uploaded</p>
                <p className="text-sm mt-2">Double-click to add nodes</p>
              </div>
            </div>
          )}

          {/* Render connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
                  <line
                    key={`${c.from}-${c.to}`}
                    x1={`${from.coordinates.x}%`}
                    y1={`${from.coordinates.y}%`}
                    x2={`${to.coordinates.x}%`}
                    y2={`${to.coordinates.y}%`}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    opacity="0.7"
                  />
                );
              })}
          </svg>

          {/* Render nodes */}
          {(activeFloor?.nodes ?? []).map((node) => (
            <div
              key={node.id}
              className={`absolute px-3 py-1 text-xs rounded-lg shadow-md
                cursor-pointer transform -translate-x-1/2 -translate-y-1/2
                transition-all duration-200 font-medium
                ${
                  selectedNodeId === node.id
                    ? "bg-blue-500 text-white scale-110 z-20"
                    : connectMode && selectedNodeId === node.id
                    ? "bg-yellow-500 text-white scale-110 z-20"
                    : node.type === "room"
                    ? "bg-green-500 text-white hover:scale-105 z-10"
                    : node.type === "hallway"
                    ? "bg-gray-500 text-white hover:scale-105 z-10"
                    : node.type === "stair"
                    ? "bg-orange-500 text-white hover:scale-105 z-10"
                    : node.type === "elevator"
                    ? "bg-purple-500 text-white hover:scale-105 z-10"
                    : "bg-red-500 text-white hover:scale-105 z-10"
                }`}
              style={{
                left: `${node.coordinates.x}%`,
                top: `${node.coordinates.y}%`,
              }}
              onClick={(e) => handleNodeClick(node, e)}
              title={`${node.name || 'Unnamed'} (${node.type})`}
            >
              {node.name || `${node.type}`}
            </div>
          ))}

          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-30">
            <button
              onClick={() => {
                setConnectMode(!connectMode);
                setSelectedNode(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                connectMode
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-white text-gray-700 shadow-md hover:bg-gray-50"
              }`}
            >
              {connectMode ? "Exit Connect Mode" : "Connect Nodes"}
            </button>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md text-sm text-gray-600 max-w-xs">
            <div className="space-y-1">
              <p><strong>Double-click:</strong> Add node</p>
              <p><strong>Click node:</strong> Select</p>
              <p><strong>Delete key:</strong> Remove selected</p>
              <p><strong>Connect mode:</strong> Click two nodes to connect</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <p className="text-lg">No floor selected</p>
            <p className="text-sm mt-2">Choose a floor from the sidebar to start editing</p>
          </div>
        </div>
      )}

      {/* Node Form Modal */}
      {showNodeForm && nodeFormData && (
        <NodeFormModal
          nodeData={nodeFormData}
          onSave={handleSaveNode}
          onCancel={handleCancelNode}
          isEditing={false}
        />
      )}
    </div>
  );
};

// Node Form Modal Component
const NodeFormModal = ({ nodeData, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState(nodeData);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a node name");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? "Edit Node" : "Create Node"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter node name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="room">Room</option>
              <option value="hallway">Hallway</option>
              <option value="stair">Stair</option>
              <option value="elevator">Elevator</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X Position
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.coordinates.x}
                onChange={(e) => handleChange('coordinates.x', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Y Position
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.coordinates.y}
                onChange={(e) => handleChange('coordinates.y', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloorCanvas;