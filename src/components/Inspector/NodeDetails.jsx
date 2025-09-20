import { Trash2, Edit3, Check, X, Link, Tag, Plus } from "lucide-react";
import { useState } from "react";
import { useProjectStore } from "../../store/useProjectStore";

const NodeDetails = ({
  selectedNode,
  activeFloor,
  setSelectedNode,
  saveState,
}) => {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  const updateNode = useProjectStore((s) => s.updateNode);
  const removeNode = useProjectStore((s) => s.removeNode);
  const addLocalConnection = useProjectStore((s) => s.addLocalConnection);
  const removeLocalConnection = useProjectStore((s) => s.removeLocalConnection);
  const addGlobalConnection = useProjectStore((s) => s.addGlobalConnection);
  const removeGlobalConnection = useProjectStore((s) => s.removeGlobalConnection);
  const project = useProjectStore((s) => s.project);

  if (!selectedNode) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a node on the canvas to view details
      </div>
    );
  }

  // --- Edit helpers ---
  const startEditing = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const confirmEdit = (field) => {
    saveState();
    updateNode(activeFloor.id, selectedNode.nodeId, { [field]: editValue });
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleDeleteNode = () => {
    if (confirm("Delete this node?")) {
      saveState();
      removeNode(activeFloor.id, selectedNode.nodeId);
      setSelectedNode(null);
    }
  };

  // --- Connection helpers ---
  const localConnections = selectedNode.connections || [];
  const globalConnections = project.connections.filter(
    (c) => c.from === selectedNode.nodeId || c.to === selectedNode.nodeId
  );

  const getNodeById = (nodeId) =>
    project.floors.flatMap((f) => f.nodes).find((n) => n.nodeId === nodeId);

  const handleAddLocalConnection = () => {
    const targetId = prompt("Enter Node ID to connect locally:");
    if (!targetId) return;
    const distance = parseFloat(prompt("Enter distance:") || "0");
    saveState();
    addLocalConnection(activeFloor.id, selectedNode.nodeId, targetId, distance);
    addLocalConnection(activeFloor.id, targetId, selectedNode.nodeId, distance); // bidirectional
  };

  const handleRemoveLocalConnection = (targetId) => {
    saveState();
    removeLocalConnection(activeFloor.id, selectedNode.nodeId, targetId);
    removeLocalConnection(activeFloor.id, targetId, selectedNode.nodeId); // bidirectional
  };

  const handleAddGlobalConnection = () => {
    const targetId = prompt("Enter Node ID to connect globally:");
    if (!targetId) return;
    const type = prompt('Enter type ("stair" or "elevator"):', "stair");
    if (!["stair", "elevator"].includes(type)) return alert("Invalid type");
    const distance = parseFloat(prompt("Enter distance:") || "0");
    saveState();
    addGlobalConnection({ from: selectedNode.nodeId, to: targetId, type, distance });
  };

  const handleRemoveGlobalConnection = (from, to) => {
    saveState();
    removeGlobalConnection(from, to);
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

      {/* --- Node ID --- */}
      <div>
        <label className="text-xs text-gray-500">Node ID</label>
        <div className="text-sm font-mono bg-gray-50 p-2 rounded">
          {selectedNode.nodeId}
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
            updateNode(activeFloor.id, selectedNode.nodeId, { type: e.target.value });
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
              updateNode(activeFloor.id, selectedNode.nodeId, {
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
              updateNode(activeFloor.id, selectedNode.nodeId, {
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
      <div>
        <label className="text-xs text-gray-500 flex items-center gap-1">
          <Link size={12} /> Connections
        </label>

        {/* Local connections */}
        <div className="mt-1">
          <div className="text-xs text-gray-400 mb-1">
            Local ({localConnections.length})
          </div>
          {localConnections.map((c) => {
            const otherNode = getNodeById(c.nodeId);
            return (
              <div
                key={c.nodeId}
                className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded mt-1"
              >
                <span className="text-sm">{otherNode?.name || c.nodeId}</span>
                <button
                  onClick={() => handleRemoveLocalConnection(c.nodeId)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          <button
            onClick={handleAddLocalConnection}
            className="mt-1 flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            <Plus size={12} /> Add Local
          </button>
        </div>

        {/* Global connections */}
        <div className="mt-2">
          <div className="text-xs text-gray-400 mb-1">
            Global ({globalConnections.length})
          </div>
          {globalConnections.map((c) => {
            const otherNodeId = c.from === selectedNode.nodeId ? c.to : c.from;
            const otherNode = getNodeById(otherNodeId);
            return (
              <div
                key={c.from + "-" + c.to}
                className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded mt-1"
              >
                <span className="text-sm">
                  {otherNode?.name || otherNodeId} ({c.type})
                </span>
                <button
                  onClick={() => handleRemoveGlobalConnection(c.from, c.to)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          <button
            onClick={handleAddGlobalConnection}
            className="mt-1 flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            <Plus size={12} /> Add Global
          </button>
        </div>
      </div>

      {/* --- Metadata --- */}
      <div>
        <label className="text-xs text-gray-500 flex items-center gap-1">
          <Tag size={12} /> Metadata
        </label>
        <div className="space-y-1">
          {Object.entries(selectedNode.meta || {}).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
            >
              <span>
                {key}: {String(value)}
              </span>
              <button
                onClick={() => {
                  const newMeta = { ...selectedNode.meta };
                  delete newMeta[key];
                  saveState();
                  updateNode(activeFloor.id, selectedNode.nodeId, { meta: newMeta });
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
            updateNode(activeFloor.id, selectedNode.nodeId, {
              meta: { ...selectedNode.meta, [newKey]: newValue },
            });
          }}
          className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded flex items-center gap-1"
        >
          <Plus size={12} /> Add Metadata
        </button>
      </div>
    </div>
  );
};

export default NodeDetails;
