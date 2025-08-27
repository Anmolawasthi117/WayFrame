import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useNodeStore } from "../store/useNodeStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { useUiStore } from "../store/useUiStore";

const FloorCanvas = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);

  const addNode = useNodeStore((s) => s.addNode);
  const updateNode = useNodeStore((s) => s.updateNode);
  const addConnection = useConnectionStore((s) => s.addConnection);

  const { selectedNodeId, setSelectedNode } = useUiStore();

  const activeFloor = project?.floors?.find((f) => f.id === activeFloorId);

  const [newNodeDraft, setNewNodeDraft] = useState(null);

  // 🔑 Double click to create draft node
  const handleDoubleClick = (e) => {
    if (!activeFloor) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const draft = {
      id: crypto.randomUUID(),
      label: "",
      type: "room",
      description: "",
      coordinates: { x, y, floor: activeFloor.id },
    };

    setNewNodeDraft(draft);
  };

  // 🔑 Save new node from form
  const saveNewNode = () => {
    if (!newNodeDraft?.label) return alert("Please enter a label");
    addNode(activeFloor.id, newNodeDraft);
    setSelectedNode(newNodeDraft.id);
    setNewNodeDraft(null);
  };

  // 🔑 Cancel draft
  const cancelNewNode = () => {
    setNewNodeDraft(null);
  };

  // 🔑 Node click (select / connect)
  const handleNodeClick = (node, e) => {
    e.stopPropagation();

    if (!selectedNodeId) {
      setSelectedNode(node.id);
    } else if (selectedNodeId === node.id) {
      setSelectedNode(null);
    } else {
      addConnection(selectedNodeId, node.id);
      setSelectedNode(null);
    }
  };

  return (
    <div
      className="relative flex-1 bg-gray-50 overflow-hidden"
      onDoubleClick={handleDoubleClick}
      onClick={() => setSelectedNode(null)}
    >
      {activeFloor ? (
        <>
          {activeFloor.imageUrl ? (
            <img
              src={activeFloor.imageUrl}
              alt={activeFloor.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No floor image uploaded
            </div>
          )}

          {/* Render connections */}
          {project?.connections
            .filter((c) => {
              const fromNode = project.floors
                .flatMap((f) => f.nodes || [])
                .find((n) => n.id === c.from);
              return fromNode?.coordinates?.floor === activeFloor.id;
            })
            .map((c) => {
              const nodes = project.floors.flatMap((f) => f.nodes || []);
              const from = nodes.find((n) => n.id === c.from);
              const to = nodes.find((n) => n.id === c.to);

              if (!from || !to) return null;

              return (
                <svg
                  key={c.id}
                  className="absolute w-full h-full pointer-events-none"
                >
                  <line
                    x1={`${from.coordinates.x}%`}
                    y1={`${from.coordinates.y}%`}
                    x2={`${to.coordinates.x}%`}
                    y2={`${to.coordinates.y}%`}
                    stroke="blue"
                    strokeWidth="2"
                  />
                </svg>
              );
            })}

          {/* Render nodes */}
          {(activeFloor?.nodes ?? []).map((n) => (
            <div
              key={n.id}
              className={`absolute px-2 py-1 text-xs rounded-lg shadow 
                cursor-pointer transform -translate-x-1/2 -translate-y-1/2
                ${
                  selectedNodeId === n.id
                    ? "bg-blue-500 text-white scale-110"
                    : "bg-red-500 text-white hover:scale-105"
                } transition`}
              style={{
                left: `${n.coordinates.x}%`,
                top: `${n.coordinates.y}%`,
              }}
              onClick={(e) => handleNodeClick(n, e)}
            >
              {n.label || "Node"}
            </div>
          ))}

          {/* 🔑 Modal for new node */}
          {newNodeDraft && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg w-80">
                <h3 className="text-lg font-semibold mb-2">New Node</h3>
                <input
                  type="text"
                  placeholder="Label"
                  value={newNodeDraft.label}
                  onChange={(e) =>
                    setNewNodeDraft({ ...newNodeDraft, label: e.target.value })
                  }
                  className="w-full border p-1 mb-2"
                />
                <select
                  value={newNodeDraft.type}
                  onChange={(e) =>
                    setNewNodeDraft({ ...newNodeDraft, type: e.target.value })
                  }
                  className="w-full border p-1 mb-2"
                >
                  <option value="room">Room</option>
                  <option value="hallway">Hallway</option>
                  <option value="stair">Stair</option>
                  <option value="elevator">Elevator</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={newNodeDraft.description}
                  onChange={(e) =>
                    setNewNodeDraft({
                      ...newNodeDraft,
                      description: e.target.value,
                    })
                  }
                  className="w-full border p-1 mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelNewNode}
                    className="px-3 py-1 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNewNode}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400 text-center mt-10">No floor selected</p>
      )}
    </div>
  );
};

export default FloorCanvas;
