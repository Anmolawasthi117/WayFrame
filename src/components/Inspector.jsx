import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useNodeStore } from "../store/useNodeStore";
import { useUiStore } from "../store/useUiStore";
import { Eye, EyeOff, Edit3, Trash2, Code } from "lucide-react";

const Inspector = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const updateMeta = useProjectStore((s) => s.updateMeta);
  const exportProject = useProjectStore((s) => s.exportProject);
  const importProject = useProjectStore((s) => s.importProject);
  
  const { updateNode, removeNode } = useNodeStore();
  const { selectedNodeId, setSelectedNode } = useUiStore();

  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [editingField, setEditingField] = useState(null);

  const activeFloor = project?.floors?.find((f) => f.id === activeFloorId);
  const selectedNode = activeFloor?.nodes?.find((n) => n.id === selectedNodeId);

  // Initialize JSON editor with current project
  const openJsonEditor = () => {
    setJsonValue(exportProject());
    setShowJsonEditor(true);
  };

  // Save JSON changes
  const saveJsonChanges = () => {
    try {
      importProject(jsonValue);
      setShowJsonEditor(false);
      alert("Project schema updated successfully!");
    } catch (error) {
      alert("Invalid JSON format. Please check your syntax.");
    }
  };

  // Update node field
  const updateNodeField = (field, value) => {
    if (!selectedNode || !activeFloor) return;
    
    const updates = {};
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updates[parent] = { ...selectedNode[parent], [child]: value };
    } else {
      updates[field] = value;
    }
    
    updateNode(activeFloor.id, selectedNode.id, updates);
    setEditingField(null);
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (!selectedNode || !activeFloor) return;
    
    const confirmDelete = window.confirm(`Delete node "${selectedNode.name}"?`);
    if (confirmDelete) {
      removeNode(activeFloor.id, selectedNode.id);
      setSelectedNode(null);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Inspector</h2>
          <button
            onClick={openJsonEditor}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Edit JSON Schema"
          >
            <Code size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Project Info */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-700 mb-2">Project</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium">{project?.building?.name || "Untitled"}</span>
            </div>
            <div>
              <span className="text-gray-500">Floors:</span>
              <span className="ml-2 font-medium">{project?.floors?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Connections:</span>
              <span className="ml-2 font-medium">{project?.connections?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Floor Info */}
        {activeFloor && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2">Current Floor</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{activeFloor.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Nodes:</span>
                <span className="ml-2 font-medium">{activeFloor.nodes?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Node Details */}
        {selectedNode ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700">Selected Node</h3>
              <button
                onClick={deleteSelectedNode}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                title="Delete Node"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Node Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">NAME</label>
                {editingField === 'name' ? (
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => updateNodeField('name', e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    autoFocus
                  />
                ) : (
                  <div
                    className="text-sm text-gray-800 p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center justify-between group"
                    onClick={() => setEditingField('name')}
                  >
                    <span>{selectedNode.name || "Unnamed"}</span>
                    <Edit3 size={12} className="opacity-0 group-hover:opacity-100" />
                  </div>
                )}
              </div>

              {/* Node Type */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">TYPE</label>
                {editingField === 'type' ? (
                  <select
                    value={selectedNode.type}
                    onChange={(e) => updateNodeField('type', e.target.value)}
                    onBlur={() => setEditingField(null)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    autoFocus
                  >
                    <option value="room">Room</option>
                    <option value="hallway">Hallway</option>
                    <option value="stair">Stair</option>
                    <option value="elevator">Elevator</option>
                  </select>
                ) : (
                  <div
                    className="text-sm text-gray-800 p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center justify-between group capitalize"
                    onClick={() => setEditingField('type')}
                  >
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedNode.type === 'room' ? 'bg-green-100 text-green-800' :
                      selectedNode.type === 'hallway' ? 'bg-gray-100 text-gray-800' :
                      selectedNode.type === 'stair' ? 'bg-orange-100 text-orange-800' :
                      selectedNode.type === 'elevator' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedNode.type}
                    </span>
                    <Edit3 size={12} className="opacity-0 group-hover:opacity-100" />
                  </div>
                )}
              </div>

              {/* Coordinates */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">COORDINATES</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">X</label>
                    {editingField === 'coordinates.x' ? (
                      <input
                        type="number"
                        step="0.01"
                        value={selectedNode.coordinates.x}
                        onChange={(e) => updateNodeField('coordinates.x', parseFloat(e.target.value))}
                        onBlur={() => setEditingField(null)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="text-sm text-gray-800 p-1 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => setEditingField('coordinates.x')}
                      >
                        {selectedNode.coordinates.x?.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Y</label>
                    {editingField === 'coordinates.y' ? (
                      <input
                        type="number"
                        step="0.01"
                        value={selectedNode.coordinates.y}
                        onChange={(e) => updateNodeField('coordinates.y', parseFloat(e.target.value))}
                        onBlur={() => setEditingField(null)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="text-sm text-gray-800 p-1 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => setEditingField('coordinates.y')}
                      >
                        {selectedNode.coordinates.y?.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Connections */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CONNECTIONS</label>
                <div className="text-sm text-gray-600">
                  {selectedNode.connections?.length || 0} connection(s)
                </div>
                {project?.connections?.filter(c => 
                  c.from === selectedNode.id || c.to === selectedNode.id
                ).map((conn, idx) => {
                  const otherId = conn.from === selectedNode.id ? conn.to : conn.from;
                  const otherNode = project.floors
                    .flatMap(f => f.nodes || [])
                    .find(n => n.id === otherId);
                  
                  return (
                    <div key={idx} className="text-xs text-gray-500 p-1 bg-gray-50 rounded mt-1">
                      → {otherNode?.name || otherId}
                    </div>
                  );
                })}
              </div>

              {/* Meta Data */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">METADATA</label>
                <textarea
                  value={JSON.stringify(selectedNode.meta || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateNodeField('meta', parsed);
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="w-full text-xs font-mono border border-gray-300 rounded px-2 py-1 h-20 resize-none"
                  placeholder="{}"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <div className="text-sm">No node selected</div>
            <div className="text-xs mt-1">Click on a node to view details</div>
          </div>
        )}
      </div>

      {/* JSON Schema Editor Modal */}
      {showJsonEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Project Schema</h3>
              <button
                onClick={() => setShowJsonEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <textarea
                value={jsonValue}
                onChange={(e) => setJsonValue(e.target.value)}
                className="w-full h-full font-mono text-sm border border-gray-300 rounded p-3 resize-none"
                placeholder="Edit your project JSON schema here..."
              />
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowJsonEditor(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveJsonChanges}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspector;