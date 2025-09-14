import { Trash2, Edit3, Check, X, Link, Tag } from "lucide-react";
import { useState } from "react";

const NodeDetails = ({
  project,
  activeFloor,
  selectedNode,
  setSelectedNode,
  updateNode,
  removeNode,
  removeConnection,
  saveState,
  editingField,
  setEditingField,
}) => {
  const [editValue, setEditValue] = useState("");

  if (!selectedNode) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a node on the canvas to view details
      </div>
    );
  }

  // --- helpers ---
  const startEditing = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const confirmEdit = (field) => {
    saveState();
    updateNode(activeFloor.id, selectedNode.id, { [field]: editValue });
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleDeleteNode = () => {
    if (confirm("Delete this node?")) {
      saveState();
      removeNode(activeFloor.id, selectedNode.id);
      setSelectedNode(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* --- Header --- */}
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-semibold text-gray-700">Node Details</h3>
        <button
          onClick={handleDeleteNode}
          className="text-red-500 hover:text-red-700"
          title="Delete node"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* --- Node ID (readonly) --- */}
      <div>
        <label className="text-xs text-gray-500">Node ID</label>
        <div className="text-sm font-mono bg-gray-50 p-2 rounded">
          {selectedNode.id}
        </div>
      </div>

      {/* --- Node Name --- */}
      <div>
        <label className="text-xs text-gray-500">Name</label>
        {editingField === "name" ? (
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 text-sm flex-1"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <button onClick={() => confirmEdit("name")} className="text-green-600">
              <Check size={16} />
            </button>
            <button onClick={cancelEdit} className="text-gray-500">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span>{selectedNode.name || "Unnamed"}</span>
            <button
              onClick={() => startEditing("name", selectedNode.name)}
              className="text-gray-500"
            >
              <Edit3 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* --- Node Type --- */}
      <div>
        <label className="text-xs text-gray-500">Type</label>
        <select
          value={selectedNode.type || "room"}
          onChange={(e) => {
            saveState();
            updateNode(activeFloor.id, selectedNode.id, { type: e.target.value });
          }}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="room">Room</option>
          <option value="hallway">Hallway</option>
          <option value="stair">Stair</option>
          <option value="elevator">Elevator</option>
          <option value="entrance">Entrance</option>
        </select>
      </div>

      {/* --- Coordinates --- */}
      <div>
        <label className="text-xs text-gray-500">Coordinates</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm"
            value={selectedNode.coordinates?.x || 0}
            onChange={(e) => {
              saveState();
              updateNode(activeFloor.id, selectedNode.id, {
                coordinates: {
                  ...selectedNode.coordinates,
                  x: parseFloat(e.target.value) || 0,
                },
              });
            }}
          />
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm"
            value={selectedNode.coordinates?.y || 0}
            onChange={(e) => {
              saveState();
              updateNode(activeFloor.id, selectedNode.id, {
                coordinates: {
                  ...selectedNode.coordinates,
                  y: parseFloat(e.target.value) || 0,
                },
              });
            }}
          />
        </div>
      </div>

      {/* --- Connections --- */}
      {/* --- Connections --- */}
<div>
  <label className="text-xs text-gray-500 flex items-center gap-1">
    <Link size={12} /> Connections
  </label>
  {project.connections
    ?.filter((c) => c.from === selectedNode.id || c.to === selectedNode.id)
    .map((c) => {
      const otherNodeId = c.from === selectedNode.id ? c.to : c.from;

      // Find the connected node in any floor
      const otherNode =
        project.floors
          ?.flatMap((f) => f.nodes || [])
          .find((n) => n.id === otherNodeId) || null;

      return (
        <div
          key={c.id}
          className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded mt-1"
        >
          <span className="text-sm">
            {otherNode?.name || `Node ${otherNodeId}`}
          </span>
          <button
            onClick={() => {
              saveState();
              removeConnection(c.id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={14} />
          </button>
        </div>
      );
    })}
</div>


      {/* --- Metadata --- */}
      <div>
        <label className="text-xs text-gray-500 flex items-center gap-1">
          <Tag size={12} /> Metadata
        </label>
        <div className="space-y-1">
          {Object.entries(selectedNode.metadata || {}).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
            >
              <span>
                {key}: {String(value)}
              </span>
              <button
                onClick={() => {
                  const newMeta = { ...selectedNode.metadata };
                  delete newMeta[key];
                  saveState();
                  updateNode(activeFloor.id, selectedNode.id, { metadata: newMeta });
                }}
                className="text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newKey = prompt("Enter metadata key:");
            if (!newKey) return;
            const newValue = prompt("Enter value for " + newKey);
            saveState();
            updateNode(activeFloor.id, selectedNode.id, {
              metadata: {
                ...selectedNode.metadata,
                [newKey]: newValue,
              },
            });
          }}
          className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
        >
          Add Metadata
        </button>
      </div>
    </div>
  );
};

export default NodeDetails;

